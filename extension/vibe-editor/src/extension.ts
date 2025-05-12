import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'

import { setExtensionContext } from './apis/api'
import { getCurrentUser } from './apis/user'
import { allCommands } from './commands'
import { Configuration } from './configuration'
import { setDraftData } from './configuration/draftData'
import { PostProvider, setPostProvider } from './services/postService'
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
} from './views/codeSnapshotView'

async function setUser(context: vscode.ExtensionContext) {
  const accessToken = await context.secrets.get(SecretType.accessToken)
  console.log('액세스 토큰', accessToken)
  setDraftData(DraftDataType.loginStatus, !!accessToken)
  if (!accessToken) {
    vscode.window.showInformationMessage('Vibe Editor에 로그인이 필요합니다.')
  } else {
    const result = await getCurrentUser()
    if (result.success) {
      setDraftData(DraftDataType.notionStatus, result.data.notionActive)
      if (!result.data.notionActive) {
        vscode.window.showInformationMessage('Notion 정보 등록이 필요합니다.')
      }
    }
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

async function registerCommand(context: vscode.ExtensionContext) {
  allCommands.forEach((CommandClass) => {
    const command = new CommandClass(context)
    const disposable = vscode.commands.registerCommand(
      command.commandName,
      command.execute.bind(command),
    )
    context.subscriptions.push(disposable)
  })
}

async function registerProvider(context: vscode.ExtensionContext) {
  const tp = new TemplateProvider(context)
  const csp = new CodeSnapshotProvider(context)
  const dsp = new DirectoryTreeSnapshotProvider(context)
  const lsp = new LogSnapshotProvider(context)
  const pp = new PostProvider(context)

  vscode.window.registerTreeDataProvider('vibeEditorTemplatePage', tp)
  vscode.window.registerTreeDataProvider('vibeEditorCodeSnapshot', csp)
  vscode.window.registerTreeDataProvider('vibeEditorDirectoryTreeSnapshot', dsp)
  vscode.window.registerTreeDataProvider('vibeEditorLogSnapshot', lsp)
  vscode.window.registerTreeDataProvider('vibeEditorPostList', pp)

  setTemplateProvider(tp)
  setCodeSnapshotProvider(csp)
  setDirectorySnapshotProvider(dsp)
  setLogSnapshotProvider(lsp)
  setPostProvider(pp)
}

async function maybeShowReadme(context: vscode.ExtensionContext) {
  const key = 'vibeEditor.hasShownReadme'
  const hasShown = context.globalState.get<boolean>(key)

  if (!hasShown) {
    const readmePath = path.join(context.extensionPath, 'README.md')
    const readmeUri = vscode.Uri.file(readmePath)

    try {
      const doc = await vscode.workspace.openTextDocument(readmeUri)
      await vscode.window.showTextDocument(doc, vscode.ViewColumn.One, true)
      await vscode.commands.executeCommand('markdown.showPreview', readmeUri)
    } catch (error) {
      console.error('README 띄우기 실패:', error)
    }

    await context.globalState.update(key, true)
  }
}

export async function activate(
  context: vscode.ExtensionContext,
): Promise<void> {
  setExtensionContext(context)
  await registerCommand(context)
  await setUser(context)
  await registerProvider(context)
  await maybeShowReadme(context)
  addStatusBarItem(context)

  context.subscriptions.push(Configuration.onDidChangeConfiguration(() => {}))
}

export function deactivate(): void {
  // 정리 작업이 필요한 경우 여기에 추가
}
