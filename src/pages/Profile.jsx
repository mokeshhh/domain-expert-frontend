import React, { useEffect, useState } from 'react';

export default function Profile() {
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });

  useEffect(() => {
    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');
    setUserInfo({ name, email });
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      {userInfo.name && userInfo.email ? (
        <>
          <p><strong>Name:</strong> {userInfo.name}</p>
          <p><strong>Email:</strong> {userInfo.email}</p>
        </>
      ) : (
        <p>No user information found. Please log in.</p>
      )}
    </div>
  );
}
