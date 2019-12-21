import assert from 'assert'
import dotenv from 'dotenv-flow'
import inquirer from 'inquirer'

import { getUser, getVods, TwitchVod } from './twitch'
import Progress from './Progress'

/**
 * Load environment variables.
 */
dotenv.config()

/**
 * Initializes the application.
 */
function initialize() {
  // Ensure environment variables are properly set.
  assert(process.env.TWITCH_CLIENT_ID, 'Twitch Client ID not defined.')

  // Enforce usage.
  assert(process.argv.length === 3, 'Usage: vod <channel>')
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
 * Runs the application.
 */
async function main() {
  try {
    initialize()

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
      // TODO Improve title with date & stuff
      choices.push({ name: vod.title, value: vod.id })
    }

    // Ask for the VODs to download.
    const answers = await inquirer.prompt<{ vod: string[] }>({
      type: 'checkbox',
      name: 'vod',
      message: 'Select VODs to download',
      pageSize: 100,
      choices,
    })

    console.log('answers ', answers)

    process.exit(0)
  } catch (error) {
    Progress.fail(error)
  }
}

main()
