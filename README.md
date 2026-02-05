# E-Commerce Backend Service

A production-ready, scalable e-commerce backend service built with **NestJS** framework, following enterprise-grade coding standards and best practices. This service demonstrates clean architecture, robust security implementation, and maintainable code patterns.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Design Patterns & Principles](#design-patterns--principles)
- [Features](#features)
- [API Documentation](#api-documentation)
- [Security Implementation](#security-implementation)
- [Error Handling Strategy](#error-handling-strategy)
- [Validation Layer](#validation-layer)
- [Database Design](#database-design)
- [Code Quality Standards](#code-quality-standards)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Testing](#testing)

---

## Architecture Overview

This service follows a **modular monolithic architecture** with clear separation of concerns, making it easy to scale horizontally or transition to microservices when needed.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Client Request                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Middleware Layer                                     │
│  ┌─────────────────────────┐    ┌─────────────────────────────────────────┐ │
│  │   Request Middleware    │───▶│        Auth Middleware                  │ │
│  │  • Request ID (ULID)    │    │  • JWT Token Verification               │ │
│  │  • Request Logging      │    │  • User Context Injection               │ │
│  │  • Timestamp Tracking   │    │  • Route Protection                     │ │
│  └─────────────────────────┘    └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Controller Layer                                     │
│  • Route Handling          • Request Validation        • Response Formatting │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Service Layer                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                    ResourceService<T> (Abstract Base)                   ││
│  │  • Generic CRUD Operations    • Lifecycle Hooks    • Error Handling     ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    │                                         │
│         ┌──────────────────────────┼──────────────────────────┐             │
│         ▼                          ▼                          ▼             │
│  ┌─────────────┐          ┌─────────────┐          ┌─────────────────┐     │
│  │ AuthService │          │ UserService │          │ ProductService  │     │
│  └─────────────┘          └─────────────┘          └─────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Data Access Layer                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                     Mongoose ODM + MongoDB                              ││
│  │  • Schema Definitions    • Connection Pooling    • Query Optimization   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **Request Middleware** → Generates unique request ID (ULID), logs request details
2. **Auth Middleware** → Validates JWT token, attaches user context (except public routes)
3. **Controller** → Receives validated request, delegates to service
4. **Service** → Executes business logic, interacts with database
5. **Exception Filter** → Catches and formats any errors with request tracing

---

## Tech Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| NestJS | 11.x | Progressive Node.js framework for scalable applications |
| TypeScript | 5.7.3 | Type-safe JavaScript with advanced features |
| Node.js | 18+ | JavaScript runtime |

### Database & ORM
| Technology | Version | Purpose |
|------------|---------|---------|
| MongoDB | Latest | NoSQL document database |
| Mongoose | 9.1.5 | Elegant MongoDB object modeling |
| @nestjs/mongoose | 11.0.4 | NestJS Mongoose integration |

### Authentication & Security
| Technology | Version | Purpose |
|------------|---------|---------|
| @nestjs/jwt | 11.0.2 | JWT token generation and verification |
| @nestjs/passport | 11.0.5 | Authentication middleware |
| Passport | 0.7.0 | Express-compatible authentication |
| passport-jwt | 4.0.1 | JWT strategy for Passport |
| bcrypt | 6.0.0 | Password hashing with salt rounds |

### Validation
| Technology | Version | Purpose |
|------------|---------|---------|
| class-validator | 0.14.3 | Decorator-based DTO validation |
| class-transformer | 0.5.1 | Object transformation and serialization |
| Joi | 18.0.2 | Powerful schema validation for complex rules |

### Logging & Utilities
| Technology | Version | Purpose |
|------------|---------|---------|
| Winston | 3.19.0 | Versatile logging with multiple transports |
| nest-winston | 1.10.2 | NestJS Winston integration |
| ULID | 3.0.2 | Lexicographically sortable unique identifiers |

### Development & Testing
| Technology | Version | Purpose |
|------------|---------|---------|
| Jest | 30.0.0 | Testing framework |
| Supertest | 7.0.0 | HTTP assertion library |
| ESLint | 9.18.0 | Code linting and style enforcement |
| Prettier | 3.4.2 | Opinionated code formatter |

---

## Project Structure

```
src/
├── main.ts                          # Application entry point with global configuration
├── app.module.ts                    # Root module - orchestrates all feature modules
│
├── config/                          # Configuration Layer
│   ├── ormconfig.ts                 # Database configuration with env validation
│   └── mongodb/
│       ├── mongodb.module.ts        # MongoDB module with provider registration
│       └── mongodb.provider.ts      # Connection factory with pool configuration
│
├── errors/                          # Custom Error Classes
│   └── resource-error.ts            # Domain-specific error types with HTTP mapping
│
├── filters/                         # Exception Filters
│   └── http-exception.filter.ts     # Global exception handler with standardized responses
│
├── middlewares/                     # Custom Middleware
│   ├── request.middleware.ts        # Request logging & tracing middleware
│   └── auth.middleware.ts           # JWT authentication middleware
│
├── modules/                         # Feature Modules (Domain-Driven)
│   │
│   ├── core/                        # Shared Core Module
│   │   ├── base.model.ts            # Base entity with common fields
│   │   ├── resource.service.ts      # Abstract generic CRUD service
│   │   └── json.ts                  # Type definitions
│   │
│   ├── auth/                        # Authentication Module
│   │   ├── auth.module.ts           # Module definition with JWT config
│   │   ├── auth.controller.ts       # Login/Register endpoints
│   │   ├── auth.service.ts          # Authentication business logic
│   │   └── auth.dto.ts              # Request/Response DTOs
│   │
│   ├── users/                       # User Management Module
│   │   ├── user.module.ts           # Module definition
│   │   ├── user.service.ts          # User CRUD operations
│   │   └── user.ts                  # User entity schema
│   │
│   └── products/                    # Product Catalog Module
│       ├── product.module.ts        # Module definition
│       ├── product.controller.ts    # Product CRUD endpoints
│       ├── product.service.ts       # Product business logic
│       ├── product.dto.ts           # Product DTOs with validation
│       └── product.ts               # Product entity schema
│
└── utils/                           # Utility Layer
    ├── constants.ts                 # Application-wide constants
    └── date-time-utils.ts           # Date formatting utilities
```

---

## Design Patterns & Principles

### 1. Generic Repository Pattern via ResourceService

The `ResourceService<T>` abstract class provides a robust foundation for all entity services, eliminating boilerplate while maintaining flexibility:

```typescript
// Abstract base class providing generic CRUD operations
export abstract class ResourceService<T extends BaseModel> {
  // Lifecycle hooks for customization
  protected async beforeCreate(resource: Partial<T>): Promise<Partial<T>>
  protected async afterCreate(resource: T): Promise<T>
  protected async beforeUpdate(id: string, input: Partial<T>, resource: T): Promise<void>
  protected async afterUpdate(oldId: string, oldResource: T, newResource: T, input: Partial<T>): Promise<T>

  // Generic operations
  async findResources(filters: object, options?: QueryOptions): Promise<T[]>
  async findResource(id: string, options?: QueryOptions): Promise<T>
  async create(resource: Partial<T>): Promise<T>
  async update(id: string, input: Partial<T>, resource: T): Promise<T>
  async countResources(filters: object): Promise<number>
}
```

**Benefits:**
- **DRY Principle**: Common CRUD logic written once
- **Consistency**: Uniform behavior across all entities
- **Extensibility**: Override hooks for entity-specific logic
- **Type Safety**: Full TypeScript generics support

### 2. Dependency Injection

Leveraging NestJS's powerful DI container for loose coupling and testability:

```typescript
// Custom providers for database models
{
  provide: 'USER_MODEL',
  useFactory: (connection: Connection) =>
    connection.model('users', UserSchema),
  inject: ['MONGO_DATABASE_CONNECTION']
}

// Service injection
@Injectable()
export class UserService extends ResourceService<User> {
  constructor(@Inject('USER_MODEL') private userModel: Model<User>) {
    super(userModel, 'User');
  }
}
```

### 3. DTO Pattern with Validation

Strict separation between API contracts and domain models:

```typescript
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
```

### 4. Middleware Chain Pattern

Sequential request processing with clear responsibilities:

```typescript
// Request flows through middleware chain
configure(consumer: MiddlewareConsumer) {
  consumer
    .apply(RequestMiddleware)
    .forRoutes('*')
    .apply(AuthMiddleware)
    .exclude(
      { path: 'auth/login', method: RequestMethod.POST },
      { path: 'auth/register', method: RequestMethod.POST }
    )
    .forRoutes('*');
}
```

### 5. Global Exception Filter Pattern

Centralized error handling with consistent response format:

```typescript
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Standardized error response with request tracing
    response.status(status).json({
      status: HTTP_RESPONSE_STATUS.FAILED,
      message: errorMessage
    });
  }
}
```

### 6. Soft Delete Pattern

Non-destructive deletion preserving data integrity:

```typescript
// BaseModel includes soft delete flag
deleted?: boolean;

// Queries automatically exclude deleted records
async findResources(filters) {
  return this.model.find({ ...filters, deleted: { $ne: true } });
}
```

---

## Features

### Authentication & Authorization
- JWT-based stateless authentication
- Secure password hashing with bcrypt (10 salt rounds)
- Token expiration management (24-hour validity)
- Protected route middleware with user context injection
- Public route exclusions for login/register

### Product Management
- Full CRUD operations for products
- Inventory management (quantity updates)
- Category organization
- Multiple image support
- SKU tracking
- Active/Inactive status management
- Soft delete implementation

### Request Processing
- Unique request ID generation (ULID format)
- Comprehensive request logging
- CORS support with credentials
- Cookie parsing middleware
- Global API versioning (`/v1`)

### Data Validation
- Dual-layer validation (class-validator + Joi)
- Field-level error messages
- Type coercion and transformation

---

## API Documentation

### Base URL
```
http://localhost:3000/v1
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Product Endpoints

> **Note:** All product endpoints require Bearer token authentication

#### Create Product
```http
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Wireless Headphones",
  "description": "Premium noise-cancelling headphones",
  "price": 199.99,
  "quantity": 50,
  "sku": "WH-001",
  "category": "Electronics",
  "images": ["https://example.com/img1.jpg"],
  "isActive": true
}
```

#### List Products
```http
GET /products?limit=10&skip=0&category=Electronics
Authorization: Bearer <token>
```

#### Get Product by ID
```http
GET /products/:id
Authorization: Bearer <token>
```

#### Update Product
```http
PATCH /products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 179.99,
  "description": "Updated description"
}
```

#### Update Inventory
```http
PATCH /products/:id/inventory
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 100
}
```

#### Delete Product (Soft Delete)
```http
DELETE /products/:id
Authorization: Bearer <token>
```

---

## Security Implementation

### Authentication Flow

```
┌──────────┐    ┌─────────────────┐    ┌──────────────┐    ┌──────────┐
│  Client  │───▶│ Auth Middleware │───▶│ JWT Service  │───▶│ Database │
└──────────┘    └─────────────────┘    └──────────────┘    └──────────┘
     │                  │                      │                 │
     │  Authorization   │                      │                 │
     │  Bearer <token>  │                      │                 │
     │─────────────────▶│                      │                 │
     │                  │   Verify Token       │                 │
     │                  │─────────────────────▶│                 │
     │                  │                      │                 │
     │                  │   Token Payload      │                 │
     │                  │◀─────────────────────│                 │
     │                  │                      │                 │
     │                  │          Find User by ID               │
     │                  │───────────────────────────────────────▶│
     │                  │                                        │
     │                  │              User Document              │
     │                  │◀───────────────────────────────────────│
     │                  │                      │                 │
     │ req.user = user  │                      │                 │
     │◀─────────────────│                      │                 │
```

### Security Measures

| Measure | Implementation |
|---------|----------------|
| Password Hashing | bcrypt with 10 salt rounds |
| Token Algorithm | HS256 (HMAC SHA-256) |
| Token Expiration | 24 hours |
| Token Storage | Client-side (stateless) |
| Route Protection | Middleware-based guards |
| Request Tracing | ULID for audit logging |

### Auth Middleware Implementation

```typescript
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    // 1. Extract Bearer token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    // 2. Verify token
    const token = authHeader.split(' ')[1];
    const payload = await this.jwtService.verifyAsync(token);

    // 3. Fetch and attach user
    const user = await this.userService.findResource(payload.sub);
    req['user'] = user;

    next();
  }
}
```

---

## Error Handling Strategy

### Custom Error Hierarchy

```typescript
// Base error with field-level details
class ResourceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errors?: Record<string, string[]>
  ) {}
}

// Specific error types
class NotFoundError extends ResourceError { statusCode = 404 }
class BadRequestError extends ResourceError { statusCode = 400 }
class UnauthorizedError extends ResourceError { statusCode = 401 }
class ForbiddenError extends ResourceError { statusCode = 403 }
class ConflictError extends ResourceError { statusCode = 409 }
class TooManyRequestError extends ResourceError { statusCode = 429 }
```

### Global Exception Filter

```typescript
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Extract request ID for tracing
    const requestId = request.headers['x-request-id'];

    // Determine status code
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Format error message with request ID
    const message = formatErrorMessage(exception, requestId);

    response.status(status).json({
      status: HTTP_RESPONSE_STATUS.FAILED,
      message
    });
  }
}
```

### Error Response Format

```json
{
  "status": "failed",
  "message": "Resource not found. Request ID: 01ARZ3NDEKTSV4RRFFQ69G5FAV"
}
```

### Validation Error Response

```json
{
  "status": "failed",
  "message": "Validation failed",
  "errors": {
    "email": ["email must be a valid email address"],
    "password": ["password must be at least 6 characters"]
  }
}
```

---

## Validation Layer

### Dual-Layer Validation Strategy

```
Request Body
     │
     ▼
┌─────────────────────────────────┐
│   Layer 1: class-validator      │  ◀── Decorator-based
│   • Type checking               │      (DTO level)
│   • Required fields             │
│   • Format validation           │
└─────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│   Layer 2: Joi Schema           │  ◀── Schema-based
│   • Complex business rules      │      (Service level)
│   • Cross-field validation      │
│   • Conditional requirements    │
└─────────────────────────────────┘
     │
     ▼
  Service Layer
```

### class-validator Decorators Used

```typescript
// Type Validation
@IsString()      // String type
@IsNumber()      // Numeric type
@IsBoolean()     // Boolean type
@IsArray()       // Array type
@IsEmail()       // Email format

// Presence Validation
@IsNotEmpty()    // Required field
@IsOptional()    // Optional field

// Value Validation
@Min(0)          // Minimum numeric value
@MinLength(6)    // Minimum string length
@IsString({ each: true })  // Array element validation
```

### Joi Schema Validation

```typescript
// In ResourceService
constructor(
  model: Model<T>,
  resourceName: string,
  schema?: Joi.ObjectSchema  // Optional Joi schema
) {
  this.joiSchema = schema;
}

async validateResource(resource: Partial<T>): Promise<void> {
  if (this.joiSchema) {
    const { error } = this.joiSchema.validate(resource, { abortEarly: false });
    if (error) {
      throw new ResourceError('Validation failed', 400, formatJoiErrors(error));
    }
  }
}
```

---

## Database Design

### Connection Configuration

```typescript
// mongodb.provider.ts
{
  provide: 'MONGO_DATABASE_CONNECTION',
  useFactory: async (): Promise<Connection> => {
    return mongoose.createConnection(process.env.MONGO_DB_URI, {
      dbName: process.env.MONGO_DB_NAME,
      maxPoolSize: parseInt(process.env.MONGO_DB_MAX_CONNECTIONS) || 15,
      minPoolSize: 1,
      socketTimeoutMS: 60000,
    });
  }
}
```

### Base Model Schema

All entities inherit from `BaseModel` ensuring consistency:

```typescript
export class BaseModel {
  _id?: string;           // MongoDB ObjectId
  id?: string;            // String representation (API-friendly)
  createdAt?: Date;       // Auto-set on creation
  updatedAt?: Date;       // Auto-set on updates
  deleted?: boolean;      // Soft delete flag
}
```

### Entity Schemas

#### User Schema
```typescript
@Schema({ timestamps: true })
export class User extends BaseModel {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;  // bcrypt hashed
}
```

#### Product Schema
```typescript
@Schema({ timestamps: true })
export class Product extends BaseModel {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 0 })
  quantity: number;

  @Prop()
  sku?: string;

  @Prop()
  category?: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: true })
  isActive: boolean;
}
```

### Query Patterns

```typescript
// Lean queries for performance (returns plain objects)
async findResources(filters: object): Promise<T[]> {
  return this.model
    .find({ ...filters, deleted: { $ne: true } })
    .lean()
    .exec();
}

// Pagination support
async findResources(filters: object, options?: QueryOptions): Promise<T[]> {
  return this.model
    .find(filters)
    .skip(options?.skip || 0)
    .limit(options?.limit || 10)
    .sort(options?.sort || { createdAt: -1 })
    .lean()
    .exec();
}
```

---

## Code Quality Standards

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "nodenext",
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### ESLint Rules

- Strict TypeScript rules enabled
- No unused variables
- Consistent code style
- Import ordering

### Prettier Configuration

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

### Coding Conventions

| Convention | Example |
|------------|---------|
| File naming | `kebab-case.ts` (e.g., `auth.middleware.ts`) |
| Class naming | `PascalCase` (e.g., `AuthService`) |
| Method naming | `camelCase` (e.g., `findResource`) |
| Constants | `SCREAMING_SNAKE_CASE` (e.g., `JWT_SECRET`) |
| DTOs | `<Action><Entity>Dto` (e.g., `CreateProductDto`) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 6.0+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd ecommerce-backend-service

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure environment variables
# Edit .env with your MongoDB URI and JWT secret
```

### Running the Application

```bash
# Development mode with hot reload
npm run start:dev

# Production build
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

---

## Environment Configuration

Create a `.env` file in the root directory:

```env
# MongoDB Configuration
MONGO_DB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net
MONGO_DB_NAME=ecommerce_app
MONGO_DB_MAX_CONNECTIONS=15

# JWT Configuration
JWT_SECRET=your-super-secure-secret-key-change-in-production

# Application
PORT=3000
NODE_ENV=development
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGO_DB_URI` | Yes | - | MongoDB connection string |
| `MONGO_DB_NAME` | Yes | - | Database name |
| `MONGO_DB_MAX_CONNECTIONS` | No | 15 | Connection pool size |
| `JWT_SECRET` | Yes | - | Secret for signing JWTs |
| `PORT` | No | 3000 | Application port |

---

## Testing

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Test Structure

```
test/
├── app.e2e-spec.ts          # End-to-end tests
└── jest-e2e.json            # E2E Jest configuration
```

