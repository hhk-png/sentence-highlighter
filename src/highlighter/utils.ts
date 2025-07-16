import type { HighlightStyle } from './types'

function normalizeKey(key: string) {
  return key.replace(/([A-Z])/g, letter => `-${letter.toLowerCase()}`)
}

export function formatHighlightStyle(highlightStyle: HighlightStyle = {}) {
  if (!highlightStyle.backgroundColor) {
    highlightStyle.backgroundColor = '#f06'
  }

  let res = ''
  for (const [key, value] of Object.entries(highlightStyle)) {
    res += `${normalizeKey(key)}:${value};`
  }
  return res
}

export function getRangeHeadRect(range: Range): DOMRect {
  const clonedRange = range.cloneRange()
  clonedRange.collapse(true)
  return clonedRange.getBoundingClientRect()
}
