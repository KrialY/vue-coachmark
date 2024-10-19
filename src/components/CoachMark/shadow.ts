export function getClipPath(target: HTMLElement) {
  const rect = target.getBoundingClientRect()
  const { top, left, width, height } = rect

  const offset = 10
  const computedWidth = width + offset
  const computedHeight = height + offset
  const computedLeft = left - offset / 2
  const computedTop = top - offset / 2

  const radius = 4
  const baseInfo = `a${radius},${radius} 0 0 1`
  const roundInfo = {
    topRight: `${baseInfo} ${radius},${radius}`,
    bottomRight: `${baseInfo} ${-radius},${radius}`,
    bottomLeft: `${baseInfo} ${-radius},${-radius}`,
    topLeft: `${baseInfo} ${radius},${-radius}`
  }

  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const _path = `M${windowWidth},0 L0,0 L0,${windowHeight} L${windowWidth},${windowHeight} L${windowWidth},0 Z`

  const path = `${_path} M${computedLeft + radius},${computedTop} h${
    computedWidth - radius * 2
  } ${roundInfo.topRight} v${computedHeight - radius * 2} ${
    roundInfo.bottomRight
  } h${-computedWidth + radius * 2} ${roundInfo.bottomLeft} v${-computedHeight + radius * 2} ${roundInfo.topLeft} z`

  return path
}
