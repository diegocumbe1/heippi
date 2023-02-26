import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Role } from 'src/user/entities/User.entity';
import { UserService } from 'src/user/user.service';
import { CreateRemarkDto } from './dto/remark.dto';
import { Remark } from './entities/Remark.entity';

@Injectable()
export class RemarksService {
  constructor(
    @InjectModel('Remark') private readonly remarkModel: Model<Remark>,
    // @InjectModel('User') private readonly usersModel: Model<Users>,
    private userService: UserService,
  ) {}
  async createRemark(remark: CreateRemarkDto) {
    const patience = await this.userService.findByDniNumber(
      parseInt(remark.patience),
    );
    if (!patience) {
      throw new NotFoundException(
        `patience whith dniNumber -> ${remark.patience} not found`,
      );
    }

    const doctor = await this.userService.findByDniNumber(
      parseInt(remark.doctor),
    );
    if (!doctor) {
      throw new NotFoundException(
        `patience whith dniNumber -> ${remark.doctor} not found`,
      );
    }
    remark.patience = patience.id;
    remark.doctor = doctor.id;
    remark.hospital = doctor.hospital.toString();
    const newRemark = await new this.remarkModel(remark);
    const model = await newRemark.save();
    return model;
  }

  async GetRemark(dniNumber: string) {
    const user = await this.userService.findByDniNumber(parseInt(dniNumber));
    if (user.role == Role.PACIENTE) {
      return await this.remarkModel
        .find({ patience: user.id })
        .populate({
          path: 'patience',
          select: 'dniNumber name address email birthday',
        })
        .populate({
          path: 'doctor',
          select: 'dniNumber name address email birthday',
        })
        .populate({
          path: 'hospital',
          select: 'dniNumber name address email services',
        });
    } else if (user.role == Role.MEDICO) {
      return await this.remarkModel
        .find({ doctor: user.id })
        .populate({
          path: 'patience',
          select: 'dniNumber name address email birthday',
        })
        .populate({
          path: 'doctor',
          select: 'dniNumber name address email birthday',
        })
        .populate({
          path: 'hospital',
          select: 'dniNumber name address email services',
        });
    }
    return await this.remarkModel
      .find({ hospital: user.id })
      .populate({
        path: 'patience',
        select: 'dniNumber name address email birthday',
      })
      .populate({
        path: 'doctor',
        select: 'dniNumber name address email birthday',
      })
      .populate({
        path: 'hospital',
        select: 'dniNumber name address email services',
      });
  }
  async GetRemarkForDownload(dniNumber: string) {
    const omissionDB = {
      __v: false,
      _id: false,
    };
    const user = await this.userService.findByDniNumber(parseInt(dniNumber));

    const remarks = await this.remarkModel
      .find({ patience: user.id }, omissionDB)
      .populate({
        path: 'patience',
        select: 'dniNumber name address email birthday',
      })
      .populate({
        path: 'doctor',
        select: 'dniNumber name address email birthday',
      })
      .populate({
        path: 'hospital',
        select: 'dniNumber name address email services',
      });
    const data = remarks.map((data) => ({
      paciente: data.patience.name,
      doctor: data.doctor.name,
      hospital: data.hospital.name,
      Observaciones: data.remark,
      estado: data.headlthStatus,
      especialidad: data.speciality,
    }));
    return data;
  }

  async generatePdfFromJson(data: any) {
    const headers = Object.keys(data[0]);

    const rows = data.map((item) => Object.values(item));
    const headersHtml = headers.map((header) => `<th>${header}</th>`).join('');
    const rowsHtml = rows
      .map(
        (row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`,
      )
      .join('');
    const html = `
      <html>
        <head>
          <style>
          table, th, td {
            border: 1px solid black;
          }
          </style>
        </head>
        <body>
        <h3>OBSERVACIONES DEL PACIENTE</h3>
          <table>
          <thead>
            <tr>${headersHtml}</tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        </body>
      </html>
    `;
    return html;
  }
}
