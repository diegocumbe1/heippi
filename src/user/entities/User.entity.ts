import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// import { profile } from 'src/profiles/entities/profile.entity';
// import { Roles } from './../../roles/entities/roles.entity';

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

  @Prop({ type: String, default: 'null' })
  resetPasswordToken: string;
}

export const UserSchema = SchemaFactory.createForClass(Users);
