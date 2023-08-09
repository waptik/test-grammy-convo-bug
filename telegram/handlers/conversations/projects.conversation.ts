import { GrammyContext, GrammyConversation } from "$grammy/context.ts";
import { Composer, InlineKeyboard, createConversation } from "$grammy/deps.ts";
import { bold, fmt, hydrateReply, italic } from "grammy_parse_mode";

export class ProjectConversation {
  name?: string;
  description?: string;
  tos?: string;
  policy?: string;

  project?: Awaited<ReturnType<typeof createProject>>;
  circleType: "channel" | "group" = "channel";

  private doneKb = new InlineKeyboard().text("Done", "done");

  constructor(
    readonly ctx: GrammyContext,
    readonly convo: GrammyConversation
  ) {}

  async runPlugins() {
    const plugins = [hydrateReply];
    await this.convo.run(...plugins);
  }

  async askForName() {
    await this.ctx.reply("Please enter the name of your project:");
    this.name = await this.convo.form.text((c) =>
      c.reply("Please enter a name!")
    );

    // this.project = await this.convo.external(() =>
    //   createProject(this.name!, this.ctx.from!.id)
    // );
    // this.convo.session.project.current += 1;

    return {
      name: this.name as string,
      project: this.project as Awaited<ReturnType<typeof createProject>>,
    };
  }

  private async promptsGuideForGroup() {
    this.circleType = "group";

    await this.ctx.reply(
      `Please create a private Telegram Group add the bot (@${this.ctx.me.username}) to the group and make it an admin with the following permissions:
  - <b>Invite Users via Link</b>
  - <b>Ban Users</b>\n\nClick Done when it's ready:
  `,
      {
        reply_markup: new InlineKeyboard().text("Done", "done2"),
      }
    );

    await this.convo.waitForCallbackQuery(["done2"], (c) =>
      c.reply(
        "Please click Done after you're done adding the bot to the new group with the correct permissions!",
        {
          reply_markup: new InlineKeyboard().text("Done", "done2"),
        }
      )
    );

    await this.ctx.replyWithChatAction("typing");

    await this.ctx.reply(
      `Please look for your own account in group admins section of your group info menu and make sure that <b>Remain Anonymous</b> is turned <b>ON</b>.\n\nNo such option? Please turn <b>Chat History For New Members to Visible</b> first.\n\nClick Done when it's ready:`,
      {
        reply_markup: new InlineKeyboard().text("Done", "done3"),
      }
    );

    await this.convo.waitForCallbackQuery(["done3"], (c) =>
      c.reply(
        "Please click Done after you're done making sure that <b>Remain Anonymous</b> is turned <b>ON</b>!",
        {
          reply_markup: new InlineKeyboard().text("Done", "done3"),
        }
      )
    );
  }

  private async promptsGuideForChannel() {
    this.circleType = "channel";

    // prompts start
    await this.ctx.reply(
      `Please create a private Telegram Channel add the bot (@${this.ctx.me.username}) to the channel and make it an admin with the following permissions:
      - <b>Add Subscribers</b>
      `,
      {
        reply_markup: new InlineKeyboard().text("Done", "done"),
      }
    );

    await this.convo.waitForCallbackQuery(["done"], {
      otherwise: (c) =>
        c.reply(
          "Please click Done after you're done adding the bot to the newly created channel with the correct permissions!",
          {
            reply_markup: new InlineKeyboard().text("Done", "done"),
          }
        ),
    });

    // prompts end
  }

  async askForCircleType() {
    const circleTypeKb = new InlineKeyboard()
      .text("🔐 Private Telegram Group", "group")
      .row()
      .text("🔗 Private Telegram Channel", "channel");

    await this.ctx.reply(
      "What type of circle do you want to create for your project?",
      {
        reply_markup: circleTypeKb,
      }
    );

    const type = await this.convo.waitForCallbackQuery(
      ["group", "channel"],
      (c) =>
        c.reply("Please select a circle type!", {
          reply_markup: circleTypeKb,
        })
    );

    await this.ctx.replyWithChatAction("typing");

    if (type.match === "group") {
      await this.promptsGuideForGroup();
    } else {
      await this.promptsGuideForChannel();
    }

    return {
      circleType: this.circleType as "group" | "channel",
    };
  }

  async askForCircleConnection() {
    await this.ctx.reply(
      `To connect your ${this.circleType}, please forward a message from your ${this.circleType} to me!`
    );
    let repeatLoop = true;

    do {
      const fwdCtx = await this.convo.waitUntil((c) => c.has(":text"));
      const chatInfo = fwdCtx.msg?.forward_from_chat;

      repeatLoop = chatInfo ? false : true;

      if (chatInfo && "title" in chatInfo) {
        let chatType: "group" | "channel" | undefined = undefined;

        if (chatInfo.type === "group" || chatInfo.type === "supergroup") {
          chatType = "group";
        } else if (chatInfo.type === "channel") {
          chatType = "channel";
        }

        if (chatType === this.circleType) {
          // check if the user is an admin of the group/channel
          const chatAdmins = await this.ctx.api
            .getChatAdministrators(chatInfo.id)
            .catch(() => []);

          if (chatAdmins.length > 0) {
            const isAdmin = chatAdmins.some(
              (admin) => admin.user.id === this.ctx.from!.id
            );

            if (isAdmin) {
              break;
            }
          }

          await this.ctx.reply(
            `You are not an admin of the ${this.circleType} you forwarded the message from!\n\nPlease try again with a ${this.circleType} you are an admin of or /cancel to cancel.`
          );
        } // if chatType === circleType

        repeatLoop = false;
      } // if repeatLoop

      await this.ctx.reply(
        `This is not a valid forwarded message from a ${this.circleType} you're an admin!\n\nDon't forget to make sure that <b>Remain Anonymous</b> is turned <b>ON</b>!\n\nPlease try again with a valid message from a ${this.circleType} or /cancel to cancel.`
      );
    } while (repeatLoop);
  }

  async askForCurrency() {
    const currenciesKb = new InlineKeyboard();

    const currencies = [
      { code: "USD", name: "US Dollar" },
      { code: "EUR", name: "Euro" },
      { code: "GBP", name: "British Pound" },
      { code: "JPY", name: "Japanese Yen" },
    ];

    currencies.forEach((currency) => {
      currenciesKb
        .text(`${currency.code} (${currency.name})`, currency.code)
        .row();
    });

    await this.ctx.reply(
      "Please select the default currency for your project:",
      {
        reply_markup: currenciesKb,
      }
    );

    const currency = await this.convo.waitForCallbackQuery(
      currencies.map((c) => c.code),
      (c) =>
        c.reply("Please select a currency!", {
          reply_markup: currenciesKb,
        })
    );

    this.convo.log(`Currency selected: ${currency.match}`);

    const foundCurrency = currencies.find((c) => c.code === currency.match);

    return foundCurrency;
  }
}

async function createProject(convo: GrammyConversation, ctx: GrammyContext) {
  const prompt = new ProjectConversation(ctx, convo);

  try {
    await prompt.runPlugins();

    await ctx.replyWithChatAction("typing");

    const { name } = await prompt.askForName();

    await ctx.replyWithChatAction("typing");

    // const { circleType } =
    await prompt.askForCircleType();

    await ctx.replyWithChatAction("typing");
    await prompt.askForCircleConnection();

    await ctx.replyWithChatAction("typing");
    const currencyInfo = await prompt.askForCurrency();

    convo.log({ currencyInfo });

    const message = fmt(
      ["\n\n", "\n\n", "\n\n", "\n\n"],
      fmt`Your new project ${bold(name)} has been created successfully! 🎉`,
      fmt`Your project's default currency is ${bold(`${currencyInfo?.code}`)}`,
      `Go to /myprojects to see your new project being added!`,
    )

    // const message = `${messages.join("\n\n")}`;

    await ctx.replyFmt(
      fmt(
        ["", " and ", " and ", ""],
        fmt`${bold("bold")}`,
        fmt`${bold(italic("bitalic"))}`,
        fmt`${italic("italic")}`
      )
    );

    await ctx.replyFmt(message);
    return;
  } catch (e) {
    const error = e as Error;

    const message = `⛔ An error occurred⛔ : \n<b>${error.name}</b> - <b>${error.message}</b>.\n\nPlease try again later.`;

    await ctx.reply(message);
  }
}

const composer = new Composer<GrammyContext>();

composer.use(createConversation(createProject));

export default composer;
