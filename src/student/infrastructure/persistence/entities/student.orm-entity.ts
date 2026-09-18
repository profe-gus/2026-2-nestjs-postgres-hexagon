import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('student')
export class StudentOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column({
    type: 'int',
    nullable: true,
  })
  age: number;

  @Column({
    type: 'text',
    unique: true,
  })
  email: string;

  @Column('boolean')
  isActive: boolean;

  @Column('text')
  nickname: string;
}
