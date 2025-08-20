import React, { useEffect, useState } from 'react';

function FacebookCallback() {
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Get code from URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      fetch(`http://localhost:3000/api/v1/facebook/auth/facebook/callback?code=${code}`)
        .then(res => res.json())
        .then(data => setResult(data));
    }
  }, []);

  if (!result) return <div>Loading...</div>;
  return (
    <div>
      <h1>Facebook Login Success!</h1>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}

export default FacebookCallback;