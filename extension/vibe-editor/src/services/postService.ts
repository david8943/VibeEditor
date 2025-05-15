import * as vscode from 'vscode'

import { upgradePost, uploadPost } from '../apis/post'
import { getDraftData } from '../configuration/draftData'
import { DraftDataType } from '../types/configuration'
import {
  CreatePost,
  Post,
  PostDetail,
  UploadToNotionRequestPost,
} from '../types/post'
import { isLoading } from '../utils/isLoading'
import { refreshPostProvider } from '../views/tree/postTreeView'

export class PostService {
  private context: vscode.ExtensionContext
  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }

  async resetPost(): Promise<void> {
    await this.context.globalState.update('posts', [])
    refreshPostProvider()
  }

  async createPost(postId: number): Promise<void> {
    const newPost: PostDetail = {
      postId: postId,
      postTitle: `임시 포스트 제목 ${postId}`,
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
    refreshPostProvider()
    vscode.window.showInformationMessage(
      `포스트가 생성되었습니다: ${newPost.postTitle}`,
    )
  }

  async deletePost(postId: number): Promise<void> {
    const prev = await this.getLocalPosts()
    const updated = prev.filter((post) => post.postId !== postId)
    await this.context.globalState.update('posts', updated)
    refreshPostProvider()
    vscode.window.showInformationMessage(`포스트가 삭제되었습니다.`)
  }

  async getCurrentPost(): Promise<PostDetail | null> {
    const posts = await this.getLocalPosts()
    const postId = getDraftData(DraftDataType.selectedPostId)
    return posts.find((post) => post.postId === postId) || posts[0] || null
  }

  async getPost(postId: number): Promise<PostDetail | null> {
    return this.getLocalPost(postId)
  }
  async getLocalPosts(): Promise<PostDetail[]> {
    return this.context.globalState.get<PostDetail[]>('posts') || []
  }
  async getLocalPost(
    postId: number,
    prev?: PostDetail[],
  ): Promise<PostDetail | null> {
    const posts = prev || (await this.getLocalPosts())
    return posts.find((post) => post.postId === postId) || null
  }

  async updatePost(data: Post): Promise<void> {
    const prev = await this.getLocalPosts()
    const updated = prev.map((post) =>
      post.postId === data.postId ? { ...post, ...data } : post,
    )
    await this.context.globalState.update('posts', updated)
    const success = await upgradePost({
      postId: data.postId,
      updatePost: {
        postContent: data.postContent,
        postTitle: data.postTitle,
      },
    })
    if (success) {
      vscode.window.showInformationMessage('포스트가 업데이트되었습니다.')
    }
    refreshPostProvider()
  }
  async submitToNotion(data: UploadToNotionRequestPost): Promise<string> {
    // 실제로는 data.promptId를 백엔드에 보내서 postContent 등을 받아야 함
    const result = await uploadPost(data)
    let postUrl = 'http://www.naver.com'
    if (result.success) {
      postUrl = result.data.postUrl
    }
    const prev = await this.getLocalPosts()
    const filtered = prev.filter((post) => !isLoading(post.postId))
    await this.context.globalState.update('posts', filtered)
    refreshPostProvider()
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
          await vscode.env.openExternal(vscode.Uri.parse(postUrl))
        }
      })
  }
}
