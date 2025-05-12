import * as vscode from 'vscode'

import { uploadPost } from '../apis/post'
import {
  CreatePost,
  PostDetail,
  PostSummary,
  UploadToNotionRequest,
  UploadToNotionRequestPost,
} from '../types/post'

export function refreshPostProvider() {
  console.log('Refreshing post provider...')
  if (postProviderInstance) {
    postProviderInstance?.refresh()
  }
}
export class PostItem extends vscode.TreeItem {
  constructor(public readonly post: PostSummary) {
    super(post.postTitle, vscode.TreeItemCollapsibleState.None)
    this.tooltip = `${post.postTitle}`
    this.command = {
      command: 'vibeEditor.showPostPage',
      title: 'View Post',
      arguments: [post.postId],
    }
    this.contextValue = 'vibeEditorPostList'
    this.iconPath = post.isLoading
      ? new vscode.ThemeIcon('sync~spin')
      : new vscode.ThemeIcon('book')
  }
}

export class PostService {
  private context: vscode.ExtensionContext
  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }

  async resetPost(): Promise<void> {
    await this.context.globalState.update('posts', [])
  }

  async createPost(data: CreatePost): Promise<void> {
    const newPost: PostDetail = {
      postId: Date.now(),
      postTitle: '임시 포스트 제목',
      postContent: '임시 포스트 내용입니다.',
      templateId: 0,
      promptId: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentPostIdList: [],
    }

    const prev = this.context.globalState.get<PostDetail[]>('posts', [])
    prev.push(newPost)
    await this.context.globalState.update('posts', prev)
    postProviderInstance?.refresh()

    vscode.window.showInformationMessage(
      `포스트가 생성되었습니다: ${newPost.postTitle}`,
    )
  }

  async deletePost(postId: number): Promise<void> {
    const prev = this.context.globalState.get<PostDetail[]>('posts') || []
    const updated = prev.filter((post) => post.postId !== postId)
    await this.context.globalState.update('posts', updated)
    postProviderInstance?.refresh()

    vscode.window.showInformationMessage(`포스트가 삭제되었습니다.`)
  }

  async getCurrentPost(): Promise<PostDetail> {
    const posts = this.context.globalState.get<PostDetail[]>('posts') || []
    return posts[0]
  }

  async getPost(postId: number): Promise<PostDetail | null> {
    return this.getLocalPost(postId)
  }

  async getLocalPost(postId: number): Promise<PostDetail | null> {
    const posts = this.context.globalState.get<PostDetail[]>('posts') || []
    return posts.find((post) => post.postId === postId) || null
  }

  async submitToNotion(data: UploadToNotionRequestPost): Promise<string> {
    // 실제로는 data.promptId를 백엔드에 보내서 postContent 등을 받아야 함
    // 여기선 로컬에서 임의 생성 (mocking)

    const result = await uploadPost(data)
    let postUrl = 'http://www.naver.com'
    if (result.success) {
      postUrl = result.data.postUrl
    }
    const prev = this.context.globalState.get<PostDetail[]>('posts', [])
    const filtered = prev.filter((post) => post.postId < 1700000000000)
    await this.context.globalState.update('posts', filtered)
    postProviderInstance?.refresh()
    return postUrl
  }
  moveToNotion = (postUrl: string) => {
    vscode.window
      .showInformationMessage(
        '노션이 생성되었습니다. 해당 페이지로 이동하시겠습니까?',
        { modal: true },
        'Ok',
      )
      .then(async (selection) => {
        if (selection === 'Ok') {
          await vscode.env.openExternal(
            vscode.Uri.parse(postUrl), // 실제 Notion URL로 변경 필요
          )
        }
      })
  }
}
let postProviderInstance: PostProvider | undefined

export function setPostProvider(provider: PostProvider) {
  postProviderInstance = provider
}

export class PostProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    vscode.TreeItem | undefined | void
  > = new vscode.EventEmitter()
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event

  constructor(private context: vscode.ExtensionContext) {}

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element
  }

  getChildren(): vscode.ProviderResult<vscode.TreeItem[]> {
    const posts = this.context.globalState.get<PostDetail[]>('posts', [])

    const summaries: PostSummary[] = posts.map((post) => ({
      postId: post.postId,
      postTitle: post.postTitle,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      isLoading: post.postId > 1700000000000,
    }))

    return Promise.resolve(
      summaries
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map((summary) => new PostItem(summary)),
    )
  }
}
