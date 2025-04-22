import { Configuration } from '../configuration'
import { ICommand, IVSCodeAPI } from '../types'

export class GoogleLoginCommand implements ICommand {
  public static readonly commandName = 'vibe-editor.googleLogin'

  constructor(private readonly vscodeApi: IVSCodeAPI) {}

  public get commandName(): string {
    return GoogleLoginCommand.commandName
  }

  public async execute(): Promise<void> {
    try {
      // TODO: 실제 Google 로그인 로직 구현
      await Configuration.set('loginStatus', true)
      this.vscodeApi.showInformationMessage('Google 로그인 성공')
    } catch (error) {
      this.vscodeApi.showErrorMessage('Google 로그인 실패')
    }
  }
}

export class GithubLoginCommand implements ICommand {
  public static readonly commandName = 'vibe-editor.githubLogin'

  constructor(private readonly vscodeApi: IVSCodeAPI) {}

  public get commandName(): string {
    return GithubLoginCommand.commandName
  }

  public async execute(): Promise<void> {
    try {
      // TODO: 실제 GitHub 로그인 로직 구현
      await Configuration.set('loginStatus', true)
      this.vscodeApi.showInformationMessage('GitHub 로그인 성공')
    } catch (error) {
      this.vscodeApi.showErrorMessage('GitHub 로그인 실패')
    }
  }
}
