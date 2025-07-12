import { TextHighlighter } from './highlighter/highlighter'

const highlighter = new TextHighlighter({
  mountedElementId: 'app',
})

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `

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

let serialized = '[{"startContainer":"//*[@id=\"app\"]/article[1]/p[2]/b[1]/text()[1]","startOffset":5,"endContainer":"//*[@id=\"app\"]/article[1]/p[2]/text()[2]","endOffset":16},{"startContainer":"//*[@id=\"app\"]/article[1]/p[3]/em[1]/text()[1]","startOffset":44,"endContainer":"//*[@id=\"app\"]/article[1]/p[3]/text()[2]","endOffset":54}]'
document.getElementById('serialize')!.addEventListener('click', () => {
  serialized = highlighter.serialize()
})

document.getElementById('deserialize')!.addEventListener('click', () => {
  highlighter.deserialize(serialized, true)
})
