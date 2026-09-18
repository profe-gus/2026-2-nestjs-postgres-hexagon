import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../../../domain/entities/student.entity';
import type { StudentRepositoryPort } from '../../../domain/ports/student.repository.port';
import { StudentOrmEntity } from '../entities/student.orm-entity';
import { StudentMapper } from '../mappers/student.mapper';

@Injectable()
export class StudentTypeOrmRepository implements StudentRepositoryPort {
  constructor(
    @InjectRepository(StudentOrmEntity)
    private readonly ormRepository: Repository<StudentOrmEntity>,
  ) {}

  async save(student: Student): Promise<Student> {
    const orm = StudentMapper.toOrm(student);
    const saved = await this.ormRepository.save(orm);
    return StudentMapper.toDomain(saved);
  }
}
