import { GrammyContext } from "$grammy/context.ts";
import { Composer } from "$grammy/deps.ts";

const composer = new Composer<GrammyContext>();

composer.command("myprojects", async (ctx) => {
  try {
    await ctx.replyWithChatAction("typing");

    console.log("session", ctx.session);

    await ctx.reply("This is just a placeholder for now!");
  } catch (e) {
    const error = e as Error;
    const message = `⛔ An error occurred⛔ : \n<b>${error.name}</b> - <b>${error.message}</b>.\n\nPlease try again later.`;
    await ctx.reply(message);
  }
});

composer.command("newproject", async (ctx) => {
  await ctx.replyWithChatAction("typing");

  await ctx.conversation.enter("createProject");
});

export default composer;
