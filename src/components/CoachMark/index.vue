<template>
  <Transition @after-leave="onAfterLeave">
    <div
      v-if="activeTemplate && target"
      id="coach-mark"
      class="coach-mark--floating"
      :style="floatingStyles"
    >
      <div id="arrow" :style="arrowStyles" class="coach-mark__arrow"></div>
      <div class="coach-mark__content">
        <slot :name="activeTemplate.templateName"></slot>
        <div class="coach-mark__actions">
          <button class="coach-mark__button" @click="handleSkip">Skip</button>
          <button class="coach-mark__button" v-if="activeTemplateIndex > 0" @click="handlePrevious">
            Previous
          </button>
          <button class="coach-mark__button" @click="handleNext">
            {{ activeTemplateIndex === steps.length - 1 ? 'Finish' : 'Next' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { defineComponent } from 'vue'
import { computePosition, arrow, offset, shift, flip } from '@floating-ui/dom'

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
    }
  },
  setup(props) {
    const localStorageKey = `${PREFIX}-${props.storageKey}`
    let _tempActiveTemplateIndex = 0

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
      activeTemplateIndex.value = props.steps.length
    }

    function handlePrevious() {
      activeTemplateIndex.value--
    }

    function onAfterLeave() {
      activeTemplateIndex.value = _tempActiveTemplateIndex + 1
    }

    function handleNext() {
      // trigger animation
      _tempActiveTemplateIndex = activeTemplateIndex.value
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
      const tooltip = document.querySelector('#coach-mark')
      const arrowEl = document.querySelector('#arrow')
      targetEl.scrollIntoView({ behavior: 'smooth' })

      computeCoachMarkPosition()
      async function computeCoachMarkPosition() {
        const { x, y, middlewareData, placement } = await computePosition(targetEl, tooltip, {
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
      target,
      activeTemplateIndex,
      activeTemplate,
      floatingStyles,
      arrowStyles,
      onAfterLeave,
      handleSkip,
      handlePrevious,
      handleNext
    }
  }
})
</script>

<style lang="scss">
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
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
