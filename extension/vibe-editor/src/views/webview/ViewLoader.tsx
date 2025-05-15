import * as path from 'path'
import * as vscode from 'vscode'

import {
  addNotionDatabase,
  removeNotionDatabase,
  retrieveNotionDatabases,
} from '../../apis/notion'
import { Configuration } from '../../configuration'
import { getDraftData, setDraftData } from '../../configuration/draftData'
import { PostService } from '../../services/postService'
import { SnapshotService } from '../../services/snapshotService'
import { TemplateService } from '../../services/templateService'
import { DraftDataType } from '../../types/configuration'
import { CreateDatabase, Database, UpdateDatabase } from '../../types/database'
import {
  Post,
  PostDetail,
  UploadToNotionRequest,
  UploadToNotionRequestPost,
} from '../../types/post'
import {
  Prompt,
  SelectPrompt,
  SubmitCreatePrompt,
  SubmitUpdatePrompt,
} from '../../types/template'
import {
  CommonMessage,
  Message,
  MessageType,
  PageType,
} from '../../types/webview'

export class ViewLoader {
  public static currentPanel?: vscode.WebviewPanel
  private panel: vscode.WebviewPanel
  private context: vscode.ExtensionContext
  private disposables: vscode.Disposable[]
  private currentPage: string

  constructor(context: vscode.ExtensionContext, initialPage: PageType) {
    this.context = context
    this.disposables = []
    this.currentPage = initialPage

    this.panel = vscode.window.createWebviewPanel(
      'vibeEditor',
      'this.getTitle(initialPage)',
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
    this.panel.webview.postMessage({
      type: 'NAVIGATE',
      payload: { page },
    })
  }

  private setupMessageListeners() {
    this.panel.webview.onDidReceiveMessage(
      async (message: Message) => {
        if (message.type === MessageType.NAVIGATE) {
          await this.navigate(message.payload?.page)
        } else if (message.type === MessageType.RELOAD) {
          vscode.commands.executeCommand(
            'workbench.action.webview.reloadWebviewAction',
          )
        }
      },
      null,
      this.disposables,
    )
  }

  private renderPage(page: string) {
    const html = this.render()
    this.panel.webview.html = html
  }

  static async showWebview(
    context: vscode.ExtensionContext,
    page: PageType,
    payload?: any, // postId 또는 template
  ) {
    const cls = this
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined

    if (cls.currentPanel) {
      cls.currentPanel.reveal(column)
      cls.currentPanel.webview.postMessage({
        type: MessageType.NAVIGATE,
        payload: { page },
      })

      setDraftData(DraftDataType.selectedPostId, payload)
      if (page == PageType.POST) {
        cls.currentPanel.webview.postMessage({
          type: MessageType.GET_CURRENT_POST,
          payload: { payload },
        })
      }

      if (page === PageType.POST && typeof payload === 'number') {
        const posts = context.globalState.get<PostDetail[]>('posts') || []
        const target = posts.find((p) => p.postId === payload)

        if (target) {
          cls.currentPanel.webview.postMessage({
            type: MessageType.SHOW_POST_VIEWER,
            payload: target,
          })
        }
      }

      if (page === PageType.TEMPLATE && payload?.templateId) {
        setDraftData(DraftDataType.selectedTemplateId, payload.templateId)
        vscode.commands.executeCommand(
          'vibeEditor.resetTemplate',
          payload.templateId,
        )
        cls.currentPanel.webview.postMessage({
          type: MessageType.TEMPLATE_SELECTED,
          payload: { template: payload },
        })
      }
    } else {
      const loader = new cls(context, page)
      cls.currentPanel = loader.panel
      if (page == PageType.POST) {
        setDraftData(DraftDataType.selectedPostId, payload)
      }

      if (page === PageType.TEMPLATE && payload?.templateId) {
        setDraftData(DraftDataType.selectedTemplateId, payload.templateId)
        vscode.commands.executeCommand(
          'vibeEditor.refreshSnapshot',
          payload.templateId,
        )
        loader.panel.webview.postMessage({
          type: MessageType.TEMPLATE_SELECTED,
          payload: { template: payload },
        })
      }
    }
  }

  static postMessageToWebview = (message: Message) => {
    if (window.vscode) {
      window.vscode.postMessage(message)
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
}
