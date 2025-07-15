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
}

export type SerializedResult = SerializedRange[]
