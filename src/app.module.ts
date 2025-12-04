import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './module/auth/auth.module';
import { PostModule } from './module/post/post.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true}),

    MongooseModule.forRoot(process.env.MONGO_URI as string),

    AuthModule,
    PostModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
