import * as vscode from 'vscode'

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

  async auth(domain: string): Promise<void> {
    try {
      const PORT = 5013
      const server = require('http').createServer(
        async (req: any, res: any) => {
          if (req.url?.startsWith('/callback')) {
            const url = new URL(req.url, `http://localhost:${PORT}`)
            const token = url.searchParams.get('token')

            if (token) {
              await this.context.secrets.store('accessToken', token)

              await vscode.commands.executeCommand(
                'setContext',
                'vibeEditor.loginStatus',
                true,
              )

              res.end('로그인 성공! 창을 닫아주세요.')
              server.close()
              vscode.window.showInformationMessage(`${domain} 로그인 성공`)
            } else {
              res.statusCode = 400
              res.end('Token이 없습니다.')
            }
          } else {
            res.statusCode = 404
            res.end('잘못된 경로입니다.')
          }
        },
      )
      server.listen(PORT)

      await vscode.env.openExternal(
        vscode.Uri.parse(
          `http://localhost:8080/oauth2/authorization/${domain}?redirect_uri=http://localhost:${PORT}/callback`,
        ),
      )
    } catch (error) {
      vscode.window.showErrorMessage(`${domain} 로그인 실패`)
      console.error(error)
    }
  }
}
