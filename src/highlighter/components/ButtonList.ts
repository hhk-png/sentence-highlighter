import type { BaseButton } from './BaseButton'
import type { ButtonItem } from './types'

export class ButtonList extends HTMLElement {
  private styleElement: HTMLStyleElement
  private container: HTMLDivElement

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    this.styleElement = document.createElement('style')
    this.styleElement.textContent = `
      .button-list {

        display: flex;
        gap: 10px;
      }`

    this.container = document.createElement('div')
    this.container.className = 'button-list'
  }

  connectedCallback() {
    this.shadowRoot?.append(this.styleElement, this.container)
    this.style.position = 'fixed'
  }

  public addButton(button: ButtonItem): void {
    const buttonElement = document.createElement('base-button') as BaseButton
    buttonElement.setAttribute('label', button.label)
    button.onClick && buttonElement.addEventListener('click', button.onClick)
    this.container.appendChild(buttonElement)
  }
}
