# vue-coachmark (work in progress)

Vue Coachmark offers an easy-to-integrate, highly customizable, and user-friendly solution for creating interactive and responsive user guides.
This component only works in Vue3.

## Usage

```bash
npm install vue-coachmark
```

## Example

### Basic usage

```ts
interface Step {
  target: string // document.querySelector()
  templateName: string // slot name
  beforeEnter?: () => Promise<boolean> | void // hook: before enter the step
  beforeLeave?: () => Promise<boolean> | void // hook: after leave the step
}

const steps = [
  {
    target: '#bbb', // document.querySelector()
    templateName: '2' // slot name
  }
]
```

```js
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
        target: '#bbb', // document.querySelector()
        templateName: '2' // slot name
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
```

## Props

| Name             |                                                                                      Description                                                                                       |                              Default | Type                    |
| ---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | -----------------------------------: | ----------------------- |
| steps            | The main configuration of guidance, where `target` refers to the element that needs to be guided, and `templateName` refers to the guidance content written for the corresponding slot |                                    - | `Array<Step>`           |
| placement        |                                                                     Priority display position for guiding content                                                                      |                             'bottom' | `Placement`             |
| storageKey       |                      If it needs to be configured to not display next time after clicking on all the guides, it needs to be configured (stored in `localStorage`)                      |                                    - | `string`                |
| contentClass     |                                                                               The popover content class                                                                                |                                    - | `string`                |
| footerClass      |                                                                                The popover footer class                                                                                |                                    - | `string`                |
| actionsClass     |                                                                            The popover footer actions class                                                                            |                                    - | `string`                |
| autoScroll       |                                                Automatically adjust the position of the window scrollbar to the current guide position                                                 |                                 true | `boolean`               |
| autoScrollConfig |                                      The options of `scrollIntoView`, see https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView                                      | `{behavior:'smooth',block:'center'}` | `ScrollIntoViewOptions` |
| teleported       |                                                                         Whether teleport the component to body                                                                         |                              `false` | `boolean`               |
