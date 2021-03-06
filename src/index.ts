#!/usr/bin/env node

import assert from 'assert'
import fs from 'fs-extra'
import inquirer from 'inquirer'

import Configuration, { ConfigurationKey } from './Configuration'
import Metadata from './Metadata'
import Progress from './Progress'
import Streamlink from './Streamlink'
import { getUser, getVods, TwitchVod } from './twitch'

/**
 * Initializes the application.
 */
async function initialize() {
  Progress.update('Starting application')

  // Loads the configuration and ensure all variables are properly set.
  Configuration.load()
  Configuration.validate()

  // Enforce usage.
  assert(process.argv.length === 3, 'Usage: vod <channel>')

  // Ensure the download path exists.
  const downloadPath = Configuration.get(ConfigurationKey.DownloadPath)
  const downloadPathExists = await fs.pathExists(downloadPath)
  assert(downloadPathExists, `The download directly does not exist at ${downloadPath}.`)

  // Initializes metadata.
  await Metadata.initialize()

  await Streamlink.ensureStreamlinkExists()

  Progress.succeed()
}

/**
 * Fetches a Twitch user ID.
 * @param  channel - The channel name.
 * @return The Twitch user ID matching the channel.
 */
async function getTwitchUserId(channel: string) {
  Progress.update('Fetching channel informations')

  const user = await getUser(channel)
  assert(user, 'Invalid channel name.')

  Progress.succeed()

  return user.id
}

/**
 * Fetches Twitch VODs.
 * @param  userId - The Twitch user ID.
 * @return The list of VODs.
 */
async function getTwitchVods(userId: string) {
  Progress.update('Fetching VODs list')

  const vods = await getVods(userId)
  assert(vods.length > 0, 'No VODs available for this channel.')

  Progress.succeed()

  return vods
}

/**
 * Downloads a Twitch VOD.
 * @param vod - The VOD to download.
 */
async function downloadVod(vod: TwitchVod) {
  const date = new Date(vod.created_at).toLocaleDateString()

  Progress.update(`Downloading VOD: ${vod.title} - ${date}`)

  await Streamlink.downloadVod(
    `https://www.twitch.tv/videos/${vod.id}`,
    Configuration.get(ConfigurationKey.DownloadPath),
    `${vod.id} - ${vod.user_name} - ${date}.mp4`
  )

  await Metadata.markVodAsDownloaded(vod.id)

  Progress.succeed()
}

/**
 * Runs the application.
 */
async function main() {
  try {
    await initialize()

    // Grab the channel name argument.
    const argv = process.argv.slice(2)
    const channel = argv[0]

    // Fetch the Twitch user ID.
    const userId = await getTwitchUserId(channel)

    // Fetch Twitch VODs.
    const vods = await getTwitchVods(userId)

    const vodsByIds: Record<string, TwitchVod> = {}
    const choices = []

    // Parse VODs.
    for (const vod of vods) {
      vodsByIds[vod.id] = vod

      const disabled = Metadata.hasDownloadedVod(vod.id) ? 'Downloaded' : false

      choices.push({
        disabled,
        name: `${vod.title} - ${new Date(vod.created_at).toLocaleDateString()} - ${vod.duration}`,
        value: vod.id,
      })
    }

    // Ask for the VODs to download.
    const answers = await inquirer.prompt<{ vods: string[] }>({
      type: 'checkbox',
      name: 'vods',
      message: 'Select VODs to download',
      pageSize: 100,
      choices,
    })

    // Bail out if no VODs are selected.
    if (answers.vods.length === 0) {
      console.log('\nNo VODs selected.')

      process.exit(0)
    }

    // Download all the VODs.
    for (const vodId of answers.vods) {
      const vod = vodsByIds[vodId]

      await downloadVod(vod)
    }

    process.exit()
  } catch (error) {
    Progress.fail(error)
  }
}

/**
 * Exit handler.
 */
process.on('SIGINT', function() {
  Streamlink.cancelPendingDownload()

  process.exit()
})

main()
