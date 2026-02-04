# Successlink Backend API

Backend server for Successlink AI Teaching Assistant with JWT authentication, SQLite database, and RESTful API.

## Quick Start

### 1. Install Dependencies

**Note**: If you encounter PowerShell execution policy errors, run this command first:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then install:
```bash
cd backend
npm install
```

### 2. Start the Server

```bash
npm start
```

Server will run on `http://localhost:3000`

## API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "teacher@example.com",
  "password": "password123",
  "name": "Nguyễn Văn A",
  "teaching_level": "elementary",
  "subject": "toan"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "teacher@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Lessons

#### Create Lesson (via AI Generation)
```http
POST /api/ai/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Phép cộng trong phạm vi 100",
  "content_types": ["slide", "quiz"]
}
```

#### Get All Lessons
```http
GET /api/lessons?page=1&limit=20
Authorization: Bearer <token>
```

#### Get Specific Lesson
```http
GET /api/lessons/:id
Authorization: Bearer <token>
```

#### Delete Lesson
```http
DELETE /api/lessons/:id
Authorization: Bearer <token>
```

## Database Schema

### Users Table
- `id`: INTEGER PRIMARY KEY
- `email`: TEXT UNIQUE
- `password`: TEXT (hashed)
- `name`: TEXT
- `teaching_level`: TEXT (elementary/middle/high)
- `subject`: TEXT
- `created_at`: DATETIME
- `updated_at`: DATETIME

### Lessons Table
- `id`: INTEGER PRIMARY KEY
- `user_id`: INTEGER (foreign key)
- `title`: TEXT
- `content_types`: TEXT (JSON array)
- `generated_content`: TEXT (JSON object)
- `created_at`: DATETIME
- `updated_at`: DATETIME
- `deleted_at`: DATETIME (soft delete)

## Environment Variables

Create `.env` file in backend directory:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DB_PATH=./database/successlink.db
```

## Testing with Postman/Thunder Client

1. **Register a user**: POST to `/api/auth/register`
2. **Copy the token** from response
3. **Use token** in Authorization header for protected routes
4. **Generate content**: POST to `/api/ai/generate` with token
5. **View lessons**: GET `/api/lessons` with token

## Frontend Integration

The frontend automatically uses the backend API when a user is authenticated. See `js/ai-service-backend.js` for implementation.

### Flow:
1. User completes onboarding (selects level & subject)
2. User registers/logs in
3. User creates lesson → calls `/api/ai/generate`
4. Content is generated and automatically saved to database
5. User can view saved lessons from `/api/lessons`

## Development

### Run with auto-reload:
```bash
npm run dev
```

### Database location:
```
backend/database/successlink.db
```

### Reset database:
Delete the database file and restart the server. Tables will be recreated automatically.

## Production Deployment

1. Change `JWT_SECRET` in `.env`
2. Update CORS origin in `server.js`
3. Use production database (PostgreSQL recommended)
4. Set `NODE_ENV=production`
5. Use process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name successlink-api
   ```

## Troubleshooting

### PowerShell Script Execution Error
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port 3000 already in use
Change `PORT` in `.env` file

### Database locked error
Close any database viewers and restart server

### CORS errors
Check CORS configuration in `server.js` matches your frontend URL
