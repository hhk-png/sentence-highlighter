export interface HighlighterOptions {
  mountedElementId: string
  document?: Document
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
