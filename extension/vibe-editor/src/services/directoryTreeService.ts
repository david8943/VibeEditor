import * as fs from 'fs'
import * as path from 'path'

import { IVSCodeAPI } from '../types'

export class DirectoryTreeService {
  constructor(private readonly vscodeApi: IVSCodeAPI) {}

  public generateTree(dirPath: string, prefix = ''): string {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true })
      let result = ''

      for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name)
        result += `${prefix}${entry.name}\n`

        if (entry.isDirectory()) {
          result += this.generateTree(entryPath, prefix + '  ')
        }
      }

      return result
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.'
      this.vscodeApi.showErrorMessage(
        `디렉토리 트리 생성 중 오류 발생: ${errorMessage}`,
      )
      return ''
    }
  }
}
