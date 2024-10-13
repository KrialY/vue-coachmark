<template>
  <Teleport to="body" :disabled="!teleported">
    <Transition name="coach-mark" @after-leave="handleAnimationEnd">
      <div
        ref="coachMarkRef"
        class="coach-mark--floating"
        :style="floatingStyles"
        v-show="!isChangingStep && target"
      >
        <div ref="arrowRef" :style="arrowStyles" class="coach-mark__arrow"></div>
        <CoachMarkSteps @update-total="onUpdateTotal" :current="activeTemplateIndex">
          <slot></slot>
        </CoachMarkSteps>
      </div>
    </Transition>
    <Transition name="coach-mark">
      <div
        v-if="shadow && isInitEnd && activeTemplateIndex < total"
        ref="shadowRef"
        :class="['coach-mark__shadow', shadow ? 'coach-mark__shadow--enable' : null]"
      ></div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  ref,
  watch,
  defineComponent,
  type PropType,
  type Ref,
  type StyleValue,
  onBeforeUnmount,
  provide
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
import CoachMarkSteps from './CoachMarkSteps'

const PREFIX: string = 'CoachMark'

export enum Action {
  next,
  previous
}

export const COACH_MARK_PROVIDE_KEY = 'COACH_MARK_PROVIDE_KEY'

export default defineComponent({
  name: 'CoachMark',
  props: {
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
    autoScroll: {
      type: Boolean as PropType<boolean>,
      default: true
    },
    teleported: {
      type: Boolean as PropType<boolean>,
      default: false
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
  components: {
    CoachMarkSteps
  },
  setup(props) {
    const localStorageKey: string = `${PREFIX}-${props.storageKey}`
    let cleanup: Function | null = null

    const isChangingStep: Ref<boolean> = ref(false)
    const activeTemplateIndex: Ref<number> = ref(0)
    const floatingStyles: Ref<StyleValue> = ref({})
    const arrowStyles: Ref<StyleValue> = ref({})
    const target: Ref<HTMLElement | null> = ref(null)
    const arrowRef: Ref<HTMLElement | null> = ref(null)
    const coachMarkRef: Ref<FloatingElement | null> = ref(null)
    const shadowRef: Ref<HTMLElement | null> = ref(null)
    const isInitEnd: Ref<boolean> = ref(false)
    const total = ref(0)
    const action: Ref<Action | null> = ref(null)
    const currentStep: Ref<any> = ref(null)

    const activeTemplate = computed(() => {
      if (isChangingStep.value) return null
      const isShowed = props.storageKey && localStorage.getItem(localStorageKey)
      if (isShowed === 'true') return null
      return currentStep.value ?? null
    })

    watch(activeTemplateIndex, (val) => {
      if (val >= total.value) {
        handleStepEnd()
      }
    })

    onMounted(() => {
      init()
      initObserver()
    })

    onBeforeUnmount(() => {
      window.removeEventListener('scrollend', onScrollEnd)
    })

    function init() {
      if (props.shadow) {
        window.addEventListener('scrollend', onScrollEnd)
        document.body.style.overflow = 'hidden'
      }
    }

    function onUpdateTotal(val: number) {
      total.value = val
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
          isInitEnd.value = true
          target.value = targetEl as HTMLElement
          observer.disconnect()
          await nextTick()
          props.shadow && doClipPath()
          doComputePosition()
        }
      }
    }

    async function handleAnimationEnd() {
      const next =
        action.value === Action.previous
          ? activeTemplateIndex.value - 1
          : activeTemplateIndex.value + 1
      activeTemplateIndex.value = next
      isChangingStep.value = false
      await nextTick()
      initObserver()
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

    function handleStepEnd() {
      props.storageKey && localStorage.setItem(localStorageKey, 'true')
      if (props.shadow) {
        document.body.style.overflow = 'initial'
        window.removeEventListener('scrollend', onScrollEnd)
      }
    }

    function doClipPath() {
      if (!target.value || !shadowRef.value) return
      const rect = target.value.getBoundingClientRect()
      const { top, left, width, height } = rect

      const offset = 10
      const computedWidth = width + offset
      const computedHeight = height + offset
      const computedLeft = left - offset / 2
      const computedTop = top - offset / 2

      const radius = 4
      const baseInfo = `a${radius},${radius} 0 0 1`
      const roundInfo = {
        topRight: `${baseInfo} ${radius},${radius}`,
        bottomRight: `${baseInfo} ${-radius},${radius}`,
        bottomLeft: `${baseInfo} ${-radius},${-radius}`,
        topLeft: `${baseInfo} ${radius},${-radius}`
      }

      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const _path = `M${windowWidth},0 L0,0 L0,${windowHeight} L${windowWidth},${windowHeight} L${windowWidth},0 Z`

      const path = `${_path} M${computedLeft + radius},${computedTop} h${
        computedWidth - radius * 2
      } ${roundInfo.topRight} v${computedHeight - radius * 2} ${
        roundInfo.bottomRight
      } h${-computedWidth + radius * 2} ${roundInfo.bottomLeft} v${-computedHeight + radius * 2} ${roundInfo.topLeft} z`

      shadowRef.value.style.clipPath = `path("${path}")`
    }

    function onScrollEnd() {
      doClipPath()
    }

    provide(COACH_MARK_PROVIDE_KEY, {
      isChangingStep,
      activeTemplateIndex,
      action,
      total,
      currentStep
    })

    return {
      isChangingStep,
      total,
      shadowRef,
      arrowRef,
      coachMarkRef,
      target,
      activeTemplateIndex,
      activeTemplate,
      floatingStyles,
      arrowStyles,
      isInitEnd,
      onUpdateTotal,
      handleAnimationEnd
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
  &__arrow {
    width: 10px;
    height: 10px;
    background-color: #fff;
    transform: rotate(45deg);
    position: absolute;
  }
  &__shadow {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    &--enable {
      background-color: rgba(0, 0, 0, 0.5);
    }
  }
}
</style>
