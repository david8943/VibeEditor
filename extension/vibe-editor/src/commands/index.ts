import {
  GithubLoginCommand,
  GoogleLoginCommand,
  LogoutCommand,
  SSAFYLoginCommand,
  SelectLoginMethodCommand,
} from './auth'
import {
  CaptureSnapshotCommand,
  DeleteSnapshotCommand,
  InsertSnapshotToChatCommand,
  RenameSnapshotCommand,
  ViewCodeSnapshotCommand,
} from './captureSnapshot'
import { CopyCodeCommand } from './copyCode'
import { DirectoryTreeCommand } from './directoryTree'
import { FileSnapshotCommand } from './fileSnapshot'
import { SetNotionApiCommand } from './notion'
import {
  CreatePostCommand,
  DeletePostCommand,
  OpenNotionLinkCommand,
  ResetPostCommand,
  ShowDefaultPostPageCommand,
  ShowPostPageCommand,
} from './post'
import {
  InitFetchDataCommand,
  ShowReadmeCommand,
  ShowSettingPageCommand,
} from './setting'
import {
  AddToPromptCommand,
  CreateTemplateCommand,
  DeleteTemplateCommand,
  GenaratePostCommand,
  GetTemplatesCommand,
  RenameTemplateCommand,
  ResetTemplateCommand,
  ShowDefaultTemplatePageCommand,
  ShowPromptCommand,
  ShowTemplatePageCommand,
} from './template'
import {
  CloseStartGuideCommand,
  OpenStartGuideCommand,
  ResetStartGuide,
  ShowSideViewCommand,
} from './view'

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
  FileSnapshotCommand,
  ViewCodeSnapshotCommand,
  GetTemplatesCommand,
  ShowPostPageCommand,
  RenameSnapshotCommand,
  OpenNotionLinkCommand,
  DeletePostCommand,
  ShowSideViewCommand,
  ShowPromptCommand,
  ShowDefaultTemplatePageCommand,
  ShowDefaultPostPageCommand,
  ResetPostCommand,
  ShowReadmeCommand,
  GenaratePostCommand,
  CreatePostCommand,
  InitFetchDataCommand,
  SelectLoginMethodCommand,
  CloseStartGuideCommand,
  OpenStartGuideCommand,
  ResetStartGuide,
  InsertSnapshotToChatCommand,
]
