import fs from 'fs-extra'
import path from 'path'

/**
 * Metadata abstraction.
 */
class Metadata {
  private metadata: Record<string, boolean> = {}

  /**
   * Loads existing metadata or create a new file if necessary.
   */
  async initialize() {
    const pathExists = await fs.pathExists(this.getMetadataPath())

    if (!pathExists) {
      await this.save()
    } else {
      await this.load()
    }
  }

  /**
   * Checks if a VOD has already been downloaded.
   * @param  id - The VOD ID.
   * @return `true` when downloaded.
   */
  hasDownloadedVod(id: string) {
    return this.metadata[id] === true
  }

  /**
   * Marks a specific VOD as downloaded.
   * @param  id - The VOD ID.
   * @return A promise resolved when downloaded.
   */
  markVodAsDownloaded(id: string) {
    this.metadata[id] = true

    return this.save()
  }

  /**
   * Loads the metadata from disk.
   */
  private async load() {
    this.metadata = await fs.readJson(this.getMetadataPath())
  }

  /**
   * Saves the current metadata on disk.
   */
  private save() {
    return fs.writeJSON(this.getMetadataPath(), this.metadata)
  }

  /**
   * Returns the metadata file path.
   * @return The path.
   */
  private getMetadataPath() {
    return path.join(process.env.DOWNLOAD_PATH, `.metadata`)
  }
}

export default new Metadata()
