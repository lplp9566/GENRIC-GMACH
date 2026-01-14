import { PartialType } from '@nestjs/mapped-types';
import { CreateBankCurrentDto } from './create-bank-current.dto';

export class UpdateBankCurrentDto extends PartialType(CreateBankCurrentDto) {}
