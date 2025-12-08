# Car2nd Project

This project contains a full-stack application with:
- **Backend:** ElysiaJS (running on Bun)
- **Frontend:** Next.js 16.0.7

## Prerequisites

- [Bun](https://bun.sh) (v1.0+)
- [Node.js](https://nodejs.org) (v18+)

## Getting Started

1. Install dependencies (if not already done during creation):
   ```bash
   # Root dependencies
   npm install

   # Backend dependencies
   cd backend && bun install

   # Frontend dependencies
   cd frontend && npm install
   ```

2. Run the development server:
   ```bash
   # From the root directory
   npm run dev
   ```

   This will start:
   - Backend at [http://localhost:8000](http://localhost:8000)
   - Frontend at [http://localhost:3000](http://localhost:3000)

## Project Structure

- `/backend` - ElysiaJS API server
- `/frontend` - Next.js 16 App Router application
