import * as vscode from 'vscode'

import { PostService } from '../services/postService'
import { ViewService } from '../services/viewService'
import { ICommand } from '../types/command'
import { PostItem } from '../views/tree/postTreeView'

export class ShowPostPageCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.showPostPage'
  private viewService: ViewService
  constructor(private context: vscode.ExtensionContext) {
    this.viewService = new ViewService(context)
  }

  public get commandName(): string {
    return ShowPostPageCommand.commandName
  }
  public async execute(postId: number): Promise<void> {
    await this.viewService.showPostPage(postId)
  }
}
export class ShowDefaultPostPageCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.showDefaultPostPage'
  private viewService: ViewService
  constructor(private context: vscode.ExtensionContext) {
    this.viewService = new ViewService(context)
  }

  public get commandName(): string {
    return ShowDefaultPostPageCommand.commandName
  }
  public async execute(): Promise<void> {
    await this.viewService.showDefaultPostPage()
  }
}
export class DeletePostCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.deletePost'

  private postService: PostService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.postService = new PostService(context)
  }

  public get commandName(): string {
    return DeletePostCommand.commandName
  }

  public async execute(item: PostItem): Promise<void> {
    await this.postService.deletePost(item.post.postId)
  }
}
export class ResetPostCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.resetPost'

  private postService: PostService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.postService = new PostService(context)
  }

  public get commandName(): string {
    return ResetPostCommand.commandName
  }

  public async execute(item: PostItem): Promise<void> {
    await this.postService.resetPost()
  }
}
export class CreatePostCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.createPost'

  private postService: PostService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.postService = new PostService(context)
  }

  public get commandName(): string {
    return CreatePostCommand.commandName
  }

  public async execute(item: PostItem): Promise<void> {
    await this.postService.createPost(1)
    await this.postService.createPost(2)
    await this.postService.createPost(3)
    await this.postService.createPost(4)
    await this.postService.createPost(5)
    await this.postService.createPost(6)
    await this.postService.createPost(7)
    await this.postService.createPost(8)
    await this.postService.createPost(9)
    await this.postService.createPost(10)
    await this.postService.createPost(11)
    await this.postService.createPost(12)
  }
}
