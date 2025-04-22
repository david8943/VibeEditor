import * as vscode from 'vscode'

export interface IVSCodeAPI {
  showInformationMessage(message: string): void
  showWarningMessage(message: string): void
  showErrorMessage(message: string): void
  getActiveTextEditor(): vscode.TextEditor | undefined
  openTextDocument(options: {
    content: string
    language: string
  }): Thenable<vscode.TextDocument>
  showTextDocument(document: vscode.TextDocument): Thenable<vscode.TextEditor>
  env: {
    clipboard: {
      writeText(text: string): Thenable<void>
    }
  }
  workspace: {
    getConfiguration(section: string): vscode.WorkspaceConfiguration
  }
}

export interface ICommand {
  commandName: string
  execute(...args: any[]): Promise<void> | void
}
