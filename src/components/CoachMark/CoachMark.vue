<template>
  <Teleport to="body" :disabled="!teleported">
    <Transition name="coach-mark" @after-leave="handleAnimationEnd">
      <div
        ref="coachMarkRef"
        class="coach-mark--floating"
        :style="contentStyle"
        v-show="!isChangingStep && target && activeTemplateIndex < total"
      >
        <div ref="arrowRef" :style="arrowStyle" class="coach-mark__arrow"></div>
        <CoachMarkSteps @update-total="onUpdateTotal" :current="activeTemplateIndex">
          <slot></slot>
        </CoachMarkSteps>
      </div>
    </Transition>
    <Transition name="coach-mark">
      <div
        v-if="shadow && activeTemplateIndex < total"
        ref="shadowRef"
        :class="['coach-mark__shadow', shadow ? 'coach-mark__shadow--enable' : null]"
        :style="{ clipPath: clipPath ? clipPath : 'initial' }"
      ></div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
import {
  computed,
  ref,
  watch,
  defineComponent,
  type PropType,
  type Ref,
  provide,
  onBeforeMount
} from 'vue'
import { type FloatingElement, type Placement } from '@floating-ui/dom'
import CoachMarkSteps from './CoachMarkSteps'
import { useFloating, useTarget } from './helpHooks'

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

    const isChangingStep: Ref<boolean> = ref(false)
    const activeTemplateIndex: Ref<number> = ref(0)
    const arrowRef: Ref<HTMLElement | null> = ref(null)
    const coachMarkRef: Ref<FloatingElement | null> = ref(null)
    const shadowRef: Ref<HTMLElement | null> = ref(null)
    const total = ref(0)
    const action: Ref<Action | null> = ref(null)
    const currentStep: Ref<any> = ref(null)

    const activeTemplate = computed(() => {
      if (isChangingStep.value) return null
      const isShowed = props.storageKey && localStorage.getItem(localStorageKey)
      if (isShowed === 'true') return null
      return currentStep.value ?? null
    })
    const currentTarget = computed(() => activeTemplate.value?.target)

    const { target, clipPath } = useTarget(currentTarget, props.autoScrollConfig)
    const { contentStyle, arrowStyle } = useFloating(
      target,
      coachMarkRef,
      arrowRef,
      props.placement
    )

    watch(activeTemplateIndex, (val) => {
      if (val >= total.value) {
        handleStepEnd()
      }
    })

    onBeforeMount(init)

    provide(COACH_MARK_PROVIDE_KEY, {
      isChangingStep,
      activeTemplateIndex,
      action,
      total,
      currentStep
    })

    function init() {
      if (props.shadow) {
        document.body.style.overflow = 'hidden'
      }
    }

    function onUpdateTotal(val: number) {
      total.value = val
    }

    async function handleAnimationEnd() {
      const next =
        action.value === Action.previous
          ? activeTemplateIndex.value - 1
          : activeTemplateIndex.value + 1
      activeTemplateIndex.value = next
      isChangingStep.value = false
    }

    function handleStepEnd() {
      props.storageKey && localStorage.setItem(localStorageKey, 'true')
      if (props.shadow) {
        document.body.style.overflow = 'initial'
      }
    }

    return {
      clipPath,
      isChangingStep,
      total,
      shadowRef,
      arrowRef,
      coachMarkRef,
      target,
      activeTemplateIndex,
      activeTemplate,
      contentStyle,
      arrowStyle,
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
    transition: all 0.5s ease;
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    z-index: 999;
    &--enable {
      background-color: rgba(0, 0, 0, 0.5);
    }
  }
}
</style>
