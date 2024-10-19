<template>
  <div :class="['coach-mark__mask', shadow ? 'coach-mark__mask--enable' : null]">
    <Transition name="coach-mark">
      <svg class="coach-mark__mask-content" v-if="clipPath">
        <path :d="clipPath" />
      </svg>
    </Transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'CoachMarkMask',
  props: {
    shadow: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    clipPath: {
      type: String as PropType<string>,
      default: null
    }
  }
})
</script>

<style lang="scss">
.coach-mark {
  &__mask {
    transition: all 0.5s ease;
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    z-index: 999;
  }
  &__mask-content {
    width: 100%;
    height: 100%;
    path {
      fill: rgba(0, 0, 0, 0.5);
      transition: all 0.5s ease;
    }
  }
}
</style>
