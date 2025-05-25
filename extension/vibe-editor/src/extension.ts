import * as vscode from 'vscode'

import { generateChat } from './apis/ai'
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
  ChatViewProvider,
  setChatViewProvider,
} from './views/webview/ChatViewProvider'
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
  console.log('accessToken', accessToken)
  setDraftData(DraftDataType.loginStatus, !!accessToken)
  if (!accessToken) {
    vscode.window.showInformationMessage('Vibe Editor에 로그인이 필요합니다.')
  } else {
    await initFetchData(context)
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

  // 채팅 화면을 여는 명령어 등록
  const openChatDisposable = vscode.commands.registerCommand(
    'vibeEditor.openChat',
    async () => {
      vscode.window.showInformationMessage(
        '채팅 뷰를 사용하려면 사이드바에서 Chat 아이콘을 클릭하거나, 명령 팔레트(Ctrl+Shift+P)에서 "Chat: Focus Chat View"를 입력하세요.',
      )
      setTimeout(() => {
        vscode.commands.executeCommand('vibeEditorAIChatView.focus')
      }, 100)
    },
  )
  context.subscriptions.push(openChatDisposable)
}

async function registerProvider(context: vscode.ExtensionContext) {
  const tp = new TemplateProvider(context)
  const pp = new PostProvider(context)
  const svp = new SideViewProvider(context)
  const sgp = new StartGuideViewProvider(context)
  const cvp = new ChatViewProvider(context)

  vscode.window.registerTreeDataProvider('vibeEditorTemplatePage', tp)
  vscode.window.registerTreeDataProvider('vibeEditorPostList', pp)
  vscode.window.registerWebviewViewProvider('vibeEditorSideView', svp)
  vscode.window.registerWebviewViewProvider('vibeEditorViewerPage', sgp)
  vscode.window.registerWebviewViewProvider('vibeEditorAIChatView', cvp)

  setTemplateProvider(tp)
  setPostProvider(pp)
  setSideViewProvider(svp)
  setStartGuideViewProvider(sgp)
  setChatViewProvider(cvp)
}

async function maybeShowReadme(context: vscode.ExtensionContext) {
  const hasShownReadme = Configuration.get(ConfigType.showReadme)
  if (!hasShownReadme) {
    await vscode.commands.executeCommand('vibeEditor.showReadme')
    Configuration.set(ConfigType.showReadme, true)
  }

  const showStartGuide = Configuration.get(ConfigType.showStartGuide)
  if (showStartGuide) {
    await vscode.commands.executeCommand('vibeEditor.openStartGuide')
  }
}

async function initFetchData(context: vscode.ExtensionContext) {
  await vscode.commands.executeCommand('vibeEditor.initFetchData')
}

export async function activate(
  context: vscode.ExtensionContext,
): Promise<void> {
  console.log('Vibe Editor 시작')
  setExtensionContext(context)
  await registerCommand(context)
  await setUser(context)
  await registerProvider(context)
  await maybeShowReadme(context)
  addStatusBarItem(context)
  // 커스텀 AI 챗 웹뷰 등록
  context.subscriptions.push(Configuration.onDidChangeConfiguration(() => {}))
}

export function deactivate(): void {}
