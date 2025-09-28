import React, { useState } from 'react';
import Login from './components/Login';
import AgentChat from './components/AgentChat';
import { type User } from './services/api';

function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setUser(user);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return <AgentChat user={user} onLogout={handleLogout} />;
}

export default App;
