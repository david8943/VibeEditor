import * as vscode from 'vscode'

import { CreatePost, Post } from '../types/post'
import { SubmitPost, Template } from '../types/template'

class PostItem extends vscode.TreeItem {
  constructor(public readonly post: Post) {
    super(post.postName, vscode.TreeItemCollapsibleState.None)
    this.tooltip = `${post.postName}`
    this.command = {
      command: 'vibeEditor.showPostPage',
      title: 'View Post',
      arguments: [post],
    }
    this.iconPath = new vscode.ThemeIcon('symbol-snippet')
  }
}

export class PostService {
  private context: vscode.ExtensionContext
  private page: string
  constructor(context: vscode.ExtensionContext, page: string) {
    this.context = context
    this.page = page
  }

  async resetPost(): Promise<void> {
    await this.context.globalState.update('posts', [])
  }

  async updatePost(data: SubmitPost): Promise<void> {
    const updatedPost: Post = {
      postId: data.post.postId,
      postName: data.post.postName,
      postContent: data.post.postContent,
      updatedAt: new Date().toISOString(),
      createdAt: data.post.createdAt,
      promptId: data.post.promptId,
    }

    const prev = this.context.globalState.get<Post[]>('posts') || []
    const postIndex = prev.findIndex(
      (post) => post.postId === data.selectedPostId,
    )
    if (postIndex !== -1) {
      prev[postIndex] = updatedPost
      await this.context.globalState.update('posts', prev)
      postProviderInstance?.refresh()
    }

    vscode.window.showInformationMessage(
      `포스트가 저장되었습니다: ${updatedPost.postName}`,
    )
  }
  async createPost(data: SubmitPost): Promise<void> {
    const newPost: Post = {
      postId: new Date().getTime(),
      postName: data.post.postName || '',
      postContent: data.post.postContent || '',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      promptId: data.post.promptId,
    }

    const prev = this.context.globalState.get<Post[]>('posts') || []
    prev.push(newPost)
    await this.context.globalState.update('posts', prev)
    postProviderInstance?.refresh()
    vscode.window.showInformationMessage(
      `포스트가 생성되었습니다: ${newPost.postName}`,
    )
  }
  async deletePost(data: SubmitPost): Promise<void> {
    const prev = this.context.globalState.get<Post[]>('posts') || []
    const postIndex = prev.findIndex(
      (post) => post.postId === data.selectedPostId,
    )
    if (postIndex !== -1) {
      await this.context.globalState.update('posts', [
        ...prev.filter((_, index) => index !== postIndex),
      ])
      postProviderInstance?.refresh()
    }
    vscode.window.showInformationMessage(`프롬프트가 삭제되었습니다:`)
  }

  async getCurrentPost(): Promise<Post> {
    const posts = this.context.globalState.get<Post[]>('posts') || []
    return posts[0]
  }

  async submitToNotion(data: CreatePost) {
    vscode.window
      .showInformationMessage(
        '노션이 생성되었습니다. 해당 페이지로 이동하시겠습니까까?',
        { modal: true },
        'Ok',
      )
      .then(async (selection) => {
        if (selection === 'Ok') {
          await vscode.env.openExternal(
            vscode.Uri.parse(`http://www.naver.com`),
          )
        }
      })
  }
}

let postProviderInstance: postProvider | undefined

export function setpostProvider(provider: postProvider) {
  postProviderInstance = provider
}
export class postProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    vscode.TreeItem | undefined | void
  > = new vscode.EventEmitter<vscode.TreeItem | undefined | void>()
  readonly onDidChangeTreeData: vscode.Event<
    vscode.TreeItem | undefined | void
  > = this._onDidChangeTreeData.event

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  constructor(private context: vscode.ExtensionContext) {}

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element
  }

  getChildren(): vscode.ProviderResult<vscode.TreeItem[]> {
    const posts = this.context.globalState.get<Post[]>('posts') || []
    return posts
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((post) => new PostItem(post))
  }
}
