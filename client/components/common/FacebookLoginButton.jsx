// client/components/FacebookLoginButton.jsx
import React from 'react';

const FACEBOOK_LOGIN_URL = 'http://localhost:3000/api/v1/facebook/auth/facebook';

function FacebookLoginButton() {
  const handleFacebookLogin = (e) => {
    e.preventDefault(); // Prevent any default form or link behavior
    window.location.href = FACEBOOK_LOGIN_URL; // Redirect to backend for OAuth
  };

  return (
    <button
      type="button"
      onClick={handleFacebookLogin}
      style={{
        backgroundColor: '#1877f2',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        padding: '10px 20px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '10px'
      }}
    >
      Login with Facebook
    </button>
  );
}

export default FacebookLoginButton;