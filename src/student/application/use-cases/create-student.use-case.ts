import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Student } from '../../domain/entities/student.entity';
import { STUDENT_REPOSITORY_PORT } from '../../domain/ports/student.repository.port';
import type { StudentRepositoryPort } from '../../domain/ports/student.repository.port';
import { CreateStudentCommand } from '../commands/create-student.command';

@Injectable()
export class CreateStudentUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY_PORT)
    private readonly studentRepository: StudentRepositoryPort,
  ) {}

  async execute(command: CreateStudentCommand): Promise<Student> {
    try {
      const student = Student.create(command);
      return await this.studentRepository.save(student);
    } catch (error) {
      throw new NotFoundException(`No se pudo guardar dato en la bd: ${error}`);
    }
  }
}
