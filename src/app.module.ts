import { Module } from '@nestjs/common';
import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { RemarksModule } from './remarks/remarks.module';
import config from './config';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        DB_URI: Joi.string().required(),
      }),
    }),
    MongooseModule.forRoot(process.env.DB_URI),
    RemarksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
