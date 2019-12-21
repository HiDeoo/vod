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
 * Runs the program.
 */
async function main() {
  try {
    // Ensure environment variables are properly set.
    assert(process.env.TWITCH_CLIENT_ID, 'Twitch Client ID not defined.')

    // Enforce usage.
    assert(process.argv.length === 3, 'Usage: vod <channel>')

    // Grab the channel name argument.
    const argv = process.argv.slice(2)
    const channel = argv[0]

    // Fetch Twitch user ID.
    Progress.update('Fetching channel informations')
    const user = await getUser(channel)
    assert(user, 'Invalid channel name.')
    Progress.succeed()

    // Fetch Twitch VODs.
    Progress.update('Fetching VODs list')
    const vods = await getVods(user.id)
    assert(vods.length > 0, 'No VODs available for this channel.')
    Progress.succeed()

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
