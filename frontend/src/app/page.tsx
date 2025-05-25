import fs from 'fs/promises'
import path from 'path'
import { marked } from 'marked'

import { StartPage } from '@/features/onboarding/StartPage'

export default async function Page() {
  const readmePath = path.join(process.cwd(), 'public/docs/README.md')
  const content = await fs.readFile(readmePath, 'utf-8')

  const html = await marked(content) // ✅ await 추가해 타입 명확히
  return <StartPage readmeContent={html} />
}
