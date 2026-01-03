import { PartialType } from '@nestjs/mapped-types';
import { CreateExpensesCategoryDto } from './create-expenses-category.dto';

export class UpdateExpensesCategoryDto {
    name: string;
}
