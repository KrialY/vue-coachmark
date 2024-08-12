import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { test as baseTest } from '@playwright/experimental-ct-vue'

const istanbulCLIOutput = path.join(process.cwd(), '.nyc_output')

export function generateUUID(): string {
  return crypto.randomBytes(16).toString('hex')
}

async function deleteDir(dirPath) {
  try {
    await fs.promises.access(dirPath)

    const files = await fs.promises.readdir(dirPath)
    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(dirPath, file)
        const stat = await fs.promises.stat(filePath)
        if (stat.isDirectory()) {
          await deleteDir(filePath)
        } else {
          await fs.promises.unlink(filePath)
        }
      })
    )
    await fs.promises.rmdir(dirPath)
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(
        `Directory ${dirPath} does not exist, no need to delete before coverage output generate.`
      )
    } else {
      console.error(`Error deleting directory ${dirPath}:`, err)
    }
  }
}

export const test = baseTest.extend({
  context: async ({ context }, use) => {
    await context.addInitScript(() =>
      window.addEventListener('beforeunload', () =>
        (window as any).collectIstanbulCoverage(JSON.stringify((window as any).__coverage__))
      )
    )
    await deleteDir(istanbulCLIOutput)
    await fs.promises.mkdir(istanbulCLIOutput, { recursive: true })
    await context.exposeFunction('collectIstanbulCoverage', (coverageJSON: string) => {
      if (coverageJSON)
        fs.writeFileSync(
          path.join(istanbulCLIOutput, `playwright_coverage_${generateUUID()}.json`),
          coverageJSON
        )
    })
    await use(context)
    for (const page of context.pages()) {
      await page.evaluate(() =>
        (window as any).collectIstanbulCoverage(JSON.stringify((window as any).__coverage__))
      )
    }
  }
})

export { expect } from '@playwright/experimental-ct-vue'
