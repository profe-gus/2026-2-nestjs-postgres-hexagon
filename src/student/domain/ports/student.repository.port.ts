import { Student } from '../entities/student.entity';

export const STUDENT_REPOSITORY_PORT = 'STUDENT_REPOSITORY_PORT';

export interface StudentRepositoryPort {
  save(student: Student): Promise<Student>;
}
