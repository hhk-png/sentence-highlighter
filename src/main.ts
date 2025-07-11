import { TextHighlighter } from './highlighter/highlighter'

// eslint-disable-next-line no-new
new TextHighlighter()

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <article>
    <p>
      Maxime debitis hic, delectus perspiciatis laborum molestiae labore,
      deleniti, <strong>quam</strong> consequatur <i>iure</i> veniam alias voluptas nisi quo. Dolorem
      eaque alias, quo vel quas repudiandae architecto deserunt quidem, sapiente
      laudantium nulla.
    </p>
    <p>
      Maiores odit molestias, <b>necessitatibus doloremque <i>dolor illum reprehenderit
      provident</i> nostrum <span>laboriosam<span> iste, tempore perferendis!</b> Ab porro neque esse
      voluptas libero necessitatibus fugiat, ex, minus atque deserunt veniam
      molestiae tempora? Vitae.
    </p>
    <p>
      Dolorum facilis voluptate eaque eius similique ducimus dignissimos assumenda
      quos architecto. <em>Doloremque deleniti non exercitationem rerum quam alias
      harum, nisi obcaecati corporis temporibus</em> vero sapiente voluptatum est
      quibusdam id ipsa.
    </p>
  </article>
`.repeat(5)
