<template>
  <div ref="reference" @click="toggle" class="popover-reference">
    <slot name="reference"></slot>
  </div>
  <div v-if="isVisible" ref="floating" class="popover-floating" :style="floatingStyles">
    <div ref="arrowEl" :style="arrowStyles" class="popover-arrow"></div>
    <div class="popover-content">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue'
import { useFloating, offset, flip, shift, arrow } from '@floating-ui/vue'

export default {
  name: 'PopoverCom',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const isVisible = ref(props.modelValue)
    const reference = ref(null)
    const floating = ref(null)
    const arrowEl = ref(null)

    const { x, y, strategy, placement, middlewareData, floatingStyles } = useFloating(
      reference,
      floating,
      {
        placement: 'top',
        middleware: [offset(10), flip(), shift(), arrow({ element: arrowEl })]
      }
    )

    const toggle = () => {
      isVisible.value = !isVisible.value
      emit('update:modelValue', isVisible.value)
    }

    const arrowStyles = computed(() => {
      const { x: arrowX, y: arrowY } = middlewareData.value.arrow || {}
      const staticSide =
        placement.value.split('-')[0] === 'top'
          ? 'bottom'
          : placement.value.split('-')[0] === 'bottom'
            ? 'top'
            : placement.value.split('-')[0] === 'left'
              ? 'right'
              : 'left'
      return {
        left: arrowX != null ? `${arrowX}px` : '',
        top: arrowY != null ? `${arrowY}px` : '',
        [staticSide]: '-4px'
      }
    })

    watch(
      () => props.modelValue,
      (newValue) => {
        isVisible.value = newValue
      }
    )

    return {
      arrowStyles,
      isVisible,
      reference,
      floating,
      arrowEl,
      x,
      y,
      strategy,
      placement,
      middlewareData,
      floatingStyles,
      toggle
    }
  }
}
</script>

<style scoped>
.popover-reference {
  cursor: pointer;
}

.popover-floating {
  position: absolute;
  z-index: 1000;
}

.popover-content {
  padding: 10px;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.popover-arrow {
  width: 10px;
  height: 10px;
  background-color: white;
  transform: rotate(45deg);
  position: absolute;
}
</style>
