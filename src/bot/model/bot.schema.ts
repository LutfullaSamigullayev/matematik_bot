import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type BotDocument = HydratedDocument<Bot>;

@Schema({versionKey: false})
export class Bot {
  @Prop()
  chatId: string;

  @Prop()
  firstName: string;

  @Prop({ default: 0 })
  score: number;

  @Prop({ default: 0 })
  testScore: number; 

  @Prop({ default: 0 })
  testStep: number; 

  @Prop({ default: false })
  isTesting: boolean; 
  
  @Prop({ type: String, default: null })
  currentQuestion: string | null;

  @Prop({ type: Number, default: null })
  currentAnswer: number | null;
}


export const BotSchema = SchemaFactory.createForClass(Bot);