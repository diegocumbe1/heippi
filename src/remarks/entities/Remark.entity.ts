import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Users } from 'src/user/entities/User.entity';

@Schema({
  timestamps: true,
})
export class Remark extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  patience: Types.ObjectId | Users | any;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  doctor: Types.ObjectId | Users | any;

  @Prop({ required: true })
  remark: string;

  @Prop({ required: true })
  headlthStatus: string;

  @Prop({ required: true })
  speciality: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  hospital: Types.ObjectId | Users | any;
}

export const Remarkschema = SchemaFactory.createForClass(Remark);
