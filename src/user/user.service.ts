import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { Role, Users } from './entities/User.entity';
import {
  CreateUserDto,
  VerifyUserDto,
  LoginDto,
  PayloadToken,
  RegisterMedicoDto,
  RequestResetPasswordDto,
  ResetPasswordDto,
  UpdateUserDto,
  RegisterHospitalDto,
  RegisterPacienteDto,
} from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly usersModel: Model<Users>,
    // private roleService: RolesService,
    private jwtService: JwtService,
  ) {}

  async CreateUser(data: CreateUserDto) {
    const userExist = await this.usersModel.findOne({
      dniNumber: data.dniNumber,
    });
    if (userExist) {
      throw new BadRequestException(`${data.dniNumber} user Exist`);
    }

    if (!Object.values(Role).includes(data.role)) {
      return {
        statusCode: 400,
        message: 'Invalid role',
        error: 'Bad Request',
        validRoles: [Role.HOSPITAL, Role.PACIENTE],
      };
      // throw new BadRequestException(`invalid Role`);
    }

    const code = randomBytes(4).toString('hex');
    data.verificationCode = code;
    const newUser = await new this.usersModel(data);
    const hashPassword = await bcrypt.hash(newUser.password, 10);
    newUser.password = hashPassword;
    const model = await newUser.save();
    const { password, verificationCode, ...rta } = model.toJSON();
    const verify = {
      email: model.email,
      code: code,
    };
    this.sendEmail(verify);
    return rta;
  }
  async CreateUserMedico(data: RegisterMedicoDto) {
    const userExist = await this.usersModel.findOne({
      dniNumber: data.dniNumber,
    });
    if (userExist) {
      throw new BadRequestException(`${data.email} user Exist`);
    }
    data.role = Role.MEDICO;
    data.password = randomBytes(4).toString('hex');
    data.mustChangePassword = true;

    const code = randomBytes(4).toString('hex');
    data.verificationCode = code;
    const newUser = await new this.usersModel(data);
    const hashPassword = await bcrypt.hash(newUser.password, 10);
    newUser.password = hashPassword;
    const model = await newUser.save();
    const { password, verificationCode, ...rta } = model.toJSON();
    const verify = {
      email: model.email,
      code: code,
      dniNumber: model.dniNumber,
    };
    this.sendEmail(verify, data.password);
    return rta;
  }

  async findByEmail(email: string) {
    const user = await this.usersModel.findOne({ email: email });
    if (!user) {
      throw new NotFoundException(`user whith email -> ${email} not found`);
    }
    return user;
  }
  async findByDniNumber(dniNumber: number) {
    const user = await this.usersModel.findOne({ dniNumber: dniNumber });
    if (!user) {
      throw new NotFoundException(
        `user whith dniNumber -> ${dniNumber} not found`,
      );
    }
    return user;
  }
  async verifyUser(data: VerifyUserDto) {
    const usuario = await this.findByDniNumber(data.dniNumber);
    if (!usuario) {
      throw new NotFoundException(
        `user whith dniNumber -> ${data.dniNumber} not found`,
      );
    }
    if (data.code == usuario.verificationCode) {
      await this.usersModel
        .findByIdAndUpdate(
          usuario.id,
          { $set: { authenticated: true } },
          { new: true },
        )
        .exec();
      return {
        statusCode: 201,
        message: 'user validate succesfully',
      };
    }
    throw new BadRequestException(`incorrect validation code`);
  }

  async RegisterUser(dniNumber: string, user: UpdateUserDto) {
    console.log('dniNumber', dniNumber);
    const usuario = await this.findByDniNumber(parseInt(dniNumber));
    console.log('usuario', usuario);
    if (!usuario) {
      throw new NotFoundException(
        `user whith dniNumber -> ${dniNumber} not found`,
      );
    }
    let changes;
    if (usuario.role == Role.HOSPITAL) {
      const hospital: RegisterHospitalDto = {
        name: user.name,
        address: user.address,
        services: user.services,
      };
      changes = hospital;
      console.log('changesss hospital', changes);
    } else if (usuario.role == Role.PACIENTE) {
      const paciente: RegisterPacienteDto = {
        name: user.name,
        address: user.address,
        birthday: user.birthday,
      };
      changes = paciente;
      console.log('changesss peac', changes);
    }
    console.log('changes', changes);
    const newUser = await this.usersModel
      .findByIdAndUpdate(usuario.id, { $set: changes }, { new: true })
      .exec();
    return newUser;
    // {
    //   statusCode: 201,
    //   message: 'user register succesfully',
    // };
    // throw new BadRequestException(`incorrect register`);
  }

  async sendEmail(data: VerifyUserDto, provisionalPassword?: string) {
    const usuario = await this.findByEmail(data.email);
    if (!usuario) {
      return ` ${data.email} no encontrado`;
    }
    const smtpConfig: SMTPTransport.Options = {
      host: 'smtp.gmail.com',
      port: 465,
      auth: {
        user: process.env.EMAIL_NODEMAILER,
        pass: process.env.PASS_NODEMAILER,
      },
    };

    const transporter = nodemailer.createTransport(smtpConfig);
    if (provisionalPassword) {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_NODEMAILER, // sender address
        to: data.email, // list of receivers
        subject: 'Bienvenido a heippi', // Subject line
        text: `hola te has registrado con exito`, // plain text body
        html: `<b>Hola debemos validar tu cuenta ${data.dniNumber}, <br/>
              este es tu codigo de verificación: ${data.code} y tu contraseña provisional: ${provisionalPassword} <br>
              recuerda que por ser la primera vez que inicias sesión debes cambiar la contraseña y establecer una 
              nueva contraseña.  </b>`, // html body
      });
      console.log('Message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

      return 'mensaje enviado';
    }
    const info = await transporter.sendMail({
      from: process.env.EMAIL_NODEMAILER, // sender address
      to: data.email, // list of receivers
      subject: 'Bienvenido a heippi', // Subject line
      text: `hola te has registrado con exito`, // plain text body
      html: `<b>Hola debemos validar tu cuenta ${data.dniNumber}, <br/>
            este es tu codigo de verificación: ${data.code} </b>`, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    return 'mensaje enviado';
  }
  async sendEmailPass(data: VerifyUserDto) {
    const usuario = await this.findByEmail(data.email);
    if (!usuario) {
      return `email: ${data.email} no encontrado`;
    }
    const smtpConfig: SMTPTransport.Options = {
      host: 'smtp.gmail.com',
      port: 465,
      auth: {
        user: process.env.USER_GMAIL,
        pass: process.env.PASSWORD_GMAIL,
      },
    };

    const transporter = nodemailer.createTransport(smtpConfig);

    const info = await transporter.sendMail({
      from: process.env.EMAIL_NODEMAILER, // sender address
      to: data.email, // list of receivers
      subject: 'Restablecer Contraseña ', // Subject line
      text: `Hello`, // plain text body
      html: `
      <p>Hola este es tu codigo para restablecer contraseña de tu usuario ${data.dniNumber} :<b> ${data.code} </b></p>
      <p>SOLICITUD DE RESTABLECIMIENTO DE CONTRASEÑA, SI NO HAS SOLICITADO RESTABLECER TU CONTRASEÑA PUEDES OMITIR ESTE MENSAJE </p>
      `, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    return 'mensaje enviado';
  }

  async sendEmailPassOk(email: string) {
    const usuario = await this.findByEmail(email);
    if (!usuario) {
      return `email: ${email} no encontrado`;
    }
    const smtpConfig: SMTPTransport.Options = {
      host: 'smtp.gmail.com',
      port: 465,
      auth: {
        user: process.env.USER_GMAIL,
        pass: process.env.PASSWORD_GMAIL,
      },
    };

    const transporter = nodemailer.createTransport(smtpConfig);

    const info = await transporter.sendMail({
      from: process.env.EMAIL_NODEMAILER, // sender address
      to: email, // list of receivers
      subject: 'Contraseña actualizada exitosamente', // Subject line
      text: `Hello`, // plain text body
      html: `Hola  Tu contraseña ha sido actualizada exitosamente`, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    return 'mensaje enviado';
  }
  async validateUser(credentials: LoginDto) {
    const mensajeError = {
      statusCode: 401,
      message: 'invalid credentials!!',
      error: 'Unauthorized',
    };
    const user = await this.findByDniNumber(credentials.dniNumber);

    if (!user) {
      throw new NotFoundException(
        `user whith dniNumber -> ${credentials.dniNumber} not found`,
      );
    }
    if (user.authenticated == false) {
      throw new BadRequestException(`user is not verify`);
    }
    const isMatch = await bcrypt.compare(credentials.password, user.password);

    if (isMatch) {
      const { password, verificationCode, authenticated, ...rta } =
        user.toJSON();
      const payload: PayloadToken = {
        id: user.id,
        dniNumber: user.dniNumber,
        role: user.role,
      };
      if (user.role == Role.MEDICO && user.mustChangePassword == true) {
        return {
          statusCode: 200,
          message: 'please update password',
          enpoint: '/request-password',
        };
      }

      const token = await this.generateToken(payload);
      return { token };
    } else return mensajeError;
  }

  async generateToken(payload: PayloadToken): Promise<string> {
    return this.jwtService.sign(payload);
  }

  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      return null;
    }
  }

  async requestResetPassword(requestReset: RequestResetPasswordDto) {
    const user = await this.findByEmail(requestReset.email);
    const { randomBytes } = await import('crypto');

    const code = randomBytes(3).toString('hex');
    user.resetPasswordToken = code;
    const saveUser = await user.save();
    const verify = {
      email: saveUser.email,
      code: saveUser.resetPasswordToken,
      dniNumber: saveUser.dniNumber,
    };
    return await this.sendEmailPass(verify);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const hashPassword = await bcrypt.hash(resetPasswordDto.password, 10);
    const user = await this.findByResetPasswordToken(
      resetPasswordDto.resetPasswordToken,
    );
    user.password = hashPassword;
    user.resetPasswordToken = null;
    user.mustChangePassword = false;
    const model = await user.save();
    const { password, ...rta } = model.toJSON();
    await this.sendEmailPassOk(model.email);
    return rta;
  }

  async findByResetPasswordToken(resetPasswordToken: string) {
    const user = await this.usersModel.findOne({
      resetPasswordToken: resetPasswordToken,
    });
    if (!user) {
      throw new NotFoundException(`code -> ${resetPasswordToken} not found`);
    }
    return user;
  }
  decodeToken(token: string) {
    const decoded = this.jwtService.verify(token);

    // Obtener el role del token
    const role = decoded.role;

    // Agregar el role a la solicitud para que esté disponible en la ruta protegida
    return role;
  }
}
