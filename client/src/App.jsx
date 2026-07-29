import { useState } from "react";
import LoginForm from "./components/LoginForm";

function App() {
  const [token, setToken] = useState(null);

  if (token) {
    return (
      <>
        <h1>Task Manager</h1>
        <p>Logged in.</p>
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
