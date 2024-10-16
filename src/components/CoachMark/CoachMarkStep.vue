<template>
  <div :class="['coach-mark__content', contentClass]">
    <slot></slot>
    <slot name="actions" :skip="handleSkip" :previous="handlePrevious" :next="handleNext">
      <div :class="['coach-mark__footer', footerClass]">
        <slot name="progress" :current="activeTemplateIndex" :total="total">
          <div class="coach-mark__progress">{{ activeTemplateIndex + 1 }} / {{ total }}</div>
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
          <slot name="next" :next="handleNext" :currentStep="activeTemplateIndex">
            <button class="coach-mark__button" @click="handleNext">
              {{ activeTemplateIndex === total - 1 ? 'Finish' : 'Next' }}
            </button>
          </slot>
        </div>
      </div>
    </slot>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import { defineComponent, inject, watch } from 'vue'
import { Action, COACH_MARK_PROVIDE_KEY } from './CoachMark.vue'

export const COACH_MARK_STEP_COMPONENT_NAME = 'CoachMarkStep'
const definePropType = <T,>(val: any): PropType<T> => val

export default defineComponent({
  name: COACH_MARK_STEP_COMPONENT_NAME,
  props: {
    target: {
      type: definePropType<string | HTMLElement | (() => HTMLElement | null) | null>([
        String,
        Object,
        Function
      ])
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
    }
  },
  components: {},
  setup(props) {
    const { activeTemplateIndex, total, isChangingStep, action, currentStep }: any =
      inject(COACH_MARK_PROVIDE_KEY)

    watch(
      props,
      (val) => {
        currentStep.value = val
      },
      {
        immediate: true
      }
    )

    async function handleSkip() {
      // trigger animation
      activeTemplateIndex.value = total.value
    }

    async function handlePrevious() {
      // trigger animation
      isChangingStep.value = true
      action.value = Action.previous
    }

    async function handleNext() {
      // trigger animation
      isChangingStep.value = true
      action.value = Action.next
    }

    return {
      activeTemplateIndex,
      total,
      handleSkip,
      handleNext,
      handlePrevious
    }
  }
})
</script>

<style lang="scss">
.coach-mark {
  &__content {
    padding: 20px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow:
      0 4px 8px rgba(0, 0, 0, 0.1),
      0 6px 20px rgba(0, 0, 0, 0.1);
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
}
</style>
