## A demo telegram bot that uses the [grammY](https://grammy.dev) framework.

This repository contains the source code for the demo bot that illustrate a certain bug in conversations as mentioned in this [gist](https://gist.github.com/waptik/c7ab7294227dc7f3e95a19b50e07f185?permalink_comment_id=4650532#gistcomment-4650532).

## How to run
1. Clone this repository.
2. Make sure you have [Deno](https://www.deno.land/) installed.
3. Cd into the cloned repository.
4. Create a `.env` file and set `TELEGRAM_BOT_TOKEN` to your bot token from [@BotFather](https://t.me/BotFather) then save the file.
5. Run `deno task start`. This will install the dependencies and start the bot.
6. Open your bot and send `/newproject` to it to start a conversation