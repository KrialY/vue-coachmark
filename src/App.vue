<template>
  <div style="width: 2000px; height: 2000px">
    <button id="aaa" style="margin-left: 300px">1111</button>
    <button id="ccc" style="margin-left: 300px">cccc</button>
    <div
      style="background: red; width: 300px; position: absolute; bottom: -100px; left: 800px"
      id="bbb"
      ref="testRef"
    >
      2222
    </div>
    <CoachMark placement="bottom" shadow v-if="coachMarkVisible">
      <CoachMarkStep
        v-for="step in steps"
        :key="step.templateName"
        :beforeLeave="step.beforeLeave"
        :target="step.target"
        >Step{{ step.templateName }}xx</CoachMarkStep
      >
    </CoachMark>
  </div>
</template>

<script setup lang="ts">
import CoachMark, { CoachMarkStep } from '@/components/CoachMark'
import { onMounted, ref } from 'vue'

const visible = ref(true)
const coachMarkVisible = ref(false)
const testRef = ref()

const steps = ref([
  {
    target: '#bbb',
    templateName: '2',
    beforeEnter: () => {
      console.log('beforeEnter bb')
    },
    beforeLeave: () => {
      console.log('beforeLeave bb')
    }
  },
  {
    target: '#aaa',
    templateName: '1',
    beforeEnter: () => {
      console.log('beforeEnter aa')
    },
    beforeLeave: () => {
      console.log('beforeLeave aa')
    }
  },
  {
    target: '#ccc',
    templateName: '1'
  }
])
onMounted(() => {
  setTimeout(() => {
    visible.value = true
    coachMarkVisible.value = true
  }, 2000)
  // testRef.value.scrollIntoView({
  //   behavior: 'smooth'
  // })
})
</script>

<style>
.popover-content {
  padding: 10px;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
