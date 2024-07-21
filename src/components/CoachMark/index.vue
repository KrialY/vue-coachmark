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

<script>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { defineComponent } from 'vue'
import { computePosition, arrow, offset, shift, autoUpdate, flip } from '@floating-ui/dom'

const PREFIX = 'CoachMark'

export default defineComponent({
  name: 'CoachMark',
  props: {
    steps: {
      type: Array,
      default: () => []
    },
    placement: {
      type: String,
      default: 'bottom'
    },
    storageKey: {
      type: String,
      default: ''
    },
    contentClasses: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  setup(props) {
    const localStorageKey = `${PREFIX}-${props.storageKey}`
    let _tempActiveTemplateIndex = 0
    let cleanup = null

    const activeTemplateIndex = ref(0)
    const floatingStyles = ref({
      x: null,
      y: null
    })
    const arrowStyles = ref({
      x: null,
      y: null
    })
    const target = ref(null)
    const arrowRef = ref()
    const coachMarkRef = ref()

    const activeTemplate = computed(() => {
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
      // trigger animation
      _tempActiveTemplateIndex = props.steps.length
      activeTemplateIndex.value = -1
    }

    function handlePrevious() {
      // trigger animation
      _tempActiveTemplateIndex = activeTemplateIndex.value - 1
      activeTemplateIndex.value = -1
    }

    function handleAnimationEnd() {
      activeTemplateIndex.value = _tempActiveTemplateIndex
    }

    function handleNext() {
      // trigger animation
      _tempActiveTemplateIndex = activeTemplateIndex.value + 1
      activeTemplateIndex.value = -1
    }

    function initObserver() {
      const observer = new MutationObserver(async () => {
        const targetEl = document.querySelector(activeTemplate.value.target)
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
      await nextTick()
      if (!activeTemplate.value) return
      const targetEl = document.querySelector(activeTemplate.value.target)
      target.value = targetEl
      if (!targetEl) return
      const coachMarkEl = coachMarkRef.value
      const arrowEl = arrowRef.value

      targetEl.scrollIntoView({ behavior: 'smooth' })

      cleanup && cleanup()
      cleanup = autoUpdate(targetEl, coachMarkEl, computeCoachMarkPosition)

      computeCoachMarkPosition()

      async function computeCoachMarkPosition() {
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
          const computeArrowPosition = {
            top: 'bottom',
            bottom: 'top',
            left: 'right',
            right: 'top'
          }

          arrowStyles.value = {
            left: x != null ? `${x}px` : '',
            top: y != null ? `${y}px` : '',
            [computeArrowPosition[placement]]: '-4px'
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
    box-shadow: 8px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
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
