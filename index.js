#!/usr/bin/env node

/**
 * Task Manager CLI
 * Reads/writes tasks to a JSON file (tasks.json) sitting next to this script.
 *
 * Usage:
 *   node index.js add "Buy milk"
 *   node index.js list
 *   node index.js done <id>
 *   node index.js remove <id>
 */

const fs = require("fs");
const path = require("path");

const TASKS_FILE = path.join(__dirname, "tasks.json");

function loadTasks() {
  if (!fs.existsSync(TASKS_FILE)) {
    return [];
  }
  const raw = fs.readFileSync(TASKS_FILE, "utf-8").trim();
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("Could not parse tasks.json — file may be corrupted.");
    process.exit(1);
  }
}

function saveTasks(tasks) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

function nextId(tasks) {
  if (tasks.length === 0) return 1;
  return Math.max(...tasks.map((t) => t.id)) + 1;
}

function addTask(title) {
  if (!title) {
    console.error('Usage: add "<task title>"');
    process.exit(1);
  }
  const tasks = loadTasks();
  const task = {
    id: nextId(tasks),
    title,
    done: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  saveTasks(tasks);
  console.log(`Added task #${task.id}: ${task.title}`);
}

function listTasks(args) {
  const tasks = loadTasks();
  const filterArg = args.find((a) => a.startsWith("--filter="));
  let filtered = tasks;

  if (filterArg) {
    const value = filterArg.split("=")[1];
    if (value === "done") {
      filtered = tasks.filter((t) => t.done);
    } else if (value === "pending") {
      filtered = tasks.filter((t) => !t.done);
    } else {
      console.error(`Unknown filter value "${value}". Use --filter=done or --filter=pending.`);
      process.exit(1);
    }
  }

  if (filtered.length === 0) {
    console.log("No tasks found.");
    return;
  }

  filtered.forEach((t) => {
    const status = t.done ? "[x]" : "[ ]";
    console.log(`${status} #${t.id} ${t.title} (created ${t.createdAt})`);
  });
}

function completeTask(idArg) {
  const id = parseInt(idArg, 10);
  if (Number.isNaN(id)) {
    console.error("Usage: done <id>");
    process.exit(1);
  }
  const tasks = loadTasks();
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    console.error(`No task found with id ${id}`);
    process.exit(1);
  }
  task.done = true;
  saveTasks(tasks);
  console.log(`Marked task #${id} as done.`);
}

function removeTask(idArg) {
  const id = parseInt(idArg, 10);
  if (Number.isNaN(id)) {
    console.error("Usage: remove <id>");
    process.exit(1);
  }
  const tasks = loadTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    console.error(`No task found with id ${id}`);
    process.exit(1);
  }
  const [removed] = tasks.splice(index, 1);
  saveTasks(tasks);
  console.log(`Removed task #${removed.id}: ${removed.title}`);
}

function main() {
  const [, , command, ...rest] = process.argv;

  switch (command) {
    case "add":
      addTask(rest.join(" "));
      break;
    case "list":
      listTasks(rest);
      break;
    case "done":
      completeTask(rest[0]);
      break;
    case "remove":
      removeTask(rest[0]);
      break;
    default:
      console.log("Task Manager CLI");
      console.log("Commands:");
      console.log('  add "<title>"       Add a new task');
      console.log("  list                List all tasks");
      console.log("  list --filter=done|pending   List filtered tasks");
      console.log("  done <id>           Mark a task as done");
      console.log("  remove <id>         Remove a task");
      break;
  }
}

main();
