<script setup>
import Basic from './demos/basic.vue'

</script>

# Vue Coachmark

Vue Coachmark is a lightweight, simple and customizable tour plugin for use with Vue.js. It provides a quick and easy way to guide your users through your application.

## Basic Usage

<Basic />

```vue
<template>
  <div id="aaa" style="background-color: yellow; color: red">test aaa</div>
  <div id="bbb" style="background-color: lightblue; color: red">test bbb</div>
  <CoachMark :steps="steps" placement="bottom">
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
```

## Props
