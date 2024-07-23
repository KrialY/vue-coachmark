<template>
  <Transition name="coach-mark" @after-leave="handleAnimationEnd">
    <div
      v-if="activeTemplate && target"
      ref="coachMarkRef"
      class="coach-mark--floating"
      :style="floatingStyles"
    >
      <div ref="arrowRef" :style="arrowStyles" class="coach-mark__arrow"></div>
      <div :class="['coach-mark__content', ...contentClasses]">
        <slot :name="activeTemplate.templateName"></slot>
        <slot name="actions" :skip="handleSkip" :previous="handlePrevious" :next="handleNext">
          <div class="coach-mark__actions">
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
            <slot name="next" :next="handleNext" :currentStep="activeTemplateIndex" :steps="steps">
              <button class="coach-mark__button" @click="handleNext">
                {{ activeTemplateIndex === steps.length - 1 ? 'Finish' : 'Next' }}
              </button>
            </slot>
          </div>
        </slot>
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
  type ComputedRef,
  type PropType,
  type Ref,
  type StyleValue
} from 'vue'
import { defineComponent } from 'vue'
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
  beforeEnter?: () => void
  beforeLeave?: () => void
}

type Steps = Array<Step>

export default defineComponent({
  name: 'CoachMark',
  props: {
    steps: {
      type: Array as PropType<Steps>,
      default: () => []
    },
    placement: {
      type: String as PropType<Placement>,
      default: 'bottom'
    },
    storageKey: {
      type: String as PropType<string>,
      default: ''
    },
    contentClasses: {
      type: Array as PropType<Array<string>>,
      default: () => {
        return []
      }
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
    let _tempActiveTemplateIndex: number = 0
    let cleanup: Function | null = null

    const activeTemplateIndex: Ref<number> = ref(0)
    const floatingStyles: Ref<StyleValue> = ref({})
    const arrowStyles: Ref<StyleValue> = ref({})
    const target: Ref<Element | null> = ref(null)
    const arrowRef: Ref<Element | null> = ref(null)
    const coachMarkRef: Ref<FloatingElement | null> = ref(null)

    const activeTemplate: ComputedRef<Step | null> = computed(() => {
      const isShowed = props.storageKey && localStorage.getItem(localStorageKey)
      if (isShowed === 'true') return null
      return activeTemplateIndex.value < props.steps.length && activeTemplateIndex.value >= 0
        ? props.steps[activeTemplateIndex.value]
        : null
    })

    watch(activeTemplateIndex, (val) => {
      if (val < props.steps.length) {
        doComputePosition()
      } else {
        props.storageKey && localStorage.setItem(localStorageKey, 'true')
      }
    })

    function handleSkip() {
      activeTemplate.value?.beforeLeave?.()
      // trigger animation
      _tempActiveTemplateIndex = props.steps.length
      activeTemplateIndex.value = -1
    }

    function handlePrevious() {
      activeTemplate.value?.beforeLeave?.()
      // trigger animation
      _tempActiveTemplateIndex = activeTemplateIndex.value - 1
      activeTemplateIndex.value = -1
    }

    function handleAnimationEnd() {
      activeTemplateIndex.value = _tempActiveTemplateIndex
    }

    function handleNext() {
      activeTemplate.value?.beforeLeave?.()
      // trigger animation
      _tempActiveTemplateIndex = activeTemplateIndex.value + 1
      activeTemplateIndex.value = -1
    }

    function initObserver() {
      const observer = new MutationObserver(async () => {
        const targetEl = document.querySelector(activeTemplate.value?.target as string)
        if (targetEl) {
          target.value = targetEl
          observer.disconnect()
          doComputePosition()
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true
      })
    }

    async function doComputePosition() {
      if (!activeTemplate.value) return
      activeTemplate.value.beforeEnter && activeTemplate.value.beforeEnter()
      await nextTick()
      const targetEl: Element | null = document.querySelector(activeTemplate.value.target)
      target.value = targetEl
      const coachMarkEl: FloatingElement | null = coachMarkRef.value
      const arrowEl: Element | null = arrowRef.value
      if (!targetEl || !coachMarkEl || !arrowEl) return

      props.autoScroll && targetEl.scrollIntoView(props.autoScrollConfig)

      cleanup && cleanup()
      cleanup = autoUpdate(targetEl, coachMarkEl, computeCoachMarkPosition)

      computeCoachMarkPosition()

      async function computeCoachMarkPosition() {
        if (!targetEl || !coachMarkEl || !arrowEl) return
        const { x, y, middlewareData, placement } = await computePosition(targetEl, coachMarkEl, {
          placement: props.placement,
          middleware: [offset(10), shift(), flip(), arrow({ element: arrowEl })]
        })
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
    margin-left: 8px;
    &:hover {
      background-color: rgba(42, 126, 59, 0.05);
    }
  }
}
</style>
