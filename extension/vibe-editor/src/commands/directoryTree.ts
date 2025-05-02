import * as vscode from 'vscode'

import { DirectoryTreeService } from '../services/directoryTreeService'
import { TemplateService } from '../services/templateService'
import { ICommand } from '../types/command'
import { PageType } from '../types/webview'

export class DirectoryTreeCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.exportDirectoryTreeSnapshot'
  private readonly directoryTreeService: DirectoryTreeService
  private templateService: TemplateService

  constructor(context: vscode.ExtensionContext) {
    this.directoryTreeService = new DirectoryTreeService(context)
    this.templateService = new TemplateService(context, PageType.TEMPLATE)
  }

  public get commandName(): string {
    return DirectoryTreeCommand.commandName
  }

  public async execute(uri: vscode.Uri): Promise<void> {
    if (!uri?.fsPath) {
      vscode.window.showWarningMessage('폴더를 선택하세요.')
      return
    }

    const templates = await this.templateService.getTemplates()
    const treeText = await this.directoryTreeService.generateTree(
      uri.fsPath,
      templates,
    )

    const doc = await vscode.workspace.openTextDocument({
      content: treeText,
      language: 'plaintext',
    })

    await vscode.window.showTextDocument(doc)
  }
}
