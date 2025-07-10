import React, { useState } from 'react';
import { LoginForm } from './components/LoginForm';
import { ChatRoom } from './components/ChatRoom';
import { User } from './types/chat';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (username: string, avatar: string) => {
    const user: User = {
      id: '', // Will be set by socket connection
      username,
      avatar,
      joinedAt: new Date()
    };
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="App">
      {currentUser ? (
        <ChatRoom user={currentUser} onLogout={handleLogout} />
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;