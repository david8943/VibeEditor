import * as vscode from 'vscode'

import { clearDraftData, setDraftData } from '../configuration/draftData'
import { DraftDataType, SecretType } from '../types/configuration'

export class AuthService {
  private context: vscode.ExtensionContext

  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }

  public async googleLogin(): Promise<void> {
    await this.auth('google')
  }

  public async githubLogin(): Promise<void> {
    // await this.context.secrets.store(SecretType.accessToken, 'test')
    // setDraftData(DraftDataType.loginStatus, true)
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
              await this.context.secrets.store(
                SecretType.accessToken,
                accessToken,
              )
              setDraftData(DraftDataType.loginStatus, true)
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
                      <button onclick="closeWindow()">VSCode로 돌아가주세요.</button>
                    </div>
                  </body>
                </html>
              `)
              res.end()
              server.close()
              vscode.window.showInformationMessage(`${domain} 로그인 성공`)
              await this.context.secrets.store(
                SecretType.accessToken,
                accessToken,
              )
              setDraftData(DraftDataType.loginStatus, true)

              // TODO: 로그인하고 나면 템플릿 리스트 재호출
              vscode.commands.executeCommand('vibeEditor.getTemplates')
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
          `https://vibeeditor.site/oauth2/authorization/${domain}`,
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
    clearDraftData()
    vscode.commands.executeCommand('vibeEditor.resetTemplate')
    vscode.window.showInformationMessage('로그아웃되었습니다.')
  }
}
