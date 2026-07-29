import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function TaskList({ token }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [actionError, setActionError] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);

  async function fetchTasks() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      setTasks(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchTasks(); }, [token]);

  async function handleAdd(e) {
    e.preventDefault();
    setActionError("");
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: newTitle, priority: newPriority }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      setNewTitle("");
      setNewPriority("medium");
      fetchTasks();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleDelete(id) {
    setActionError("");
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete task");
      fetchTasks();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleMarkDone(id) {
    setActionError("");
    try {
      const res = await fetch(`${API_URL}/tasks/${id}/done`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to update task");
      fetchTasks();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handlePriorityChange(id, priority) {
    setActionError("");
    try {
      const res = await fetch(`${API_URL}/tasks/${id}/priority`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ priority }),
      });
      if (!res.ok) throw new Error("Failed to update priority");
      fetchTasks();
    } catch (err) {
      setActionError(err.message);
    }
  }

  const displayedTasks = showCompleted
    ? tasks
    : tasks.filter((t) => !t.done);

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <form onSubmit={handleAdd}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New task title"
          required
        />
        <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>
        <button type="submit">Add</button>
      </form>

      {actionError && <p style={{ color: "red" }}>{actionError}</p>}

      <label style={{ display: "block", margin: "8px 0" }}>
        <input
          type="checkbox"
          checked={showCompleted}
          onChange={(e) => setShowCompleted(e.target.checked)}
        />{" "}
        Show completed
      </label>

      {displayedTasks.length === 0 ? (
        <p>No tasks yet.</p>
      ) : (
        <ul>
          {displayedTasks.map((task) => (
            <li key={task.id}>
              <span style={{ textDecoration: task.done ? "line-through" : "none" }}>
                {task.title}
              </span>{" "}
              <span>({task.priority})</span>
              <select
                value={task.priority}
                onChange={(e) => handlePriorityChange(task.id, e.target.value)}
                style={{ margin: "0 8px" }}
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
              {!task.done && (
                <button onClick={() => handleMarkDone(task.id)}>Mark done</button>
              )}
              <button onClick={() => handleDelete(task.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
