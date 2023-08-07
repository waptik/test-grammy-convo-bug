import { GrammyContext, GrammySession } from "$grammy/context.ts";
import {
  Composer,
  MemorySessionStorage,
  session as grammySession,
} from "$grammy/deps.ts";

const session = new Composer<GrammyContext>();

const storage = new MemorySessionStorage<GrammySession>();

session.use(
  grammySession({
    initial: (): GrammySession => ({
      __language_code: "en",
    }),
    getSessionKey: (ctx) =>
      `${ctx.chat?.id}${ctx.from ? `:_${ctx.from.id}` : ""}`,
    storage,
  })
);
export default session;
