import _fetch, { Headers } from 'node-fetch'
import { URL } from 'url'

/**
 * Session app acess token.
 */
let accessToken: string

/**
 * Fetches informations about a specific user.
 * @param  name - The user name.
 * @return The user details.
 */
export async function getUser(name: string): Promise<TwitchUser> {
  const users = await fetch('users', { login: name })

  return users[0]
}

/**
 * Fetches Twitch VODs for a specific user.
 * @param  userId - The user ID.
 * @return The list of VODs.
 */
export function getVods(userId: string): Promise<TwitchVod[]> {
  return fetch('videos', { user_id: userId, type: 'archive', first: '100' })
}

/**
 * Fetches an app access token.
 */
async function getAccessToken() {
  const url = new URL('https://id.twitch.tv/oauth2/token')

  url.searchParams.set('client_id', process.env.TWITCH_CLIENT_ID)
  url.searchParams.set('client_secret', process.env.TWITCH_CLIENT_SECRET)
  url.searchParams.set('grant_type', 'client_credentials')

  const response = await _fetch(url, { method: 'POST' })

  if (!response.ok) {
    throw new Error(`Error while authenticating with Twitch: ${response.statusText}.`)
  }

  const json = await response.json()

  accessToken = json.access_token
}

/**
 * Fetches data using the Twitch API.
 * @param  path - The API path.
 * @return The fetched data.
 */
async function fetch(path: ApiPath, searchParams?: SearchParams) {
  if (!accessToken) {
    await getAccessToken()
  }

  const url = new URL(getUrl(path, searchParams))
  const headers = new Headers({ 'Client-ID': process.env.TWITCH_CLIENT_ID, Authorization: `Bearer ${accessToken}` })
  const response = await _fetch(url, { headers })

  if (!response.ok) {
    throw new Error(`Error while communicating with Twitch: ${response.statusText}.`)
  }

  const json = await response.json()

  return json.data
}

/**
 * Returns the Twitch Helix API endpoint URM.
 * @param  path - The API path.
 * @return The API endpoint URL.
 */
function getUrl(path: ApiPath, searchParams: SearchParams = {}) {
  const url = new URL(`https://api.twitch.tv/helix/${path}`)

  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value)
  }

  return url.toString()
}

/**
 * Twitch API endpoint path.
 */
type ApiPath = string

/**
 * API search parameters.
 */
type SearchParams = Record<string, string>

/**
 * A Twitch user returned by the API.
 */
type TwitchUser = {
  id: string
  login: string
  display_name: string
  type: string
  broadcaster_type: string
  description: string
  profile_image_url: string
  offline_image_url: string
  view_count: number
}

/**
 * A Twitch VOD returned by the API.
 */
export type TwitchVod = {
  id: string
  user_id: string
  user_name: string
  title: string
  description: string
  created_at: string
  published_at: string
  url: string
  thumbnail_url: string
  viewable: string
  view_count: number
  language: string
  type: string
  duration: string
}
