import * as vscode from 'vscode'

import { TemplateService } from '../services/templateService'
import { ICommand } from '../types/command'
import { SnapshotItem } from '../views/codeSnapshotView'
import { ViewLoader } from '../views/webview/ViewLoader'

export class CreateTemplateCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.createTemplate'
  private templateService: TemplateService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.templateService = new TemplateService(context, 'template')
  }

  public get commandName(): string {
    return CreateTemplateCommand.commandName
  }

  public async execute(): Promise<void> {
    this.templateService.createTemplate()
  }
}

export class ShowTemplatePageCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.showTemplatePage'
  private templateService: TemplateService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.templateService = new TemplateService(context, 'template')
  }

  public get commandName(): string {
    return ShowTemplatePageCommand.commandName
  }

  public async execute(template?: any): Promise<void> {
    ViewLoader.showWebview(this.context, 'template', template)
  }
}

export class CreatePostCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.createPost'
  private templateService: TemplateService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.templateService = new TemplateService(context, 'post')
  }

  public get commandName(): string {
    return CreatePostCommand.commandName
  }

  public async execute(): Promise<void> {
    ViewLoader.showWebview(this.context, 'post')
  }
}

export class ResetTemplateCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.resetTemplate'
  private templateService: TemplateService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.templateService = new TemplateService(context, 'post')
  }

  public get commandName(): string {
    return ResetTemplateCommand.commandName
  }

  public async execute(): Promise<void> {
    this.templateService.resetTemplate()
  }
}

export class AddToPromptCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.addToPrompt'
  private templateService: TemplateService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.templateService = new TemplateService(context, 'post')
  }

  public get commandName(): string {
    return AddToPromptCommand.commandName
  }

  public async execute(snapshotItem: SnapshotItem): Promise<void> {
    this.templateService.addToPrompt(snapshotItem)
  }
}
