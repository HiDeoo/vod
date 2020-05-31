import { homedir } from 'os'
import { cosmiconfigSync } from 'cosmiconfig'
import { CosmiconfigResult } from 'cosmiconfig/dist/types'

/**
 * Configuration keys.
 */
export enum ConfigurationKey {
  TwitchClientId = 'twitch_client_id',
  TwitchClientSecret = 'twitch_client_secret',
  DownloadPath = 'download_path',
}

/**
 * Application configuration.
 */
class Configuration {
  /**
   * The cosmiconfig result object.
   */
  private result?: CosmiconfigResult

  /**
   * Loads the configuration.
   */
  public load() {
    try {
      const explorerSync = cosmiconfigSync('vod')
      this.result = explorerSync.load(this.getPath())
    } catch (error) {
      throw new Error(`Could not load configuration file at ${this.getPath()}.`)
    }
  }

  /**
   * Validates that all configuration keys are specified.
   */
  public validate() {
    if (!this.result || this.result.isEmpty) {
      throw new Error(`Empty configuration found at ${this.getPath()}.`)
    }

    if (!this.result.config[ConfigurationKey.TwitchClientId]) {
      throw new Error(`Twitch Client ID not configured (${ConfigurationKey.TwitchClientId}).`)
    }

    if (!this.result.config[ConfigurationKey.TwitchClientSecret]) {
      throw new Error(`Twitch Client Secret not configured (${ConfigurationKey.TwitchClientSecret}).`)
    }

    if (!this.result.config[ConfigurationKey.DownloadPath]) {
      throw new Error(`Download Path not configured (${ConfigurationKey.DownloadPath}).`)
    }
  }

  /**
   * Returns a specific configuration value.
   * @param  key - The configuration key.
   * @return The configuration value.
   */
  public get(key: ConfigurationKey): string {
    return this.result?.config[key]
  }

  /**
   * Returns the configuration path.
   * @return The path to the configuration.
   */
  private getPath() {
    return `${homedir}/.vodrc`
  }
}

export default new Configuration()
