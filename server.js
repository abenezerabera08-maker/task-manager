/**
 * Task Manager API
 * Database-backed replacement for the file-based CLI.
 * "add" becomes POST /tasks, "list" becomes GET /tasks, etc.
 */

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const logger = require("./logger");
const pinoHttp = require("pino-http");

const cors = require("cors");
const authRouter = require("./auth");
const auth = require("./middleware/auth");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(pinoHttp({ logger }));
app.use(cors({ origin: "http://localhost:5173" }));

app.use("/tasks", auth);

// POST /tasks  { "title": "Buy milk" }
app.post("/tasks", async (req, res) => {
  const { title } = req.body;

  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "title is required and must be a string" });
  }

  const task = await prisma.task.create({
    data: { title, userId: req.user.userId },
  });

  res.status(201).json(task);
});

// GET /tasks
// GET /tasks?filter=done
// GET /tasks?filter=pending
app.get("/tasks", async (req, res) => {
  const { filter } = req.query;

  let where = { userId: req.user.userId };
  if (filter === "done") {
    where = { ...where, done: true };
  } else if (filter === "pending") {
    where = { ...where, done: false };
  } else if (filter !== undefined) {
    return res.status(400).json({ error: 'filter must be "done" or "pending"' });
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { id: "asc" },
  });

  res.json(tasks);
});

// PATCH /tasks/:id/done
app.patch("/tasks/:id/done", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "id must be a number" });
  }

  const owned = await prisma.task.findFirst({ where: { id, userId: req.user.userId } });
  if (!owned) {
    return res.status(404).json({ error: `No task found with id ${id}` });
  }

  const task = await prisma.task.update({
    where: { id },
    data: { done: true },
  });
  res.json(task);
});

// DELETE /tasks/:id
app.delete("/tasks/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "id must be a number" });
  }

  const owned = await prisma.task.findFirst({ where: { id, userId: req.user.userId } });
  if (!owned) {
    return res.status(404).json({ error: `No task found with id ${id}` });
  }

  const task = await prisma.task.delete({ where: { id } });
  res.json(task);
});

app.use("/auth", authRouter);

const PORT = process.env.PORT || 8080;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Task Manager API listening on port ${PORT}`);
  });
}

module.exports = app;
