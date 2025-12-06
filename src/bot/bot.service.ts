import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Bot } from "./model/bot.schema";
import { Model } from "mongoose";
import TelegramBot, { Update } from "node-telegram-bot-api";

@Injectable()
export class BotService {
  private bot: TelegramBot;

  constructor(@InjectModel(Bot.name) private botModel: Model<Bot>) {
    const webhookBase = process.env.WEBHOOK_BASE_URL || process.env.RENDER_EXTERNAL_URL || "";
    const isWebhookMode = !!webhookBase;
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string, {
      polling: !isWebhookMode,
    });
  }

  async onModuleInit() {
    const webhookBase = process.env.WEBHOOK_BASE_URL || process.env.RENDER_EXTERNAL_URL || "";
    if (webhookBase) {
      const base = webhookBase.replace(/\/+$/, "");
      const secret = process.env.TG_WEBHOOK_SECRET || (process.env.TELEGRAM_BOT_TOKEN as string);
      await (this.bot as any).setWebHook(`${base}/webhook/${secret}`, { secret_token: secret } as any);
    }

    this.handleStartCommand();
    this.handleTestCommand();
    this.handleAnswerListener();
  }

  private handleStartCommand() {
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = String(msg.chat.id);
      const firstName: string = msg.from?.first_name || "";

      const foundedUser = await this.botModel.findOne({ chatId });

      if (!foundedUser) {
        const newUser = new this.botModel({ chatId, firstName });
        await newUser.save();
        this.bot.sendMessage(
          chatId,
          `Matematik botga xush kelibsiz, ${firstName}!`
        );
      } else {
        this.bot.sendMessage(
          chatId,
          `Siz avval ro'yxatdan o'tgansiz, ${firstName}!`
        );
      }
    });
  }

  private generateQuestion() {
    const a: number = Math.floor(Math.random() * 10) + 1;
    const b: number = Math.floor(Math.random() * 10) + 1;

    const operators: string[] = ["+", "-", "*"];
    const operator: string =
      operators[Math.floor(Math.random() * operators.length)];

    let answer: number;

    switch (operator) {
      case "+":
        answer = a + b;
        break;
      case "-":
        answer = a - b;
        break;
      case "*":
        answer = a * b;
        break;
      default:
        throw new Error("Invalid operator!");
    }

    return {
      question: `${a} ${operator} ${b} = ?`,
      answer,
    };
  }

  private handleTestCommand() {
    this.bot.onText(/\/test/, async (msg) => {
      const chatId = String(msg.chat.id);
      const user = await this.botModel.findOne({ chatId });

      if (!user) {
        return this.bot.sendMessage(chatId, "Siz hali ro'yxatdan o'tmagansiz!");
      }

      if (user.isTesting) {
        return this.bot.sendMessage(
          chatId,
          `${user.firstName} siz hali avvalgi testni tugatmadingiz!`
        );
      }

      user.isTesting = true;
      user.testScore = 0;
      user.testStep = 1;

      const { question, answer } = this.generateQuestion();
      user.currentQuestion = question;
      user.currentAnswer = answer;

      await user.save();

      this.bot.sendMessage(
        chatId,
        `Test boshlandi! \n№ 1-savol: \n${question}`
      );
    });
  }

  private handleAnswerListener() {
    this.bot.on("message", async (msg) => {
      const chatId = String(msg.chat.id);
      const text = msg.text?.trim();

      if (text?.startsWith("/")) return;

      const user = await this.botModel.findOne({ chatId });

      if (!user) return;

      if (!user.isTesting) {
        return this.bot.sendMessage(
          chatId,
          "Testni boshlash uchun /test buyrug'ini bering."
        );
      }

      const userAnswer = Number(text);

      if (isNaN(userAnswer)) {
        return this.bot.sendMessage(chatId, "Faqat son kiriting!");
      }

      if (userAnswer === user.currentAnswer) {
        user.testScore += 1;
        await this.bot.sendMessage(chatId, "To'g'ri 🎉🎆", {
          parse_mode: "HTML", // yoki "MarkdownV2"
        });
      } else {
        await this.bot.sendMessage(
          chatId,
          `Noto'g'ri! \nTo'g'ri javob: ${user.currentAnswer}`
        );
      }

      if (user.testStep >= 10) {
        await this.bot.sendMessage(
          chatId,
          `Test tugadi! \nSizning natijangiz: ${user.testScore}/10 \nAgar yana testdan o'tmoqchi bo'lsangiz /test buyrug'ini bering.`
        );

        user.isTesting = false;
        user.currentAnswer = null;
        user.currentQuestion = null;
        await user.save();
        return;
      }

      user.testStep += 1;
      const { question, answer } = this.generateQuestion();
      user.currentQuestion = question;
      user.currentAnswer = answer;
      await user.save();

      this.bot.sendMessage(chatId, `№ ${user.testStep}-savol: \n${question}`);
    });
  }

  processUpdate(update: Update) {
    (this.bot as any).processUpdate(update);
  }
}
