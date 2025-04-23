import * as vscode from 'vscode'

import { NotionService } from '../services/notionService'
import { ICommand } from '../types/command'

export class SetNotionApiCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.setNotionApi'

  private notionService: NotionService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.notionService = new NotionService(context)
  }

  public get commandName(): string {
    return SetNotionApiCommand.commandName
  }

  public async execute(): Promise<void> {
    await this.notionService.setNotionApi()
  }
}
