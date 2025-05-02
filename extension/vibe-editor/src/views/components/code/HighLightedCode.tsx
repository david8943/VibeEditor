import React, { useEffect, useRef } from 'react'

import hljs from 'highlight.js/lib/common'
import 'highlight.js/styles/github.css'

import '../../../styles/highlight-vscode.css'

interface HighlightedCodeProps {
  code: string
  language?: string
}

export const HighlightedCode = ({ code, language }: HighlightedCodeProps) => {
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!codeRef.current) return

    codeRef.current.textContent = code

    if (language) {
      hljs.highlightElement(codeRef.current)
    } else {
      hljs.highlightAuto(code)
      hljs.highlightElement(codeRef.current)
    }
  }, [code, language])

  return (
    <pre>
      <code
        ref={codeRef}
        className="hljs"
      />
    </pre>
  )
}
