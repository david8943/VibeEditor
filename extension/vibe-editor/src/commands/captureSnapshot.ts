import * as vscode from 'vscode'

import { getDraftData } from '../configuration/draftData'
import { SnapshotService } from '../services/snapshotService'
import { TemplateService } from '../services/templateService'
import { ICommand } from '../types/command'
import { DraftDataType } from '../types/configuration'
import { Snapshot, SnapshotType } from '../types/snapshot'
import {
  SnapshotItem,
  refreshTemplateProvider,
} from '../views/tree/templateTreeView'

export class CaptureSnapshotCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.captureCodeSnapshot'

  private snapshotService: SnapshotService
  private templateService: TemplateService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.snapshotService = new SnapshotService(context)
    this.templateService = new TemplateService(context)
  }

  public get commandName(): string {
    return CaptureSnapshotCommand.commandName
  }

  public async execute(): Promise<void> {
    const localTemplates = await this.templateService.getLocalTemplates()
    if (localTemplates.length == 0) {
      vscode.window.showInformationMessage(`프로젝트가 없습니다.`)
      await this.templateService.createTemplate()
    }
    const defaultCaptureSnapshotName =
      await this.snapshotService.getSnapshotName()
    const blockText = await this.snapshotService.captureSnapshot()

    const success = await this.snapshotService.createSnapshot({
      defaultSnapshotName: defaultCaptureSnapshotName,
      snapshotType: SnapshotType.BLOCK,
      snapshotContent: blockText,
      localTemplates,
    })
    if (!success) {
      vscode.window.showInformationMessage('스냅샷 생성에 실패했습니다.')
      return
    }

    vscode.window.showInformationMessage('📸 코드 스냅샷이 저장되었습니다!')
    vscode.commands.executeCommand(
      'workbench.view.extension.vibeEditorCodeSnapshot',
    )
    const selectedTemplateId: number | undefined = getDraftData(
      DraftDataType.selectedTemplateId,
    )
    if (selectedTemplateId) {
      await this.templateService.updateTemplateDetail(selectedTemplateId)
    }
    refreshTemplateProvider()
  }
}

export class DeleteSnapshotCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.deleteSnapshot'

  private snapshotService: SnapshotService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.snapshotService = new SnapshotService(context)
  }

  public get commandName(): string {
    return DeleteSnapshotCommand.commandName
  }

  public async execute(item: SnapshotItem): Promise<void> {
    await this.snapshotService.deleteSnapshot(item.snapshot.snapshotId)
  }
}

export class ViewCodeSnapshotCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.viewCodeSnapshot'

  private snapshotService: SnapshotService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.snapshotService = new SnapshotService(context)
  }
  public get commandName(): string {
    return ViewCodeSnapshotCommand.commandName
  }

  public async execute({
    snapshot,
    templateId,
  }: {
    snapshot: Snapshot
    templateId: number
  }): Promise<void> {
    await this.snapshotService.viewCodeSnapshot(snapshot.snapshotId, templateId)
  }
}

export class RenameSnapshotCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.renameSnapshot'

  private snapshotService: SnapshotService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.snapshotService = new SnapshotService(context)
  }
  public get commandName(): string {
    return RenameSnapshotCommand.commandName
  }

  public async execute(item: SnapshotItem): Promise<void> {
    await this.snapshotService.renameSnapshot(item)
  }
}
