import * as vscode from 'vscode'

import { setDraftData } from '@/configuration/draftData'
import { DraftDataType } from '@/types/configuration'

import { PostService } from '../services/postService'
import { SettingService } from '../services/settingService'
import { TemplateService } from '../services/templateService'
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
export class InitFetchDataCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.initFetchData'
  private postService: PostService
  private templateService: TemplateService

  constructor(private context: vscode.ExtensionContext) {
    this.postService = new PostService(context)
    this.templateService = new TemplateService(context)
  }

  public get commandName(): string {
    return InitFetchDataCommand.commandName
  }
  public async execute(): Promise<void> {
    await this.postService.getPosts()
    await this.templateService.getTemplates()
  }
}
