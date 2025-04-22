import { IVSCodeAPI } from '../types'

export class ClipboardService {
  constructor(private readonly vscodeApi: IVSCodeAPI) {}

  public async copyToClipboard(text: string): Promise<void> {
    await this.vscodeApi.env.clipboard.writeText(text)
  }
}
