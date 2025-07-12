export interface HighlighterOptions {
  mountedElementId: string
}

export interface SerializedRange {
  // XPath array
  startContainer: string
  startOffset: number
  endContainer: string
  endOffset: number
}

export type SerializedResult = SerializedRange[]
