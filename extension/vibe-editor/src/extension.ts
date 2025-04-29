import * as vscode from 'vscode'

import { allCommands } from './commands'
import { Configuration } from './configuration'
import { setDraftData } from './configuration/tempData'
import {
  setCodeSnapshotProvider,
  setDirectorySnapshotProvider,
  setLogSnapshotProvider,
} from './services/snapshotService'
import {
  TemplateProvider,
  setTemplateProvider,
} from './services/templateService'
import { DraftDataType, SecretType } from './types/configuration'
import {
  CodeSnapshotProvider,
  DirectoryTreeSnapshotProvider,
  LogSnapshotProvider,
  registerSnapshotViewCommand,
} from './views/codeSnapshotView'

async function isLogin(context: vscode.ExtensionContext) {
  const accessToken = await context.secrets.get(SecretType.accessToken)
  setDraftData(DraftDataType.loginStatus, !!accessToken)
  if (!accessToken) {
    vscode.window.showInformationMessage('Vibe Editor에 로그인이 필요합니다.')
  }
}

async function isNotion(context: vscode.ExtensionContext) {
  const notionToken = await context.secrets.get(SecretType.notionToken)
  setDraftData(DraftDataType.notionStatus, !!notionToken)
  if (!notionToken) {
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
  // 코드 스냅샷 뷰 등록 및 전역 등록
  const codeSnapshotProvider = new CodeSnapshotProvider(context)
  const directoryTreeSnapshotProvider = new DirectoryTreeSnapshotProvider(
    context,
  )
  const logSnapshotProvider = new LogSnapshotProvider(context)
  const templateProvider = new TemplateProvider(context)
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

  // 각 프로바이더 등록
  setCodeSnapshotProvider(codeSnapshotProvider)
  setDirectorySnapshotProvider(directoryTreeSnapshotProvider)
  setLogSnapshotProvider(logSnapshotProvider)
  setTemplateProvider(templateProvider)

  // 스냅샷 클릭 시 WebView 명령어 등록
  registerSnapshotViewCommand(context)

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'vibeEditor.openContext',
      (item: vscode.TreeItem) => {
        vscode.window.showInformationMessage(`우클릭한 항목: ${item.label}`)
        // TODO: Notion 업로드, 삭제 등의 기능 확장 가능
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
