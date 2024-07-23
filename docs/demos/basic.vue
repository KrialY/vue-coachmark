<template>
  <div id="aaa" style="background-color: yellow; color: red; scroll-margin-top: 100px">
    test aaa
  </div>
  <div id="bbb" style="background-color: lightblue; color: red">test bbb</div>
  <CoachMark :steps="steps" placement="bottom" :autoScroll="false">
    <template #1>
      <div style="background: red">11</div>
    </template>
    <template #2>
      <div style="width: 500px; background: red">2</div>
    </template>
  </CoachMark>
</template>

<script>
import { defineComponent, ref } from 'vue'
import CoachMark from 'vue-coachmark'

export default defineComponent({
  name: 'BasicDemo',
  components: {
    CoachMark
  },
  setup() {
    const steps = ref([
      {
        target: '#bbb',
        templateName: '2'
      },
      {
        target: '#aaa',
        templateName: '1'
      }
    ])
    return { steps }
  }
})
</script>

<style lang="scss"></style>
