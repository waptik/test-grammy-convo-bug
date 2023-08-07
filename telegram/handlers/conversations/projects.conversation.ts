import { GrammyContext, GrammyConversation } from "$grammy/context.ts";
import { Composer, InlineKeyboard, createConversation } from "$grammy/deps.ts";

async function createProject(convo: GrammyConversation, ctx: GrammyContext) {
  let circleType: "group" | "channel" = "group";

  try {
    await ctx.reply("Please enter the name of your project:");
    const name = await convo.form.text((c) => c.reply("Please enter a name!"));

    await ctx.replyWithChatAction("typing");

    // type of chat

    const circleTypeKb = new InlineKeyboard()
      .text("🔐 Private Telegram Group", "group")
      .row()
      .text("🔗 Private Telegram Channel", "channel");

    await ctx.reply(
      "What type of circle do you want to create for your project?",
      {
        reply_markup: circleTypeKb,
      }
    );

    const type = await convo.waitForCallbackQuery(["group", "channel"], (c) =>
      c.reply("Please select a circle type!", {
        reply_markup: circleTypeKb,
      })
    );

    await ctx.replyWithChatAction("typing");

    if (type.match === "group") {
      // prompts start
      await ctx.replyWithChatAction("typing");

      await ctx.reply(
        `Please create a private Telegram Group add the bot (@${ctx.me.username}) to the group and make it an admin with the following permissions:
  - <b>Invite Users via Link</b>
  - <b>Ban Users</b>\n\nClick Done when it's ready:
  `,
        {
          reply_markup: new InlineKeyboard().text("Done", "done2"),
        }
      );

      await convo.waitForCallbackQuery(["done2"], (c) =>
        c.reply(
          "Please click Done after you're done adding the bot to the new group with the correct permissions!",
          {
            reply_markup: new InlineKeyboard().text("Done", "done2"),
          }
        )
      );

      await ctx.replyWithChatAction("typing");

      await ctx.reply(
        `Please look for your own account in group admins section of your group info menu and make sure that <b>Remain Anonymous</b> is turned <b>ON</b>.\n\nNo such option? Please turn <b>Chat History For New Members to Visible</b> first.\n\nClick Done when it's ready:`,
        {
          reply_markup: new InlineKeyboard().text("Done", "done3"),
        }
      );

      await convo.waitForCallbackQuery(["done3"], (c) =>
        c.reply(
          "Please click Done after you're done making sure that <b>Remain Anonymous</b> is turned <b>ON</b>!",
          {
            reply_markup: new InlineKeyboard().text("Done", "done3"),
          }
        )
      );
    } else {
      circleType = "channel";

      // prompts start
      await ctx.reply(
        `Please create a private Telegram Channel add the bot (@${ctx.me.username}) to the channel and make it an admin with the following permissions:
        - <b>Add Subscribers</b>
        `,
        {
          reply_markup: new InlineKeyboard().text("Done", "done"),
        }
      );

      await convo.waitForCallbackQuery(["done"], {
        otherwise: (c) =>
          c.reply(
            "Please click Done after you're done adding the bot to the newly created channel with the correct permissions!",
            {
              reply_markup: new InlineKeyboard().text("Done", "done"),
            }
          ),
      });

      // delete the message
    } // <--- end of group/channel creation --->

    // <--- start of group/channel connection --->

    await ctx.replyWithChatAction("typing");
    await ctx.reply(
      `To connect your ${circleType}, please forward a message from your ${circleType} to me!`
    );
    let repeatLoop = true;

    do {
      const fwdCtx = await convo.waitUntil((c) => c.has(":text"));
      const chatInfo = fwdCtx.msg?.forward_from_chat;

      repeatLoop = chatInfo ? false : true;

      if (chatInfo && "title" in chatInfo) {
        let chatType: "group" | "channel" | undefined = undefined;

        if (chatInfo.type === "group" || chatInfo.type === "supergroup") {
          chatType = "group";
        } else if (chatInfo.type === "channel") {
          chatType = "channel";
        }

        if (chatType === circleType) {
          // check if the user is an admin of the group/channel
          const chatAdmins = await convo.external(() =>
            ctx.api.getChatAdministrators(chatInfo.id).catch(() => [])
          );

          if (chatAdmins.length > 0) {
            const isAdmin = chatAdmins.some(
              (admin) => admin.user.id === ctx.from!.id
            );

            if (isAdmin) {
              break;
            }
          }

          await ctx.reply(
            `You are not an admin of the ${circleType} you forwarded the message from!\n\nPlease try again with a ${circleType} you are an admin of or /cancel to cancel.`
          );
        } // if chatType === circleType

        repeatLoop = false;
      } // if repeatLoop

      await ctx.reply(
        `This is not a valid forwarded message from a ${circleType} you're an admin!\n\nDon't forget to make sure that <b>Remain Anonymous</b> is turned <b>ON</b>!\n\nPlease try again with a valid message from a ${circleType} or /cancel to cancel.`
      );
    } while (repeatLoop);

    // <--- end of group/channel connection --->

    // <--- start of project's default currency selection --->
    await ctx.replyWithChatAction("typing");
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

    await ctx.reply("Please select the default currency for your project:", {
      reply_markup: currenciesKb,
    });

    const currency = await convo.waitForCallbackQuery(
      currencies.map((c) => c.code),
      (c) =>
        c.reply("Please select a currency!", {
          reply_markup: currenciesKb,
        })
    );

    convo.log(`Currency selected: ${currency.match}`);
    // <--- end of project's default currency selection --->

    const messages = [
      `Your new project *${name}* has been created successfully\\! 🎉`,
      `Your project's default currency is *${currencies.find(
        (c) => c.code === currency.match
      )}*`,
    ];

    messages.push(`Go to /myprojects to see your new project being added\\!`);

    await ctx.replyWithMarkdownV2(messages.join("\n\n"));
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
