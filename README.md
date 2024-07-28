# vue-coachmark (work in progress)

Vue Coachmark offers an easy-to-integrate, highly customizable, and user-friendly solution for creating interactive and responsive user guides.
This component only works in Vue3.

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
