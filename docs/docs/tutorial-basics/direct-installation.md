---
sidebar_position: 3
---

# Direct Installation Guide

This guide will help you set up CueFlies directly on your local machine for development without using Docker.

## CueMeet Setup

Before proceeding with CueHired installation, you'll need to set up CueMeet first. Please follow the [CueMeet local setup guide](https://cuemeet.github.io/cuemeet-documentation/docs/local-setup) to install and configure CueMeet on your system.


## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- Yarn package manager
- PostgreSQL (latest version)
- Redis (latest version)
- Git

## Getting the Code

1. Clone the repository:
```bash
git clone <repository-url>
cd cuemeet/Apps/CueFlies
```

### Project Folder Structure

<details>
<summary>Click to expand folder structure</summary>
```
.
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── SECURITY.md
├── UPGRADE.md
├── backend/
│   ├── Dockerfile
│   ├── README.md
│   ├── dist/
│   ├── nest-cli.json
│   ├── package.json
│   ├── src/
│   ├── test/
│   ├── tsconfig.build.json
│   ├── tsconfig.json
│   ├── .gitignore
│   └── docker-compose.yml
├── docs/
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   ├── README.md
│   ├── .next/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.mjs
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   └── .gitignore
└── .git/
```
</details>

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
<details>
<summary>Click to view/copy Backend API .env configuration</summary>

```env
NODE_ENV=
PORT=

ORIGIN=

POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
POSTGRES_HOST=
POSTGRES_PORT=

REDIS_HOST=
REDIS_PORT=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

CUEMEET_BASE_URL=
```
⚠️ Important: The CueMeet-related environment variables must be obtained from the CueMeet Setup Guide. Complete the CueMeet setup first and copy the relevant values into this file.
</details>

4. Start the development server:
```bash
yarn start:dev
```

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
<details>
<summary>Click to view/copy Frontend .env configuration</summary>

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```
</details>

4. Start the development server:
```bash
yarn dev
```

## Verifying the Installation

1. Backend API should be running at: `http://localhost:8080`
2. Frontend application should be running at: `http://localhost:3000`

## Common Issues

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env` file
- Verify database port is not blocked

### Port Conflicts
- If port 8080 is in use, modify the backend port in `.env`
- If port 3000 is in use, modify the frontend port in the Next.js configuration

### Node Version Issues
- Use `nvm` to switch to the correct Node.js version
- Ensure you're using Node.js v18 or higher

### Redis Connection Issues
- Ensure Redis server is running
- Check Redis connection settings in `.env` file
- Verify Redis port is not blocked

### Google Calendar Integration
- Ensure Google OAuth credentials are properly configured
- Verify the redirect URI matches your Google Cloud Console settings
- Check that the required Google Calendar API scopes are enabled 