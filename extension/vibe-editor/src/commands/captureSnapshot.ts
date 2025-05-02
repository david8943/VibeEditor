import * as vscode from 'vscode'

import { SnapshotService } from '../services/snapshotService'
import { TemplateService } from '../services/templateService'
import { ICommand } from '../types/command'
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
    const templates = await this.templateService.getTemplates()
    await this.snapshotService.captureSnapshot(templates)
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
