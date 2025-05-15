import * as vscode from 'vscode'

import { ViewService } from '../services/viewService'
import { ICommand } from '../types/command'

export class ShowSideViewCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.showSideViewPage'
  private viewService: ViewService
  constructor(private context: vscode.ExtensionContext) {
    this.viewService = new ViewService(context)
  }

  public get commandName(): string {
    return ShowSideViewCommand.commandName
  }
  public async execute(): Promise<void> {
    await this.viewService.focusSideView()
  }
}
