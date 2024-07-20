<template>
  <div style="width: 2000px; height: 2000px">
    <Popover v-if="false" v-model="isPopoverVisible">
      <template #reference>
        <button>Click me</button>
      </template>
      <template #content>
        <div>This is the popover content.</div>
      </template>
    </Popover>
    <button style="margin-left: 300px" id="aaa">1111</button>
    <div style="background: red; width: 300px; position: absolute; bottom: -100px" id="bbb">
      2222
    </div>
    <CoachMark :steps="steps" placement="bottom">
      <template #1>1</template>
      <template #2>2</template>
      <template #3>3</template>
    </CoachMark>
  </div>
</template>

<script setup lang="ts">
import CoachMark from '@/components/CoachMark/index.vue'
import Popover from '@/components/CoachMark/Popover.vue'
import { ref } from 'vue'

const isPopoverVisible = ref(false)

const steps = ref([
  {
    target: '#aaa',
    templateName: '1'
  },
  {
    target: '#bbb',
    templateName: '2'
  }
])
</script>

<style>
.popover-content {
  padding: 10px;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
