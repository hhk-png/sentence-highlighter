import type { HighlighterOptions, SerializedRange, SerializedResult } from './types'
import { BaseButton } from './components/BaseButton'
import {
  buildHighlightButtons,
  buildUnhighlightButtons,
} from './components/buildButtonList'
import { ButtonList } from './components/ButtonList'
import { highlightName } from './constant'
import {
  formatHighlightStyle,
  getRangeHeadRect,
} from './utils'
import {
  getElementByXPath,
  getElementXPath,
} from './xpath'

export class TextHighlighter {
  private highlighter: Highlight
  // the default mounted element is document.body
  private mountedElement!: HTMLElement | Document
  // <style> for ::highlight
  private highlighterStyle: HTMLStyleElement
  // highlight buttons
  private highlightButtons: ReturnType<typeof buildHighlightButtons>
  private unhighlightButton: ReturnType<typeof buildUnhighlightButtons>

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

    // highlight Buttons
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
      {
        label: 'copy',
        onClick: () => {
          const text = this.getSelection()?.toString()
          if (text) {
            navigator.clipboard.writeText(text!)
            this.highlightButtons.hide()
            this.getSelection()?.removeAllRanges()
          }
        },
      },
    ], this.currDocument)
    this.highlightButtons.hide()
    // unhighlight Button
    this.unhighlightButton = buildUnhighlightButtons([{
      label: 'delete',
      onClick: () => { },
    }], this.currDocument)
    this.unhighlightButton.hide()

    // highlight
    this.highlighter = new globalThis.Highlight()
    this.CSSHighlights.set(highlightName, this.highlighter)
    this.highlighterStyle = this.currDocument.createElement('style')
    this.highlighterStyle.textContent
      = `::highlight(${highlightName}){${formatHighlightStyle(options.highlightStyle)}}`
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
    if (!this.unhighlightButton.instance.contains(e.target as HTMLElement)) {
      this.unhighlightButton.hide()
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
      top: rangeRect.top - 45,
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
    // rebind the click event
    this.unhighlightButton.rebindEvent((e) => {
      e.stopPropagation()
      this.highlighter.delete(currentRange)
      this.unhighlightButton.hide()
    })
    this.unhighlightButton.show()

    const rangeRect = getRangeHeadRect(currentRange)
    this.unhighlightButton.setPosition({
      top: rangeRect.top - 45,
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

  public serialize(saveText: boolean = false) {
    const res: SerializedResult = []
    for (const range of this.highlighter) {
      if (range instanceof this.RangeClass && !range.collapsed) {
        const startContainer = getElementXPath(range.startContainer as HTMLElement, this.mountedElement)
        const endContainer = getElementXPath(range.endContainer as HTMLElement, this.mountedElement)
        const obj: SerializedRange = {
          startContainer,
          startOffset: range.startOffset,
          endContainer,
          endOffset: range.endOffset,
        }
        if (saveText) {
          obj.text = range.toString()
        }
        res.push(obj)
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
