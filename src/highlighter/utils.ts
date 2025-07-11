export function getRangeHeadRect(range: Range): DOMRect {
  const clonedRange = range.cloneRange()
  clonedRange.collapse(true)
  return clonedRange.getBoundingClientRect()
}
