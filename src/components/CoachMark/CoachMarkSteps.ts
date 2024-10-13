import { defineComponent, isVNode } from 'vue'
import type { Component, VNode, VNodeChild, VNodeNormalizedChildren } from 'vue'
import { COACH_MARK_STEP_COMPONENT_NAME } from './CoachMarkStep.vue'

type VNodeChildAtom = Exclude<VNodeChild, Array<any>>
type RawSlots = Exclude<VNodeNormalizedChildren, Array<any> | null | string>
type FlattenVNodes = Array<VNodeChildAtom | RawSlots>

const flattedChildren = (
  children: FlattenVNodes | VNode | VNodeNormalizedChildren
): FlattenVNodes => {
  const vNodes = Array.isArray(children) ? children : [children]
  const result: FlattenVNodes = []

  vNodes.forEach((child) => {
    if (Array.isArray(child)) {
      result.push(...flattedChildren(child))
    } else if (isVNode(child) && Array.isArray(child.children)) {
      result.push(...flattedChildren(child.children))
    } else {
      result.push(child)
      if (isVNode(child) && child.component?.subTree) {
        result.push(...flattedChildren(child.component.subTree))
      }
    }
  })
  return result
}

export default defineComponent({
  name: 'CoachMarkSteps',
  props: {
    current: {
      type: Number,
      default: 0
    }
  },
  emits: ['update-total'],
  setup(props, { slots, emit }) {
    let cacheTotal = 0

    return () => {
      const children = slots.default?.()!
      const result: VNode[] = []
      let total = 0

      function filterSteps(children?: FlattenVNodes) {
        if (!Array.isArray(children)) return
        ;(children as VNode[]).forEach((item) => {
          const name = ((item?.type || {}) as Component)?.name

          if (name === COACH_MARK_STEP_COMPONENT_NAME) {
            result.push(item)
            total += 1
          }
        })
      }

      if (children.length) {
        filterSteps(flattedChildren(children![0]?.children))
      }

      if (cacheTotal !== total) {
        cacheTotal = total
        emit('update-total', total)
      }

      if (result.length) {
        return result[props.current]
      }
      return null
    }
  }
})
