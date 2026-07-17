# Task Manager (CLI)

A basic command-line Node.js app that reads/writes tasks to a JSON file.

## Usage

```
node index.js add "Buy milk"
node index.js list
node index.js done <id>
node index.js remove <id>
```

## Docker

```
docker build -t task-manager .
docker run -it --rm -v "$(pwd)/tasks.json:/app/tasks.json" task-manager list
```
