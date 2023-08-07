import { User } from "$grammy/deps.ts";

export function getFullName(from: Pick<User, "first_name" | "last_name">) {
  return from.last_name
    ? `${from.first_name} ${from.last_name}`
    : from.first_name;
}

export function getProfileLink(from: User, html = true) {
  if (from.id < 1) {
    return `<b>${getFullName(from)}</b>`;
  }

  const url = from.username
    ? `https://t.me/${from.username}`
    : `tg://user?id=${from.id}`;

  const both: string[] = [
    `https://t.me/@id${from.id}`,
    url,
    `<a href="${url}">@${from.username ?? `id${from.id}`}</a>`,
  ];

  return html ? `<a href="${url}">${getFullName(from)}</a>` : both.join(", ");
}

export const listOfCommands: Array<{
  command: string;
  description: string;
  show: boolean;
}> = [
  { command: "newproject", description: "Create a new project", show: true },
//   { command: "myprojects", description: "Manage your projects", show: true },
  { command: "help", description: "How to get help", show: true },
  {
    command: "cancel",
    description: "Cancel the current operation",
    show: true,
  },
];

export function getEnvOrThrow(name: string) {
    const value = Deno.env.get(name);
    if (value == null) {
      throw new Error(`Missing env variable: ${name}`);
    }
    return value;
  }
  
  // create a sleep function to delay the sending of messages
  export const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  
  export const isDev =
    typeof Deno.env.get("DENO_DEPLOYMENT_ID") === "undefined" ? true : false;
  