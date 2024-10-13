import CoachMark from './CoachMark.vue'
import CoachMarkStep from './CoachMarkStep.vue'

const installCoachMark = (app: any): void => app.component('CoachMark', CoachMark)

export { CoachMark as default, CoachMarkStep, installCoachMark }
