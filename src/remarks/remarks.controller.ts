import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import * as pdf from 'html-pdf';

import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Role } from 'src/user/entities/User.entity';
import { CreateRemarkDto } from './dto/remark.dto';
import { RemarksService } from './remarks.service';

@ApiTags('remarks')
@Controller('remarks')
export class RemarksController {
  constructor(private remarksService: RemarksService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.MEDICO)
  @UsePipes(new ValidationPipe())
  @Post('create/:dniNumber')
  CreateRemark(
    @Param('dniNumber') dniNumber: string,
    @Body() remark: CreateRemarkDto,
  ) {
    remark.doctor = dniNumber;
    return this.remarksService.createRemark(remark);
  }

  @Get('/:dniNumber')
  GetUserByCompany(@Param('dniNumber') dniNumber: string) {
    return this.remarksService.GetRemark(dniNumber);
  }

  @Get('/download-remarks/:dniNumber')
  async generatePdf(
    @Param('dniNumber') dniNumber: string,
    @Res() res: Response,
  ) {
    const data = await this.remarksService.GetRemarkForDownload(dniNumber);
    const buffer = await this.remarksService.generatePdfFromJson(data);
    pdf.create(buffer).toBuffer((err, buffer) => {
      if (err) {
        console.error(err);
        return;
      }
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=observaciones.pdf',
      );
      res.send(buffer);
    });
  }
}
