# AssignmentDeployWebApp

Group Assignment 4: building and securing a tested REST API, adding authentication, and deploying the app online.

This repository contains a full-stack Gym Review application. Public visitors can browse gyms and reviews. Authenticated users can sign in with Auth0, view their profile, create gym listings, create reviews, and delete gyms.

## Public Website

The deployed public website is here:

```text
https://assignmentdeploywebapp-frontend.onrender.com
```

The deployed backend API is here:

```text
https://assignmentdeploywebapp-backend-qvcj.onrender.com
```

The frontend automatically uses the local API at `http://localhost:3000` when opened from `localhost` or `127.0.0.1`. In production it uses `VITE_API_BASE_URL` when that variable is set, otherwise it falls back to the deployed Render backend URL above.

## How The App Works

The app is split into two services:

- `frontend`: a React and Vite single page app.
- `backend`: an Express REST API using Prisma and SQLite.

The main browser routes are:

| Route | Purpose | Access |
| --- | --- | --- |
| `/login` | Sign in page with Auth0 login link | Public |
| `/gyms` | Gym directory with reviews and average ratings | Public |
| `/profile` | Authenticated user dashboard | Protected |
| `/gyms/new` | Form for adding a gym | Protected |
| `/reviews/new` | Form for adding a review to an existing gym | Protected |

The root route `/` redirects to `/login`.

## Request Flow

1. The React frontend calls the API using `frontend/src/config.ts`.
2. Public data is loaded from `GET /gyms` and `GET /gyms/:id`.
3. Login and logout links send the browser to the backend `/login` and `/logout` routes.
4. The backend uses `express-openid-connect` to handle Auth0 login, callback, logout, and session cookies.
5. The frontend checks the session by calling `GET /profile` with `credentials: "include"`.
6. Protected API routes use `requiresAuth()` and return `401 Unauthorized` when there is no valid session.

## API Routes

| Method | Route | Purpose | Access |
| --- | --- | --- | --- |
| `GET` | `/ping` | Health check | Public |
| `GET` | `/gyms` | List gyms with reviews | Public |
| `GET` | `/gyms/:id` | Get one gym with reviews | Public |
| `POST` | `/gyms` | Create a gym | Protected |
| `DELETE` | `/gyms/:id` | Delete a gym | Protected |
| `POST` | `/gyms/:id/reviews` | Create a review for a gym | Protected |
| `GET` | `/profile` | Return Auth0 user profile | Protected |

## Data Model

The database has two main models:

- `Gym`: `id`, `name`, `location`, `createdAt`
- `Review`: `id`, `rating`, `comment`, `gymId`, `createdAt`

Reviews belong to gyms. If a gym is deleted, its reviews are deleted too.

The seed script creates starter gyms when the database is empty:

- Iron House Gym in Stockholm
- Nordic Fitness in Goteborg

## Local Setup

Clone the repository:

```bash
git clone https://github.com/ViktorOlausson/AssignmentDeployWebApp.git
cd AssignmentDeployWebApp
```

The setup commands below assume you are starting from the project root.

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

Create a backend `.env` file:

```bash
cd backend
cp .env.example .env
```

Required backend environment variables:

```env
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
DATABASE_URL="file:./dev.db"

AUTH0_SECRET=replace_me
AUTH0_BASE_URL=http://localhost:3000
AUTH0_CLIENT_ID=replace_me
AUTH0_ISSUER_BASE_URL=https://your-domain.eu.auth0.com
AUTH0_CLIENT_SECRET=replace_me_optional
```

Do not commit real `.env` values or Auth0 secrets.

Generate Prisma files, run migrations, and seed the database:

```bash
cd backend
npx prisma generate
npm run prisma:migrate
npm run prisma:seed
```

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

Open the local app:

```text
http://localhost:5173
```

## Auth0 Settings

For local development, configure the Auth0 application with these URLs:

```text
Allowed Callback URLs:
http://localhost:3000/callback

Allowed Logout URLs:
http://localhost:5173/login

Allowed Web Origins:
http://localhost:5173

Allowed Origins (CORS):
http://localhost:5173
```

For production, add the deployed frontend and backend URLs as well:

```text
Allowed Callback URLs:
https://assignmentdeploywebapp-backend-qvcj.onrender.com/callback

Allowed Logout URLs:
https://assignmentdeploywebapp-frontend.onrender.com/login

Allowed Web Origins:
https://assignmentdeploywebapp-frontend.onrender.com

Allowed Origins (CORS):
https://assignmentdeploywebapp-frontend.onrender.com
```

The backend `AUTH0_BASE_URL` should match the backend origin. The backend `FRONTEND_ORIGIN` should match the frontend origin.

## Docker Setup

From the project root, run:

```bash
docker compose up --build
```

Docker starts:

- backend on `http://localhost:3000`
- frontend on `http://localhost:5173`

Open:

```text
http://localhost:5173
```

Check running containers:

```bash
docker ps
```

## Testing

Run backend tests:

```bash
cd backend
npm test
```

The project uses Vitest for unit and integration tests. Tests use a separate SQLite database file, `backend/test.db`, so local development data in `backend/dev.db` is not reset.

Integration tests cover public gym endpoints and protected route behavior, including `401 Unauthorized` responses when logged out.

## Security Decisions

- Real secrets are kept in `.env`, which is ignored by Git.
- `.env.example` documents required configuration without exposing secrets.
- CORS is restricted to `FRONTEND_ORIGIN` and supports credentials for session cookies.
- Auth0 tokens are not stored in `localStorage`.
- Authenticated frontend requests use `credentials: "include"`.
- Protected routes use `requiresAuth()` with `errorOnRequiredAuth: true`, so unauthenticated API requests return `401 Unauthorized`.

## Project Structure

```text
AssignmentDeployWebApp/
  backend/
    prisma/
    src/
    __tests__/
    .env.example
    package.json
  frontend/
    src/
    nginx.conf
    package.json
  docker-compose.yml
  README.md
```
