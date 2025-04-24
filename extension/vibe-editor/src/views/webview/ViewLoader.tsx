import * as path from 'path'
import * as vscode from 'vscode'

import { Configuration } from '../../configuration'
import { SnapshotService } from '../../services/snapshotService'
import { TemplateService } from '../../services/templateService'
import {
  CommonMessage,
  Message,
  SubmitPromptMessage,
} from '../../types/webview'

export class ViewLoader {
  public static currentPanel?: vscode.WebviewPanel
  private templateService: TemplateService
  private snapshotService: SnapshotService
  private panel: vscode.WebviewPanel
  private context: vscode.ExtensionContext
  private disposables: vscode.Disposable[]
  private currentPage: string

  constructor(context: vscode.ExtensionContext, initialPage: string) {
    this.context = context
    this.disposables = []
    this.templateService = new TemplateService(context, initialPage)
    this.snapshotService = new SnapshotService(context)
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

  private setupMessageListeners() {
    this.panel.webview.onDidReceiveMessage(
      async (message: Message) => {
        if (message.type === 'NAVIGATE') {
          const { page } = message.payload
          this.currentPage = page
          this.panel.title = this.getTitle(page)
          this.panel.webview.postMessage({
            type: 'NAVIGATE',
            payload: { page },
          })
        } else if (message.type === 'RELOAD') {
          vscode.commands.executeCommand(
            'workbench.action.webview.reloadWebviewAction',
          )
        } else if (message.type === 'COMMON') {
          const text = (message as CommonMessage).payload
          vscode.window.showInformationMessage(
            `Received message from Webview: ${text}`,
          )
        } else if (message.type === 'SUBMIT_PROMPT') {
          console.log(
            '프롬프트가 생성되었습니다: SUBMIT_PROMPT',
            message.payload,
          )
          const data = message.payload
          await this.templateService.submitPrompt(
            message as SubmitPromptMessage,
          )
          vscode.window.showInformationMessage(
            `프롬프트가 생성되었습니다: ${data.promptName}`,
          )
        } else if (message.type === 'GET_TEMPLATES') {
          const templates = await this.templateService.getTemplates()
          console.log('templates', templates)
          this.panel.webview.postMessage({
            type: 'TEMPLATE_SELECTED',
            payload: { template: templates[0] },
          })
        } else if (message.type === 'GET_SNAPSHOTS') {
          const snapshots = await this.snapshotService.getSnapshots()
          this.panel.webview.postMessage({
            type: 'SNAPSHOTS_LOADED',
            payload: { snapshots },
          })
        }
      },
      null,
      this.disposables,
    )

    // 패널 dispose 리스너
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables)
  }

  private renderPage(page: string) {
    console.log('ViewLoader: Rendering page:', page)
    const html = this.render()
    this.panel.webview.html = html
    console.log('ViewLoader: Sending INITIAL_PAGE message')
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
    console.log('showWebview', template)
    const cls = this
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined
    if (cls.currentPanel) {
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
    ViewLoader.currentPanel = undefined

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
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>템플릿 생성</title>
          <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
          <style>
            body {
              padding: 20px;
              color: var(--vscode-editor-foreground);
              font-family: var(--vscode-font-family);
              background-color: var(--vscode-editor-background);
            }
            .app-container {
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              color: var(--vscode-editor-foreground);
              font-size: 24px;
              margin-bottom: 20px;
            }
            .template-form {
              display: flex;
              flex-direction: column;
              gap: 15px;
            }
            .form-group {
              display: flex;
              flex-direction: column;
              gap: 5px;
            }
            label {
              color: var(--vscode-editor-foreground);
            }
            input, textarea, select {
              padding: 8px;
              border: 1px solid var(--vscode-input-border);
              background: var(--vscode-input-background);
              color: var(--vscode-input-foreground);
              border-radius: 4px;
            }
            textarea {
              min-height: 100px;
              font-family: var(--vscode-editor-font-family);
            }
            button {
              padding: 8px 16px;
              background: var(--vscode-button-background);
              color: var(--vscode-button-foreground);
              border: none;
              border-radius: 4px;
              cursor: pointer;
            }
            button:hover {
              background: var(--vscode-button-hoverBackground);
            }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script>
            const vscode = acquireVsCodeApi();
            window.vscode = vscode;
            console.log('vscode API initialized:', vscode);
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
