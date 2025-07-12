import type { HighlighterOptions, SerializedResult } from './types'
import { BaseButton } from './components/BaseButton'
import { buildHighlightButtons, createUnhighlightButtons } from './components/buildButtonList'
import { ButtonList } from './components/ButtonList'
import { highlightName } from './constant'
import { getElementByXPath, getElementXPath, getRangeHeadRect } from './utils'

export class TextHighlighter {
  private highlighter: Highlight
  // the default mounted element is document.body
  private mountedElement: HTMLElement | Document = document
  // <style> for ::highlight
  private highlighterStyle: HTMLStyleElement
  // highlight buttons
  private highlightButtons: ReturnType<typeof buildHighlightButtons>
  private unhighlightButton: ReturnType<typeof createUnhighlightButtons> | undefined = undefined

  // TODO: support a feature that allows users to highlight text in iframes
  constructor(options: Partial<HighlighterOptions> = {}) {
    // define Button components
    customElements.define('base-button', BaseButton)
    customElements.define('button-list', ButtonList)

    // highlightButtons
    this.highlightButtons = buildHighlightButtons([
      {
        label: 'highlight',
        onClick: (e) => {
          e.stopPropagation()
          const selection = window.getSelection()!
          const range = selection.getRangeAt(0)

          this.highlighter.add(range)
          this.highlightButtons.hide()
          selection.removeAllRanges()
        },
      },
    ])
    this.highlightButtons.hide()

    if (options.mountedElementId) {
      this.mountedElement = document.getElementById(options.mountedElementId) as HTMLElement
    }

    // highlight
    this.highlighter = new Highlight()
    CSS.highlights.set(highlightName, this.highlighter)
    this.highlighterStyle = document.createElement('style')
    this.highlighterStyle.textContent = `
      ::highlight(${highlightName}) {
        background-color: #f06;
      }`
    document.head.appendChild(this.highlighterStyle)
    this.addOnLoadEvents()
  }

  // avoid memory leak
  destroy(): void {
    this.mountedElement.removeEventListener('click', this.bindedOnClickRange)
    document.removeEventListener('mousedown', this.bindedOnSelectionMouseDown)
    document.removeEventListener('mouseup', this.bindedOnSelectionMouseUp)
    this.highlighterStyle.remove()
    CSS.highlights.delete(highlightName)
  }

  private onSelectionMouseDown(e: MouseEvent): void {
    // click outside highlightButtons
    if (!this.highlightButtons.instance.contains(e.target as HTMLElement)) {
      window.getSelection()?.removeAllRanges()
      this.highlightButtons.hide()
    }

    // click outside unhighlightButton
    // TODO: delete button will cause flash when clicking on the same range
    if (!this.unhighlightButton?.instance.contains(e.target as HTMLElement)) {
      this.unhighlightButton?.remove()
      this.unhighlightButton = undefined
    }
  }

  private bindedOnSelectionMouseDown = this.onSelectionMouseDown.bind(this)

  private onSelectionMouseUp(_: MouseEvent): void {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed)
      return
    // Show `Highlight` button
    this.highlightButtons.show()

    // set position of the highlight buttons
    const rangeRect = getRangeHeadRect(selection.getRangeAt(0))
    this.highlightButtons.setPosition({
      top: rangeRect.top - 40,
      left: rangeRect.left,
    })
  }

  private bindedOnSelectionMouseUp = this.onSelectionMouseUp.bind(this)

  private onClickRange(e: MouseEvent): void {
    // to avoid delete range when selecting text
    const selection = window.getSelection()
    if (selection && !selection.isCollapsed) {
      return
    }

    // collect ranges that intersect with the clicked target
    const target = e.target as HTMLElement
    const intersectionRanges: Range[] = []
    for (const range of this.highlighter) {
      if (range instanceof Range && !range.collapsed) {
        if (range.intersectsNode(target)) {
          intersectionRanges.push(range)
          break
        }
      }
    }
    if (intersectionRanges.length === 0) {
      return
    }

    // remove collected range
    const currentRange = intersectionRanges[0]
    // we need to recreate the unhighlightButton each click,
    //  because we need to rebind the click event
    this.unhighlightButton = createUnhighlightButtons([
      {
        label: 'delete',
        onClick: (e) => {
          e.stopPropagation()
          this.highlighter.delete(currentRange)
          this.unhighlightButton!.remove()
          this.unhighlightButton = undefined
        },
      },
    ])
    // TODO: limit the position boundary of unhighlightButton
    const rangeRect = getRangeHeadRect(currentRange)
    this.unhighlightButton.setPosition({
      top: rangeRect.top - 40,
      left: rangeRect.left,
    })
  }

  private bindedOnClickRange = this.onClickRange.bind(this) as EventListenerOrEventListenerObject

  private addOnLoadEvents(): void {
    document.addEventListener('mousedown', this.bindedOnSelectionMouseDown, false)
    // Show Highlight button
    document.addEventListener('mouseup', this.bindedOnSelectionMouseUp, false)
    // click range to show delete button
    this.mountedElement.addEventListener('click', this.bindedOnClickRange, false)
  }

  public serialize() {
    const res: SerializedResult = []
    for (const range of this.highlighter) {
      if (range instanceof Range && !range.collapsed) {
        const startContainer = getElementXPath(range.startContainer as HTMLElement)
        const endContainer = getElementXPath(range.endContainer as HTMLElement)
        res.push({
          startContainer,
          startOffset: range.startOffset,
          endContainer,
          endOffset: range.endOffset,
        })
      }
    }
    return JSON.stringify(res)
  }

  public deserialize(serialized: string, clearPreviousRange: boolean = false): void {
    const ranges: SerializedResult = JSON.parse(serialized)
    if (clearPreviousRange) {
      this.highlighter.clear()
    }
    for (const range of ranges) {
      const startContainer = getElementByXPath(range.startContainer, document)
      const endContainer = getElementByXPath(range.endContainer, document)
      if (startContainer && endContainer) {
        const newRange = document.createRange()
        newRange.setStart(startContainer, range.startOffset)
        newRange.setEnd(endContainer, range.endOffset)
        this.highlighter.add(newRange)
      }
    }
  }
}
