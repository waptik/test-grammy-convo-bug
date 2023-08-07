#!/usr/bin/env -S deno run -A --allow-write --watch=routes/,main.ts

import "$std/dotenv/load.ts";
import { green } from "$std/fmt/colors.ts";

import { grammy } from "$grammy/mod.ts";
import { TG_ALLOWED_UPDATES } from "./constants.ts";

grammy.start({
  drop_pending_updates: false,
  allowed_updates: TG_ALLOWED_UPDATES,
  onStart: ({ username }) =>
    console.log(`[bot] ${green(username)} is up and running`),
});

Deno.addSignalListener("SIGINT", () => grammy.stop());
Deno.addSignalListener("SIGTERM", () => grammy.stop());
