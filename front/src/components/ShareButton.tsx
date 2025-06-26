import React from 'react';

const ShareButton: React.FC = () => {
  const handleShare = () => {
    // TODO: Implement share functionality
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Share link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy share link');
    });
  };

  return (
    <button onClick={handleShare} style={{ padding: '8px 16px' }}>
      Share Results
    </button>
  );
};

export default ShareButton;