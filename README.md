<p align="center">
  <h1 align="center">vod - Twitch VODs Downloader</h1>
</p>

<p align="center">
  <a href="https://github.com/HiDeoo/vod/actions?query=workflow%3Aintegration"><img alt="Integration Status" src="https://github.com/HiDeoo/vod/workflows/integration/badge.svg"></a>
  <a href="https://github.com/HiDeoo/vod/blob/master/LICENSE"><img alt="License" src="https://badgen.now.sh/badge/license/MIT/blue"></a>
  <br /><br />
</p>

<p align="center">
  <img alt="vod" src="https://imgur.com/r7zMYPD.png">
</p>

# Requirements

- [Streamlink](https://streamlink.github.io/)

# Installation

Install the application:

```sh
$ yarn global add https://github.com/HiDeoo/vod
```

Create a configuration file located at `~/.vodrc` by modifying the following example:

```yaml
twitch_client_id: myTwitchClientId
twitch_client_secret: myTwitchClientSecret
download_path: /path/to/download/folder
```

## Usage

```sh
$ vod <channel>
```

## License

Licensed under the MIT License, Copyright © HiDeoo.

See [LICENSE](https://github.com/HiDeoo/vod/blob/master/LICENSE) for more information.
