import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigType } from '@nestjs/config';

import { UserSchema } from './entities/User.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import config from './../config';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [config.KEY],
      useFactory: (ConfigService: ConfigType<typeof config>) => {
        return {
          secret: ConfigService.jwtSecret,
          signOptions: {
            expiresIn: '2d', // definir tiempo
          },
        };
      },
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [PassportModule, UserService],
})
export class UserModule {}
