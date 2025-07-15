import type { HighlighterOptions, SerializedResult } from './types'
import { BaseButton } from './components/BaseButton'
import { buildHighlightButtons, createUnhighlightButtons } from './components/buildButtonList'
import { ButtonList } from './components/ButtonList'
import { highlightName } from './constant'
import {
  getElementByXPath,
  getElementXPath,
  getRangeHeadRect,
} from './utils'

export class TextHighlighter {
  private highlighter: Highlight
  // the default mounted element is document.body
  private mountedElement!: HTMLElement | Document
  // <style> for ::highlight
  private highlighterStyle: HTMLStyleElement
  // highlight buttons
  private highlightButtons: ReturnType<typeof buildHighlightButtons>
  private unhighlightButton: ReturnType<typeof createUnhighlightButtons> | undefined = undefined

  private currWindow: typeof globalThis = window
  private currDocument: Document = document

  private RangeClass!: typeof Range
  private CSSHighlights!: HighlightRegistry

  private defineCustomComponents() {
    this.currWindow.customElements.define('base-button', BaseButton)
    this.currWindow.customElements.define('button-list', ButtonList)
  }

  private getSelection(): Selection | null {
    return this.currWindow.getSelection()
  }

  constructor(options: Partial<HighlighterOptions> = {}) {
    if (options.document) {
      this.currDocument = options.document
      this.currWindow = options.document.defaultView!
    }
    this.CSSHighlights = this.currWindow.CSS.highlights
    this.RangeClass = this.currWindow.Range
    // define Button components
    this.defineCustomComponents()

    // highlightButtons
    this.highlightButtons = buildHighlightButtons([
      {
        label: 'highlight',
        onClick: (e) => {
          e.stopPropagation()
          const selection = this.getSelection()!
          const range = selection.getRangeAt(0)
          this.highlighter.add(range)
          this.highlightButtons.hide()
          selection.removeAllRanges()
        },
      },
    ], this.currDocument)
    this.highlightButtons.hide()

    // highlight
    this.highlighter = new this.currWindow.Highlight()
    this.CSSHighlights.set(highlightName, this.highlighter)
    this.highlighterStyle = this.currDocument.createElement('style')
    this.highlighterStyle.textContent = `
      ::highlight(${highlightName}) {
        background-color: #f06;
      }`
    this.currDocument.head.appendChild(this.highlighterStyle)

    // add events
    this.currWindow.addEventListener('load', () => {
      if (options.mountedElementId) {
        this.mountedElement
          = this.currDocument.getElementById(options.mountedElementId) as HTMLElement
        if (!this.mountedElement) {
          throw new Error(`Element with id "${options.mountedElementId}" not found. So it can not work.`)
        }
      }
      else {
        this.mountedElement = this.currDocument
      }
      this.addOnLoadEvents()
    })
  }

  // avoid memory leak
  destroy(): void {
    this.mountedElement.removeEventListener('click', this.bindedOnClickRange)
    this.currDocument.removeEventListener('mousedown', this.bindedOnSelectionMouseDown)
    this.currDocument.removeEventListener('mouseup', this.bindedOnSelectionMouseUp)
    this.highlighterStyle.remove()
    this.CSSHighlights.delete(highlightName)
  }

  private onSelectionMouseDown(e: MouseEvent): void {
    // click outside highlightButtons
    if (!this.highlightButtons.instance.contains(e.target as HTMLElement)) {
      this.getSelection()?.removeAllRanges()
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
    const selection = this.getSelection()
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
    const selection = this.getSelection()
    if (selection && !selection.isCollapsed) {
      return
    }

    // collect ranges that intersect with the clicked target
    const intersectionRanges: Range[] = []
    for (const range of this.highlighter) {
      if (range instanceof this.RangeClass && !range.collapsed) {
        // using getBoundingClientRect to check if the mouse is inside the range's rect
        const mouseX = e.clientX
        const mouseY = e.clientY
        const rect = range.getBoundingClientRect()
        if (
          mouseX >= rect.left && mouseX <= rect.right
          && mouseY >= rect.top && mouseY <= rect.bottom) {
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
    ], this.currDocument)

    const rangeRect = getRangeHeadRect(currentRange)
    this.unhighlightButton.setPosition({
      top: rangeRect.top - 40,
      left: rangeRect.left,
    })
  }

  private bindedOnClickRange = this.onClickRange.bind(this) as EventListenerOrEventListenerObject

  private addOnLoadEvents(): void {
    this.currDocument.addEventListener('mousedown', this.bindedOnSelectionMouseDown, false)
    // Show Highlight button
    this.currDocument.addEventListener('mouseup', this.bindedOnSelectionMouseUp, false)
    // click range to show delete button
    this.mountedElement.addEventListener('click', this.bindedOnClickRange, false)
  }

  public serialize() {
    const res: SerializedResult = []
    for (const range of this.highlighter) {
      if (range instanceof this.RangeClass && !range.collapsed) {
        const startContainer = getElementXPath(range.startContainer as HTMLElement, this.mountedElement)
        const endContainer = getElementXPath(range.endContainer as HTMLElement, this.mountedElement)
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
      const startContainer = getElementByXPath(range.startContainer, this.currDocument)
      const endContainer = getElementByXPath(range.endContainer, this.currDocument)
      if (startContainer && endContainer) {
        const newRange = this.currDocument.createRange()
        newRange.setStart(startContainer, range.startOffset)
        newRange.setEnd(endContainer, range.endOffset)
        this.highlighter.add(newRange)
      }
    }
  }
}
