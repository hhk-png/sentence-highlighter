import type { ButtonList } from './ButtonList'
import type { ButtonItem } from './types'

function buildButtonList(buttons: ButtonItem[]): ButtonList {
  const buttonList = document.createElement('button-list') as ButtonList
  for (const button of buttons) {
    buttonList.addButton(button)
  }
  return buttonList
}

interface ListPosition {
  top: number
  left: number
}

export function buildHighlightButtons(buttons: ButtonItem[], doc: Document) {
  const buttonList = buildButtonList(buttons)
  doc.body.appendChild(buttonList)

  return {
    instance: buttonList,
    isShow() {
      return buttonList.style.display !== 'none'
    },
    show() {
      buttonList.style.display = 'block'
    },
    hide() {
      buttonList.style.display = 'none'
    },
    setPosition(position: ListPosition) {
      buttonList.style.top = `${position.top}px`
      buttonList.style.left = `${position.left}px`
    },
  }
}

export function buildUnhighlightButtons(buttons: ButtonItem[], doc: Document) {
  const buttonList = buildButtonList(buttons)

  doc.body.appendChild(buttonList)

  return {
    instance: buttonList,
    hide() {
      buttonList.style.display = 'none'
    },
    show() {
      buttonList.style.display = 'block'
    },
    setPosition(position: ListPosition) {
      buttonList.style.top = `${position.top}px`
      buttonList.style.left = `${position.left}px`
    },
    rebindEvent(event: (e: MouseEvent) => void) {
      buttonList.rebindButtonClickEvent('delete', event)
    },
  }
}
