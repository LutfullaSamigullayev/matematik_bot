import { Body, Controller, Headers, HttpCode, Param, Post } from '@nestjs/common';
import { BotService } from './bot.service';

@Controller()
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Post('webhook/:secret')
  @HttpCode(200)
  async handleWebhook(
    @Param('secret') secret: string,
    @Headers('x-telegram-bot-api-secret-token') secretHeader: string,
    @Body() update: any,
  ) {
    const configuredSecret = process.env.TG_WEBHOOK_SECRET || process.env.TELEGRAM_BOT_TOKEN;
    if (!configuredSecret || (secret !== configuredSecret && secretHeader !== configuredSecret)) {
      return { ok: true };
    }
    await this.botService.processUpdate(update);
    return { ok: true };
  }
}
