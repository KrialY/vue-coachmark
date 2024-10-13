<template>
  <div style="width: 2000px; height: 2000px">
    <template v-if="visible">
      <button id="aaa" style="margin-left: 300px">1111</button>
      <div
        style="background: red; width: 300px; position: absolute; bottom: -100px; left: 800px"
        id="bbb"
      >
        2222
      </div></template
    >
    <CoachMark placement="bottom" shadow>
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

const visible = ref(false)

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
  }
])
onMounted(() => {
  setTimeout(() => {
    visible.value = true
  }, 2000)
})
</script>

<style>
.popover-content {
  padding: 10px;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
