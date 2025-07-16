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

export function getElementByXPath(xpath: string, doc: Document): HTMLElement {
  return doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLElement
}
