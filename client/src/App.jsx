import { useState } from "react";
import LoginForm from "./components/LoginForm";
import TaskList from "./components/TaskList";

function App() {
  const [token, setToken] = useState(null);

  if (token) {
    return (
      <>
        <h1>Task Manager</h1>
        <TaskList token={token} />
      </>
    );
  }

  return (
    <>
      <h1>Task Manager</h1>
      <LoginForm onLogin={setToken} />
    </>
  );
}

export default App;
