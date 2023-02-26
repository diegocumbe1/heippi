import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateRemarkDto {
  readonly id?: string;

  @IsNotEmpty()
  @ApiProperty({
    example: '10000000',
    description: 'aqui el numero de identificación del paciente',
  })
  patience: string;

  doctor: string;

  @IsNotEmpty()
  @ApiProperty()
  remark: string;

  @IsNotEmpty()
  @ApiProperty()
  headlthStatus: string;

  @IsNotEmpty()
  @ApiProperty()
  speciality: string;

  hospital: string;
}

export class UpdateRemarkDto extends PartialType(CreateRemarkDto) {}
