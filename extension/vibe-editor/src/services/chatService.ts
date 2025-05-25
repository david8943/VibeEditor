import * as vscode from 'vscode'

import { getSnapshotDetail } from '../apis/snapshot'
import { Snapshot } from '../types/snapshot'
import { MessageType } from '../types/webview'
import { getChatViewProvider } from '../views/webview/ChatViewProvider'

export class ChatService {
  private context: vscode.ExtensionContext

  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }

  public async insertSnapshotToChat(snapshot: Snapshot): Promise<void> {
    try {
      const snapshotDetailResult = await getSnapshotDetail(snapshot.snapshotId)
      if (snapshotDetailResult.success) {
        const snapshotDetail = snapshotDetailResult.data
        snapshotDetail.snapshotId = snapshot.snapshotId
        getChatViewProvider()?.postMessageToWebview({
          type: MessageType.INSERT_SNAPSHOT_TO_CHAT,
          payload: snapshotDetail,
        })
      }
    } catch (error) {
      vscode.window.showErrorMessage(
        `스냅샷 채팅에 추가 중 오류 발생: ${error}`,
      )
    }
  }
}
