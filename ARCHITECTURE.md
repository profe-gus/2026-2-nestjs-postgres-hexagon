# Arquitectura hexagonal (Ports & Adapters)

Este proyecto organiza cada *feature* (por ahora, `student`) siguiendo el patrón **hexagonal** (también llamado *ports & adapters*). La idea central: el **dominio** (las reglas de negocio) no depende de ningún framework, ORM o librería de validación. Son los frameworks los que dependen del dominio, nunca al revés.

```
src/student/
├── student.module.ts                              # Composition root: conecta todas las capas
├── domain/
│   ├── entities/
│   │   └── student.entity.ts                      # Entidad de dominio (clase pura, sin decoradores)
│   └── ports/
│       └── student.repository.port.ts             # Puerto: contrato que debe cumplir la persistencia
├── application/
│   ├── commands/
│   │   └── create-student.command.ts               # Input del caso de uso (agnóstico de HTTP)
│   └── use-cases/
│       └── create-student.use-case.ts               # Orquesta la operación "crear estudiante"
└── infrastructure/
    ├── http/                                       # Adaptador de ENTRADA (driving adapter)
    │   ├── controllers/
    │   │   └── student.controller.ts
    │   └── dto/
    │       └── create-student.dto.ts
    └── persistence/                                # Adaptador de SALIDA (driven adapter)
        ├── entities/
        │   └── student.orm-entity.ts                # Entidad TypeORM (mapea la tabla `student`)
        ├── mappers/
        │   └── student.mapper.ts                     # Convierte entre dominio <-> ORM
        └── repositories/
            └── student-typeorm.repository.ts         # Implementación del puerto usando TypeORM
```

Cada carpeta agrupa un único tipo de pieza (entidades, puertos, comandos, casos de uso, controllers, dto, mappers, repositorios). Con un solo caso de uso hoy puede verse como más carpetas de las necesarias, pero es la convención que se espera seguir a medida que el CRUD crezca (varios comandos, varios casos de uso, varios controllers, etc.) sin tener que reorganizar después.

## Las tres capas

### 1. `domain/` — el centro del hexágono

Contiene las reglas de negocio puras, sin importar nada de `@nestjs/*`, `typeorm` ni `class-validator`. No sabe que existe HTTP ni una base de datos.

- **`entities/student.entity.ts`**: la clase `Student`. Expone un factory `Student.create(...)` que arma el `nickname` a partir de `name` y `age` — esta lógica antes vivía en un hook `@BeforeInsert()` de TypeORM. En hexagonal, una regla de negocio no debe depender de que el ORM decida ejecutarla; por eso se movió al dominio como un método explícito.
- **`ports/student.repository.port.ts`**: el **puerto**. Es una interfaz (`StudentRepositoryPort`) que declara *qué* necesita el dominio de la persistencia (`save`), sin decir *cómo* se implementa. Junto a la interfaz se exporta `STUDENT_REPOSITORY_PORT`, un token de inyección — las interfaces de TypeScript no existen en tiempo de ejecución, así que Nest necesita un token concreto para resolver la dependencia.

### 2. `application/` — casos de uso

Orquesta el dominio para cumplir una operación concreta. Es el reemplazo directo de lo que antes era `student.service.ts`.

- **`commands/create-student.command.ts`**: la forma de los datos que necesita el caso de uso. Es un tipo propio de la capa de aplicación, distinto del DTO de HTTP — así el caso de uso no depende de `class-validator` ni de cómo llegan los datos (podrían venir de un controller REST, un mensaje de una cola, un CLI, etc.).
- **`use-cases/create-student.use-case.ts`**: recibe el puerto por inyección (`@Inject(STUDENT_REPOSITORY_PORT)`), construye el `Student` de dominio y le pide al puerto que lo guarde. No sabe si por debajo hay Postgres, MongoDB o un mock en memoria.

### 3. `infrastructure/` — adaptadores

Es la única capa que conoce frameworks externos. Se divide en dos direcciones:

- **`http/` (adaptador de entrada / *driving*)**: traduce peticiones HTTP en llamadas al caso de uso. `controllers/student.controller.ts` valida el body contra el DTO de `dto/create-student.dto.ts` (`class-validator`) y delega en `CreateStudentUseCase`. Si mañana se agrega un adaptador de entrada distinto (un consumidor de eventos, un CLI), viviría aquí también, sin tocar `application/` ni `domain/`.
- **`persistence/` (adaptador de salida / *driven*)**: implementa el puerto que pidió el dominio. `entities/student.orm-entity.ts` es la entidad TypeORM real (mapea la tabla `student`), `mappers/student.mapper.ts` traduce entre la entidad de dominio y la entidad ORM, y `repositories/student-typeorm.repository.ts` implementa `StudentRepositoryPort` usando el `Repository<StudentOrmEntity>` de TypeORM. Si mañana se cambia de Postgres a otra base de datos, solo se reemplaza esta carpeta.

## Flujo de una petición (`POST /api/student`)

```
HTTP request
   │
   ▼
StudentController (infrastructure/http)
   │  valida CreateStudent (DTO) con class-validator
   ▼
CreateStudentUseCase.execute(command) (application)
   │  Student.create(command) → construye la entidad de dominio
   ▼
StudentRepositoryPort.save(student) (domain, el contrato)
   │
   ▼
StudentTypeOrmRepository.save(student) (infrastructure/persistence)
   │  StudentMapper.toOrm() → guarda con TypeORM → StudentMapper.toDomain()
   ▼
Student (dominio) de vuelta hasta el controller → respuesta HTTP
```

La regla de dependencia siempre apunta hacia adentro: `infrastructure` conoce `application` y `domain`; `application` conoce `domain`; `domain` no conoce a nadie.

## Wiring: `student.module.ts`

El módulo de Nest es el único lugar que conecta la interfaz abstracta con su implementación concreta:

```ts
providers: [
  CreateStudentUseCase,
  {
    provide: STUDENT_REPOSITORY_PORT,
    useClass: StudentTypeOrmRepository,
  },
],
```

Esto le dice a Nest: "cuando algo pida `STUDENT_REPOSITORY_PORT`, dale una instancia de `StudentTypeOrmRepository`". Si en un test se quisiera reemplazar la base de datos real por un repositorio en memoria, bastaría con cambiar ese `useClass` — el caso de uso y el controller no se enterarían.

## Decisiones y compatibilidad hacia atrás

- **Comportamiento sin cambios**: esta migración es puramente estructural. La lógica de creación de estudiantes, incluyendo sus bugs conocidos (el cálculo del `nickname` con `replace` de un solo espacio, y el uso semánticamente incorrecto de `NotFoundException` cuando falla el guardado), se conserva intacta a propósito — son ejercicios de debugging del curso, documentados en el `README.md`.
- **Nombre de tabla estable**: la entidad ORM se renombró de `Student` a `StudentOrmEntity`, por lo que se agregó `@Entity('student')` explícito para que TypeORM siga usando el nombre de tabla `student` (por defecto usaría el nombre de la clase).
- **`app.module.ts` fuera de alcance**: el bug de `port: +!process.env.DB_PORT` vive a nivel de la configuración raíz de la aplicación, no del módulo `student`, así que no se tocó en esta migración.

## Cómo agregar una nueva funcionalidad siguiendo este patrón

Para las próximas operaciones del CRUD (listar, obtener por id, actualizar, eliminar) u otras features del curso, seguir el mismo esquema:

1. **`domain/ports/`**: si la nueva operación necesita algo nuevo del repositorio (por ejemplo `findById`), agregarlo al puerto (`student.repository.port.ts`).
2. **`application/commands/`** y **`application/use-cases/`**: crear el `command` correspondiente (si aplica) y el `use-case.ts` de la nueva operación.
3. **`infrastructure/http/controllers/`** y **`infrastructure/http/dto/`**: agregar el endpoint en el controller y su DTO si hace falta.
4. **`infrastructure/persistence/repositories/`**: implementar el nuevo método del puerto en `student-typeorm.repository.ts`.
5. **`student.module.ts`**: registrar el nuevo caso de uso en `providers`.

Una nueva feature completa (por ejemplo `course`) replicaría esta misma estructura de carpetas (`domain/`, `application/`, `infrastructure/`) dentro de `src/course/`.
