import * as vscode from 'vscode'

import { SnapshotService } from '../services/snapshotService'
import { TemplateItem, TemplateService } from '../services/templateService'
import { ICommand } from '../types/command'
import { PageType } from '../types/webview'
import { SnapshotItem } from '../views/codeSnapshotView'
import { ViewLoader } from '../views/webview/ViewLoader'

export class CreateTemplateCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.createTemplate'
  private templateService: TemplateService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.templateService = new TemplateService(context, PageType.TEMPLATE)
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
    this.templateService = new TemplateService(context, PageType.TEMPLATE)
  }

  public get commandName(): string {
    return ShowTemplatePageCommand.commandName
  }

  public async execute(template?: any): Promise<void> {
    console.log('showTemplatePage', template)
    await this.templateService.updateTemplateDetail(template.templateId)

    ViewLoader.showWebview(this.context, PageType.TEMPLATE, template)
  }
}

export class CreatePostCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.createPost'
  private templateService: TemplateService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.templateService = new TemplateService(context, PageType.POST)
  }

  public get commandName(): string {
    return CreatePostCommand.commandName
  }

  public async execute(): Promise<void> {
    ViewLoader.showWebview(this.context, PageType.POST)
  }
}
export class RenameTemplateCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.renameTemplate'
  private templateService: TemplateService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.templateService = new TemplateService(context, PageType.TEMPLATE)
  }

  public get commandName(): string {
    return RenameTemplateCommand.commandName
  }
  public async execute(treeItem: TemplateItem): Promise<void> {
    console.log(treeItem)
    this.templateService.renameTemplate(treeItem.template.templateId)
  }
}
export class DeleteTemplateCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.deleteTemplate'
  private templateService: TemplateService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.templateService = new TemplateService(context, PageType.POST)
  }

  public get commandName(): string {
    return DeleteTemplateCommand.commandName
  }

  public async execute(treeItem: TemplateItem): Promise<void> {
    this.templateService.deleteTemplate(treeItem.template.templateId)
  }
}

export class ResetTemplateCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.resetTemplate'
  private templateService: TemplateService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.templateService = new TemplateService(context, PageType.POST)
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
  private snapshotService: SnapshotService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.templateService = new TemplateService(context, PageType.POST)
    this.snapshotService = new SnapshotService(context)
  }

  public get commandName(): string {
    return AddToPromptCommand.commandName
  }

  public async execute(snapshotItem: SnapshotItem): Promise<void> {
    const snapshot = await this.snapshotService.updateCodeSnapshot(
      snapshotItem.snapshot.snapshotId,
    )
    if (snapshot) {
      this.templateService.addToPrompt(snapshot)
    }
  }
}

export class GetTemplatesCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.getTemplates'
  private templateService: TemplateService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.templateService = new TemplateService(context, PageType.POST)
  }

  public get commandName(): string {
    return GetTemplatesCommand.commandName
  }

  public async execute(): Promise<void> {
    await this.templateService.getTemplates()
    await this.templateService.refreshTemplate()
  }
}
