# DevPulse

A modern issue tracking and management system built with Express.js and TypeScript. DevPulse enables teams to efficiently report, track, and manage issues with role-based access control and real-time updates.

## 🌐 Live URL

- **Production**: `https://dev-pulse-kappa-black.vercel.app/`

## ✨ Features

- **User Management**
  - User registration and authentication
  - Role-based access control (Contributor, Maintainer)
  - Secure password hashing with bcryptjs

- **Issue Tracking**
  - Create, read, update, and delete issues
  - Filter issues by type and status
  - Sort by newest or oldest
  - Issue status management (open, closed, etc.)

- **Authorization & Security**
  - JWT token-based authentication
  - Role-based permissions (Contributors, Maintainers)
  - Protected endpoints with middleware verification
  - Comprehensive error handling with detailed error messages

- **Error Handling**
  - Detailed error responses with context
  - Development mode stack traces
  - Validation error field information

## 🛠 Tech Stack

| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | Runtime environment | Latest |
| **Express.js** | Web framework | ^5.2.1 |
| **TypeScript** | Type-safe JavaScript | ^6.0.3 |
| **PostgreSQL** | Database | Latest |
| **JWT** | Authentication | ^9.0.3 |
| **bcryptjs** | Password hashing | ^3.0.3 |
| **CORS** | Cross-origin requests | ^2.8.6 |
| **TSX** | TypeScript executor | ^4.22.3 |
| **TSUP** | TypeScript bundler | ^8.5.1 |



## 📦 Setup & Installation

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (local or remote)
- npm or yarn

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/devpulse.git
   cd devpulse
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize Database**
   The database tables are automatically created on first run. Ensure your PostgreSQL connection string is correct in `.env`.

5. **Build the Project**
   ```bash
   npm run build
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`

7. **Start Production Server**
   ```bash
   npm start
   ```

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_CONNECTION_STRING=postgresql://user:password@localhost:5432/devpulse

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5000
```

## 📡 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth | Body |
|--------|----------|-------------|------|------|
| **POST** | `/api/auth/signup` | Register new user | ❌ | `{ name, email, password, role }` |
| **POST** | `/api/auth/login` | User login | ❌ | `{ email, password }` |

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "contributor"
    }
  }
}
```

---

### Issue Endpoints

| Method | Endpoint | Description | Auth | Access |
|--------|----------|-------------|------|--------|
| **GET** | `/api/issues` | Get all issues (filtered & sorted) | ❌ | Public |
| **GET** | `/api/issues/:id` | Get single issue by ID | ❌ | Public |
| **POST** | `/api/issues` | Create new issue | ✅ | Any authenticated user |
| **PATCH** | `/api/issues/:id` | Update issue | ✅ | Maintainer or Issue Reporter |
| **DELETE** | `/api/issues/:id` | Delete issue | ✅ | Maintainer only |

#### GET /api/issues
**Query Parameters:**
- `sort`: `newest` (default) or `oldest`
- `type`: Filter by issue type (e.g., `bug`, `feature`)
- `status`: Filter by status (e.g., `open`, `closed`)

**Example:**
```bash
GET /api/issues?sort=oldest&type=bug&status=open
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Login button not working",
      "description": "The login button on the homepage is not clickable...",
      "type": "bug",
      "status": "open",
      "reporter": {
        "id": 2,
        "name": "Alice Smith",
        "role": "contributor"
      },
      "created_at": "2024-05-20T10:30:00Z",
      "updated_at": "2024-05-20T10:30:00Z"
    }
  ]
}
```

---

#### GET /api/issues/:id
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Login button not working",
    "description": "The login button on the homepage is not clickable...",
    "type": "bug",
    "status": "open",
    "reporter": {
      "id": 2,
      "name": "Alice Smith",
      "role": "contributor"
    },
    "created_at": "2024-05-20T10:30:00Z",
    "updated_at": "2024-05-20T10:30:00Z"
  }
}
```

---

#### POST /api/issues
**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Login button not working",
  "description": "The login button on the homepage is not clickable when hovering...",
  "type": "bug",
  "status": "open"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Issue created successfully",
  "data": {
    "id": 1,
    "title": "Login button not working",
    "description": "The login button on the homepage is not clickable...",
    "type": "bug",
    "status": "open",
    "reporter_id": 2,
    "created_at": "2024-05-20T10:30:00Z",
    "updated_at": "2024-05-20T10:30:00Z"
  }
}
```

---

#### PATCH /api/issues/:id
**Access Control:**
- **Maintainers**: Can update any issue
- **Contributors**: Can only update their own issues with "open" status

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description...",
  "type": "feature"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Issue updated successfully",
  "data": {
    "id": 1,
    "title": "Updated title",
    "description": "Updated description...",
    "type": "feature",
    "status": "open",
    "reporter": { ... },
    "created_at": "2024-05-20T10:30:00Z",
    "updated_at": "2024-05-20T15:45:00Z"
  }
}
```

---

#### DELETE /api/issues/:id
**Access Control:**
- **Maintainers Only**: Can delete issues

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Issue deleted successfully"
}
```

---

## 🗄️ Database Schema

### Users Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique user identifier |
| `name` | VARCHAR(20) | NOT NULL | User full name |
| `email` | VARCHAR(50) | UNIQUE, NOT NULL | User email address |
| `password` | TEXT | NOT NULL | Hashed password |
| `role` | VARCHAR(20) | DEFAULT 'contributor' | User role (contributor/maintainer) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

### Issues Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique issue identifier |
| `title` | VARCHAR(150) | NOT NULL, CHECK length ≤ 150 | Issue title |
| `description` | TEXT | NOT NULL, CHECK length ≥ 20 | Issue detailed description |
| `type` | VARCHAR(20) | NOT NULL | Issue type (bug, feature, etc.) |
| `status` | VARCHAR(20) | DEFAULT 'open' | Issue status (open, closed, etc.) |
| `reporter_id` | INTEGER | FOREIGN KEY → users(id) | User who reported the issue |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Issue creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

### Entity Relationship

```
Users (1) ──────── (N) Issues
  id                 reporter_id (FK)
```

---

## 💻 Usage Examples

### Example 1: User Registration and Login

```bash
# Sign up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123",
    "role": "contributor"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

### Example 2: Create an Issue

```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Dashboard loads slowly",
    "description": "The dashboard takes more than 5 seconds to load completely...",
    "type": "bug"
  }'
```

### Example 3: Get Filtered Issues

```bash
# Get open bugs sorted by oldest
curl "http://localhost:5000/api/issues?type=bug&status=open&sort=oldest"

# Get feature requests sorted by newest
curl "http://localhost:5000/api/issues?type=feature&sort=newest"
```

### Example 4: Update an Issue (as Maintainer)

```bash
curl -X PATCH http://localhost:5000/api/issues/1 \
  -H "Authorization: Bearer MAINTAINER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "closed",
    "description": "Fixed in version 2.1.0"
  }'
```

### Example 5: Delete an Issue (Maintainer Only)

```bash
curl -X DELETE http://localhost:5000/api/issues/1 \
  -H "Authorization: Bearer MAINTAINER_TOKEN"
```

---

## 🔐 Authentication

### JWT Token Structure

Tokens are issued upon successful login and must be included in all protected endpoints:

```
Authorization: Bearer <JWT_TOKEN>
```

### Role-Based Permissions

| Action | Contributor | Maintainer |
|--------|-------------|-----------|
| View Issues | ✅ | ✅ |
| Create Issue | ✅ | ✅ |
| Update Own Issue (open) | ✅ | ❌ |
| Update Any Issue | ❌ | ✅ |
| Delete Issue | ❌ | ✅ |

---

## 📁 Project Structure

```
devpulse/
├── src/
│   ├── app.ts                      # Express app configuration
│   ├── server.ts                   # Server entry point
│   ├── config/
│   │   └── index.ts                # Configuration management
│   ├── db/
│   │   └── index.ts                # Database initialization & pool
│   ├── middlewares/
│   │   └── auth.middleware.ts      # JWT verification middleware
│   └── modules/
│       ├── auth/
│       │   ├── auth.controllers.ts # Authentication logic
│       │   └── auth.service.ts     # Authentication service
│       ├── user/
│       │   ├── user.controllers.ts # User management logic
│       │   ├── user.interface.ts   # User types
│       │   ├── user.route.ts       # User routes
│       │   └── user.service.ts     # User service
│       └── issue/
│           ├── issue.controller.ts # Issue handlers
│           ├── issue.route.ts      # Issue routes
│           └── issue.service.ts    # Issue database operations
├── dist/                           # Compiled JavaScript
├── package.json                    # Project dependencies
├── tsconfig.json                   # TypeScript configuration
├── .env                           # Environment variables
└── README.md                       # This file
```

---

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

```bash
npm run build
vercel --prod
```

---

## 🐛 Error Handling

All API errors return a consistent format:

```json
{
  "success": false,
  "message": "User-friendly error message",
  "errors": {
    "details": "Detailed error explanation",
    "fields": ["field1", "field2"],
    "stack": "Stack trace (development only)"
  }
}
```

**Example Error Responses:**
- `400 Bad Request`: Missing or invalid fields
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource doesn't exist
- `500 Server Error`: Internal server error

---

## 📝 Scripts

```bash
# Development with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run tests (if configured)
npm test
```

---

## 📄 License

ISC License - See LICENSE file for details

---

## 👨‍💻 Author

**Tonmoy** - [GitHub Profile](https://github.com/yourusername)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## ❓ Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review API endpoint examples above

---

**Last Updated**: May 2024
