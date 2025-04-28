import { GithubLoginCommand, GoogleLoginCommand, LogoutCommand } from './auth'
import {
  CaptureSnapshotCommand,
  DeleteSnapshotCommand,
} from './captureSnapshot'
import { CopyCodeCommand } from './copyCode'
import { DirectoryTreeCommand } from './directoryTree'
import { SetNotionApiCommand } from './notion'
import { ShowSettingPageCommand } from './setting'
import {
  AddToPromptCommand,
  CreateTemplateCommand,
  ResetTemplateCommand,
  ShowTemplatePageCommand,
} from './template'

export const allCommands = [
  GoogleLoginCommand,
  GithubLoginCommand,
  LogoutCommand,
  CaptureSnapshotCommand,
  CopyCodeCommand,
  DirectoryTreeCommand,
  SetNotionApiCommand,
  CreateTemplateCommand,
  ResetTemplateCommand,
  ShowTemplatePageCommand,
  ShowSettingPageCommand,
  AddToPromptCommand,
  DeleteSnapshotCommand,
]
