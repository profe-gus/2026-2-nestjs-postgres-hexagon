export interface CreateStudentProps {
  name: string;
  age: number;
  email: string;
  isActive: boolean;
}

export class Student {
  private constructor(
    public readonly id: string | undefined,
    public readonly name: string,
    public readonly age: number,
    public readonly email: string,
    public readonly isActive: boolean,
    public readonly nickname: string,
  ) {}

  static create(props: CreateStudentProps): Student {
    const nickname = Student.buildNickname(props.name, props.age);
    return new Student(
      undefined,
      props.name,
      props.age,
      props.email,
      props.isActive,
      nickname,
    );
  }

  static fromPersistence(props: {
    id: string;
    name: string;
    age: number;
    email: string;
    isActive: boolean;
    nickname: string;
  }): Student {
    return new Student(
      props.id,
      props.name,
      props.age,
      props.email,
      props.isActive,
      props.nickname,
    );
  }

  private static buildNickname(name: string, age: number): string {
    return name.toLowerCase().replace(' ', '_') + age;
  }
}
