import * as vscode from 'vscode'

import { FileService } from '../services/fileService'
import { TemplateService } from '../services/templateService'
import { ICommand } from '../types/command'
import { Template } from '../types/template'
import { PageType } from '../types/webview'

export class FileSnapshotCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.captureFileSnapshot'
  private readonly fileService: FileService
  private templateService: TemplateService

  constructor(context: vscode.ExtensionContext) {
    this.fileService = new FileService(context)
    this.templateService = new TemplateService(context, PageType.TEMPLATE)
  }

  public get commandName(): string {
    return FileSnapshotCommand.commandName
  }

  public async execute(uri: vscode.Uri, uris?: vscode.Uri[]): Promise<void> {
    const selectedUris = uris?.length ? uris : [uri]

    if (!selectedUris.length) {
      vscode.window.showWarningMessage('파일을 선택하세요.')
      return
    }

    const templates: Template[] = await this.templateService.getTemplates()

    for (const fileUri of selectedUris) {
      const treeText = await this.fileService.captureFileSnapshot(
        fileUri.fsPath,
        templates,
      )
      const doc = await vscode.workspace.openTextDocument({
        content: treeText,
        language: 'plaintext',
      })

      await vscode.window.showTextDocument(doc)
    }
  }
}
