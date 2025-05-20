import * as vscode from 'vscode'

import { getDraftData } from '../configuration/draftData'
import { SnapshotService } from '../services/snapshotService'
import { TemplateService } from '../services/templateService'
import { ICommand } from '../types/command'
import { DraftDataType } from '../types/configuration'
import { SnapshotType } from '../types/snapshot'
import { Template } from '../types/template'
import { PageType } from '../types/webview'
import { refreshTemplateProvider } from '../views/tree/templateTreeView'

export class CopyCodeCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.copyCode'

  private snapshotService: SnapshotService
  private templateService: TemplateService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.snapshotService = new SnapshotService(context)
    this.templateService = new TemplateService(context)
  }
  public get commandName(): string {
    return CopyCodeCommand.commandName
  }

  public async execute(): Promise<void> {
    const localTemplates: Template[] =
      await this.templateService.getLocalTemplates()
    if (localTemplates.length == 0) {
      vscode.window.showInformationMessage(`프로젝트가 없습니다.`)
      await this.templateService.createTemplate()
    }
    const copyText = await this.snapshotService.copyCode()

    const success = await this.snapshotService.createSnapshot({
      defaultSnapshotName: new Date().toISOString(),
      snapshotType: SnapshotType.LOG,
      snapshotContent: copyText,
      localTemplates,
    })
    if (!success) {
      vscode.window.showInformationMessage('스냅샷 생성에 실패했습니다.')
      return
    }

    vscode.window.showInformationMessage('📸 로그 스냅샷이 저장되었습니다!')
    const selectedTemplateId: number | undefined = getDraftData(
      DraftDataType.selectedTemplateId,
    )
    if (selectedTemplateId) {
      await this.templateService.updateTemplateDetail(selectedTemplateId)
    }
    refreshTemplateProvider()
  }
}
