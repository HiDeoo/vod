import dotenv from 'dotenv-flow'

/**
 * Load environment variables.
 */
dotenv.config()

function main() {
  console.log('process.env.TWITCH_CLIENT_ID ', process.env.TWITCH_CLIENT_ID)
  console.log('process.env.SAVE_PATH ', process.env.SAVE_PATH)
}

main()
