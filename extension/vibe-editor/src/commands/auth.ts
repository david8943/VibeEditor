import * as vscode from 'vscode'

import { AuthService } from '../services/authService'
import { ICommand } from '../types/command'

export class GoogleLoginCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.googleLogin'
  private authService: AuthService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.authService = new AuthService(context)
  }

  public get commandName(): string {
    return GoogleLoginCommand.commandName
  }

  public async execute(): Promise<void> {
    await this.authService.googleLogin()
  }
}

export class GithubLoginCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.githubLogin'
  private authService: AuthService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.authService = new AuthService(context)
  }

  public get commandName(): string {
    return GithubLoginCommand.commandName
  }

  public async execute(): Promise<void> {
    await this.authService.githubLogin()
  }
}

export class LogoutCommand implements ICommand {
  public static readonly commandName = 'vibeEditor.logout'
  private authService: AuthService

  constructor(private readonly context: vscode.ExtensionContext) {
    this.authService = new AuthService(context)
  }

  public get commandName(): string {
    return LogoutCommand.commandName
  }

  public async execute(): Promise<void> {
    await this.authService.logout()
  }
}
