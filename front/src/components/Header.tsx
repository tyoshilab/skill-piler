import React from 'react';
import LoginButton from './LoginButton';

const Header: React.FC = () => {
  return (
    <header style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Skill Piler</h1>
        <LoginButton />
      </div>
    </header>
  );
};

export default Header;