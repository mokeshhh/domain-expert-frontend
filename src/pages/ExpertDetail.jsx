import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

// Capitalize first letter of each word
function capitalizeWords(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

const backendUrl = import.meta.env.VITE_API_URL;

export default function ExpertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [wikiInfo, setWikiInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wikiLoading, setWikiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [notification, setNotification] = useState(null);
  const [notificationType, setNotificationType] = useState('success');

  const isLoggedIn = !!localStorage.getItem('token');
  const userEmail = localStorage.getItem('email');

  useEffect(() => {
    fetch(`${backendUrl}/api/experts/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Expert not found');
        return res.json();
      })
      .then(data => {
        setExpert(data);
        setLoading(false);

        if (isLoggedIn && userEmail) {
          fetch(`${backendUrl}/api/auth/get-saved-experts?email=${userEmail}`)
            .then(res => res.json())
            .then(({ savedExperts }) => {
              if (savedExperts && savedExperts.includes(data._id)) {
                setIsSaved(true);
              } else {
                setIsSaved(false);
              }
            })
            .catch(() => setIsSaved(false));
        } else {
          setIsSaved(false);
        }

        if (data.wikipedia_url) {
          const parts = data.wikipedia_url.split('/');
          const title = parts[parts.length - 1];
          setWikiLoading(true);

          fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`)
            .then(res => res.json())
            .then(info => {
              setWikiInfo(info);
              setWikiLoading(false);
            })
            .catch(() => {
              setWikiLoading(false);
              setWikiInfo(null);
            });
        }
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, isLoggedIn, userEmail]);

  const showNotification = (msg, type = 'success') => {
    setNotification(msg);
    setNotificationType(type);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleBookmark = async () => {
    if (!isLoggedIn) {
      showNotification('Please log in to save experts.', 'error');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    if (isSaved) {
      try {
        const res = await fetch(`${backendUrl}/api/auth/remove-saved-expert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, expertId: expert._id }),
        });
        const data = await res.json();
        if (res.ok) {
          setIsSaved(false);
          showNotification('Expert removed from saved.', 'error');
        } else {
          showNotification(data.message, 'error');
        }
      } catch {
        showNotification('Could not remove bookmark. Please try again.', 'error');
      }
    } else {
      try {
        const res = await fetch(`${backendUrl}/api/auth/save-expert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, expertId: expert._id }),
        });
        const data = await res.json();
        if (res.ok) {
          setIsSaved(true);
          showNotification('Expert saved successfully', 'success');
        } else {
          showNotification(data.message, 'error');
        }
      } catch (error) {
        showNotification('Could not bookmark expert. Please try again later.', 'error');
      }
    }
  };

  if (loading) return <div className="p-8 text-center">Loading expert details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white rounded shadow relative">
      {/* Notification Block */}
      {notification && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg transition 
            ${notificationType === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
        >
          {notification}
        </div>
      )}

      <Link to="/experts" className="text-blue-500 hover:underline mb-6 inline-block">
        ← Back to experts
      </Link>

      {/* Bookmark Icon */}
      <button
        onClick={handleBookmark}
        title={isSaved ? "Unsave Profile" : "Save Profile"}
        className="absolute top-8 right-8 z-10 bg-transparent border-none p-0 cursor-pointer"
        aria-label={isSaved ? "Remove bookmark" : "Add bookmark"}
      >
        {isSaved ? (
          <svg width="32" height="32" fill="#1976ed" viewBox="0 0 24 24">
            <path d="M6 4a2 2 0 0 0-2 2v16l8-5.333L20 22V6a2 2 0 0 0-2-2H6z" />
          </svg>
        ) : (
          <svg width="32" height="32" fill="none" stroke="#1976ed" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M6 4a2 2 0 0 0-2 2v16l8-5.333L20 22V6a2 2 0 0 0-2-2H6z" />
          </svg>
        )}
      </button>

      <div className="flex items-center justify-between mb-4">
        {expert.avatar && (
          <img
            src={expert.avatar}
            alt={expert.name}
            className="w-32 h-32 rounded-full shadow mr-4"
          />
        )}
        <div className="flex-1">
          <h2 className="text-3xl font-bold">{expert.name}</h2>
        </div>
      </div>

      {expert.username && <p className="mb-2"><strong>Username:</strong> {expert.username}</p>}
      <p className="mb-2"><strong>Domain:</strong> {capitalizeWords(expert.domain) || 'N/A'}</p>
      {expert.bio && <p className="mb-2"><strong>Bio:</strong> {expert.bio}</p>}
      {expert.location && <p className="mb-2"><strong>Location:</strong> {expert.location}</p>}
      {expert.linkedin_url && (
        <p className="mb-2">
          <strong>LinkedIn:</strong>{' '}
          <a
            href={expert.linkedin_url}
            target="_blank"
            rel="noreferrer noopener"
            className="text-blue-600 hover:underline"
          >
            {expert.linkedin_url}
          </a>
        </p>
      )}
      {expert.profile_url && (
        <p className="mb-4">
          <strong>Profile URL:</strong>{' '}
          <a
            href={expert.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {expert.profile_url}
          </a>
        </p>
      )}
      {wikiLoading && <p>Loading Wikipedia info...</p>}
      {wikiInfo && (
        <div className="mb-6">
          {wikiInfo.thumbnail && (
            <img
              src={wikiInfo.thumbnail.source}
              alt={`${expert.name} photo`}
              className="mb-4 rounded shadow-md"
              width={160}
              height={160}
            />
          )}
          {wikiInfo.description && (
            <p className="mb-2">
              <strong>Occupation:</strong> {wikiInfo.description}
            </p>
          )}
          {wikiInfo.extract && (
            <p
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {wikiInfo.extract}
            </p>
          )}
        </div>
      )}
      {expert.about && (
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">About</h3>
          <p>{expert.about}</p>
        </section>
      )}
      {expert.wikipedia_url && (
        <p>
          <a
            href={expert.wikipedia_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View Full Wikipedia Profile
          </a>
        </p>
      )}
    </div>
  );
}
