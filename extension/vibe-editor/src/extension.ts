import * as vscode from 'vscode'

import { GithubLoginCommand, GoogleLoginCommand } from './commands/auth'
import { CaptureSnapshotCommand } from './commands/captureSnapshot'
import { CopyCodeCommand } from './commands/copyCode'
import { DirectoryTreeCommand } from './commands/directoryTree'
import { Configuration } from './configuration'
import { setSnapshotProvider } from './services/snapshotService'
import { IVSCodeAPI } from './types'
import {
  CodeSnapshotProvider,
  registerSnapshotViewCommand,
} from './views/codeSnapshotView'

class VSCodeAPI implements IVSCodeAPI {
  public get env() {
    return vscode.env
  }

  public get workspace() {
    return vscode.workspace
  }

  public showInformationMessage(message: string): void {
    vscode.window.showInformationMessage(message)
  }

  public showWarningMessage(message: string): void {
    vscode.window.showWarningMessage(message)
  }

  public showErrorMessage(message: string): void {
    vscode.window.showErrorMessage(message)
  }

  public getActiveTextEditor() {
    return vscode.window.activeTextEditor
  }

  public async openTextDocument(options: {
    content: string
    language: string
  }) {
    return vscode.workspace.openTextDocument(options)
  }

  public async showTextDocument(document: vscode.TextDocument) {
    return vscode.window.showTextDocument(document)
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const vscodeApi = new VSCodeAPI()

  // 로그인 상태 확인
  const isLoggedIn = Configuration.get('loginStatus')
  if (!isLoggedIn) {
    vscodeApi.showInformationMessage('Vibe Editor에 로그인이 필요합니다.')
  }

  // 명령어 등록
  const commands = [
    new CopyCodeCommand(vscodeApi),
    new DirectoryTreeCommand(vscodeApi),
    new GoogleLoginCommand(vscodeApi),
    new GithubLoginCommand(vscodeApi),
    new CaptureSnapshotCommand(context),
  ]

  commands.forEach((command) => {
    const disposable = vscode.commands.registerCommand(
      command.commandName,
      command.execute.bind(command),
    )
    context.subscriptions.push(disposable)
  })

  // 코드 스냅샷 뷰 등록 및 전역 등록
  const snapshotProvider = new CodeSnapshotProvider(context)
  vscode.window.registerTreeDataProvider('codeSnapshot', snapshotProvider)
  setSnapshotProvider(snapshotProvider) // ✅ 이 줄 추가됨

  // 스냅샷 클릭 시 WebView 명령어 등록
  registerSnapshotViewCommand(context)
}

export function deactivate(): void {
  // 정리 작업이 필요한 경우 여기에 추가
}
