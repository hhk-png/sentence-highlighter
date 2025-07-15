export interface HighlightStyle {
  color?: string
  backgroundColor?: string
  textDecoration?: string
  textShadow?: string
}

export interface HighlighterOptions {
  mountedElementId: string
  document?: Document
  highlightStyle?: HighlightStyle
}

export interface SerializedRange {
  // XPath array
  startContainer: string
  startOffset: number
  endContainer: string
  endOffset: number
  text?: string
}

export type SerializedResult = SerializedRange[]
