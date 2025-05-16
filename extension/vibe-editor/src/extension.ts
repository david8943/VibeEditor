import * as vscode from 'vscode'

import { setExtensionContext } from './apis/api'
import { getCurrentUser } from './apis/user'
import { allCommands } from './commands'
import { ConfigType, Configuration } from './configuration'
import { setDraftData } from './configuration/draftData'
import { DraftDataType, SecretType } from './types/configuration'
import { PostProvider, setPostProvider } from './views/tree/postTreeView'
import {
  TemplateProvider,
  setTemplateProvider,
} from './views/tree/templateTreeView'
import {
  SideViewProvider,
  setSideViewProvider,
} from './views/webview/SideViewProvider'
import {
  StartGuideViewProvider,
  setStartGuideViewProvider,
} from './views/webview/StartGuideViewProvider'

async function setUser(context: vscode.ExtensionContext) {
  const accessToken = await context.secrets.get(SecretType.accessToken)
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
  statusBarItem.text = 'VibeEditor'
  statusBarItem.tooltip = 'VibeEditor 열기'
  statusBarItem.command = 'vibeEditor.showSideViewPage'
  statusBarItem.show()
  context.subscriptions.push(statusBarItem)
  vscode.commands.executeCommand('vibeEditor.showSideViewPage')
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
  const pp = new PostProvider(context)
  const svp = new SideViewProvider(context)
  const sgp = new StartGuideViewProvider(context)

  vscode.window.registerTreeDataProvider('vibeEditorTemplatePage', tp)
  vscode.window.registerTreeDataProvider('vibeEditorPostList', pp)
  vscode.window.registerWebviewViewProvider('vibeEditorSideView', svp)
  vscode.window.registerWebviewViewProvider('vibeEditorViewerPage', sgp)

  setTemplateProvider(tp)
  setPostProvider(pp)
  setSideViewProvider(svp)
  setStartGuideViewProvider(sgp)
}

async function maybeShowReadme(context: vscode.ExtensionContext) {
  const hasShownReadme = Configuration.get(ConfigType.showReadme)
  if (!hasShownReadme) {
    await vscode.commands.executeCommand('vibeEditor.showReadme')
    Configuration.set(ConfigType.showReadme, true)
  }
}

async function initFetchData(context: vscode.ExtensionContext) {
  await vscode.commands.executeCommand('vibeEditor.initFetchData')
}

export async function activate(
  context: vscode.ExtensionContext,
): Promise<void> {
  setExtensionContext(context)
  await registerCommand(context)
  await setUser(context)
  await initFetchData(context)
  await registerProvider(context)
  await maybeShowReadme(context)
  addStatusBarItem(context)
  context.subscriptions.push(Configuration.onDidChangeConfiguration(() => {}))
}

export function deactivate(): void {}
