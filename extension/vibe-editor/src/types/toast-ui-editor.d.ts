declare module '@toast-ui/editor' {
  interface EditorOptions {
    el: HTMLElement
    height?: string
    initialEditType?: 'markdown' | 'wysiwyg'
    previewStyle?: 'vertical' | 'tab'
    initialValue?: string
    usageStatistics?: boolean
    events?: Record<string, Function>
    [key: string]: any
  }

  export type { EditorOptions }

  export default class Editor {
    constructor(options: EditorOptions)
    getMarkdown(): string
    setMarkdown(markdown: string): void
    getHtml(): string
    setHtml(html: string): void
    getCurrentModeEditor(): any
    setHeight(height: string): void
    changePreviewStyle(style: 'vertical' | 'tab'): void
    destroy(): void
    on(event: string, handler: Function): void
    off(event: string): void
  }
}
