# AssignmentDeployWebApp

Group Assignment 4: Building and securing a tested REST API and deploy online.

This project is a small full-stack Gym Review application with a tested REST API, Auth0 authentication, protected routes, and a React frontend.

## Setup

### Clone the repository

```bash
git clone https://github.com/ViktorOlausson/AssignmentTestsAndSecureAPI.git
cd AssignmentTestsAndSecureAPI
```

### Install dependencies

Install backend dependencies:
```bash
cd backend
npm install
```

Install batabase dependencies:
```bash
cd backend
npx prisma generate
npx prisma db push # setup db file 'dev.db'
```

Install client dependencies:
```bash
cd ../client
npm install
```

### Configure environment variables

Create a backend `.env` file from the example:
```bash
cd backend
cp .env.example .env
```

The backend needs these values:

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

### Auth0 application settings

In the Auth0 dashboard, configure the application with:

```text
Allowed Callback URLs:
http://localhost:3000/callback, http://localhost:5173/callback, http://localhost:5173/login

Allowed Logout URLs:
http://localhost:5173/login

Allowed Web Origins:
http://localhost:5173/login

Allowed Origins(CORS):
http://localhost:5173, http://localhost:5173/login


```

### Database setup

Run Prisma migration and seed data:

```bash
cd backend
npm run prisma:migrate
npm run prisma:seed
```

### Run locally

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd client
npm run dev
```

Open:
```text
http://localhost:5173
```

## API Routes

| Method | Route               | Access    |
| ------ | ------------------- | --------- |
| GET    | `/gyms`             | Public    |
| GET    | `/gyms/:id`         | Public    |
| POST   | `/gyms`             | Protected |
| POST   | `/gyms/:id/reviews` | Protected |
| GET    | `/profile`          | Protected |

Protected routes require an authenticated Auth0 session.

## Testing

Run backend tests:

```bash
cd backend
npm test
```

The project uses Vitest for both unit and integration tests.

Tests use a separate SQLite database file:

```text
backend/test.db
```

This keeps local development data in `backend/dev.db` from being reset when tests run.

Unit tests cover UI and utility logic in isolation without real network calls.

Integration tests cover the API using `node:http`, including:

- `GET /gyms`
- `GET /gyms/:id`
- `GET /gyms/:id` returning `404`
- `POST /gyms` returning `401` when logged out
- `POST /gyms/:id/reviews` returning `401` when logged out

## Authentication

This project uses **Auth0** with `express-openid-connect`.

Auth0 was chosen because the assignment allows Auth0 session-based authentication, and it fits the backend/frontend setup well. The backend manages the login, callback, session cookie, and logout flow. The frontend redirects users to backend login/logout routes.

Authentication is implemented in the backend with:

- `authMiddleware`
- `requiresAuth()`
- `errorOnRequiredAuth: true`

The protected API routes use `requiresAuth()`:

- `POST /gyms`
- `POST /gyms/:id/reviews`
- `GET /profile`

Unauthenticated users receive `401 Unauthorized` instead of being redirected.

The frontend checks login state by calling:

```text
GET /profile
```

with:

```ts
credentials: "include";
```

Protected frontend routes and menu items are only shown when the user is logged in.

## Security Decisions

### No secrets in the repository

Real Auth0 secrets and local environment values are kept in `.env`, which is ignored by Git. The repository includes `.env.example` to document required variables without exposing secrets.

### Sensitive values are listed in `.env.example`

The backend `.env.example` documents the required Auth0, database, and frontend origin settings so the project can be configured safely on another machine.

### Protected routes return 401

The backend uses `errorOnRequiredAuth: true`, so protected routes return `401 Unauthorized` when a user is not logged in. This is verified by integration tests.

### CORS is restricted

CORS is configured to allow only the frontend origin:

```text
http://localhost:5173
```

The API does not use a wildcard `*`, because authenticated requests use cookies and should only be allowed from the known frontend.

### Tokens are not stored in localStorage

The frontend does not store tokens in `localStorage`. Auth0 session handling is managed through secure session cookies by the backend middleware. This reduces the risk of token theft through client-side JavaScript.

### Authenticated requests use credentials

Frontend requests that need the logged-in session use:

```ts
credentials: "include";
```

This allows the browser to send the Auth0 session cookie to the backend.

## Frontend

The React frontend includes:

- Login page
- Profile dashboard
- Public gyms page
- Protected add gym page
- Protected add review page
- Login/logout navigation
- Menu items that change based on login state
- Loading and error states

Public users can view gyms and reviews.

Logged-in users can create gyms and reviews.
