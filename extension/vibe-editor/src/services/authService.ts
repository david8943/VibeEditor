import * as vscode from 'vscode'

import { ConfigType, Configuration } from '../configuration'
import { clearDraftData, setDraftData } from '../configuration/draftData'
import { DraftDataType, SecretType } from '../types/configuration'
import { MessageType } from '../types/webview'
import { getChatViewProvider } from '../views/webview/ChatViewProvider'
import { getSideViewProvider } from '../views/webview/SideViewProvider'
import { getStartGuideViewProvider } from '../views/webview/StartGuideViewProvider'

export class AuthService {
  private context: vscode.ExtensionContext

  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }

  public async googleLogin(): Promise<void> {
    await this.auth('google')
  }

  public async githubLogin(): Promise<void> {
    await this.auth('github')
  }

  public async ssafyLogin(): Promise<void> {
    await this.auth('ssafy')
  }

  async auth(domain: string): Promise<void> {
    try {
      const PORT = 5013
      const server = require('http').createServer(
        async (req: any, res: any) => {
          if (req.url?.startsWith('/callback')) {
            const url = new URL(req.url, `http://localhost:${PORT}`)
            const accessToken = url.searchParams.get('accessToken')

            if (accessToken) {
              res.writeHead(200, {
                'Content-Type': 'text/html; charset=utf-8',
              })
              res.write(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="UTF-8">
                    <style>
                      body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        margin: 0;
                        background-color: #f5f5f5;
                      }
                      .container {
                        text-align: center;
                        padding: 20px;
                        background-color: white;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                      }
                      button {
                        margin-top: 20px;
                        padding: 10px 20px;
                        font-size: 16px;
                        background-color: #007acc;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                      }
                      button:hover {
                        background-color: #0062a3;
                      }
                    </style>
                    <script>
                      function closeWindow() {
                        // 창을 닫기 전에 메시지를 보냅니다
                        window.opener.postMessage('closeWindow', '*');
                        // 창을 닫으려고 시도합니다
                        window.close();
                      }
                    </script>
                  </head>
                  <body>
                    <div class="container">
                      <h1>로그인 성공!</h1>
                      <button  type="button" onclick="closeWindow()">VSCode로 돌아가주세요.</button>
                    </div>
                  </body>
                </html>
              `)
              res.end()
              server.close()
              const loginStatus = true
              vscode.window.withProgress(
                {
                  location: vscode.ProgressLocation.Notification,
                  title: `${domain} 로그인 성공`,
                  cancellable: false,
                },
                async () => {
                  await new Promise((resolve) => setTimeout(resolve, 2000))
                },
              )

              await this.context.secrets.store(
                SecretType.accessToken,
                accessToken,
              )
              setDraftData(DraftDataType.loginStatus, loginStatus)
              await vscode.commands.executeCommand('vibeEditor.initFetchData')
              const sideViewProvider = getSideViewProvider()
              if (sideViewProvider) {
                sideViewProvider.postMessageToWebview({
                  type: MessageType.LOGIN_STATUS_LOADED,
                  payload: loginStatus,
                })
              }

              const startGuideViewProvider = getStartGuideViewProvider()
              if (startGuideViewProvider) {
                startGuideViewProvider.postMessageToWebview({
                  type: MessageType.LOGIN_STATUS_LOADED,
                  payload: loginStatus,
                })
              }

              const chatViewProvider = getChatViewProvider()
              if (chatViewProvider) {
                chatViewProvider.postMessageToWebview({
                  type: MessageType.LOGIN_STATUS_LOADED,
                  payload: loginStatus,
                })
              }

              vscode.commands.executeCommand('vibeEditor.initFetchData')
            } else {
              res.statusCode = 400
              res.end('Token이 없습니다.')
              setDraftData(DraftDataType.loginStatus, false)
            }
          } else {
            res.statusCode = 404
            res.end('잘못된 경로입니다.')
            setDraftData(DraftDataType.loginStatus, false)
          }
        },
      )
      server.listen(PORT)

      await vscode.env.openExternal(
        vscode.Uri.parse(
          domain === 'ssafy'
            ? `https://project.ssafy.com/oauth/sso-check?client_id=74261878-69ac-4133-9729-39dff3a38aca&redirect_uri=https://vibeeditor.site/api/v1/user/login/ssafy/callback&response_type=code`
            : `https://vibeeditor.site/oauth2/authorization/${domain}`,
        ),
      )
    } catch (error) {
      vscode.window.showErrorMessage(`${domain} 로그인 실패`)
      console.error(error)
    }
  }

  public async logout(): Promise<void> {
    Object.values(SecretType).forEach((element) => {
      this.context.secrets.delete(element)
    })
    await clearDraftData()
    await Configuration.reset()
    await vscode.commands.executeCommand('vibeEditor.resetTemplate')
    await vscode.commands.executeCommand('vibeEditor.resetPost')
    if (Configuration.get(ConfigType.showStartGuide)) {
      await vscode.commands.executeCommand('vibeEditor.resetStartGuide')
    }
    const chatViewProvider = getChatViewProvider()
    if (chatViewProvider) {
      chatViewProvider.postMessageToWebview({
        type: MessageType.LOGIN_STATUS_LOADED,
        payload: false,
      })
    }
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: '로그아웃되었습니다.',
        cancellable: false,
      },
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      },
    )
  }

  public async selectLoginMethod(): Promise<void> {
    const result = await new Promise<string | null>((resolve) => {
      const quickPick = vscode.window.createQuickPick()
      quickPick.items = [
        {
          label: 'google',
          description: '구글 로그인',
        },
        {
          label: 'github',
          description: '깃허브 로그인',
        },
        {
          label: 'ssafy',
          description: 'SSAFY 로그인',
        },
      ]
      quickPick.placeholder = '로그인 방식을 선택하세요'
      quickPick.onDidAccept(() => {
        const selected = quickPick.selectedItems[0] as {
          label: string
        }
        if (selected) {
          quickPick.hide()
          resolve(selected.label)
        } else {
          resolve(null)
        }
      })

      quickPick.onDidHide(() => {
        resolve(null)
      })
      quickPick.show()
    })
    if (result === null) {
      vscode.window.showErrorMessage('로그인 방식을 선택해주세요.')
    } else {
      vscode.window.showInformationMessage(`${result} 로그인 선택`)
      await this.auth(result)
    }
  }
}
