import { Composer } from "grammy";

const composer = new Composer();

composer.command("start", async (ctx) => {
  await ctx.replyWithChatAction("typing");

  await ctx.reply("Hi there! 👋");
});


export default composer;