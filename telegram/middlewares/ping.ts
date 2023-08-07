import { Context, MiddlewareFn } from "grammy";
import { User } from "../deps.ts";

function getFullName(from: Pick<User, "first_name" | "last_name">) {
  return from.last_name
    ? `${from.first_name} ${from.last_name}`
    : from.first_name;
}

const ping: MiddlewareFn<Context> = async (ctx, next) => {
  const start = new Date().getTime();
  let message = "";

  try {
    if (ctx?.message) {
      if (ctx.message.migrate_to_chat_id) {
        message = `Recieved chat migration update
old chat id: ${ctx.chat?.id}
new chat id: ${ctx.message.migrate_to_chat_id}`;
      } else {
        message = `Received message [ID:${ctx.message.message_id}]`;
      }
    } else if (ctx?.callbackQuery?.message) {
      message = `Received callback query [ID:${ctx.callbackQuery.id}]
for message [ID:${ctx.callbackQuery.message.message_id}] with data: ${ctx.callbackQuery.data})`;
    } else if (ctx?.inlineQuery) {
      message = `Received inline query [ID:${ctx.inlineQuery.id}]`;
    } else if (ctx?.chosenInlineResult) {
      message = `Received chosen inline result [Inline msg ID:${ctx.chosenInlineResult.inline_message_id}] result [ID:${ctx.chosenInlineResult.result_id}]`;
    }

    await next();
    const ms = new Date().getTime() - start;
    console.log(
      `${new Date().toTimeString()} >> Update ID: ${ctx.update.update_id} ${
        ctx.chat?.type !== "private"
          ? `|| Chat: ${ctx.chat?.title}(${ctx.chat?.id})`
          : ""
      } || Message: ${message} || Response time: ${ms} ms || User: ${getFullName(
        ctx.from!
      )} (${ctx.from?.id})`
    );
  } catch (err) {
    console.error(err);
  }
};

export default ping;
