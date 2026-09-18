import { Student } from '../../../domain/entities/student.entity';
import { StudentOrmEntity } from '../entities/student.orm-entity';

export class StudentMapper {
  static toDomain(orm: StudentOrmEntity): Student {
    return Student.fromPersistence({
      id: orm.id,
      name: orm.name,
      age: orm.age,
      email: orm.email,
      isActive: orm.isActive,
      nickname: orm.nickname,
    });
  }

  static toOrm(domain: Student): StudentOrmEntity {
    const orm = new StudentOrmEntity();
    if (domain.id) {
      orm.id = domain.id;
    }
    orm.name = domain.name;
    orm.age = domain.age;
    orm.email = domain.email;
    orm.isActive = domain.isActive;
    orm.nickname = domain.nickname;
    return orm;
  }
}
