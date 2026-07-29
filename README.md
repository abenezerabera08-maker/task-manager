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

| Method | Path                  | Description                          |
| ------ | --------------------- | ------------------------------------ |
| POST   | /tasks                | Create a task (`{ "title": "..." }`) |
| GET    | /tasks                | List all tasks                       |
| GET    | /tasks?filter=done    | List completed tasks                 |
| GET    | /tasks?filter=pending | List pending tasks                   |
| PATCH  | /tasks/:id/done       | Mark a task as done                  |
| DELETE | /tasks/:id            | Delete a task                        |

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

---

Here's a summary of every change made from the original setup:

1. server.js

No code changes — routes were already correct. The only "fix" was realizing PATCH /tasks/:id/done doesn't take a body, and to test it correctly.

2. .env

Added/changed PORT=8080 (was originally defaulting to 3000 in code, though your server.js already had process.env.PORT || 8080 by the time we started)

3. .env.example

Deleted entirely (you did this yourself — harmless, since it was just documentation)

4. docker-compose.yml

Changed the api service's port mapping:
yaml

# before

ports: - "8080:8080"

# after

ports: - "8081:8080"

This was the key fix — host port 8080 was already taken by a system Apache (httpd) process, so we moved the host-side port to 8081 while keeping the container's internal port at 8080 (matching PORT: 8080 in the same file and EXPOSE 8080 in the Dockerfile).

5. Dockerfile

You changed EXPOSE 3000 → EXPOSE 8080 yourself earlier, just before we looked at compose — that was already correct/consistent with everything else by the time we got there.

6. Local environment fixes (not code — machine state)

Ran npm install (node_modules was missing/incomplete)
Ran npx prisma generate (Prisma client wasn't generated yet)
Identified port 8080 was occupied by Apache (httpd, PID 5364) — left it running rather than killing it, and worked around it via the Docker port remap instead
