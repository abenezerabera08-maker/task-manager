/**
 * Task Manager API
 * Database-backed replacement for the file-based CLI.
 * "add" becomes POST /tasks, "list" becomes GET /tasks, etc.
 */

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const logger = require("./logger");
const pinoHttp = require("pino-http");

const authRouter = require("./auth");
const auth = require("./middleware/auth");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(pinoHttp({ logger }));

app.use("/tasks", auth);

// POST /tasks  { "title": "Buy milk" }
app.post("/tasks", async (req, res) => {
  const { title } = req.body;

  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "title is required and must be a string" });
  }

  const task = await prisma.task.create({
    data: { title },
  });

  res.status(201).json(task);
});

// GET /tasks
// GET /tasks?filter=done
// GET /tasks?filter=pending
app.get("/tasks", async (req, res) => {
  const { filter } = req.query;

  let where = {};
  if (filter === "done") {
    where = { done: true };
  } else if (filter === "pending") {
    where = { done: false };
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

  try {
    const task = await prisma.task.update({
      where: { id },
      data: { done: true },
    });
    res.json(task);
  } catch (err) {
    res.status(404).json({ error: `No task found with id ${id}` });
  }
});

// DELETE /tasks/:id
app.delete("/tasks/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "id must be a number" });
  }

  try {
    const task = await prisma.task.delete({ where: { id } });
    res.json(task);
  } catch (err) {
    res.status(404).json({ error: `No task found with id ${id}` });
  }
});

app.use("/auth", authRouter);

const PORT = process.env.PORT || 8080;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Task Manager API listening on port ${PORT}`);
  });
}

module.exports = app;
