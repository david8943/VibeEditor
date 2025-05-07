import * as vscode from 'vscode'

import { getDraftData } from '../configuration/draftData'
import { DirectoryTreeService } from '../services/directoryTreeService'
import {
  SnapshotService,
  refreshAllProviders,
} from '../services/snapshotService'
import { TemplateService } from '../services/templateService'
import { ICommand } from '../types/command'
import { DraftDataType } from '../types/configuration'
import { SnapshotType } from '../types/snapshot'
import { PageType } from '../types/webview'

export class DirectoryTreeCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.exportDirectoryTreeSnapshot'
  private readonly directoryTreeService: DirectoryTreeService
  private readonly snapshotService: SnapshotService
  private templateService: TemplateService

  constructor(context: vscode.ExtensionContext) {
    this.directoryTreeService = new DirectoryTreeService(context)
    this.snapshotService = new SnapshotService(context)
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

    const localTemplates = await this.templateService.getLocalTemplates()
    const treeText = await this.directoryTreeService.generateTree(uri.fsPath)
    const success = await this.snapshotService.createSnapshot({
      defaultSnapshotName: uri.fsPath,
      snapshotType: SnapshotType.DIRECTORY,
      snapshotContent: treeText,
      localTemplates,
    })
    if (!success) {
      vscode.window.showInformationMessage('스냅샷 생성에 실패했습니다.')
      return
    }
    const selectedTemplateId: number | undefined = getDraftData(
      DraftDataType.selectedTemplateId,
    )
    if (selectedTemplateId) {
      await this.templateService.updateTemplateDetail(selectedTemplateId)
    }
    refreshAllProviders()
    await this.snapshotService.openTextDocument(treeText)
  }
}
