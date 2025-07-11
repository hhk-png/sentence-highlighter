import type { ButtonList } from './ButtonList'
import type { ButtonItem } from './types'

export function buildButtonList(buttons: ButtonItem[]): ButtonList {
  const buttonList = document.createElement('button-list') as ButtonList
  for (const button of buttons) {
    buttonList.addButton(button)
  }
  return buttonList
}

interface ListPosition {
  top: number
  left: number
  right?: number
  bottom?: number
}

export function buildHighlightButtons(buttons: ButtonItem[]) {
  const buttonList = buildButtonList(buttons)
  document.body.appendChild(buttonList)

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
      if (position.right) {
        buttonList.style.right = `${position.right}px`
      }
      if (position.bottom) {
        buttonList.style.bottom = `${position.bottom}px`
      }
    },
  }
}

export function buildUnHighlightButtons(buttons: ButtonItem[]) {
  const buildList = buildButtonList(buttons)
  document.body.appendChild(buildList)

  return () => {
    document.body.removeChild(buildList)
  }
}
