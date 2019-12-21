import assert from 'assert'
import dotenv from 'dotenv-flow'
import inquirer from 'inquirer'

import { download, ensureStreamlinkExists } from './streamlink'
import { getUser, getVods, TwitchVod } from './twitch'
import Progress from './Progress'

/**
 * Load environment variables.
 */
dotenv.config()

/**
 * Initializes the application.
 */
async function initialize() {
  Progress.update('Starting application')

  // Ensure environment variables are properly set.
  assert(process.env.TWITCH_CLIENT_ID, 'Twitch Client ID not defined.')

  // Enforce usage.
  assert(process.argv.length === 3, 'Usage: vod <channel>')

  await ensureStreamlinkExists()

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

  await download(`https://www.twitch.tv/videos/${vod.id}`, `${vod.id} - ${vod.user_name} - ${date}.mp4`)

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
      choices.push({ name: `${vod.title} - ${new Date(vod.created_at).toLocaleDateString()}`, value: vod.id })
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

    process.exit(0)
  } catch (error) {
    Progress.fail(error)
  }
}

main()
