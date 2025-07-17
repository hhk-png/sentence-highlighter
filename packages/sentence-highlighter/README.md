# English

`sentence-highlighter` is a text highlighting tool built on the [Highlight API](https://developer.mozilla.org/zh-CN/docs/Web/API/Highlight). It supports text selection for highlighting and unhighlighting, as well as serialization and deserialization of highlights.

The [Highlight API](https://developer.mozilla.org/zh-CN/docs/Web/API/Highlight) is currently supported in Chrome, Edge, and Safari, but not yet available in Firefox.

## Install

```shell
pnpm install sentence-highlighter
```

## Usage

```typescript
import { SentenceHighlighter } from 'sentence-highlighter'

document.body.innerHTML = `
  <article>
    <p>
      Maxime debitis hic, delectus perspiciatis laborum molestiae labore,
      deleniti, <strong>quam</strong> consequatur <i>iure</i> veniam alias voluptas nisi quo. Dolorem
      eaque alias, quo vel quas repudiandae architecto deserunt quidem, sapiente
      laudantium nulla.
    </p>
    <div id="temp">
    <p>
      Maiores odit molestias, <b>necessitatibus doloremque <i>dolor illum reprehenderit
      provident</i> nostrum <span>laboriosam<span> iste, tempore perferendis!</b> Ab porro neque esse
      voluptas libero necessitatibus fugiat, ex, minus atque deserunt veniam
      molestiae tempora? Vitae.
    </p>
    </div>
    <p>
      Dolorum facilis voluptate eaque eius similique ducimus dignissimos assumenda
      quos architecto. <em>Doloremque deleniti non exercitationem rerum quam alias
      harum, nisi obcaecati corporis temporibus</em> vero sapiente voluptatum est
      quibusdam id ipsa.
    </p>
  </article>
  <button id="serialize">serialize</button>
  <button id="deserialize">deserialize</button>
`

const highlighter = new SentenceHighlighter({
  mountedElementId: 'app',
})

let serialized: ReturnType<SentenceHighlighter['serialize']>

document.getElementById('serialize')!.addEventListener('click', () => {
  serialized = highlighter.serialize()
  console.log(serialized)
})

document.getElementById('deserialize')!.addEventListener('click', () => {
  highlighter.deserialize(serialized, true)
})
```

## SentenceHighlighter class

### constructor(options?: Partial\<HighlighterOptions\>)

**Parameters：**

| Parameter | Type                          | Description                                                                                 |
| --------- | ----------------------------- | ------------------------------------------------------------------------------------------- |
| `options` | `Partial<HighlighterOptions>` | Optional configurations, such as the mount element ID, custom styles, and document context. |

#### HighlighterOptions.mountedElementId

**Type：** `string`

If the DOM outside the highlighted area changes, the regions previously serialized using `serialize` may no longer match the intended result. To address this, you can set the starting node for the XPath using `mountedElementId`. As long as the relative position between the highlighted area and this node remains unchanged, the serialized highlights can still be accurately restored—even if the surrounding DOM structure changes.

`mountedElementId` should be the ID of an existing element. If the element is not found, an error will be thrown.

#### HighlighterOptions.document

**Type：** `Document`

If the text to be highlighted is inside an iframe, you should set this parameter to `iframe.contentDocument`.

#### HighlighterOptions.highlightStyle

**Type：** `HighlightStyle`

```typescript
interface HighlightStyle {
  color?: string
  backgroundColor?: string
  textDecoration?: string
  textShadow?: string
}
```

### destroy(): void

Used to clean up event listeners added to `document` and `window` to prevent memory leaks.

### serialize(saveText?: boolean): SerializedResult

**Parameters：**

| Parameter  | Type      | Description                                                                                                                                                                                                                                               |
| ---------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `saveText` | `boolean` | Whether to include the selected text in the serialized result. If set to `false`, only the metadata of the highlighted region will be stored, without the actual text content. If set to `true`, the selected text will be included. Defaults to `false`. |

**Returns：**

```typescript
interface SerializedRange {
  // XPath of the start node of the highlight range.
  startContainer: string
  // Offset within the node, same as Range.startOffset.
  startOffset: number
  // XPath of the end node of the highlight range.
  endContainer: string
  // Offset within the node, same as Range.endOffset.
  endOffset: number
  // Text of the highlighted area.
  text?: string
}

type SerializedResult = SerializedRange[]
```

### deserialize(serialized: SerializedResult, clearPreviousRange?: boolean): void

**Parameters：**

| Parameter            | Type               | Description                                                                                                                                                                                 |
| -------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `serialized`         | `SerializedResult` | The serialized result, see above.                                                                                                                                                           |
| `clearPreviousRange` | `boolean`          | Indicates whether to clear existing highlighted areas before deserializing the results. Defaults to `false`, meaning newly deserialized highlight areas will be added to the existing ones. |

## Others

When deleting a selected highlighted region, the implementation relies on the [Highlight API](https://developer.mozilla.org/en-US/docs/Web/API/Highlight). Since ranges in the DOM are not physical entities, there's no direct way to determine which specific range was clicked. As a result, `sentence-highlighter` must iterate through **all** ranges to identify the correct one before displaying the delete button. If there are **thousands of ranges**, each click will impose a significant performance burden, leading to noticeable delays.

Considering factors like browser page zoom, optimization techniques such as **spatial indexing** don't effectively solve the performance issues caused by large-scale ranges.

A mature solution to this problem already exists—**[Rangy](https://github.com/timdown/rangy)**. [Rangy](https://github.com/timdown/rangy) is based on HTML structure and implements text highlighting by **wrapping text nodes in `<span>` tags**, avoiding the aforementioned issues. Since HTML in browsers is unlikely to undergo major changes in the future, Rangy remains a robust technical solution for text selection highlighting.

# 中文

`sentence-highlighter` 是一个基于[Highlight API](https://developer.mozilla.org/zh-CN/docs/Web/API/Highlight)的高亮文本的工具。支持选中文本高亮与取消高亮，以及序列化和反序列化功能。

[Highlight API](https://developer.mozilla.org/zh-CN/docs/Web/API/Highlight)目前可以在 Chrome、Edge、Safari 中使用，Firefox 中目前不支持。

## Install

```shell
pnpm install sentence-highlighter
```

## Usage

```typescript
import { SentenceHighlighter } from 'sentence-highlighter'

document.body.innerHTML = `
  <article>
    <p>
      Maxime debitis hic, delectus perspiciatis laborum molestiae labore,
      deleniti, <strong>quam</strong> consequatur <i>iure</i> veniam alias voluptas nisi quo. Dolorem
      eaque alias, quo vel quas repudiandae architecto deserunt quidem, sapiente
      laudantium nulla.
    </p>
    <div id="temp">
    <p>
      Maiores odit molestias, <b>necessitatibus doloremque <i>dolor illum reprehenderit
      provident</i> nostrum <span>laboriosam<span> iste, tempore perferendis!</b> Ab porro neque esse
      voluptas libero necessitatibus fugiat, ex, minus atque deserunt veniam
      molestiae tempora? Vitae.
    </p>
    </div>
    <p>
      Dolorum facilis voluptate eaque eius similique ducimus dignissimos assumenda
      quos architecto. <em>Doloremque deleniti non exercitationem rerum quam alias
      harum, nisi obcaecati corporis temporibus</em> vero sapiente voluptatum est
      quibusdam id ipsa.
    </p>
  </article>
  <button id="serialize">serialize</button>
  <button id="deserialize">deserialize</button>
`

const highlighter = new SentenceHighlighter({
  mountedElementId: 'app',
})

let serialized: ReturnType<SentenceHighlighter['serialize']>

document.getElementById('serialize')!.addEventListener('click', () => {
  serialized = highlighter.serialize()
  console.log(serialized)
})

document.getElementById('deserialize')!.addEventListener('click', () => {
  highlighter.deserialize(serialized, true)
})
```

## SentenceHighlighter class

### constructor(options?: Partial\<HighlighterOptions\>)

**参数：**

| 参数名    | 类型                          | 描述                                              |
| --------- | ----------------------------- | ------------------------------------------------- |
| `options` | `Partial<HighlighterOptions>` | 可选配置，如挂载元素 ID、自定义样式、文档环境等。 |

#### HighlighterOptions.mountedElementId

**类型：** `string`

如果高亮区域以外的 dom 发生了变化，那之前通过 `serialize` 序列化的区域可能会发生变化，与目标结果不一致。为此可以通过 `mountedElementId` 设置 XPath 的起始结点，只要所要序列化的区域与该结点的相对位置保持不变，哪怕区域外的 dom 元素顺序发生了变化，也可以保证回复正确结果。

`mountedElementId` 是元素的 id，并且要保证该元素存在，否则会报错。

#### HighlighterOptions.document

**类型：** `Document`

如果要进行文本高亮的区域在 iframe 中，则应该指定该参数为 `iframe.contentDocument`。

#### HighlighterOptions.highlightStyle

**类型：** `HighlightStyle`

```typescript
interface HighlightStyle {
  color?: string
  backgroundColor?: string
  textDecoration?: string
  textShadow?: string
}
```

### destroy(): void

用于清除绑定在`document`、`window`上的事件，防止内存泄漏。

### serialize(saveText?: boolean): SerializedResult

**参数：**

| 参数名     | 类型      | 描述                                                                                                                           |
| ---------- | --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `saveText` | `boolean` | 是否在序列化的结果中存储选中区域的文本，如果为 false，则只会存放框选区域的信息，否则不会包含框选区域的文本字段。默认为 false。 |

**返回值：**

```typescript
interface SerializedRange {
  // 高亮区域开始位置结点的XPath
  startContainer: string
  // 节点内的偏移，同Range.startOffset
  startOffset: number
  // 高亮区域结束位置结点的XPath
  endContainer: string
  // 节点内的偏移，同Range.endOffset
  endOffset: number
  // 高亮区域的文本
  text?: string
}

type SerializedResult = SerializedRange[]
```

### deserialize(serialized: SerializedResult, clearPreviousRange?: boolean): void

**参数：**

| 参数名               | 类型               | 描述                                                                                                               |
| -------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `serialized`         | `SerializedResult` | 序列化后的结果，参见上方。                                                                                         |
| `clearPreviousRange` | `boolean`          | 表示在反序列化结果之前，是否清除已经高亮的区域，默认为 false，表示在原有高亮区域的基础上新增要反序列化的高亮区域。 |

## 其他

在选中高亮区域，执行删除操作时，由于是基于[Highlight API](https://developer.mozilla.org/zh-CN/docs/Web/API/Highlight)实现，range 在 dom 中并没有一个实体，所以无法直接确定当前点击的是哪一个 range。因此`sentence-highlighter` 会将所有的 range 遍历一遍，然后才选出对应的 range 弹出删除按钮。如果有成千上万 range，每次点击都会给运行环境带来巨大的负担，耗时增长。

考虑到浏览器页面缩放的因素，使用像空间索引结构这样的优化方式并不能很好的解决大规模 range 带来的性能问题。

在过去针对这个问题已经有了成熟的解决方案，比如 **rangy**。rangy 的基础是 html 结构，其在高亮文本时也是通过在文本节点外包裹 span 标签的方式，所以并没有前面描述的问题。在未来，浏览器中的 html 不太可能有较大的变化，因此针对选中文本高亮这个目的，rangy 还是一个较好的技术方案。
