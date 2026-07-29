import { useState, useEffect } from "react";

const API_URL = "http://localhost:8080";

export default function TaskList({ token }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [actionError, setActionError] = useState("");

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
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      setNewTitle("");
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
        <button type="submit">Add</button>
      </form>

      {actionError && <p style={{ color: "red" }}>{actionError}</p>}

      {tasks.length === 0 ? (
        <p>No tasks yet.</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <span style={{ textDecoration: task.done ? "line-through" : "none" }}>
                {task.title}
              </span>
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
