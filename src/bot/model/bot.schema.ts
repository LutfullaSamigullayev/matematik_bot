import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type BotDocument = HydratedDocument<Bot>;

@Schema()
export class Bot {
    @Prop()
    chatId: string;

    @Prop()
    firstName: string;
}

export const BotSchema = SchemaFactory.createForClass(Bot);