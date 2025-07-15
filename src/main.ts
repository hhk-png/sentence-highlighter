import { TextHighlighter } from './highlighter/highlighter'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `${`

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
  </article>`.repeat(5)

}<button id="serialize">serialize</button><button id="deserialize">deserialize</button>`

const highlighter = new TextHighlighter({
  mountedElementId: 'app',
})

let serialized = ''
document.getElementById('serialize')!.addEventListener('click', () => {
  serialized = highlighter.serialize()
})

document.getElementById('deserialize')!.addEventListener('click', () => {
  highlighter.deserialize(serialized, true)
})

const iframe = document.getElementById('iframe') as HTMLIFrameElement

const iframeHighlighter = new TextHighlighter({
  // mountedElementId: 'app',
  document: iframe.contentDocument!,
})
let serialized2 = ''
iframe.contentDocument!.getElementById('serialize')!.addEventListener('click', () => {
  serialized2 = iframeHighlighter.serialize()
})

iframe.contentDocument!.getElementById('deserialize')!.addEventListener('click', () => {
  iframeHighlighter.deserialize(serialized2, true)
})
