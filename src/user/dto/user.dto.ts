// import { IsString, IsNotEmpty } from 'class-validator'
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { Role } from '../entities/User.entity';

export class CreateUserDto {
  readonly id?: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @ApiProperty()
  role: Role;

  @IsNotEmpty()
  @ApiProperty()
  password: string;

  name?: string;

  @IsNotEmpty()
  @ApiProperty()
  dniNumber: number;

  @IsNotEmpty()
  @ApiProperty()
  phone: string;

  address?: string;

  birthday?: string;

  services?: Array<string>;

  verificationCode?: string;

  resetPasswordToken?: string;

  createdAt: Date;

  updatedAt: Date;
}

export class RegisterHospitalDto {
  id?: string;

  @IsNotEmpty()
  @ApiProperty()
  name?: string;

  @IsNotEmpty()
  @ApiProperty()
  address?: string;

  @IsNotEmpty()
  @ApiProperty()
  services?: Array<string>;
}
export class RegisterPacienteDto {
  id?: string;

  @IsNotEmpty()
  @ApiProperty()
  name?: string;

  @IsNotEmpty()
  @ApiProperty()
  address?: string;

  @IsNotEmpty()
  @ApiProperty({
    example: '1999/05/27',
    description: 'FORMAT: AAAA/MM/DD  -  YYYY/MM/DD',
  })
  birthday?: string;
}

export class RegisterMedicoDto {
  id?: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  role: string;

  password: string;

  mustChangePassword: boolean;

  @IsNotEmpty()
  @ApiProperty()
  dniNumber: number;

  @IsNotEmpty()
  @ApiProperty()
  phone: string;

  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @ApiProperty()
  address: string;

  @IsNotEmpty()
  @ApiProperty({
    example: '1999/05/27',
    description: 'FORMAT: AAAA/MM/DD  -  YYYY/MM/DD',
  })
  birthday: string;

  verificationCode?: string;
}

export class RequestResetPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class VerifyUserDto {
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  dniNumber?: number;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  resetPasswordToken: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(6, 50)
  password: string;
}

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty()
  dniNumber: number;

  @ApiProperty()
  @IsNotEmpty()
  @Length(6, 50)
  password: string;
}

export class PayloadToken {
  id: string;
  dniNumber: number;
  role: Role;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
// export class UpdateLoginDto extends PartialType(LoginDto) {}
// export class UpdateUserDto extends PartialType(CreateUserDto) {}
// export class UpdateUserDto extends PartialType(CreateUserDto) {}
