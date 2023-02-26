import {
  Body,
  Controller,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Public } from 'src/auth/decorator/public.decorator';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import {
  CreateUserDto,
  VerifyUserDto,
  LoginDto,
  RegisterMedicoDto,
  ResetPasswordDto,
  RequestResetPasswordDto,
  UpdateUserDto,
  RegisterHospitalDto,
  RegisterPacienteDto,
} from './dto/user.dto';
import { Role } from './entities/User.entity';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UsePipes(new ValidationPipe())
  @Post('/create')
  CreateUser(@Body() user: CreateUserDto) {
    return this.userService.CreateUser(user);
  }

  @Public()
  @UsePipes(new ValidationPipe())
  @Post('/verify')
  VerifyUser(@Body() data: VerifyUserDto) {
    return this.userService.verifyUser(data);
  }

  @UsePipes(new ValidationPipe())
  @Post('login')
  async login(@Body() credentials: LoginDto) {
    return await this.userService.validateUser(credentials);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.HOSPITAL)
  @UsePipes(new ValidationPipe())
  @Post('/register/medico')
  CreateUserMedico(@Body() user: RegisterMedicoDto) {
    return this.userService.CreateUserMedico(user);
  }
  @UsePipes(new ValidationPipe())
  @Put('/register/hospital/:dniNumber')
  RegisterUserHospital(
    @Param('dniNumber') dniNumber: string,
    @Body() user: RegisterHospitalDto,
  ) {
    return this.userService.RegisterUser(dniNumber, user);
  }

  @UsePipes(new ValidationPipe())
  @Put('/register/paciente/:dniNumber')
  RegisterUserPaciente(
    @Param('dniNumber') dniNumber: string,
    @Body() user: RegisterPacienteDto,
  ) {
    return this.userService.RegisterUser(dniNumber, user);
  }

  @Public()
  @Put('reset-password')
  ResetPassword(@Body() reset: ResetPasswordDto) {
    return this.userService.resetPassword(reset);
  }

  @Public()
  @Post('request-password')
  RequestResetPassword(@Body() requestReset: RequestResetPasswordDto) {
    return this.userService.requestResetPassword(requestReset);
  }
}
