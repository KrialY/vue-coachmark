<template>
  <Transition name="coach-mark" @after-leave="handleAnimationEnd">
    <div
      :class="['coach-mark__shadow', shadow ? 'coach-mark__shadow--enable' : null]"
      v-if="activeTemplate && target"
    >
      <div ref="coachMarkRef" class="coach-mark--floating" :style="floatingStyles">
        <div ref="arrowRef" :style="arrowStyles" class="coach-mark__arrow"></div>
        <div :class="['coach-mark__content', contentClass]">
          <slot :name="activeTemplate.templateName"></slot>
          <slot name="actions" :skip="handleSkip" :previous="handlePrevious" :next="handleNext">
            <div :class="['coach-mark__footer', footerClass]">
              <slot name="progress" :current="activeTemplateIndex" :total="steps.length">
                <div class="coach-mark__progress">
                  {{ activeTemplateIndex + 1 }} / {{ steps.length }}
                </div>
              </slot>
              <div :class="['coach-mark__actions', actionsClass]">
                <slot name="skip" :skip="handleSkip">
                  <button class="coach-mark__button" @click="handleSkip">Skip</button>
                </slot>
                <slot name="previous" :previous="handlePrevious">
                  <button
                    class="coach-mark__button"
                    v-if="activeTemplateIndex > 0"
                    @click="handlePrevious"
                  >
                    Previous
                  </button>
                </slot>
                <slot
                  name="next"
                  :next="handleNext"
                  :currentStep="activeTemplateIndex"
                  :steps="steps"
                >
                  <button class="coach-mark__button" @click="handleNext">
                    {{ activeTemplateIndex === steps.length - 1 ? 'Finish' : 'Next' }}
                  </button>
                </slot>
              </div>
            </div>
          </slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  ref,
  watch,
  defineComponent,
  type ComputedRef,
  type PropType,
  type Ref,
  type StyleValue
} from 'vue'
import {
  computePosition,
  arrow,
  offset,
  shift,
  autoUpdate,
  flip,
  type FloatingElement,
  type Placement
} from '@floating-ui/dom'

const PREFIX: string = 'CoachMark'

interface Step {
  target: string
  templateName: string
  beforeEnter?: () => Promise<boolean> | void
  beforeLeave?: () => Promise<boolean> | void
}

type Steps = Array<Step>

enum Action {
  next,
  previous
}

export default defineComponent({
  name: 'CoachMark',
  props: {
    steps: {
      type: Array as PropType<Steps>,
      default: () => []
    },
    shadow: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    placement: {
      type: String as PropType<Placement>,
      default: 'bottom'
    },
    storageKey: {
      type: String as PropType<string>,
      default: ''
    },
    contentClass: {
      type: String as PropType<string>,
      default: ''
    },
    footerClass: {
      type: String as PropType<string>,
      default: ''
    },
    actionsClass: {
      type: String as PropType<string>,
      default: ''
    },
    autoScroll: {
      type: Boolean as PropType<boolean>,
      default: true
    },
    autoScrollConfig: {
      type: Object as PropType<ScrollIntoViewOptions>,
      default: () => {
        return {
          behavior: 'smooth',
          block: 'center'
        }
      }
    }
  },
  setup(props) {
    const localStorageKey: string = `${PREFIX}-${props.storageKey}`
    let cleanup: Function | null = null
    let action: Action | null = null
    let activeTargetStyle: { position: string; zIndex: string } | null = null

    const isChangingStep: Ref<boolean> = ref(false)
    const activeTemplateIndex: Ref<number> = ref(0)
    const floatingStyles: Ref<StyleValue> = ref({})
    const arrowStyles: Ref<StyleValue> = ref({})
    const target: Ref<HTMLElement | null> = ref(null)
    const arrowRef: Ref<HTMLElement | null> = ref(null)
    const coachMarkRef: Ref<FloatingElement | null> = ref(null)

    const activeTemplate: ComputedRef<Step | null> = computed(() => {
      if (isChangingStep.value) return null
      const isShowed = props.storageKey && localStorage.getItem(localStorageKey)
      if (isShowed === 'true') return null
      return activeTemplateIndex.value < props.steps.length && activeTemplateIndex.value >= 0
        ? props.steps[activeTemplateIndex.value]
        : null
    })

    watch(activeTemplateIndex, (val) => {
      if (val >= props.steps.length) {
        props.storageKey && localStorage.setItem(localStorageKey, 'true')
      }
    })

    async function handleSkip() {
      const res = await activeTemplate.value?.beforeLeave?.()
      if (res === false) return
      // trigger animation
      activeTemplateIndex.value = props.steps.length
    }

    async function handlePrevious() {
      const res = await activeTemplate.value?.beforeLeave?.()
      if (res === false) return
      // trigger animation
      isChangingStep.value = true
      action = Action.previous
      target.value = null
    }

    async function handleAnimationEnd() {
      const next =
        action === Action.previous ? activeTemplateIndex.value - 1 : activeTemplateIndex.value + 1
      const step = props.steps[next]
      const res = await step?.beforeEnter?.()
      if (res === false) return
      activeTemplateIndex.value = next
      isChangingStep.value = false
      initObserver()
    }

    async function handleNext() {
      const res = await activeTemplate.value?.beforeLeave?.()
      if (res === false) return
      // trigger animation
      isChangingStep.value = true
      action = Action.next
      if (props.shadow && target.value && activeTargetStyle) {
        target.value.style.position = activeTargetStyle.position
        target.value.style.zIndex = activeTargetStyle.zIndex
        activeTargetStyle = null
      }
      target.value = null
    }

    function initObserver() {
      const observer = new MutationObserver(observeTarget)

      observer.observe(document.body, {
        childList: true,
        subtree: true
      })
      observeTarget()

      async function observeTarget() {
        const targetEl = document.querySelector(activeTemplate.value?.target as string)
        if (targetEl) {
          target.value = targetEl as HTMLElement
          if (props.shadow) {
            const targetElStyle = window.getComputedStyle(targetEl)
            activeTargetStyle = {
              zIndex: targetElStyle.zIndex,
              position: targetElStyle.position
            }
            if (targetElStyle.position === 'static') {
              target.value.style.position = 'relative'
            }
            target.value.style.zIndex = '1'
          }
          observer.disconnect()
          await nextTick()
          doComputePosition()
        }
      }
    }

    function doComputePosition() {
      if (!target.value || !coachMarkRef.value || !arrowRef.value) return

      props.autoScroll && target.value.scrollIntoView(props.autoScrollConfig)

      cleanup && cleanup()
      cleanup = autoUpdate(target.value, coachMarkRef.value, computeCoachMarkPosition)

      computeCoachMarkPosition()

      async function computeCoachMarkPosition() {
        const curTargetEl: Element | null = document.querySelector(
          activeTemplate?.value?.target as string
        )
        if (target.value && !curTargetEl) {
          target.value = null
          return
        }
        if (!target.value || !coachMarkRef.value || !arrowRef.value) return
        const { x, y, middlewareData, placement } = await computePosition(
          target.value,
          coachMarkRef.value,
          {
            placement: props.placement,
            middleware: [offset(10), shift(), flip(), arrow({ element: arrowRef.value })]
          }
        )
        floatingStyles.value = {
          left: `${x}px`,
          top: `${y}px`
        }
        if (middlewareData.arrow) {
          const { x, y } = middlewareData.arrow
          const computeArrowPosition: Record<string, string> = {
            top: 'bottom',
            bottom: 'top',
            left: 'right',
            right: 'left'
          }
          const boxShadowStyle: Record<string, string> = {
            top: '4px 4px 8px rgba(0, 0, 0, 0.1)',
            bottom: '-4px -4px 8px rgba(0, 0, 0, 0.1)',
            left: '4px -4px 8px rgba(0, 0, 0, 0.1)',
            right: '-4px 4px 8px rgba(0, 0, 0, 0.1)'
          }

          arrowStyles.value = {
            left: x != null ? `${x}px` : '',
            top: y != null ? `${y}px` : '',
            [computeArrowPosition[placement]]: '-4px',
            boxShadow: boxShadowStyle[placement]
          }
        }
      }
    }

    onMounted(() => {
      initObserver()
    })

    return {
      arrowRef,
      coachMarkRef,
      target,
      activeTemplateIndex,
      activeTemplate,
      floatingStyles,
      arrowStyles,
      handleAnimationEnd,
      handleSkip,
      handlePrevious,
      handleNext
    }
  }
})
</script>

<style lang="scss">
.coach-mark-enter-active,
.coach-mark-leave-active {
  transition: opacity 0.25s ease;
}

.coach-mark-enter-from,
.coach-mark-leave-to {
  opacity: 0;
}

.coach-mark {
  &--floating {
    position: absolute;
    z-index: 1000;
    pointer-events: initial;
  }
  &__content {
    padding: 20px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow:
      0 4px 8px rgba(0, 0, 0, 0.1),
      0 6px 20px rgba(0, 0, 0, 0.1);
  }
  &__arrow {
    width: 10px;
    height: 10px;
    background-color: #fff;
    transform: rotate(45deg);
    position: absolute;
  }
  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
  }
  &__progress {
    padding-right: 8px;
  }
  &__button {
    font-size: 14px;
    color: rgb(42 126 59);
    padding: 0 14px;
    line-height: 14px;
    height: 35px;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid rgb(42 126 59);
    cursor: pointer;
    transition: 0.15s;
    margin-right: 8px;
    &:hover {
      background-color: rgba(42, 126, 59, 0.05);
    }
  }
  &__shadow {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    &--enable {
      pointer-events: initial;
      background-color: rgba(0, 0, 0, 0.5);
    }
  }
}
</style>
