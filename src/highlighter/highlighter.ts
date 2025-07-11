import type { HighlighterOptions } from './types'
import { BaseButton } from './components/BaseButton'
import { buildHighlightButtons } from './components/buildButtonList'
import { ButtonList } from './components/ButtonList'

export class TextHighlighter {
  private highlighter: Highlight
  // the default mounted element is document.body
  private mountedElement: HTMLElement
  // <style> for ::highlight
  private highlighterStyle: HTMLStyleElement
  // highlight buttons
  private highlightButtons: ReturnType<typeof buildHighlightButtons>

  constructor(options: Partial<HighlighterOptions> = {}) {
    // define Button components
    customElements.define('base-button', BaseButton)
    customElements.define('button-list', ButtonList)

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

    if (options.mountedId) {
      this.mountedElement = document.getElementById(options.mountedId) as HTMLElement
    }
    else {
      this.mountedElement = document.body
    }

    this.highlighter = new Highlight()
    CSS.highlights.set('TextHighlighter-default', this.highlighter)
    this.highlighterStyle = document.createElement('style')
    this.highlighterStyle.textContent = `
      ::highlight(TextHighlighter-default) {
        background-color: #f06;
      }`
    document.head.appendChild(this.highlighterStyle)
    this.addOnLoadEvents()
  }

  // destroy(): void {
  //   this.mountedElement.removeEventListener('click', this.onClickRange.bind(this))
  //   document.removeEventListener('mouseup', this.onSelectionMouseUp.bind(this))
  //   this.highlighterStyle.remove()
  //   CSS.highlights.delete('TextHighlighter-default')
  // }

  public highlight(): void {
  }

  // unhighlight(range: Range): void {
  // }

  private onSelectionMouseDown(e: MouseEvent): void {
    if (!this.highlightButtons.instance.contains(e.target as HTMLElement)) {
      window.getSelection()?.removeAllRanges()
      this.highlightButtons.hide()
    }
  }

  private onSelectionMouseUp(_: MouseEvent): void {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed)
      return
    // Show `Highlight` button
    this.highlightButtons.show()

    // set position of the highlight buttons
    const range = selection.getRangeAt(0).cloneRange()
    range.collapse(true)
    const rangeRect = range.getBoundingClientRect()
    this.highlightButtons.setPosition({
      top: rangeRect.top - 40,
      left: rangeRect.left,
    })
  }

  private onClickRange(e: MouseEvent): void {
    const target = e.target as HTMLElement
    const intersectionNodes: HTMLElement[] = []
    this.highlighter.forEach((range: AbstractRange) => {
      if (range instanceof Range && !range.collapsed) {
        if (range.intersectsNode(target)) {
          intersectionNodes.push(target)
        }
      }
    })
    // show delete button and addEventListener to it(this.unhighlight(range))
  }

  private addOnLoadEvents(): void {
    document.addEventListener('mousedown', this.onSelectionMouseDown.bind(this), false)
    // Show Highlight button
    document.addEventListener('mouseup', this.onSelectionMouseUp.bind(this), false)
    // click range to show delete button
    this.mountedElement.addEventListener('click', this.onClickRange.bind(this), false)
  }

  // later:
  public serialize() {
    throw new Error('Method not implemented.')
  }

  public deserialize() {
    throw new Error('Method not implemented.')
  }
}
