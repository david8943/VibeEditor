import * as path from 'path'
import * as vscode from 'vscode'

import { setDraftData } from '../../configuration/tempData'
import { PostService } from '../../services/postService'
import { SnapshotService } from '../../services/snapshotService'
import { TemplateService } from '../../services/templateService'
import { SubmitPrompt } from '../../types/template'
import { CommonMessage, Message, MessageType } from '../../types/webview'

export class ViewLoader {
  public static currentPanel?: vscode.WebviewPanel
  private templateService: TemplateService
  private snapshotService: SnapshotService
  private postService: PostService
  private panel: vscode.WebviewPanel
  private context: vscode.ExtensionContext
  private disposables: vscode.Disposable[]
  private currentPage: string

  constructor(context: vscode.ExtensionContext, initialPage: string) {
    this.context = context
    this.disposables = []
    this.templateService = new TemplateService(context, initialPage)
    this.snapshotService = new SnapshotService(context)
    this.postService = new PostService(context, initialPage)
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
  private async getTemplates() {
    const templates = await this.templateService.getTemplates()
    await setDraftData('selectedTemplateId', templates[0].templateId)

    this.panel.webview.postMessage({
      type: MessageType.TEMPLATE_SELECTED,
      payload: { template: templates[0] },
    })
  }

  private async getSnapshots() {
    const snapshots = await this.snapshotService.getSnapshots()
    this.panel.webview.postMessage({
      type: 'SNAPSHOTS_LOADED',
      payload: { snapshots },
    })
  }

  private async getCurrentPost() {
    const post = await this.postService.getCurrentPost()
    this.panel.webview.postMessage({
      type: MessageType.CURRENT_POST_LOADED,
      payload: { post },
    })
  }
  private async submitPrompt(data: SubmitPrompt) {
    await this.templateService.submitPrompt({
      ...data,
      navigate: (page: string) => this.navigate(page),
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
        } else if (message.type === MessageType.SUBMIT_PROMPT) {
          await this.submitPrompt(message.payload)
        } else if (message.type === MessageType.CREATE_PROMPT) {
          await this.templateService.createPrompt(message.payload)
        } else if (message.type === MessageType.UPDATE_PROMPT) {
          await this.templateService.updatePrompt(message.payload)
        } else if (message.type === MessageType.DELETE_PROMPT) {
          await this.templateService.deletePrompt(message.payload)
        } else if (message.type === MessageType.GET_TEMPLATES) {
          await this.getTemplates()
        } else if (message.type === MessageType.GET_SNAPSHOTS) {
          await this.getSnapshots()
        } else if (message.type === MessageType.GET_CURRENT_POST) {
          await this.getCurrentPost()
        } else if (message.type === MessageType.PROMPT_SELECTED) {
          console.log('setDraftData', message.payload?.selectedPromptId)
          await setDraftData(
            'selectedPromptId',
            message.payload?.selectedPromptId,
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

  static async showWebview(
    context: vscode.ExtensionContext,
    page: string,
    template?: any,
  ) {
    const cls = this
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined
    if (cls.currentPanel) {
      cls.currentPanel.reveal(column)
      if (template) {
        setDraftData('selectedTemplateId', template.templateId)
        cls.currentPanel.webview.postMessage({
          type: 'TEMPLATE_SELECTED',
          payload: { template },
        })
      }
    } else {
      cls.currentPanel = new cls(context, page).panel
      if (template) {
        await setDraftData('selectedTemplateId', template.templateId)
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
