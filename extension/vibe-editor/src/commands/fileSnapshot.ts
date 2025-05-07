import * as vscode from 'vscode'

import { getDraftData } from '../configuration/draftData'
import { FileService } from '../services/fileService'
import {
  SnapshotService,
  refreshAllProviders,
} from '../services/snapshotService'
import { TemplateService } from '../services/templateService'
import { ICommand } from '../types/command'
import { DraftDataType } from '../types/configuration'
import { SnapshotType } from '../types/snapshot'
import { Template } from '../types/template'
import { PageType } from '../types/webview'

export class FileSnapshotCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.captureFileSnapshot'
  private readonly fileService: FileService
  private readonly snapshotService: SnapshotService
  private templateService: TemplateService

  constructor(context: vscode.ExtensionContext) {
    this.fileService = new FileService(context)
    this.templateService = new TemplateService(context, PageType.TEMPLATE)
    this.snapshotService = new SnapshotService(context)
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

    const localTemplates: Template[] =
      await this.templateService.getLocalTemplates()

    for (const fileUri of selectedUris) {
      const treeText = await this.fileService.captureFileSnapshot(
        fileUri.fsPath,
        localTemplates,
      )
      const success = await this.snapshotService.createSnapshot({
        defaultSnapshotName: fileUri.fsPath,
        snapshotType: SnapshotType.FILE,
        snapshotContent: treeText,
        localTemplates,
      })
      if (!success) {
        vscode.window.showInformationMessage('스냅샷 생성에 실패했습니다.')
        return
      }

      await this.snapshotService.openTextDocument(treeText)
    }
    const selectedTemplateId: number | undefined = getDraftData(
      DraftDataType.selectedTemplateId,
    )
    if (selectedTemplateId) {
      await this.templateService.updateTemplateDetail(selectedTemplateId)
    }
    refreshAllProviders()
  }
}
