import { computed, onBeforeUnmount, onMounted, ref, unref, watch, watchEffect } from 'vue'
import { arrow, autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom'
import type { CSSProperties, Ref } from 'vue'
import type { ComputePositionReturn, Middleware, Placement } from '@floating-ui/dom'
import { getClipPath } from './shadow'

function isInViewPort(element: HTMLElement) {
  const viewWidth = window.innerWidth || document.documentElement.clientWidth
  const viewHeight = window.innerHeight || document.documentElement.clientHeight
  const { top, right, bottom, left } = element.getBoundingClientRect()

  return top >= 0 && left >= 0 && right <= viewWidth && bottom <= viewHeight
}

export const useTarget = (
  target: Ref<string | HTMLElement | (() => HTMLElement | null) | null | undefined>,
  scrollIntoViewOptions: boolean | ScrollIntoViewOptions
) => {
  const posInfo: any = ref(null)
  const clipPath = ref()

  const getTargetEl = () => {
    let targetEl: HTMLElement | null
    if (typeof target.value === 'string') {
      targetEl = document.querySelector<HTMLElement>(target.value)
    } else if (typeof target.value === 'function') {
      targetEl = target.value()
    } else {
      targetEl = target.value ?? null
    }
    return targetEl
  }

  const updatePosInfo = async () => {
    const targetEl = getTargetEl()
    if (!targetEl) {
      posInfo.value = null
      return
    }

    if (isInViewPort(targetEl)) {
      updateClipPath()
    } else {
      clipPath.value = null
      targetEl.scrollIntoView(scrollIntoViewOptions)
    }
    const { left, top, width, height } = targetEl.getBoundingClientRect()

    posInfo.value = {
      left,
      top,
      width,
      height
    }
  }

  function updateClipPath() {
    const targetEl = getTargetEl()
    if (targetEl) {
      clipPath.value = getClipPath(targetEl)
    }
  }

  onMounted(() => {
    watch(
      [target],
      () => {
        updatePosInfo()
      },
      {
        immediate: true
      }
    )
    window.addEventListener('resize', updatePosInfo)
    window.addEventListener('scrollend', updateClipPath)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updatePosInfo)
    window.removeEventListener('scrollend', updateClipPath)
  })

  const triggerTarget = computed(() => {
    const targetEl = getTargetEl()

    return targetEl
  })

  return {
    clipPath,
    target: triggerTarget
  }
}

export const useFloating = (
  referenceRef: Ref<HTMLElement | null>,
  contentRef: Ref<HTMLElement | null>,
  arrowRef: Ref<HTMLElement | null>,
  placement: Placement
) => {
  const x = ref<number>()
  const y = ref<number>()
  const middlewareData = ref<ComputePositionReturn['middlewareData']>({})
  const currentPlacement = ref<Placement>(placement)

  const middleware = computed(() => {
    const _middleware: Middleware[] = [offset(10), shift(), flip()]

    if (unref(arrowRef)) {
      _middleware.push(
        arrow({
          element: unref(arrowRef)!
        })
      )
    }
    return _middleware
  })

  const update = async () => {
    const referenceEl = unref(referenceRef)
    const contentEl = unref(contentRef)
    if (!referenceEl || !contentEl) return

    const {
      x: _x,
      y: _y,
      middlewareData: _middlewareData,
      placement: _placement
    } = await computePosition(referenceEl, contentEl, {
      placement: unref(placement),
      middleware: unref(middleware)
    })
    x.value = _x
    y.value = _y
    middlewareData.value = _middlewareData
    currentPlacement.value = _placement
  }

  const contentStyle = computed<CSSProperties>(() => {
    return {
      top: unref(y) != null ? `${unref(y)}px` : '',
      left: unref(x) != null ? `${unref(x)}px` : ''
    }
  })

  const arrowStyle = computed<CSSProperties>(() => {
    const { x, y } = middlewareData.value.arrow ?? {}
    const computeArrowPosition: Record<string, string> = {
      top: 'bottom',
      bottom: 'top',
      left: 'right',
      right: 'left'
    }
    const boxShadowStyle: Record<string, string> = {
      top: '4px 4px 8px rgba(0, 0, 0, 0.1)',
      bottom: '-4px -4px 8px rgba(0, 0, 0, 0.1)',
      left: '4px -4px 8px rgba(0, 0, 0, 0.1)',
      right: '-4px 4px 8px rgba(0, 0, 0, 0.1)'
    }

    return Object.assign(
      {
        left: x != null ? `${x}px` : '',
        top: y != null ? `${y}px` : ''
      },
      currentPlacement.value
        ? {
            [computeArrowPosition[currentPlacement.value]]: '-4px',
            boxShadow: boxShadowStyle[currentPlacement.value]
          }
        : {}
    )
  })

  let cleanup: any
  onMounted(() => {
    const referenceEl = unref(referenceRef)
    const contentEl = unref(contentRef)
    if (referenceEl && contentEl) {
      cleanup = autoUpdate(referenceEl, contentEl, update)
    }

    watchEffect(() => {
      update()
    })
  })

  onBeforeUnmount(() => {
    cleanup && cleanup()
  })

  return {
    update,
    contentStyle,
    arrowStyle
  }
}
