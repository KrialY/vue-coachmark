<template>
  <Transition>
    <div
      v-if="activeTemplate"
      id="coach-mark"
      class="coach-mark--floating"
      :style="floatingStyles"
      :key="activeTemplate.templateName"
    >
      <div id="arrow" :style="arrowStyles" class="coach-mark__arrow"></div>
      <div class="coach-mark__content">
        <slot :name="activeTemplate.templateName"></slot>
        <div class="coach-mark__actions">
          <button class="coach-mark__button" @click="handleSkip">Skip</button>
          <button class="coach-mark__button" @click="handlePrevious">Previous</button>
          <button class="coach-mark__button" @click="handleNext">Next</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue'
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
    const activeTemplateIndex = ref(0)
    const floatingStyles = ref({
      x: null,
      y: null
    })
    const arrowStyles = ref({
      x: null,
      y: null
    })
    const localStorageKey = `${PREFIX}-${props.storageKey}`
    const activeTemplate = computed(() => {
      const isShowed = props.storageKey && localStorage.getItem(localStorageKey)
      if (isShowed === 'true') return null
      return activeTemplateIndex.value < props.steps.length
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

    function handleNext() {
      activeTemplateIndex.value++
    }

    async function doComputePosition() {
      if (!activeTemplate.value) return
      const button = document.querySelector(activeTemplate.value.target)
      const tooltip = document.querySelector('#coach-mark')
      const arrowEl = document.querySelector('#arrow')

      const { x, y, middlewareData, placement } = await computePosition(button, tooltip, {
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

    onMounted(doComputePosition)

    return {
      activeTemplateIndex,
      activeTemplate,
      floatingStyles,
      arrowStyles,
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
