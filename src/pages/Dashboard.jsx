import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);

  const userEmail = localStorage.getItem('email');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSavedExperts() {
      if (!userEmail) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/auth/get-saved-experts?email=${userEmail}`);
        const data = await res.json();

        if (res.ok && Array.isArray(data.savedExperts)) {
          const expertDetails = await Promise.all(
            data.savedExperts.map(async (id) => {
              const resExpert = await fetch(`/api/experts/${id}`);
              if (resExpert.ok) {
                return await resExpert.json();
              }
              return null;
            })
          );
          setExperts(expertDetails.filter(Boolean));
        } else {
          setExperts([]);
        }
      } catch {
        setExperts([]);
      }

      setLoading(false);
    }

    fetchSavedExperts();
  }, [userEmail]);

  const handleRemoveExpert = async (expertId) => {
    try {
      const res = await fetch('/api/auth/remove-saved-expert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, expertId }),
      });
      const data = await res.json();

      if (res.ok) {
        // Remove the expert from local state to update UI immediately
        setExperts(prev => prev.filter(expert => expert._id !== expertId));
        alert('Expert removed successfully.');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Could not remove expert. Please try again later.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading saved experts...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Saved Experts</h2>
      {experts.length === 0 ? (
        <p>No experts saved yet.</p>
      ) : (
        experts.map((expert) => (
          <div
            key={expert._id}
            onClick={() => navigate(`/experts/${expert._id}`)}
            className="cursor-pointer border rounded p-4 mb-3 bg-gray-50 shadow-sm flex justify-between items-center hover:bg-gray-100 transition"
          >
            <div>
              <h3 className="font-semibold text-lg">{expert.name}</h3>
              <p><strong>Domain:</strong> {expert.domain || 'N/A'}</p>
              <p><strong>Location:</strong> {expert.location || 'N/A'}</p>
            </div>
            <button
              onClick={e => {
                e.stopPropagation(); // prevent navigating when clicking 'Remove'
                handleRemoveExpert(expert._id);
              }}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none"
              aria-label={`Remove expert ${expert.name}`}
            >
              Remove
            </button>
          </div>
        ))
      )}
    </div>
  );
}
