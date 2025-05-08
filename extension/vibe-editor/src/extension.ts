import * as vscode from 'vscode'

import { setExtensionContext } from './apis/api'
import { addNotionDatabase, retrieveNotionDatabases } from './apis/notion'
import { allCommands } from './commands'
import { Configuration } from './configuration'
import { setDraftData } from './configuration/draftData'
import { PostProvider, setPostProvider } from './services/postService'
import {
  SnapshotService,
  setCodeSnapshotProvider,
  setDirectorySnapshotProvider,
  setLogSnapshotProvider,
} from './services/snapshotService'
import {
  TemplateProvider,
  setTemplateProvider,
} from './services/templateService'
import { DraftDataType, SecretType } from './types/configuration'
import { CreateDatabase, Database } from './types/database'
import { PageType } from './types/webview'
import {
  CodeSnapshotProvider,
  DirectoryTreeSnapshotProvider,
  LogSnapshotProvider,
  SnapshotItem,
  // registerSnapshotViewCommand,
} from './views/codeSnapshotView'
import { ViewLoader } from './views/webview/ViewLoader'

async function isLogin(context: vscode.ExtensionContext) {
  const accessToken = await context.secrets.get(SecretType.accessToken)
  setDraftData(DraftDataType.loginStatus, !!accessToken)
  if (!accessToken) {
    vscode.window.showInformationMessage('Vibe Editor에 로그인이 필요합니다.')
  }
}

async function isNotion(context: vscode.ExtensionContext) {
  const notionSecretKey = await context.secrets.get(SecretType.notionSecretKey)
  setDraftData(DraftDataType.notionStatus, !!notionSecretKey)
  if (!notionSecretKey) {
    vscode.window.showInformationMessage('Notion 정보 등록이 필요합니다.')
  }
}

async function addStatusBarItem(context: vscode.ExtensionContext) {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  )
  statusBarItem.text = 'VibeEditor $(gear)'
  statusBarItem.tooltip = '$(gear) VibeEditor 설정 열기'
  statusBarItem.command = 'vibeEditor.showSettingPage' // ← 이미 정의한 command 사용
  statusBarItem.show()

  context.subscriptions.push(statusBarItem)
}

export async function activate(
  context: vscode.ExtensionContext,
): Promise<void> {
  setExtensionContext(context)

  allCommands.forEach((CommandClass) => {
    const command = new CommandClass(context)
    const disposable = vscode.commands.registerCommand(
      command.commandName,
      command.execute.bind(command),
    )
    context.subscriptions.push(disposable)
  })

  await isLogin(context)
  await isNotion(context)
  const templateProvider = new TemplateProvider(context)
  // 코드 스냅샷 뷰 등록 및 전역 등록
  const codeSnapshotProvider = new CodeSnapshotProvider(context)
  const directoryTreeSnapshotProvider = new DirectoryTreeSnapshotProvider(
    context,
  )
  const logSnapshotProvider = new LogSnapshotProvider(context)
  vscode.window.registerTreeDataProvider(
    'vibeEditorCodeSnapshot',
    codeSnapshotProvider,
  )
  vscode.window.registerTreeDataProvider(
    'vibeEditorDirectoryTreeSnapshot',
    directoryTreeSnapshotProvider,
  )
  vscode.window.registerTreeDataProvider(
    'vibeEditorLogSnapshot',
    logSnapshotProvider,
  )
  vscode.window.registerTreeDataProvider(
    'vibeEditorTemplatePage',
    templateProvider,
  )

  const postTreeProvider = new PostProvider(context)
  vscode.window.registerTreeDataProvider('vibeEditorPostList', postTreeProvider)
  setPostProvider(postTreeProvider)

  // 각 프로바이더 등록
  setTemplateProvider(templateProvider)
  setCodeSnapshotProvider(codeSnapshotProvider)
  setDirectorySnapshotProvider(directoryTreeSnapshotProvider)
  setLogSnapshotProvider(logSnapshotProvider)

  // 스냅샷 클릭 시 WebView 명령어 등록
  // registerSnapshotViewCommand(context)

  vscode.window.registerWebviewViewProvider('vibeEditorTemplatePage', {
    resolveWebviewView(webviewView) {
      webviewView.webview.options = { enableScripts: true }

      webviewView.webview.onDidReceiveMessage(async (message) => {
        switch (message.command) {
          case 'saveDatabase':
            // TODO : 삭제해야
            const existing = context.globalState.get<Database[]>(
              'notionDatabases',
              [],
            )
            const success = await addNotionDatabase(message.payload)
            if (!success) {
              vscode.window.showErrorMessage('DB 저장 실패')
              return
            }
            const result = await retrieveNotionDatabases()
            console.log('📦 DB 저장 후:', result)
            if (result.success) {
              const database = result.data
              await context.globalState.update('notionDatabases', database)
            }

            vscode.window.showInformationMessage('DB 저장 완료')
            console.log('📦 DB 저장 후:', existing)
            webviewView.webview.postMessage({
              command: 'setDatabases',
              payload: existing,
            })
            break
        }
      })
    },
  })

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'vibeEditor.openContext',
      (item: vscode.TreeItem) => {
        vscode.window.showInformationMessage(`우클릭한 항목: ${item.label}`)
        // TODO: Notion 업로드, 삭제 등의 기능 확장 가능
      },
    ),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'vibeEditor.showPostPage',
      async (postId: number) => {
        ViewLoader.showWebview(context, PageType.POST, postId)
      },
    ),
  )

  const snapshotService = new SnapshotService(context)

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'vibeEditor.renameSnapshot',
      async (item: SnapshotItem) => {
        await snapshotService.renameSnapshot(item.snapshot.snapshotId)
      },
    ),
  )

  addStatusBarItem(context)
  // 설정 변경 이벤트 구독
  context.subscriptions.push(Configuration.onDidChangeConfiguration(() => {}))
}

export function deactivate(): void {
  // 정리 작업이 필요한 경우 여기에 추가
}
