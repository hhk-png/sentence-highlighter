export class BaseButton extends HTMLElement {
  private styleElement: HTMLStyleElement
  private button: HTMLButtonElement

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    // <style>
    this.styleElement = document.createElement('style')
    this.styleElement.textContent = `
      button {
        font-size: 16px;
        border: none;
        color: white;
        background-color: inherit;
        cursor: pointer;
      }`

    // innerHTML
    this.button = document.createElement('button')
  }

  connectedCallback() {
    this.button.textContent = this.getAttribute('label') || 'Default'
    this.shadowRoot?.append(this.styleElement, this.button)
  }

  static get observedAttributes() {
    return ['label']
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'label' && newValue !== oldValue) {
      this.button.textContent = newValue
    }
  }

  // other methods
  setLabel(newLabel: string) {
    this.setAttribute('label', newLabel)
  }

  addClickEvent(callback: (e: MouseEvent) => void) {
    this.button.addEventListener('click', callback)
  }
}
