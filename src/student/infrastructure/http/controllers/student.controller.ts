import { Body, Controller, Post } from '@nestjs/common';
import { CreateStudentUseCase } from '../../../application/use-cases/create-student.use-case';
import { CreateStudent } from '../dto/create-student.dto';

@Controller('student')
export class StudentController {
  constructor(private readonly createStudentUseCase: CreateStudentUseCase) {}

  @Post()
  create(@Body() createStudentDto: CreateStudent) {
    return this.createStudentUseCase.execute(createStudentDto);
  }
}
