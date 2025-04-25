import * as vscode from 'vscode'

import { SettingService } from '../services/settingService'
import { ICommand } from '../types/command'

export class ShowSettingPageCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.showSettingPage'
  private settingService: SettingService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.settingService = new SettingService(context, 'setting')
  }

  public get commandName(): string {
    return ShowSettingPageCommand.commandName
  }

  public async execute(): Promise<void> {
    await this.settingService.showSettingPage()
  }
}
