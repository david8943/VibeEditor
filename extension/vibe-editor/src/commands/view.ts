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
export class CloseStartGuideCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.closeStartGuide'
  private viewService: ViewService
  constructor(private context: vscode.ExtensionContext) {
    this.viewService = new ViewService(context)
  }

  public get commandName(): string {
    return CloseStartGuideCommand.commandName
  }
  public async execute(): Promise<void> {
    await this.viewService.closeStartGuide()
  }
}
export class OpenStartGuideCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.openStartGuide'
  private viewService: ViewService
  constructor(private context: vscode.ExtensionContext) {
    this.viewService = new ViewService(context)
  }

  public get commandName(): string {
    return OpenStartGuideCommand.commandName
  }
  public async execute(): Promise<void> {
    await this.viewService.openStartGuide()
  }
}
export class ResetStartGuide implements ICommand {
  public static readonly commandName = 'vibeEditor.resetStartGuide'
  private viewService: ViewService
  constructor(private context: vscode.ExtensionContext) {
    this.viewService = new ViewService(context)
  }

  public get commandName(): string {
    return ResetStartGuide.commandName
  }
  public async execute(): Promise<void> {
    await this.viewService.resetStartGuide()
  }
}
