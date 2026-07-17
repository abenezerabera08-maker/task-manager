# Task Manager API

A database-backed Task Manager API. Started life as a file-based CLI
(see the `master` branch history) and was transformed into an
Express + Prisma + PostgreSQL API, running as two containers via
docker-compose.

## Stack

- Express (HTTP layer)
- Prisma 6 (ORM)
- PostgreSQL (database, in its own container)

## Endpoints

| Method | Path              | Description                          |
|--------|-------------------|--------------------------------------|
| POST   | /tasks            | Create a task (`{ "title": "..." }`) |
| GET    | /tasks            | List all tasks                       |
| GET    | /tasks?filter=done | List completed tasks                |
| GET    | /tasks?filter=pending | List pending tasks                |
| PATCH  | /tasks/:id/done   | Mark a task as done                  |
| DELETE | /tasks/:id        | Delete a task                        |

## Running locally with Docker

```
docker compose up --build
```

This starts two containers:
- `db`: PostgreSQL 16
- `api`: Express server on port 3000, which runs `prisma db push` against
  the `db` container on startup to sync the schema, then boots the server.

Once running:

```
curl -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Buy milk"}'
curl http://localhost:3000/tasks
curl http://localhost:3000/tasks?filter=pending
```

A ready-to-import Postman collection is at `postman_collection.json`.

## Local dev without Docker

```
cp .env.example .env
# point DATABASE_URL at a local Postgres instance
npm install
npx prisma generate
npx prisma db push
npm start
```
