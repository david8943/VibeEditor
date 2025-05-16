import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'

import ToastuiEditor from '@toast-ui/editor'
import codeSyntaxHighlight from '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight-all.js'
import '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css'
import '@toast-ui/editor/dist/toastui-editor.css'
import 'prismjs/themes/prism.css'

interface TuiEditorProps {
  height?: string
  initialEditType?: 'markdown' | 'wysiwyg'
  previewStyle?: 'vertical' | 'tab'
  initialValue?: string
  events?: Record<string, (...args: any[]) => void>
  usageStatistics?: boolean
}

export interface TuiEditorRef {
  getMarkdown: () => string
}

const TuiEditor = forwardRef<TuiEditorRef, TuiEditorProps>((props, ref) => {
  const divRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<ToastuiEditor | null>(null)

  useEffect(() => {
    if (divRef.current) {
      editorRef.current = new ToastuiEditor({
        el: divRef.current,
        height: props.height || '500px',
        initialEditType: props.initialEditType || 'markdown',
        previewStyle: props.previewStyle || 'vertical',
        initialValue: props.initialValue || '',
        usageStatistics: props.usageStatistics ?? false,
        events: props.events || {},
        plugins: [codeSyntaxHighlight],
      })
    }

    return () => {
      editorRef.current?.destroy()
    }
  }, [])

  useImperativeHandle(ref, () => ({
    getMarkdown: () => editorRef.current?.getMarkdown() || '',
  }))

  return <div ref={divRef} />
})

export default TuiEditor
