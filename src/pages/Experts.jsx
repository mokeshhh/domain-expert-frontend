import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const FILTER_ICON = (
  <svg height="20" viewBox="0 0 24 24" width="20" style={{ marginRight: 4 }}>
    <path d="M3 5h18M6 9h12M9 13h6M12 17h0" stroke="#444" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

const CLOSE_ICON = (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <line x1="6" y1="6" x2="14" y2="14" stroke="#888" strokeWidth="2" />
    <line x1="14" y1="6" x2="6" y2="14" stroke="#888" strokeWidth="2" />
  </svg>
);

function capitalizeWords(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

export default function Experts() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialQuery = params.get('query') || '';

  const [experts, setExperts] = useState([]);
  const [filteredExperts, setFilteredExperts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [domains, setDomains] = useState([]);
  const [showDomainPanel, setShowDomainPanel] = useState(false);

  const inputRef = useRef();
  const filterBtnRef = useRef();

  useEffect(() => {
    setLoading(true);
    fetch('/api/experts')
      .then(res => res.json())
      .then(data => {
        setExperts(data);
        setLoading(false);
        const uniqueDomains = [...new Set(data.map(exp => exp.domain).filter(Boolean))]
          .map(capitalizeWords)
          .sort();
        setDomains(uniqueDomains);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user?.email) {
      setRecentSearches([]);
      return;
    }
    fetch(`/api/auth/recent-searches?email=${encodeURIComponent(user.email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.recentSearches) setRecentSearches(data.recentSearches);
      })
      .catch(() => setRecentSearches([]));
  }, [user]);

  useEffect(() => {
    let filtered = [...experts];
    if (selectedDomains.length > 0) {
      filtered = filtered.filter(exp =>
        selectedDomains.includes(capitalizeWords(exp.domain))
      );
    }
    if (searchTerm.trim() !== '') {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        exp =>
          exp.name?.toLowerCase().includes(lower) ||
          exp.domain?.toLowerCase().includes(lower) ||
          exp.location?.toLowerCase().includes(lower)
      );
    }
    setFilteredExperts(filtered);
  }, [searchTerm, selectedDomains, experts]);

  const saveRecentSearch = (query) => {
    if (!user?.email || !query.trim()) return;
    fetch('/api/auth/save-recent-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, searchQuery: query.trim() }),
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.recentSearches)) {
          setRecentSearches(data.recentSearches);
        }
      })
      .catch(() => {});
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    saveRecentSearch(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    if (inputRef.current) inputRef.current.focus();
  };

  const handleRecentChipClick = (search) => {
    setSearchTerm(search);
    saveRecentSearch(search);
  };

  const handleDomainToggle = (dom) => {
    setSelectedDomains(current =>
      current.includes(dom) ? current.filter(d => d !== dom) : [...current, dom]
    );
    saveRecentSearch(dom);
  };

  if (loading) return <div className="p-8 text-center">Loading experts...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">Experts List</h1>

      {/* Search/Filter Bar */}
      <form
        className="flex flex-row items-center justify-center gap-4 mb-2 relative"
        onSubmit={handleSearchSubmit}
        autoComplete="off"
        style={{ width: '100%' }}
      >
        <div className="relative" style={{ width: '80%', maxWidth: 500 }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search experts by name, domain or location…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg shadow focus:bg-white-50 focus:border-white-700 focus:shadow-lg transition-all outline-none"
            style={{ backgroundColor: '#ffffffff' }}
          />

          {searchTerm && (
            <button
              type="button"
              className="absolute top-3 right-3 p-1"
              onClick={handleClearSearch}
              aria-label="Clear search"
              tabIndex={0}
            >
              {CLOSE_ICON}
            </button>
          )}
        </div>

        {/* Filter Button */}
        <button
          ref={filterBtnRef}
          type="button"
          className={`flex items-center px-4 py-2 rounded-full border transition ${
            showDomainPanel ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setShowDomainPanel(v => !v)}
          aria-label="Filter by domain"
        >
          {FILTER_ICON}
          <span style={{ fontWeight: 500 }}>Filter</span>
        </button>

        {/* Domain Selection Panel */}
        {showDomainPanel && (
          <div
            className="absolute flex flex-col gap-2 items-center p-4 rounded-lg bg-white shadow border"
            style={{
              top: 52,
              right: 0,
              zIndex: 10,
              maxHeight: 240,
              minWidth: 240,
              width: 260,
              overflowY: 'auto',
            }}
          >
            {domains.map(dom => (
              <button
                key={dom}
                className={`w-full px-4 py-2 rounded-full border text-sm mb-1 transition ${
                  selectedDomains.includes(dom)
                    ? 'bg-purple-300 text-white font-semibold'
                    : 'bg-gray-50 text-gray-800 hover:bg-purple-50'
                }`}
                onClick={() => handleDomainToggle(dom)}
                style={{ minWidth: 120 }}
              >
                {dom}
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mb-4 mt-2">
          <span className="text-gray-500 text-sm mr-2">Recent Searches:</span>
          {recentSearches.map((s, i) => (
            <button
              key={i}
              className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700 hover:bg-purple-100 border transition"
              onClick={() => handleRecentChipClick(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Experts Grid */}
      {filteredExperts.length === 0 ? (
        <p className="text-center text-gray-500">No experts found.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {filteredExperts.map(expert => (
            <Link
              to={`/experts/${expert._id ?? expert.id}`}
              key={expert._id ?? expert.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-2xl hover:scale-[1.02] transform transition-all flex items-center space-x-6 cursor-pointer"
            >
              {expert.avatar ? (
                <img
                  src={expert.avatar}
                  alt={expert.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-xl">
                  {expert.name?.[0] || '?'}
                </div>
              )}
              <div>
                <div className="text-xl font-semibold">{expert.name}</div>
                <div><strong>Domain:</strong> {capitalizeWords(expert.domain) || 'N/A'}</div>
                <div><strong>Location:</strong> {expert.location || 'N/A'}</div>
                {expert.linkedin_url && (
                  <a
                    href={expert.linkedin_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-blue-600 hover:underline text-sm"
                    onClick={e => e.stopPropagation()}
                  >
                    LinkedIn Profile
                  </a>
                )}
              </div>
            </Link>
          ))}
        </ul>
      )}
    </div>
  );
}
