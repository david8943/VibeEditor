import { useState } from 'react'
import { marked } from 'marked'
import readme from './assets/docs/README.md?raw'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
        <div
          className="markdown-viewer"
          dangerouslySetInnerHTML={{ __html: marked(readme) }}
        />
    </>
  )
}

export default App
