import { Injectable  } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Bot } from "./model/bot.schema";
import { Model } from "mongoose";
import TelegramBot from "node-telegram-bot-api";

@Injectable()
export class BotService {
  private bot: TelegramBot;

  constructor(@InjectModel(Bot.name) private botModel: Model<Bot>) {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string, {
      polling: true,
    });
  }

  onModuleInit() {
    this.handleStartCommand();
  }

  private handleStartCommand() {
    this.bot.onText(/\/start/, async (msg) => {
      const chatId: number = msg.chat.id;
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
        await this.bot.sendMessage(
          chatId,
          `Siz avval ro'yxatdan o'tgansiz, ${firstName}!`
        );
      }
    });
  }
}
