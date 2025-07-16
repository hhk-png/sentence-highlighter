import type { BaseButton } from './BaseButton'
import type { ButtonItem } from './types'

export class ButtonList extends HTMLElement {
  private styleElement: HTMLStyleElement
  private container: HTMLDivElement
  private labelToElementMap: Map<string, BaseButton> = new Map()

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    this.styleElement = document.createElement('style')
    this.styleElement.textContent = `
      .button-list {
        display: flex;
        background-color: #4CAF50;
        border-radius: 6px;
      }`

    this.container = document.createElement('div')
    this.container.className = 'button-list'
  }

  connectedCallback() {
    this.shadowRoot?.append(this.styleElement, this.container)
    this.style.position = 'fixed'
  }

  public addButton(button: ButtonItem): void {
    const { label, onClick } = button
    const buttonElement = document.createElement('base-button') as BaseButton
    buttonElement.setAttribute('label', label)
    if (onClick) {
      buttonElement.onclick = onClick
    }
    this.container.appendChild(buttonElement)
    this.labelToElementMap.set(label, buttonElement)
  }

  public rebindButtonClickEvent(label: string, event: (e: MouseEvent) => void) {
    if (this.labelToElementMap.has(label)) {
      this.labelToElementMap.get(label)!.onclick = event
    }
  }
}
