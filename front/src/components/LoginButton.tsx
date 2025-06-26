import React from 'react';
import { useAuthStore } from '../hooks/useAuthStore';

const LoginButton: React.FC = () => {
  const { isAuthenticated, username, login, logout } = useAuthStore();

  const handleLogin = () => {
    // TODO: Implement GitHub OAuth login
    console.log('Login clicked');
    login();
  };

  const handleLogout = () => {
    logout();
  };

  if (isAuthenticated) {
    return (
      <div>
        <span>Welcome, {username}!</span>
        <button onClick={handleLogout} style={{ marginLeft: '10px' }}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <button onClick={handleLogin}>
      Login with GitHub
    </button>
  );
};

export default LoginButton;