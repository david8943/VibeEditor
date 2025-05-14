import {
  GithubLoginCommand,
  GoogleLoginCommand,
  LogoutCommand,
  SSAFYLoginCommand,
} from './auth'
import {
  CaptureSnapshotCommand,
  DeleteSnapshotCommand,
  RefreshSnapshotCommand,
  RenameSnapshotCommand,
  ViewCodeSnapshotCommand,
} from './captureSnapshot'
import { CopyCodeCommand } from './copyCode'
import { DirectoryTreeCommand } from './directoryTree'
import { FileSnapshotCommand } from './fileSnapshot'
import { SetNotionApiCommand } from './notion'
import { DeletePostCommand, ShowPostPageCommand } from './post'
import { ShowSettingPageCommand } from './setting'
import {
  AddToPromptCommand,
  CreateTemplateCommand,
  DeleteTemplateCommand,
  GetTemplatesCommand,
  RenameTemplateCommand,
  ResetTemplateCommand,
  ShowTemplatePageCommand,
} from './template'

export const allCommands = [
  GoogleLoginCommand,
  GithubLoginCommand,
  SSAFYLoginCommand,
  LogoutCommand,
  CaptureSnapshotCommand,
  CopyCodeCommand,
  DirectoryTreeCommand,
  SetNotionApiCommand,
  CreateTemplateCommand,
  DeleteTemplateCommand,
  RenameTemplateCommand,
  ResetTemplateCommand,
  ShowTemplatePageCommand,
  ShowSettingPageCommand,
  AddToPromptCommand,
  DeleteSnapshotCommand,
  RefreshSnapshotCommand,
  FileSnapshotCommand,
  ViewCodeSnapshotCommand,
  GetTemplatesCommand,
  ShowPostPageCommand,
  RenameSnapshotCommand,
  DeletePostCommand,
]
