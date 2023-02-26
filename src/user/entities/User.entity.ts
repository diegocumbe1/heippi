import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum Role {
  HOSPITAL = 'Hospital',
  PACIENTE = 'Paciente',
  MEDICO = 'Médico',
}

@Schema({
  timestamps: true,
})
export class Users extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ type: String, enum: Object.values(Role), required: true })
  role: Role;

  @Prop({ required: true })
  password: string;

  @Prop()
  mustChangePassword: boolean;

  @Prop()
  name: string;

  @Prop({ required: true })
  dniNumber: number;

  @Prop({ required: true })
  phone: string;

  @Prop()
  address: string;

  @Prop()
  birthday: Date;

  @Prop()
  services: Array<string>;
  @Prop()
  verificationCode: string;

  @Prop({ default: false })
  authenticated: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  hospital: Types.ObjectId | Users;

  @Prop({ type: String, default: 'null' })
  resetPasswordToken: string;
}

export const UserSchema = SchemaFactory.createForClass(Users);
