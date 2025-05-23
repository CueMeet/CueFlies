---
sidebar_position: 2
---

# Docker Installation

Get started quickly with our Docker-based installation, which provides a consistent development environment with all services pre-configured.

## Prerequisites
- Docker and Docker Compose installed on your machine
- Basic command line knowledge

## Services Overview
The application consists of the following services:
- Frontend (Next.js) - Runs on port 3000
- Backend (Node.js) - Runs on port 8080
- PostgreSQL (Database) - Runs on port 5433
- Redis (Cache) - Runs on port 6379

## Setup Steps

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd <your-repo-directory>
   ```

2. Configure Environment Variables:
   - The backend service requires Google OAuth credentials
   - Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in the docker-compose.yml file
   - Default database credentials are:
     - Username: postgres
     - Password: postgres
     - Database: cue-calender

3. Start the services using Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. Access the services:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: http://localhost:8080
   - PostgreSQL: localhost:5433
   - Redis: localhost:6379

## Service Details

### Frontend
- Next.js application
- Connected to backend service
- Environment variables:
  - NODE_ENV=development
  - NEXT_PUBLIC_API_URL=http://backend:8080

### Backend
- Node.js application
- Connected to PostgreSQL and Redis
- Environment variables:
  - NODE_ENV=development
  - PORT=8080
  - ORIGIN=http://localhost:3000
  - Database and Redis configurations are pre-set

### Database (PostgreSQL)
- Version: 15-alpine
- Persistent storage using Docker volumes
- Health checks enabled
- Default credentials are set in the configuration

### Redis
- Version: 7-alpine
- Persistent storage using Docker volumes
- Health checks enabled
- Append-only mode enabled for data persistence

## Troubleshooting
- All services have health checks configured
- Check service logs using: `docker-compose logs <service-name>`
- Ensure all required ports are available on your machine
- For database issues, check the PostgreSQL logs: `docker-compose logs postgres`

For more detailed configuration or support, please refer to the README or contact the development team. 