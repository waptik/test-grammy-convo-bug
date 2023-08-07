import { PollingOptions } from "grammy";
import { getEnvOrThrow } from "./utils.ts";

const tryCloudflare = "";

export const IS_PRODUCTION =
  Deno.env.get("IS_PRODUCTION") === "true" ||
  typeof Deno.env.get("DENO_DEPLOYMENT_ID") !== "undefined"
    ? true
    : false;

export const IS_DEVELOPMENT = !IS_PRODUCTION;
export const WEBAPP_URL =
  tryCloudflare.length > 0
    ? `https://${tryCloudflare}.trycloudflare.com`
    : Deno.env.get("WEBAPP_URL") || "https://sneakycall.notionbird.com";

const BOT_NAME = "PeerCircle";
const BOT_USERNAME = IS_DEVELOPMENT ? "PeerCirclezBot" : "PeerCircleBot";
export const BOT_URL = Deno.env.get("BOT_URL");
export const TELEGRAM_BOT_TOKEN = getEnvOrThrow("TELEGRAM_BOT_TOKEN");

export const BOT_INFO = {
  name: BOT_NAME,
  username: BOT_USERNAME,
  link: `<a href="https://t.me/${BOT_USERNAME}">@${BOT_USERNAME}</a>`,
 
};

export const TG_ALLOWED_UPDATES: PollingOptions["allowed_updates"] = [
  "message",
  "edited_message",
  // "channel_post",
  // "edited_channel_post",
  "inline_query",
  "chosen_inline_result",
  "callback_query",
  // "poll",
  // "poll_answer",
  "my_chat_member",
  "chat_member",
  // "chat_join_request",
];

export const KEYS_TOKENS = {
  telegram: TELEGRAM_BOT_TOKEN,
};
