<template>
  <div class="auto-scroll">
    <button @click="handleShowCoachMark">Show Coachmark</button>
    <div style="margin-top: 8px">
      <div id="auto-scroll-aaa" style="scroll-margin-top: 100px" class="target">Target A</div>
      <div id="auto-scroll-bbb" class="target">Target B</div>
    </div>
    <CoachMark :steps="steps" placement="bottom" v-if="showCoachMark">
      <template #1>
        <div>Target A Content</div>
      </template>
      <template #2>
        <div style="width: 500px; background: lightgreen; margin-bottom: 8px">Target B Content</div>
      </template>
    </CoachMark>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import CoachMark from '../../src/components/CoachMark'

export default defineComponent({
  name: 'AutoScrollDemo',
  components: {
    CoachMark
  },
  setup() {
    const steps = ref([
      {
        target: '#auto-scroll-aaa',
        templateName: '1'
      },
      {
        target: '#auto-scroll-bbb',
        templateName: '2'
      }
    ])
    const showCoachMark = ref(false)
    const handleShowCoachMark = () => {
      showCoachMark.value = true
    }

    return { steps, showCoachMark, handleShowCoachMark }
  }
})
</script>

<style lang="scss">
.auto-scroll {
  button {
    padding: 5px 10px;
    background-color: #007bff;
    border: none;
    border-radius: 5px;
    color: white;
    cursor: pointer;
  }

  button:hover {
    background-color: #0056b3;
  }

  .target {
    border: 1px solid #007bff;
    border-radius: 4px;
  }

  #auto-scroll-aaa {
    margin-bottom: 1000px;
  }
}
</style>
