---
sidebar_position: 2
---

# Getting Started

This guide will help you get CueCal up and running on your system.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- Docker and Docker Compose
- Git
- Yarn package manager

## Installation

### Option 1: Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/CueMeet/CueCal.git
   cd cuecal
   ```

2. Start the application using Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Access the application at `http://localhost:3000`

### Option 2: Manual Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/CueMeet/CueCal.git
   cd cuecal
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   yarn install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   yarn install
   ```

4. Start the development servers:

   In the backend directory:
   ```bash
   yarn dev
   ```

   In the frontend directory:
   ```bash
   yarn dev
   ```

## Initial Setup

1. Create your account:
   - Visit the registration page
   - Fill in your details
   - Verify your email address

2. Configure your profile:
   - Add your profile picture
   - Set your timezone
   - Configure notification preferences

3. Set up your calendar:
   - Import existing calendars (Google, Outlook, etc.)
   - Create your first event
   - Set your availability

## Configure Environment Variables

Details Click to view/copy Backend API .env configuration

```env
# Backend API Configuration
PORT=
NODE_ENV=
ORIGIN=

# Database
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=cue-
POSTGRES_HOST=
POSTGRES_PORT=
POSTGRES_CA_CERT=

# Redis
REDIS_HOST=
REDIS_PORT=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
GOOGLE_CALENDER_WEBHOOK_URL=

# JWT
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=3hr
JWT_REFRESH_EXPIRES_IN=30d

# CueMeet Integration
CUEMEET_BASE_URL=
```

Details Click to view/copy Frontend .env configuration

```env
# Frontend Environment Variables
NEXT_PUBLIC_GOOGLE_AUTH_URL=
NEXT_PUBLIC_GRAPHQL_URL=
```


## Next Steps

- [Learn about basic features](/guide/basic-features)
