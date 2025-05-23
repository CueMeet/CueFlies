---
sidebar_position: 1
---

# Introduction

Welcome to CueCal Documentation! CueCal is a modern calendar integration and meeting management platform designed to streamline your meeting experience with AI-powered note-taking and analytics.

## What is CueCal?

CueCal is a comprehensive calendar platform that helps users manage their meetings efficiently. It provides features for Google Calendar integration, meeting management, automated note-taking, and meeting analytics.

## Key Features

- **Calendar Integration**: Seamless integration with Google Calendar for automatic meeting tracking
- **Multi-Platform Support**: Works with Google Meet, Microsoft Teams, and Zoom meetings
- **Smart Notes**: Automatically generated meeting summaries, transcriptions, and action items
- **Meeting Analytics**: Track meeting participation and engagement metrics
- **Modern Tech Stack**: Built with NestJS (Backend) and React (Frontend)

## System Architecture

CueCal consists of two main components:

### Backend (NestJS)
- RESTful API architecture
- Modular design with separate modules for:
  - Authentication (Google OAuth)
  - Calendar Management
  - Meeting Management
  - CueMeet Integration
- TypeScript-based development
- PostgreSQL database
- Redis for caching
- Bull queue for background jobs

### Frontend (React)
- Modern React application with TypeScript
- Responsive UI using Tailwind CSS
- Component-based architecture
- Vite for fast development and building

## Getting Started

To get started with CueCal, you can:

1. Check out the [Installation Guide](./tutorial-basics/installation)

## Development

The project uses Docker for containerization, making it easy to set up and run locally. For detailed instructions on setting up your development environment, please refer to the [Installation Guide](./tutorial-basics/installation).

## Contributing

We welcome contributions! Please check back soon for our contributing guidelines.
