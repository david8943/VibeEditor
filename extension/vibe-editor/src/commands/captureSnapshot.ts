import * as vscode from 'vscode'

import { getDraftData } from '../configuration/draftData'
import {
  SnapshotService,
  refreshAllProviders,
} from '../services/snapshotService'
import { TemplateService } from '../services/templateService'
import { ICommand } from '../types/command'
import { DraftDataType } from '../types/configuration'
import { Snapshot, SnapshotType } from '../types/snapshot'
import { PageType } from '../types/webview'
import { SnapshotItem } from '../views/codeSnapshotView'

export class CaptureSnapshotCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.captureCodeSnapshot'

  private snapshotService: SnapshotService
  private templateService: TemplateService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.snapshotService = new SnapshotService(context)
    this.templateService = new TemplateService(context, PageType.TEMPLATE)
  }

  public get commandName(): string {
    return CaptureSnapshotCommand.commandName
  }

  public async execute(): Promise<void> {
    const localTemplates = await this.templateService.getLocalTemplates()

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
    refreshAllProviders()
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

  public async execute(snapshot: SnapshotItem): Promise<void> {
    await this.snapshotService.deleteSnapshot(snapshot)
  }
}

export class RefreshSnapshotCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.refreshSnapshot'

  private snapshotService: SnapshotService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.snapshotService = new SnapshotService(context)
  }
  public get commandName(): string {
    return RefreshSnapshotCommand.commandName
  }

  public async execute(): Promise<void> {
    await this.snapshotService.refreshSnapshot()
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

  public async execute(snapshot: Snapshot): Promise<void> {
    await this.snapshotService.viewCodeSnapshot(snapshot.snapshotId)
  }
}
