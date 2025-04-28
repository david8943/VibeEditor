import * as vscode from 'vscode'

import { SnapshotService } from '../services/snapshotService'
import { ICommand } from '../types/command'
import { SnapshotItem } from '../views/codeSnapshotView'

export class CaptureSnapshotCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.captureCodeSnapshot'

  private snapshotService: SnapshotService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.snapshotService = new SnapshotService(context)
  }

  public get commandName(): string {
    return CaptureSnapshotCommand.commandName
  }

  public async execute(): Promise<void> {
    await this.snapshotService.captureSnapshot()
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
