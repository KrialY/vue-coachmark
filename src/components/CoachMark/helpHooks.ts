import { computed, onBeforeUnmount, onMounted, ref, unref, watchEffect } from 'vue'
import { arrow, autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom'
import type { CSSProperties, Ref } from 'vue'
import type { ComputePositionReturn, Middleware, Placement } from '@floating-ui/dom'

export const useFloating = (
  referenceRef: Ref<HTMLElement | null>,
  contentRef: Ref<HTMLElement | null>,
  arrowRef: Ref<HTMLElement | null>,
  placement: Placement,
  scrollIntoViewOptions: ScrollIntoViewOptions
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
    referenceEl.scrollIntoView(scrollIntoViewOptions)

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
    if (!unref(referenceRef)) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate3d(-50%, -50%, 0)',
        maxWidth: '100vw'
      }
    }

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
