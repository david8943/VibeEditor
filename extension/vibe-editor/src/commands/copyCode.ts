import { ClipboardService } from '../services/clipboardService'
import { ICommand, IVSCodeAPI } from '../types'

export class CopyCodeCommand implements ICommand {
  public static readonly commandName = 'vibe-editor.copyCode'
  private readonly clipboardService: ClipboardService

  constructor(private readonly vscodeApi: IVSCodeAPI) {
    this.clipboardService = new ClipboardService(vscodeApi)
  }

  public get commandName(): string {
    return CopyCodeCommand.commandName
  }

  public async execute(): Promise<void> {
    const editor = this.vscodeApi.getActiveTextEditor()
    if (!editor) {
      return
    }

    const selection = editor.selection
    const text = editor.document.getText(selection)

    if (text.trim()) {
      await this.clipboardService.copyToClipboard(text)
      this.vscodeApi.showInformationMessage(
        '✅ 코드가 클립보드에 복사되었습니다!',
      )
    } else {
      this.vscodeApi.showWarningMessage('⚠️ 복사할 코드가 없습니다.')
    }
  }
}
