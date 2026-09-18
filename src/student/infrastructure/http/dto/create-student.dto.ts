import {
  IsString,
  IsNumber,
  IsPositive,
  IsEmail,
  IsBoolean,
} from 'class-validator';

export class CreateStudent {
  @IsString()
  name: string;

  @IsNumber()
  @IsPositive()
  age: number;

  @IsString()
  @IsEmail()
  email: string;

  @IsBoolean()
  isActive: boolean;
}
