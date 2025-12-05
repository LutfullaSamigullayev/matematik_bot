import { Injectable } from "@nestjs/common";
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

}
