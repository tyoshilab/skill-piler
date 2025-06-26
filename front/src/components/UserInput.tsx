import React, { useState } from 'react';
import { useAnalysisStore } from '../hooks/useAnalysisStore';

const UserInput: React.FC = () => {
  const [username, setUsername] = useState('');
  const [includePrivate, setIncludePrivate] = useState(false);
  const { startAnalysis, isLoading } = useAnalysisStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      startAnalysis({
        github_username: username.trim(),
        include_private: includePrivate
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: '2rem 0' }}>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="username">GitHub Username:</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter GitHub username"
          style={{ marginLeft: '10px', padding: '5px' }}
          disabled={isLoading}
        />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <label>
          <input
            type="checkbox"
            checked={includePrivate}
            onChange={(e) => setIncludePrivate(e.target.checked)}
            disabled={isLoading}
          />
          Include private repositories (requires login)
        </label>
      </div>
      
      <button type="submit" disabled={isLoading || !username.trim()}>
        {isLoading ? 'Analyzing...' : 'Analyze'}
      </button>
    </form>
  );
};

export default UserInput;