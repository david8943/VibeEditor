import * as vscode from 'vscode'

import { GithubLoginCommand, GoogleLoginCommand } from './commands/auth'
import { CopyCodeCommand } from './commands/copyCode'
import { DirectoryTreeCommand } from './commands/directoryTree'
import { Configuration } from './configuration'
import { IVSCodeAPI } from './types'

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

  const commands = [
    new CopyCodeCommand(vscodeApi),
    new DirectoryTreeCommand(vscodeApi),
    new GoogleLoginCommand(vscodeApi),
    new GithubLoginCommand(vscodeApi),
  ]

  commands.forEach((command) => {
    const disposable = vscode.commands.registerCommand(
      command.commandName,
      command.execute.bind(command),
    )
    context.subscriptions.push(disposable)
  })
}

export function deactivate(): void {
  // 정리 작업이 필요한 경우 여기에 추가
}
