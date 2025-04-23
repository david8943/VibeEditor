import * as vscode from 'vscode'

import { DirectoryTreeService } from '../services/directoryTreeService'
import { ICommand } from '../types/command'

export class DirectoryTreeCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.exportDirectoryTreeSnapshot'
  private readonly directoryTreeService: DirectoryTreeService

  constructor(context: vscode.ExtensionContext) {
    this.directoryTreeService = new DirectoryTreeService(context)
  }

  public get commandName(): string {
    return DirectoryTreeCommand.commandName
  }

  public async execute(uri: vscode.Uri): Promise<void> {
    if (!uri?.fsPath) {
      vscode.window.showWarningMessage('폴더를 선택하세요.')
      return
    }

    const treeText = await this.directoryTreeService.generateTree(uri.fsPath)

    const doc = await vscode.workspace.openTextDocument({
      content: treeText,
      language: 'plaintext',
    })

    await vscode.window.showTextDocument(doc)
  }
}
