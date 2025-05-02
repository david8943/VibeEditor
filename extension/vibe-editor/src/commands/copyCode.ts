import * as vscode from 'vscode'

import { SnapshotService } from '../services/snapshotService'
import { TemplateService } from '../services/templateService'
import { ICommand } from '../types/command'
import { PageType } from '../types/webview'

export class CopyCodeCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.copyCode'

  private snapshotService: SnapshotService
  private templateService: TemplateService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.snapshotService = new SnapshotService(context)
    this.templateService = new TemplateService(context, PageType.TEMPLATE)
  }
  public get commandName(): string {
    return CopyCodeCommand.commandName
  }

  public async execute(): Promise<void> {
    const templates = await this.templateService.getTemplates()
    await this.snapshotService.copyCode(templates)
  }
}
