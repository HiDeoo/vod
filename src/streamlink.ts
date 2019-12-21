import childProcess, { spawn } from 'child_process'
import { quote } from 'shell-quote'
import util from 'util'

/**
 * Promisified version of `child_process.exec()`
 */
const exec = util.promisify(childProcess.exec)

/**
 * Ensures (poorly) that streamlink is installed and in the PATH.
 */
export async function ensureStreamlinkExists() {
  const { stdout } = await exec('which streamlink')

  if (!stdout.startsWith('/')) {
    throw new Error('Streamlink not found.')
  }
}

/**
 * Downloads a Twitch VOD using streamlink.
 * @param  url - The VOD URL.
 * @param  fileName - The file name to use when saving.
 * @return A promise resovled or rejected when the download is done.
 */
export async function download(url: string, fileName: string) {
  return new Promise((resolve, reject) => {
    const sanitizedFileName = quote([fileName])
      .replace(/\//g, '-')
      .slice(1, -1)

    const command = spawn('streamlink', ['-o', sanitizedFileName, url])

    command.on('error', (error: Error) => {
      reject(error)
    })

    command.on('close', (code: number) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error('Something went wrong while downloading a VOD.'))
      }
    })
  })
}
