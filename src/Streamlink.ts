import childProcess, { spawn, ChildProcessWithoutNullStreams } from 'child_process'
import path from 'path'
import { quote } from 'shell-quote'
import util from 'util'

/**
 * Promisified version of `child_process.exec()`
 */
const exec = util.promisify(childProcess.exec)

/**
 * Streamlink interface.
 */
class Streamlink {
  private command: ChildProcessWithoutNullStreams | undefined

  /**
   * Ensures (poorly) that streamlink is installed and in the PATH.
   */
  async ensureStreamlinkExists() {
    const { stdout } = await exec('which streamlink')

    if (!stdout.startsWith('/')) {
      throw new Error('Streamlink not found.')
    }
  }

  /**
   * Downloads a Twitch VOD using streamlink.
   * @param  url - The VOD URL.
   * @param  filePath - The path where to save the VOD.
   * @param  fileName - The file name to use when saving.
   * @return A promise resovled or rejected when the download is done.
   */
  async downloadVod(url: string, filePath: string, fileName: string) {
    return new Promise((resolve, reject) => {
      const sanitizedFileName = quote([fileName])
        .replace(/\//g, '-')
        .slice(1, -1)

      this.command = spawn('streamlink', ['-o', path.join(filePath, sanitizedFileName), url])

      this.command.on('error', (error: Error) => {
        reject(error)
      })

      this.command.on('close', (code: number) => {
        this.command = undefined

        if (code === 0) {
          resolve()
        } else {
          reject(new Error('Something went wrong while downloading a VOD.'))
        }
      })
    })
  }

  /**
   * Cancel any pending download if any.
   */
  cancelPendingDownload() {
    if (this.command) {
      this.command.kill('SIGINT')
    }
  }
}

export default new Streamlink()
