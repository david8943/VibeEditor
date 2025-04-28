import * as path from 'path'
import * as vscode from 'vscode'

import { CommonMessage, Message, MessageType } from '../../types/webview'

export class SettingViewLoader {
  public static currentPanel?: vscode.WebviewPanel
  private panel: vscode.WebviewPanel
  private context: vscode.ExtensionContext
  private disposables: vscode.Disposable[]
  private currentPage: string

  constructor(context: vscode.ExtensionContext, initialPage: string) {
    this.context = context
    this.disposables = []
    this.currentPage = initialPage

    this.panel = vscode.window.createWebviewPanel(
      'vibeEditor',
      this.getTitle(initialPage),
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(this.context.extensionPath, 'dist', 'app')),
        ],
      },
    )

    this.renderPage(this.currentPage)

    this.setupMessageListeners()
  }
  private async navigate(page: string) {
    this.currentPage = page
    this.panel.title = this.getTitle(page)
    this.panel.webview.postMessage({
      type: 'NAVIGATE',
      payload: { page },
    })
  }
  private setupMessageListeners() {
    this.panel.webview.onDidReceiveMessage(
      async (message: Message) => {
        if (message.type === 'NAVIGATE') {
          await this.navigate(message.payload?.page)
        } else if (message.type === 'RELOAD') {
          vscode.commands.executeCommand(
            'workbench.action.webview.reloadWebviewAction',
          )
        } else if (message.type === 'COMMON') {
          const text = (message as CommonMessage).payload
          vscode.window.showInformationMessage(
            `Received message from Webview: ${text}`,
          )
        }
      },
      null,
      this.disposables,
    )

    // 패널 dispose 리스너
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables)
  }

  private renderPage(page: string) {
    const html = this.render()
    this.panel.webview.html = html
    this.panel.webview.postMessage({
      type: 'INITIAL_PAGE',
      payload: { page },
    })
  }

  static showWebview(
    context: vscode.ExtensionContext,
    page: string,
    template?: any,
  ) {
    const cls = this
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined

    if (cls.currentPanel) {
      cls.currentPanel.webview.postMessage({
        type: 'INITIAL_PAGE',
        payload: { page },
      })
      cls.currentPanel.reveal(column)
      if (template) {
        cls.currentPanel.webview.postMessage({
          type: 'TEMPLATE_SELECTED',
          payload: { template },
        })
      }
    } else {
      cls.currentPanel = new cls(context, page).panel
      if (template) {
        cls.currentPanel.webview.postMessage({
          type: 'TEMPLATE_SELECTED',
          payload: { template },
        })
      }
    }
  }

  static postMessageToWebview = (message: Message) => {
    if (window.vscode) {
      window.vscode.postMessage(message)
    }
  }

  public dispose() {
    SettingViewLoader.currentPanel = undefined

    this.panel.dispose()

    while (this.disposables.length) {
      const x = this.disposables.pop()
      if (x) {
        x.dispose()
      }
    }
  }

  render() {
    const bundleScriptPath = this.panel.webview.asWebviewUri(
      vscode.Uri.file(
        path.join(this.context.extensionPath, 'dist', 'app', 'bundle.js'),
      ),
    )

    return `
      <!DOCTYPE html>
      <html lang="ko">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>템플릿 생성</title>
          <link rel="stylesheet" href="${this.panel.webview.asWebviewUri(
            vscode.Uri.file(
              path.join(
                this.context.extensionPath,
                'dist',
                'app',
                'global.css',
              ),
            ),
          )}">
          <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
        </head>
        <body>
          <div id="root"></div>
          <script>
            const vscode = acquireVsCodeApi();
            window.vscode = vscode;
          </script>
          <script src="${bundleScriptPath}"></script>
        </body>
      </html>
    `
  }

  private getTitle(page: string): string {
    switch (page) {
      case 'template':
        return '프롬프트 생성기'
      case 'post':
        return '포스트 생성기'
      default:
        return 'Vibe Editor'
    }
  }
}
