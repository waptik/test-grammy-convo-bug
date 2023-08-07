import { GrammyContext } from "$grammy/context.ts";
import { Bot, conversations, GrammyError, HttpError } from "$grammy/deps.ts";
import { hydrateReply, parseMode } from "grammy_parse_mode";
import { limit as rateLimit } from "https://deno.land/x/grammy_ratelimiter@v1.1.6/mod.ts";

import commands from "$grammy/handlers/commands/mod.ts";
import conversationComposer from "$grammy/handlers/conversations/mod.ts";
import drop from "$grammy/handlers/commands/drop.ts";
import ping from "$grammy/middlewares/ping.ts";
import session from "$grammy/middlewares/session.ts";
import { listOfCommands } from "../utils.ts";
import { KEYS_TOKENS } from "../constants.ts";

export const grammy = new Bot<GrammyContext>(KEYS_TOKENS.telegram);

// Plugins
grammy.api.config.use(parseMode("HTML"));

grammy
  .filter((ctx) => {
    if (ctx.msg && "media_ group_id" in ctx.msg) {
      return false;
    }
    return true;
  })
  .use(rateLimit());
grammy.use(hydrateReply<GrammyContext>);

grammy.use(session);
grammy.use(ping);
grammy.use(conversations());
grammy.use(drop);

grammy.use(conversationComposer);
grammy.use(commands);

grammy.api
  .setMyCommands(
    listOfCommands.filter((c) => c.show),
    {
      scope: {
        type: "default",
      },
    }
  )
  .then(() => {
    console.log("default commands have been uploaded to BotFather");
  })
  .catch((e) =>
    console.error("Failed to upload default commands to BotFather", e)
  );
  
grammy.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});
