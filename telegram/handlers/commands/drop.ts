import { GrammyContext } from "$grammy/context.ts";
import { Composer } from "grammy";

const composer = new Composer<GrammyContext>();

composer.command(["cancel", "drop"], async (ctx) => {
  let message = "No active operation to cancel.";
  const activeConvo = await ctx.conversation.active();
  console.log({ activeConvo });

  if (Object.keys(activeConvo).length > 0) {
    await ctx.conversation.exit();
    message = "The current operation has been cancelled.";
  }

  message += "\n\nManage projects: /myprojects";

  await ctx.reply(message);
});

export default composer;