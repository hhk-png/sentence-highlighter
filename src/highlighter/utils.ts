export function getRangeHeadRect(range: Range): DOMRect {
  const clonedRange = range.cloneRange()
  clonedRange.collapse(true)
  return clonedRange.getBoundingClientRect()
}

// export function getIframeElementFromDocument(win: Window): HTMLIFrameElement | undefined {
//   const parentWin = win.parent

//   if (win === parentWin) {
//     // window.parent === window, meaning it's not inside an iframe
//     return undefined
//   }

//   const iframes = parentWin.document.getElementsByTagName('iframe')

//   for (let iframe of iframes) {
//     try {
//       if (iframe.contentWindow === win) {
//         return iframe
//       }
//     } catch (e) {
//       console.warn('Cross-domain iframe, unable to access contentWindow.')
//       return undefined
//     }
//   }

//   return undefined
// }

export function getElementXPath(node: HTMLElement, mountedElement: Document | HTMLElement): string {
  const path: string[] = []

  while (node && node !== mountedElement) {
    let index = 1
    let segment = ''

    if (node.nodeType === Node.ELEMENT_NODE) {
      // if the node has an ID, use it directly
      // if (node.id) {
      //   segment = `/*[@id="${node.id}"]`
      //   path.unshift(segment)
      //   break
      // }
      const tagName = (node as Element).tagName.toLowerCase()
      let sibling = node.previousElementSibling
      while (sibling) {
        if (sibling.nodeName === node.nodeName)
          index++
        sibling = sibling.previousElementSibling
      }
      segment = `${tagName}[${index}]`
    }
    else if (node.nodeType === Node.TEXT_NODE) {
      // 对 text() 节点，按出现顺序计算 index
      let sibling = node.previousSibling
      while (sibling) {
        if (sibling.nodeType === Node.TEXT_NODE) {
          index++
        }
        sibling = sibling.previousSibling
      }
      segment = `text()[${index}]`
    }
    else {
      // 其他类型暂不处理
      break
    }

    path.unshift(segment)
    node = node.parentNode as HTMLElement
  }

  if (mountedElement instanceof HTMLElement) {
    path.unshift(`/*[@id="${mountedElement.id}"]`)
  }

  return `/${path.join('/')}`
}

// export function getElementXPath(elem: HTMLElement): string[] {
//   const res: string[] = []
//   let win: Window | null = null
//   while (win !== window) {
//     const [elemWindow, xpath] = getSegmentXPath(elem)
//     res.unshift(xpath)
//     const iframe = getIframeElementFromDocument(elemWindow!)

//     if (!iframe) {
//       break
//     } else {
//       win = elemWindow
//     }
//   }
//   return res
// }

export function getElementByXPath(xpath: string, doc: Document): HTMLElement {
  return doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLElement
}
