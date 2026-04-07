# FreelanceHub Mobile + API

Monorepo containing:
- Ionic + Angular mobile/web frontend in `appFreelance/`
- Flask + MongoDB backend API in `backend/`

## Current Status

Implemented features right now:
- Authentication API (register, login, profile)
- Roles: `client`, `freelancer`, `admin`
- Registration workflow with `pending` status for client/freelancer accounts
- Admin validation endpoints for pending accounts
- Frontend pages for login, register selection, register client, register freelancer, and registration pending

## Repository Structure

```text
projetMobile/
  appFreelance/   # Ionic Angular app
  backend/        # Flask API + Mongo models/routes
```

## Prerequisites

- Node.js 20+ and npm
- Python 3.10+
- MongoDB (local or remote)

## 1) Backend Setup (Flask)

Open a terminal in `backend/`.

### Install dependencies

```bash
pip install -r requirements.txt
```

### Configure environment variables

Create a `.env` file inside `backend/` with:

```env
MONGO_URI=mongodb://localhost:27017
MONGO_DB=freelancehub_db
JWT_SECRET_KEY=change-this-secret
FLASK_DEBUG=True
```

### Run the API

```bash
python app.py
```

Default URL:
- `http://localhost:5000`

Health check:
- `GET /` returns `{ "message": "API running" }`

### Optional: Seed sample users

```bash
python utils/seed.py
```

Seeded accounts:
- Admin: `admin@test.com` / `admin1234`
- Clients: `client@test.com`, `client2@test.com` (password `1234`)
- Freelancers: `freelancer@test.com`, `freelancer2@test.com` (password `1234`)

## 2) Frontend Setup (Ionic Angular)

Open a terminal in `appFreelance/`.

### Install dependencies

```bash
npm install
```

### API URL configuration

The app currently uses:
- `src/environments/environment.ts` -> `http://localhost:5000/api`
- `src/environments/environment.prod.ts` -> `https://your-production-api.com/api`

Update these values if your backend runs on another host.

### Run frontend in dev mode

```bash
npm start
```

This runs Angular dev server (`ng serve`).

### Other useful scripts

```bash
npm run build
npm run test
npm run lint
```

## API Endpoints (current)

Base prefix: `/api`

### Public

- `POST /api/register`
- `POST /api/login`

Register payload example:

```json
{
  "email": "user@example.com",
  "password": "1234",
  "name": "User Name",
  "role": "client"
}
```

Login payload example:

```json
{
  "email": "user@example.com",
  "password": "1234"
}
```

### Protected (JWT Bearer token required)

- `GET /api/profile`
- `GET /api/admin/pending` (admin only)
- `POST /api/admin/validate` (admin only)
- `POST /api/admin/reject` (admin only)

Example header:

```http
Authorization: Bearer <JWT_TOKEN>
```

## Frontend Routes (current)

- `/login`
- `/register`
- `/register-client`
- `/register-freelancer`
- `/registration-pending`
- `/home`

## Notes

- New `client` and `freelancer` accounts are created with status `pending`.
- `admin` accounts are created with status `active`.
- Passwords are hashed in the backend using Werkzeug security helpers.
- CORS is enabled in the backend app.

## Quick Start (2 terminals)

Terminal 1:

```bash
cd backend
python app.py
```

Terminal 2:

```bash
cd appFreelance
npm install
npm start
```

Then open the frontend URL shown by Angular, usually `http://localhost:4200`.
