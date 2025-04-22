import * as vscode from 'vscode'

import { DirectoryTreeService } from '../services/directoryTreeService'
import { ICommand, IVSCodeAPI } from '../types'

export class DirectoryTreeCommand implements ICommand {
  public static readonly commandName = 'vibe-editor.exportDirectoryTree'
  private readonly directoryTreeService: DirectoryTreeService

  constructor(private readonly vscodeApi: IVSCodeAPI) {
    this.directoryTreeService = new DirectoryTreeService(vscodeApi)
  }

  public get commandName(): string {
    return DirectoryTreeCommand.commandName
  }

  public async execute(uri: vscode.Uri): Promise<void> {
    if (!uri?.fsPath) {
      this.vscodeApi.showWarningMessage('폴더를 선택하세요.')
      return
    }

    const treeText = this.directoryTreeService.generateTree(uri.fsPath)
    const doc = await this.vscodeApi.openTextDocument({
      content: treeText,
      language: 'plaintext',
    })

    await this.vscodeApi.showTextDocument(doc)
  }
}
