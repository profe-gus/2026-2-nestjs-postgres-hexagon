# Computación en Internet 3 — NestJS + PostgreSQL

Proyecto base para las prácticas del curso **Computación en Internet 3**. Es una API REST construida con [NestJS](https://nestjs.com/) que se conecta a una base de datos **PostgreSQL** usando **TypeORM**.

Este repositorio sirve como punto de partida: trae la configuración inicial (conexión a la base de datos, validaciones globales, prefijo de rutas) y el módulo `student`, que ya tiene su entidad, su DTO de creación y un primer endpoint funcionando, y que se irá completando en clase (actualizar, listar, eliminar).

## Stack y dependencias

### Dependencias de producción

| Paquete | Versión | Para qué sirve |
|---|---|---|
| `@nestjs/common` | ^11.0.1 | Decoradores y utilidades base de Nest (`@Module`, `@Controller`, `@Injectable`, pipes, etc.) |
| `@nestjs/core` | ^11.0.1 | Núcleo del framework: arranque de la aplicación, inyección de dependencias |
| `@nestjs/platform-express` | ^11.0.1 | Adaptador HTTP: hace que Nest corra sobre Express por debajo |
| `@nestjs/config` | ^12.0.0 | Carga variables de entorno desde `.env` (`ConfigModule`) |
| `@nestjs/typeorm` | ^12.0.1 | Integra TypeORM como ORM dentro de Nest (`TypeOrmModule`) |
| `typeorm` | ^1.1.1 | ORM: mapea clases TypeScript (entidades) a tablas de la base de datos |
| `pg` | ^8.23.0 | Driver de PostgreSQL que usa TypeORM para conectarse |
| `class-validator` | ^0.15.1 | Valida los DTOs (`@IsString()`, `@IsInt()`, etc.) |
| `class-transformer` | ^0.5.1 | Transforma objetos planos (JSON de las peticiones) en instancias de clases (DTOs) |
| `@nestjs/mapped-types` | * | Utilidades para derivar DTOs (`PartialType`, `PickType`) sin repetir código, típico en `update-*.dto.ts` |
| `reflect-metadata` | ^0.2.2 | Requerido por los decoradores de TypeScript (metadata en tiempo de ejecución) |
| `rxjs` | ^7.8.1 | Programación reactiva; Nest la usa internamente (interceptores, streams) |

### Dependencias de desarrollo

| Paquete | Para qué sirve |
|---|---|
| `@nestjs/cli` | Comandos `nest ...` (build, generate, start) |
| `@nestjs/schematics` | Generadores de código (`nest g module/controller/service`) |
| `@nestjs/testing` | Utilidades para escribir tests de Nest |
| `jest`, `ts-jest`, `@types/jest` | Framework y soporte de TypeScript para pruebas unitarias |
| `supertest`, `@types/supertest` | Pruebas de integración/e2e sobre HTTP |
| `typescript`, `ts-node`, `tsconfig-paths` | Compilación y ejecución de TypeScript |
| `eslint`, `typescript-eslint`, `eslint-config-prettier`, `eslint-plugin-prettier`, `@eslint/js`, `@eslint/eslintrc`, `globals` | Linting del código |
| `prettier` | Formateo automático del código |
| `ts-loader` | Loader de TypeScript (usado por el build de Nest) |
| `source-map-support` | Mapea errores en tiempo de ejecución de vuelta al código TypeScript original |
| `@types/express`, `@types/node` | Tipos de TypeScript para Express y Node |

## Estructura del proyecto

Este proyecto sigue una **arquitectura hexagonal (ports & adapters)**: cada *feature* se organiza en capas `domain` / `application` / `infrastructure`, donde el dominio no depende de Nest, TypeORM ni class-validator. El detalle completo (por qué cada capa existe, cómo fluyen los datos y cómo agregar una nueva feature) está documentado en **[`ARCHITECTURE.md`](./ARCHITECTURE.md)**.

```
src/
├── main.ts                                       # Punto de entrada: arranca la app, prefijo global, validaciones
├── app.module.ts                                  # Módulo raíz: config, conexión a la BD, módulos de features
└── student/
    ├── student.module.ts                          # Wiring: conecta casos de uso con sus implementaciones
    ├── domain/
    │   ├── entities/
    │   │   └── student.entity.ts                  # Entidad de dominio (clase pura, sin decoradores)
    │   └── ports/
    │       └── student.repository.port.ts         # Puerto: contrato de persistencia
    ├── application/
    │   ├── commands/
    │   │   └── create-student.command.ts           # Input del caso de uso
    │   └── use-cases/
    │       └── create-student.use-case.ts           # Lógica de negocio de "crear estudiante"
    └── infrastructure/
        ├── http/                                   # Adaptador de entrada (REST)
        │   ├── controllers/
        │   │   └── student.controller.ts
        │   └── dto/
        │       └── create-student.dto.ts
        └── persistence/                            # Adaptador de salida (TypeORM)
            ├── entities/
            │   └── student.orm-entity.ts
            ├── mappers/
            │   └── student.mapper.ts
            └── repositories/
                └── student-typeorm.repository.ts
test/
└── app.e2e-spec.ts              # Prueba end-to-end de ejemplo
```

Cada nueva funcionalidad del curso debería seguir este mismo patrón: una carpeta por *feature*, con sus propias subcarpetas `domain/`, `application/` e `infrastructure/`. Ver la sección ["Cómo agregar una nueva funcionalidad"](./ARCHITECTURE.md#cómo-agregar-una-nueva-funcionalidad-siguiendo-este-patrón) en `ARCHITECTURE.md`.

## Requisitos previos

- **Node.js** 18 o superior
- **npm**
- **PostgreSQL** corriendo localmente (o accesible por red), con una base de datos ya creada

## Puesta en marcha

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Crear un archivo `.env` en la raíz del proyecto con las credenciales de tu base de datos:

   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=compunet3
   DB_USERNAME=postgres
   DB_PASSWORD=tu_password
   ```

   > El `.env` está en `.gitignore`: cada quien usa el suyo y **no se sube al repositorio**.

3. Levantar la aplicación en modo desarrollo (con recarga automática):

   ```bash
   npm run start:dev
   ```

4. La API queda disponible en `http://localhost:9000/api/student` (ver [Puntos clave](#puntos-clave) sobre el prefijo global y [Endpoints disponibles](#endpoints-disponibles)).

## Scripts disponibles

| Comando | Qué hace |
|---|---|
| `npm run start` | Levanta la app una vez (sin watch) |
| `npm run start:dev` | Levanta la app en modo watch (recarga en cada cambio) |
| `npm run start:debug` | Igual que `start:dev`, con el debugger de Node habilitado |
| `npm run start:prod` | Ejecuta el build ya compilado (`dist/main.js`) |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm run lint` | Corre ESLint y corrige automáticamente lo que pueda |
| `npm run format` | Formatea el código con Prettier |
| `npm run test` | Corre las pruebas unitarias con Jest |
| `npm run test:watch` | Pruebas unitarias en modo watch |
| `npm run test:cov` | Pruebas unitarias con reporte de cobertura |
| `npm run test:e2e` | Corre las pruebas end-to-end |

## Comandos del CLI de Nest

El [Nest CLI](https://docs.nestjs.com/cli/overview) (`nest`, instalado como dependencia de desarrollo) sirve para generar código y gestionar el proyecto sin escribir todo el boilerplate a mano. Se ejecuta con `npx nest <comando>` (o directamente `nest <comando>` si lo tienen instalado global con `npm i -g @nestjs/cli`).

| Comando | Alias | Qué hace |
|---|---|---|
| `nest new <nombre>` | `nest n` | Crea un proyecto Nest nuevo desde cero |
| `nest generate module <nombre>` | `nest g mo` | Genera un módulo (`*.module.ts`) y lo registra en el módulo padre |
| `nest generate controller <nombre>` | `nest g co` | Genera un controlador (`*.controller.ts`) con su spec de test |
| `nest generate service <nombre>` | `nest g s` | Genera un servicio (`*.service.ts`) con su spec de test |
| `nest generate resource <nombre>` | `nest g res` | Genera un CRUD completo: módulo, controlador, servicio, DTOs y entidad (pregunta el transport layer, ej. REST API) |
| `nest generate class <nombre>` | `nest g cl` | Genera una clase simple (útil para DTOs o entidades) |
| `nest generate interface <nombre>` | `nest g interface` | Genera una interfaz de TypeScript |
| `nest generate pipe <nombre>` | `nest g pi` | Genera un pipe (para validación/transformación de datos) |
| `nest generate guard <nombre>` | `nest g gu` | Genera un guard (para autenticación/autorización de rutas) |
| `nest generate interceptor <nombre>` | `nest g in` | Genera un interceptor |
| `nest generate filter <nombre>` | `nest g f` | Genera un filtro de excepciones |
| `nest build` | | Compila el proyecto a `dist/` (equivalente a `npm run build`) |
| `nest start` | | Levanta la aplicación (equivalente a `npm run start`) |
| `nest start --watch` | | Levanta la aplicación en modo watch (equivalente a `npm run start:dev`) |
| `nest info` | `nest i` | Muestra las versiones de Node, npm y de los paquetes `@nestjs/*` instalados |

> Tip: se puede indicar la carpeta destino del recurso generado, por ejemplo `nest g mo course` crea `src/course/course.module.ts`. Así es como se generó la estructura de `src/student/`.

## Endpoints disponibles

Con el prefijo global `api` (definido en `main.ts`) y el prefijo `student` del controlador, las rutas quedan bajo `/api/student`.

| Método | Ruta | Descripción | Body |
|---|---|---|---|
| `POST` | `/api/student` | Crea un estudiante | `{ "name": string, "age": number, "email": string, "isActive": boolean }` |

Ejemplo de request:

```bash
curl -X POST http://localhost:9000/api/student \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana Pérez","age":21,"email":"ana@example.com","isActive":true}'
```

Los endpoints de listar, obtener por id, actualizar y eliminar todavía no están implementados — son el siguiente paso del CRUD que se completará en clase.

## Puntos clave

Estos son los conceptos importantes que se están usando en este proyecto y que van a reutilizar durante el curso:

- **Módulos (`@Module`)**: Nest organiza la app en módulos. `AppModule` es el módulo raíz y va importando los módulos de cada feature (como `StudentModule`). Cada feature nueva del curso debe crear su propio módulo y registrarse en `imports` de `AppModule`.

- **Inyección de dependencias**: las clases marcadas con `@Injectable()` (como `CreateStudentUseCase`) se inyectan por constructor donde se necesiten (por ejemplo, en `StudentController`). Nest se encarga de crear e inyectar esas instancias, no hay que hacerlo a mano. Este proyecto también inyecta por **puerto** (una interfaz + un token, ver [`ARCHITECTURE.md`](./ARCHITECTURE.md)), no solo por clase concreta.

- **Conexión a PostgreSQL con TypeORM** (`src/app.module.ts`): `TypeOrmModule.forRoot()` configura la conexión leyendo las variables de entorno cargadas por `ConfigModule`. `autoLoadEntities: true` hace que TypeORM detecte automáticamente las entidades registradas en cada módulo, sin tener que listarlas todas a mano.

- **`synchronize: true`**: hace que TypeORM cree/actualice las tablas automáticamente a partir de las entidades, sin necesidad de escribir migraciones. Es muy cómodo para aprender y prototipar, **pero nunca debe usarse en producción** (puede borrar o alterar datos reales). El propio código lo marca con un comentario recordándolo.

- **`ValidationPipe` global** (`src/main.ts`): valida automáticamente el `body` de las peticiones contra los DTOs usando `class-validator`.
  - `whitelist: true`: elimina del `body` cualquier propiedad que no esté declarada en el DTO.
  - `forbidNonWhitelisted: true`: si llega una propiedad no declarada, la petición falla con un error 400 en lugar de ignorarla silenciosamente.

- **Prefijo global de rutas** (`app.setGlobalPrefix('api')` en `main.ts`): todas las rutas de la aplicación quedan bajo `/api`. Cada controlador agrega su propio prefijo encima (`@Controller('student')`), por eso la ruta final es `/api/student`. Al agregar nuevos módulos (por ejemplo `course`, `enrollment`) solo hace falta definir el `@Controller('course')` correspondiente; el `/api` ya queda cubierto por el prefijo global.

- **DTOs + `class-validator`/`class-transformer`**: los DTOs (`create-*.dto.ts`, `update-*.dto.ts`) son las clases que definen la forma y las reglas de validación de los datos que entran por la API. `CreateStudent` (`src/student/infrastructure/http/dto/create-student.dto.ts`) es el primer ejemplo: valida `name`, `age`, `email` e `isActive`. `@nestjs/mapped-types` (`PartialType`) permite crear el DTO de actualización reutilizando el de creación, sin duplicar campos — todavía no se ha creado ese `update-student.dto.ts`.

- **Entidades TypeORM** (`src/student/infrastructure/persistence/entities/student.orm-entity.ts`): la clase `StudentOrmEntity`, decorada con `@Entity('student')`, define la tabla `student` en la base de datos. Cada `@Column()` es una columna (`name`, `age`, `email` con `unique: true`, `isActive`, `nickname`). `@PrimaryGeneratedColumn("uuid")` hace que el `id` se genere automáticamente como UUID.

- **Lógica de negocio en el dominio, no en el ORM**: la construcción del `nickname` (antes en los hooks `@BeforeInsert`/`@BeforeUpdate` de la entidad TypeORM) ahora vive en `Student.create(...)` (`src/student/domain/entities/student.entity.ts`), la entidad de dominio. Es el mismo cálculo, solo que explícito y sin depender de que TypeORM decida cuándo ejecutarlo — ver [`ARCHITECTURE.md`](./ARCHITECTURE.md) para el porqué.

- **Repositorios con `TypeOrmModule.forFeature()` e `@InjectRepository()`**: `StudentModule` registra la entidad `StudentOrmEntity` con `TypeOrmModule.forFeature([StudentOrmEntity])`, lo que habilita inyectar su repositorio en `StudentTypeOrmRepository` con `@InjectRepository(StudentOrmEntity) private readonly ormRepository: Repository<StudentOrmEntity>`. El repositorio (`.save()`, etc.) es la forma estándar de leer/escribir en la base de datos con TypeORM dentro de Nest.

- **Endpoint de creación** (`StudentController.create` → `CreateStudentUseCase.execute`): el controlador recibe el `body` ya validado como `CreateStudent` y delega en el caso de uso, que arma la entidad de dominio con `Student.create(...)` y la persiste a través del puerto `StudentRepositoryPort`. Ver [Endpoints disponibles](#endpoints-disponibles) y [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## ⚠️ Cosas a revisar (para practicar debugging)

- En `src/app.module.ts`, la línea `port: +!process.env.DB_PORT` no calcula el puerto correctamente: el operador `!` niega el valor *antes* de convertirlo a número, por lo que el puerto configurado en `DB_PORT` nunca se usa como tal. Es un buen ejercicio identificar por qué y corregirlo (pista: comparar con cómo se leen las demás variables de entorno en el mismo bloque).

- En `src/student/application/use-cases/create-student.use-case.ts`, `execute` atrapa cualquier error al guardar y lanza un `NotFoundException`. Semánticamente no tiene sentido: "no encontrado" es un error de lectura (404), no de escritura. Si, por ejemplo, se repite un `email` (la columna es `unique`), el error real es un conflicto/dato inválido. Piensen qué excepción de Nest (`BadRequestException`, `ConflictException`, etc.) describe mejor cada caso de falla.

- En `src/student/domain/entities/student.entity.ts`, `buildNickname` arma el `nickname` con `name.toLowerCase().replace(" ", "_")`. `String.replace` con un string (no una expresión regular con `/g`) solo reemplaza la **primera** coincidencia, así que un nombre con varios espacios ("Ana María Pérez") no queda completamente convertido a `snake_case`. ¿Cómo lo arreglarían para que reemplace todos los espacios?

## Pruebas

```bash
# pruebas unitarias
npm run test

# pruebas end-to-end
npm run test:e2e

# cobertura
npm run test:cov
```

## Recursos del framework

- [Documentación de NestJS](https://docs.nestjs.com)
- [Documentación de TypeORM](https://typeorm.io)
- [class-validator](https://github.com/typestack/class-validator)
