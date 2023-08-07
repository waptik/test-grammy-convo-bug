import { Composer } from "grammy";

import { GrammyContext } from "$grammy/context.ts";

import help from "$grammy/handlers/commands/help.ts";
import projects from "$grammy/handlers/commands/projects.ts";
import start from "$grammy/handlers/commands/start.ts";

const composer = new Composer<GrammyContext>();

composer.use(
  start,
  help,
  projects
);

export default composer;
