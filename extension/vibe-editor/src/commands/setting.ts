import * as vscode from 'vscode'

import { SettingService } from '../services/settingService'
import { ViewService } from '../services/viewService'
import { ICommand } from '../types/command'

export class ShowSettingPageCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.showSettingPage'
  private viewService: ViewService
  constructor(private context: vscode.ExtensionContext) {
    this.viewService = new ViewService(context)
  }

  public get commandName(): string {
    return ShowSettingPageCommand.commandName
  }
  public async execute(): Promise<void> {
    await this.viewService.showSettingPage()
  }
}
export class ShowReadmeCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.showReadme'
  private settingService: SettingService
  constructor(private context: vscode.ExtensionContext) {
    this.settingService = new SettingService(context)
  }

  public get commandName(): string {
    return ShowReadmeCommand.commandName
  }
  public async execute(): Promise<void> {
    await this.settingService.showReadme()
  }
}
