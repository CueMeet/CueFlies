---
sidebar_position: 3
---

# Direct Installation

Set up CueCal directly on your local machine for more control over the configuration and services.

## Prerequisites
- Node.js (v18 or higher) and npm installed
- PostgreSQL (v15) installed and running
- Redis (v7) installed and running
- Basic command line knowledge

## Project Structure
The application consists of two main components:
- Frontend (Next.js) - Runs on port 3000
- Backend (NestJS) - Runs on port 8000

## Setup Steps

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd <your-repo-directory>
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the backend directory with the following variables:
   ```env
   NODE_ENV=development
   PORT=8000
   ORIGIN=http://localhost:3000
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=cue-calender
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5433
   REDIS_HOST=localhost
   REDIS_PORT=6379
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/google/callback
   ```

4. Start the backend server:
   - For development with hot-reload:
     ```bash
     npm run start:dev
     ```
   - For production:
     ```bash
     npm run build
     npm run start:prod
     ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env.local` file in the frontend directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

### 4. Access the Application
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: http://localhost:8000

## Additional Information
- The backend uses NestJS with GraphQL for the API
- The frontend is built with Next.js and uses Apollo Client for GraphQL
- PostgreSQL is used as the main database
- Redis is used for caching and session management
- Google OAuth is required for authentication

For more detailed configuration or troubleshooting, see the README in each directory or contact support. 