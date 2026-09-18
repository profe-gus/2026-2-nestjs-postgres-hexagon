import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentController } from './infrastructure/http/controllers/student.controller';
import { StudentOrmEntity } from './infrastructure/persistence/entities/student.orm-entity';
import { StudentTypeOrmRepository } from './infrastructure/persistence/repositories/student-typeorm.repository';
import { STUDENT_REPOSITORY_PORT } from './domain/ports/student.repository.port';
import { CreateStudentUseCase } from './application/use-cases/create-student.use-case';

@Module({
  controllers: [StudentController],
  imports: [TypeOrmModule.forFeature([StudentOrmEntity])],
  providers: [
    CreateStudentUseCase,
    {
      provide: STUDENT_REPOSITORY_PORT,
      useClass: StudentTypeOrmRepository,
    },
  ],
})
export class StudentModule {}
