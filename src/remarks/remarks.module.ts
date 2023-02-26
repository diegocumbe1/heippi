import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/user/entities/User.entity';
import { UserModule } from 'src/user/user.module';
import { Remarkschema } from './entities/Remark.entity';
import { RemarksController } from './remarks.controller';
import { RemarksService } from './remarks.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Remark', schema: Remarkschema },
    ]),
    UserModule,
  ],
  controllers: [RemarksController],
  providers: [RemarksService],
})
export class RemarksModule {}
