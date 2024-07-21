import CoachMark from '@/components/CoachMark/CoachMark.vue'

const installCoachMark = (app: any): void =>
  app.component('CoachMark', CoachMark);


export { CoachMark as default, installCoachMark } 