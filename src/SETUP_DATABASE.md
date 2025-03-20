
# Database Setup Instructions

This application supports both local development with browser storage and connecting to a real backend database. Follow the instructions below to set up your preferred method.

## Option 1: Local Development (Default)

By default, the application uses browser localStorage as a database, which means:

- Data is stored only in the current browser
- Data will be lost if you clear browser storage
- You can't share data between different devices
- Perfect for development and testing

**No additional setup required for this option!**

## Option 2: Connect to a Real Database (Recommended for Production)

For a real production environment, you should set up a backend database. Here's how:

### Step 1: Set Up a Backend Server

You have several options:

A. **Firebase**
   1. Create a Firebase project at https://firebase.google.com/
   2. Set up Firebase Authentication and Firestore Database
   3. Create Firestore collections for `users` and `rooms`

B. **MongoDB Atlas**
   1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
   2. Set up a free cluster and create collections for `users` and `rooms`
   3. Set up a simple Express.js server to handle API requests

C. **Supabase**
   1. Create an account at https://supabase.com/
   2. Set up tables for users and rooms
   3. Configure authentication and row-level security

### Step 2: Create API Endpoints

Your backend should provide these REST API endpoints:

- Users:
  - GET `/users` - Get all users
  - GET `/users/:id` - Get user by ID
  - GET `/users/email/:email` - Get user by email
  - POST `/users` - Create user
  - PATCH `/users/:id` - Update user

- Rooms:
  - GET `/rooms` - Get all rooms
  - GET `/rooms/:id` - Get room by ID
  - GET `/rooms/invite/:code` - Get room by invite code
  - POST `/rooms` - Create room
  - PATCH `/rooms/:id` - Update room
  - DELETE `/rooms/:id` - Delete room
  - POST `/rooms/:id/users` - Add user to room

### Step 3: Update Database Configuration

1. Open `src/services/database.ts`
2. Change the `API_URL` to your backend URL:
   ```typescript
   private API_URL: string = 'https://your-backend-url.com/api';
   ```
3. Set `useLocalStorage` to `false` to use the real backend:
   ```typescript
   private useLocalStorage: boolean = false;
   ```

### Step 4: Add Authentication

For secure authentication, consider:

1. Implementing JWT authentication on your backend
2. Using OAuth providers like Google, GitHub, etc.
3. Storing tokens securely in the frontend
4. Setting up refresh token mechanism

## Option 3: Use a Backend-as-a-Service (BaaS)

If you don't want to set up your own backend server, consider using a Backend-as-a-Service:

- **Firebase**: Complete solution with authentication, database, and storage
- **Supabase**: Open-source Firebase alternative with PostgreSQL
- **AWS Amplify**: Full-stack solution with AWS services
- **Appwrite**: Open-source backend server

Each service has its own setup process, but most offer:
- User authentication
- Database functionality
- Storage for files
- Real-time data synchronization

## Database Schema

Your database should follow this basic schema:

**Users Collection/Table:**
```
{
  id: string (primary key),
  email: string (unique),
  name: string,
  role: enum ['user', 'moderator', 'admin'],
  password: string (hashed),
  createdAt: timestamp,
  lastLogin: timestamp,
  userAgent: string,
  ipAddress: string,
  isBanned: boolean,
  banExpiration: timestamp,
  bannedBy: string (user id),
  banReason: string
}
```

**Rooms Collection/Table:**
```
{
  id: string (primary key),
  name: string,
  videoId: string,
  users: array of user objects,
  createdBy: string (user id),
  isPrivate: boolean,
  inviteCode: string,
  createdAt: timestamp
}
```

## Security Considerations

When implementing your database solution:

1. **Never** store passwords as plain text - always hash them
2. Implement proper authentication and authorization
3. Use HTTPS for all API requests
4. Implement rate limiting to prevent abuse
5. Regularly back up your database
6. Set up proper security rules to protect user data

## Need Help?

If you need help setting up a specific database solution, consult the documentation for that service or reach out to the community.
