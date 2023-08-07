import { Composer } from "$grammy/deps.ts";
import { listOfCommands } from "../../../utils.ts";

const composer = new Composer();

composer.command("help", async (ctx) => {
  const helpMsg = [
    `<b>Available Commands : </b>`,
    ...listOfCommands
      .filter(
        (c) =>
          // ctx.chat.id === botInfo.notifications.id ? true :
          c.show
      )
      .map(({ command, description }) => `/${command} — ${description}`),
  ].join("\n");

  return await ctx.reply(helpMsg, {
    reply_markup: { remove_keyboard: true },
  });
});

export default composer;