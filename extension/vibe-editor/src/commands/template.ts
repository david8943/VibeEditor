import * as vscode from 'vscode'

import { setDraftData } from '../configuration/draftData'
import { SnapshotService } from '../services/snapshotService'
import { TemplateService } from '../services/templateService'
import { ViewService } from '../services/viewService'
import { ICommand } from '../types/command'
import { DraftDataType } from '../types/configuration'
import { Prompt } from '../types/template'
import {
  PromptItem,
  SnapshotItem,
  TemplateItem,
  refreshTemplateProvider,
} from '../views/tree/templateTreeView'

export class CreateTemplateCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.createTemplate'
  private templateService: TemplateService
  private viewService: ViewService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.templateService = new TemplateService(context)
    this.viewService = new ViewService(context)
  }

  public get commandName(): string {
    return CreateTemplateCommand.commandName
  }

  public async execute(): Promise<void> {
    const templateId = await this.templateService.createTemplate()
    if (templateId) {
      await this.viewService.showTemplatePage(templateId)
    }
  }
}

export class ShowTemplatePageCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.showTemplatePage'
  private viewService: ViewService
  private templateService: TemplateService
  constructor(private context: vscode.ExtensionContext) {
    this.viewService = new ViewService(context)
    this.templateService = new TemplateService(context)
  }

  public get commandName(): string {
    return ShowTemplatePageCommand.commandName
  }
  public async execute(templateId: number): Promise<void> {
    await this.templateService.updateTemplateDetail(templateId)
    await this.viewService.showTemplatePage(templateId)
  }
}
export class ShowDefaultTemplatePageCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.showDefaultTemplatePage'
  private viewService: ViewService
  constructor(private context: vscode.ExtensionContext) {
    this.viewService = new ViewService(context)
  }

  public get commandName(): string {
    return ShowDefaultTemplatePageCommand.commandName
  }
  public async execute(): Promise<void> {
    await this.viewService.showDefaultTemplatePage()
  }
}
export class ShowPromptCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.showPrompt'
  private viewService: ViewService
  private templateService: TemplateService
  constructor(private context: vscode.ExtensionContext) {
    this.viewService = new ViewService(context)
    this.templateService = new TemplateService(context)
  }

  public get commandName(): string {
    return ShowPromptCommand.commandName
  }
  public async execute({
    prompt,
    templateId,
  }: {
    prompt: Prompt
    templateId: number
  }): Promise<void> {
    setDraftData(DraftDataType.selectedTemplateId, templateId)
    await this.templateService.updateTemplateDetail(templateId)
    await this.viewService.showPrompt(prompt)
  }
}
export class RenameTemplateCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.renameTemplate'
  private templateService: TemplateService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.templateService = new TemplateService(context)
  }

  public get commandName(): string {
    return RenameTemplateCommand.commandName
  }
  public async execute(treeItem: TemplateItem): Promise<void> {
    this.templateService.renameTemplate(treeItem.template.templateId)
  }
}
export class DeleteTemplateCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.deleteTemplate'
  private templateService: TemplateService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.templateService = new TemplateService(context)
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

  constructor(private readonly context: vscode.ExtensionContext) {}

  public get commandName(): string {
    return ResetTemplateCommand.commandName
  }

  public async execute(): Promise<void> {
    refreshTemplateProvider()
  }
}

export class AddToPromptCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.addToPrompt'
  private templateService: TemplateService
  private snapshotService: SnapshotService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.templateService = new TemplateService(context)
    this.snapshotService = new SnapshotService(context)
  }

  public get commandName(): string {
    return AddToPromptCommand.commandName
  }

  public async execute(snapshotItem: SnapshotItem): Promise<void> {
    const snapshot = await this.snapshotService.updateCodeSnapshot(
      snapshotItem.snapshot.snapshotId,
      snapshotItem.templateId,
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
    this.templateService = new TemplateService(context)
  }

  public get commandName(): string {
    return GetTemplatesCommand.commandName
  }

  public async execute(): Promise<void> {
    await this.templateService.getTemplates()
    refreshTemplateProvider()
  }
}

export class GenaratePostCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.generatePost'
  private templateService: TemplateService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.templateService = new TemplateService(context)
  }

  public get commandName(): string {
    return GenaratePostCommand.commandName
  }

  public async execute(item: PromptItem): Promise<void> {
    this.templateService.generatePost(item.prompt)
  }
}
