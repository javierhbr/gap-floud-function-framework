# GCP Functions Framework Middleware System

A powerful and flexible middleware system for Google Cloud Functions that supports both HTTP and Pub/Sub triggers. This framework provides a clean, type-safe way to handle requests, validate data, manage authentication, and standardize responses.

## Core Concepts

### Handler

The `Handler` class is the core of the framework. It manages the middleware chain and executes your business logic. Each handler instance can have multiple middlewares and one main handler function.

### Middleware

Middlewares are reusable pieces of logic that run before/after your main handler. They can:

- Modify the request/response objects
- Perform validation
- Handle authentication
- Process errors
- And more...

### Context

The context object is passed through the entire middleware chain and contains all request-related data:

```typescript
interface Context {
  req: CustomRequest; // Extended request with additional properties
  res: CustomResponse; // Extended response with additional methods
  container?: Container; // Dependency injection container
  error: Error | null; // Holds any errors that occur
  businessData: Map<string, unknown>; // Store data between middlewares
  user?: unknown; // Authenticated user information
}
```

## Getting Started

### 1. HTTP Function Example

```typescript
import { Handler } from '@core/handler';
import {
  bodyParser,
  bodyValidator,
  authentication,
  errorHandler,
  responseWrapper,
} from '@framework/middlewares';
import { z } from 'zod';
import { verifyToken } from '@utils/auth';

// 1. Define your request schema using Zod
const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18),
});

// 2. Create and configure your handler
export const createUser = new Handler()
  // Add middlewares in the order they should execute
  .use(errorHandler()) // Always add error handler first
  .use(bodyParser()) // Parse incoming JSON
  .use(bodyValidator(userSchema)) // Validate request body
  .use(authentication(verifyToken)) // Verify JWT token
  .use(responseWrapper()) // Standardize response format
  .handle(async (context) => {
    // Access validated data and user information
    const { validatedBody, user } = context.req;

    // Your business logic here
    const newUser = await createUserInDatabase(validatedBody);

    // Send response
    context.res.json({
      userId: newUser.id,
      message: 'User created successfully',
    });
  });
```

### 2. Pub/Sub Function Example

```typescript
import { Handler } from '@core/handler';
import { bodyParser, bodyValidator, errorHandler } from '@framework/middlewares';
import { z } from 'zod';

// 1. Define your message schema
const messageSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(['CREATE', 'UPDATE', 'DELETE']),
  payload: z.record(z.unknown()),
});

// 2. Create your Pub/Sub handler
export const processPubSubMessage = new Handler()
  .use(errorHandler())
  .use(bodyParser()) // Will decode base64 Pub/Sub message
  .use(bodyValidator(messageSchema))
  .handle(async (context) => {
    const { validatedBody } = context.req;

    // Process the message based on action
    switch (validatedBody.action) {
      case 'CREATE':
        await handleCreateAction(validatedBody.payload);
        break;
      // ... handle other actions
    }
  });
```

## Available Middlewares

### 1. Body Parser Middleware

Automatically parses:

- JSON request bodies for HTTP functions
- Base64-encoded Pub/Sub messages

```typescript
.use(bodyParser())
```

### 2. Body Validation Middleware

Type-safe request validation using Zod schemas:

```typescript
const schema = z.object({
  name: z.string(),
  age: z.number(),
});
.use(bodyValidator(schema))
```

### 3. Authentication Middleware

JWT token validation and user context injection:

```typescript
.use(authentication(verifyToken))
```

### 4. Header Variables Middleware

Ensure required headers are present:

```typescript
.use(headerVariables(['x-api-key', 'correlation-id']))
```

### 5. Path Parameters Middleware

Extract URL parameters:

```typescript
// URL: /users/:userId/posts/:postId
.use(pathParameters())
// Access via: context.req.params.userId
```

### 6. Query Parameters Middleware

Process and validate query strings:

```typescript
.use(queryParameters(['page', 'limit']))
```

### 7. Response Wrapper Middleware

Standardizes all responses:

```typescript
.use(responseWrapper())

// Output format:
{
  "success": true,
  "statusCode": 200,
  "data": { /* your response data */ },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 8. Error Handler Middleware

Consistent error handling:

```typescript
.use(errorHandler())

// Usage in your code:
throw new HttpError(400, 'Invalid input');
throw new ValidationError('Email is required');
throw new AuthenticationError();
```

## Error Handling

The framework provides built-in error classes:

```typescript
// Basic HTTP error
throw new HttpError(statusCode, message, code?, details?);

// Validation error (400 Bad Request)
throw new ValidationError(message, details?);

// Authentication error (401 Unauthorized)
throw new AuthenticationError(message?);
```

## Deployment

### HTTP Function

```bash
gcloud functions deploy your-function \
  --runtime nodejs18 \
  --trigger-http \
  --entry-point yourFunction \
  --allow-unauthenticated  # If public access is needed
```

### Pub/Sub Function

```bash
# 1. Create a Pub/Sub topic
gcloud pubsub topics create your-topic

# 2. Deploy the function
gcloud functions deploy your-pubsub-function \
  --runtime nodejs18 \
  --trigger-topic your-topic \
  --entry-point yourPubSubFunction
```

## Best Practices

1. Always add `errorHandler()` as the first middleware
2. Use `bodyParser()` before `bodyValidator()`
3. Add `authentication()` before accessing user context
4. Place `responseWrapper()` last in the chain
5. Use TypeScript interfaces for better type safety
6. Implement proper error handling in your business logic
7. Use environment variables for sensitive configuration

## TypeScript Support

The framework is built with TypeScript and provides full type safety. Use the provided interfaces and types for better development experience:

```typescript
import { Context, CustomRequest, CustomResponse } from '@framework/middlewares/base/Middleware';
import { BaseMiddleware } from '../../core/handler';
```
