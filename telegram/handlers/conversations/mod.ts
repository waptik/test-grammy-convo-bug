import { GrammyContext } from "$grammy/context.ts";
import { Composer } from "$grammy/deps.ts";
import projectsConversation from "$grammy/handlers/conversations/projects.conversation.ts";

const composer = new Composer<GrammyContext>();

composer.use(projectsConversation);

export default composer;
