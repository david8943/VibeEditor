import * as vscode from 'vscode'

import { SnapshotService } from '../services/snapshotService'
import { ICommand } from '../types/command'

export class CopyCodeCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.copyCode'

  private snapshotService: SnapshotService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.snapshotService = new SnapshotService(context)
  }
  public get commandName(): string {
    return CopyCodeCommand.commandName
  }

  public async execute(): Promise<void> {
    await this.snapshotService.copyCode()
  }
}
