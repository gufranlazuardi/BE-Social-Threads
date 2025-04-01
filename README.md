# Social Threads API - Setup Instructions

This is a simple social media API built with Express.js, TypeScript, PostgreSQL, and Prisma. It includes authentication, user profiles, posts, comments, likes, and follows functionality.

## Installation

1. **Clone the repository** (or create the files as shown in the code examples)

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Rename the `.env.example` file to `.env`
   - Replace the `DATABASE_URL` with your PostgreSQL connection string
   - Update the `JWT_SECRET` with a secure random string

4. **Set up the database**
   ```bash
   # Initialize Prisma
   npx prisma generate

   # Run migrations
   npx prisma migrate dev --name init
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The server should now be running at http://localhost:3000.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (protected)
- `DELETE /api/users/:id` - Delete user (protected)

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get post by ID
- `GET /api/posts/user/:userId` - Get posts by user ID
- `POST /api/posts` - Create post (protected)
- `PUT /api/posts/:id` - Update post (protected)
- `DELETE /api/posts/:id` - Delete post (protected)

### Comments
- `GET /api/comments/post/:postId` - Get comments by post ID
- `POST /api/comments` - Create comment (protected)
- `PUT /api/comments/:id` - Update comment (protected)
- `DELETE /api/comments/:id` - Delete comment (protected)

### Likes
- `GET /api/likes/post/:postId` - Get likes by post ID
- `POST /api/likes` - Like a post (protected)
- `DELETE /api/likes/:postId` - Unlike a post (protected)

### Follows
- `GET /api/follows/followers/:userId` - Get followers of a user
- `GET /api/follows/following/:userId` - Get users that a user is following
- `POST /api/follows` - Follow a user (protected)
- `DELETE /api/follows/:userId` - Unfollow a user (protected)

## Example API Requests

### Register a new user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"user1","password":"password123","name":"John Doe"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Create a post (with authentication)
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"content":"This is my first post!"}'
```

### Get all posts
```bash
curl -X GET http://localhost:3000/api/posts
```
