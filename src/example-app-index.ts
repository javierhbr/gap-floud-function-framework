import * as functions from '@google-cloud/functions-framework';
import express from 'express';
import { Request, Response } from 'express';

// Define interfaces for our data structures
interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
}

interface UpdateUserRequest {
  name?: string;
  email?: string;
  age?: number;
}

// Create an express app
const app = express();
app.use(express.json());

// GET endpoint with query parameters
// Example: /api/users?age=25&active=true
app.get('/api/users', (req: Request, res: Response) => {
  const { age, active } = req.query;

  console.log(`Fetching users with filters - age: ${age}, active: ${active}`);

  // Here you would typically query your database
  // This is just an example response
  const users: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      age: Number(age) || 30,
    },
  ];

  res.status(200).json({
    success: true,
    data: users,
    filters: { age, active },
  });
});

// GET endpoint with path parameter
// Example: /api/users/123
app.get('/api/users/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;

  console.log(`Fetching user with ID: ${userId}`);

  // Here you would typically query your database
  const user: User = {
    id: userId,
    name: 'John Doe',
    email: 'john@example.com',
  };

  res.status(200).json({
    success: true,
    data: user,
  });
});

// POST endpoint with request body
// Example: POST /api/users
app.post('/api/users', (req: Request, res: Response) => {
  const newUser: User = req.body;

  // Validate required fields
  if (!newUser.name || !newUser.email) {
    return res.status(400).json({
      success: false,
      error: 'Name and email are required fields',
    });
  }

  console.log('Creating new user:', newUser);

  // Here you would typically save to your database
  // For this example, we'll just return the created user with an ID
  const createdUser: User = {
    ...newUser,
    id: Math.random().toString(36).substring(7),
  };

  return res.status(201).json({
    success: true,
    data: createdUser,
  });
});

// PUT endpoint with path parameter and request body
// Example: PUT /api/users/123
app.put('/api/users/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const updates: UpdateUserRequest = req.body;

  console.log(`Updating user ${userId} with:`, updates);

  // Here you would typically update your database
  // For this example, we'll just return the updated user
  const updatedUser: User = {
    id: userId,
    name: updates.name || 'John Doe',
    email: updates.email || 'john@example.com',
    age: updates.age,
  };

  res.status(200).json({
    success: true,
    data: updatedUser,
  });
});

// Export the function
exports.userApi = functions.http('userApi', app);
