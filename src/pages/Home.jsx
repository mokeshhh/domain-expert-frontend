import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import FadeInSection from '../animations/FadeInSection';
import TestimonialReveal from '../animations/TestimonialReveal';
import { AuthContext } from '../context/AuthContext';

function TopRightAuthBar() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 30,
        zIndex: 1000,
        display: 'flex',
        gap: '12px',
      }}
    >
      {/* Add login/logout/profile links */}
    </div>
  );
}

function capitalizeWords(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

export default function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [recommendedExperts, setRecommendedExperts] = useState([]);
  const [trendingExperts, setTrendingExperts] = useState([]);
  const [trendingDomains, setTrendingDomains] = useState([]);
  const [featuredExpert, setFeaturedExpert] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [filterDomain, setFilterDomain] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [titleAnimated, setTitleAnimated] = useState(false);

  useEffect(() => {
    setTitleAnimated(true);
  }, []);

  useEffect(() => {
    async function fetchRecommendationsAndRandoms() {
      if (!user?.email) {
        setRecommendedExperts([]);
        return;
      }
      try {
        const recentRes = await fetch(
          `/api/auth/recent-searches?email=${encodeURIComponent(user.email)}`
        );
        const recentData = await recentRes.json();
        const searches = (recentData && Array.isArray(recentData.recentSearches))
          ? recentData.recentSearches
          : [];
        const latestSearchArr = searches.length > 0 ? [searches[0]] : [];

        const recommendRes = await fetch('/api/experts/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recentSearches: latestSearchArr }),
        });
        const recommendData = await recommendRes.json();
        const recommended = recommendData.experts ? recommendData.experts.slice(0, 3) : [];

        const randomRes = await fetch('/api/experts');
        const allExperts = await randomRes.json();
        const shownIds = new Set(recommended.map(e => e._id ?? e.id));
        const randoms = allExperts
          .filter(e => !shownIds.has(e._id ?? e.id))
          .sort(() => Math.random() - 0.5)
          .slice(0, 2);

        setRecommendedExperts([...recommended, ...randoms]);
      } catch {
        setRecommendedExperts([]);
      }
    }
    fetchRecommendationsAndRandoms();
  }, [user]);

  useEffect(() => {
    fetch('/api/experts')
      .then(res => res.json())
      .then(data => {
        let experts = data;
        for (let i = experts.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [experts[i], experts[j]] = [experts[j], experts[i]];
        }
        setTrendingExperts(experts.slice(0, 10));
      })
      .catch(() => setTrendingExperts([]));
  }, []);

  useEffect(() => {
    fetch('/api/domains/trending')
      .then(res => res.json())
      .then(data => setTrendingDomains(data))
      .catch(() => setTrendingDomains([]));
  }, []);

  useEffect(() => {
    if (recommendedExperts.length > 0) {
      setFeaturedExpert(recommendedExperts[0]);
    } else {
      setFeaturedExpert(null);
    }
    setTestimonials([
      { id: 1, name: 'Ashwini Patil', comment: 'Great platform, found my dream expert!' },
      { id: 2, name: 'Rahul Singh', comment: 'Experts here are top-notch and responsive.' },
    ]);
  }, [recommendedExperts]);

  useEffect(() => {
    if (trendingExperts.length < 3) return;
    const interval = setInterval(() => {
      setCarouselIndex(i => (i + 1) % trendingExperts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [trendingExperts]);

  const handleSearchSubmit = e => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/experts?query=${encodeURIComponent(search.trim())}`);
  };

  const onFilterChipClick = domain => {
    setFilterDomain(domain);
    setSearch(domain);
    navigate(`/experts?query=${encodeURIComponent(domain)}`);
  };

  return (
    <>
      <TopRightAuthBar />
      <div className={styles.page}>
        {/* Hero Section */}
        <FadeInSection>
          <section className={styles.hero}>
            <div className={styles.heroLeft}>
              <h1
                className={`${styles.heroTitle} ${titleAnimated ? styles.zoomIn : ''}`}
                style={{
                  transition: 'transform 0.6s cubic-bezier(.32,2,.55,.27)',
                  transform: titleAnimated ? 'scale(1.08)' : 'scale(0.92)',
                }}
              >
                Find Expert Talent Across Domains
              </h1>
              <p className={styles.heroSubtitle}>
                Search, filter, and connect with top verified experts.
              </p>
              <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                <input
                  className={styles.searchInput}
                  type="text"
                  placeholder="Search for experts, domains..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <button type="submit" className={styles.searchButton}>
                  🔍
                </button>
              </form>
              <div className={styles.quickFilters}>
                {['AI', 'Frontend', 'Data Scientist', 'DevOps', 'UI/UX'].map(domain => (
                  <button
                    key={domain}
                    className={`${styles.filterChip} ${
                      filterDomain === domain ? styles.activeChip : ''
                    }`}
                    onClick={() => onFilterChipClick(domain)}
                  >
                    {domain}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.heroRight}>
              <img
                src="/illustrations/hero-illustration.svg"
                alt="Hero Illustration"
                className={styles.heroImg}
              />
            </div>
          </section>
        </FadeInSection>

        {/* Show 3D video below hero section and before Trending Domains when logged out */}
        {!user && (
          <FadeInSection>
            <section className={styles.videoSection}>
              <h2 className={styles.sectionTitle}>"Finding the Right Expert: Watch the Conversation"</h2>
              <div className={styles.videoWrapper}>
                <video width="100%" controls style={{ borderRadius: 10, background: '#000' }}>
                  <source src="/videos/MyPlotagonMovie.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </section>
          </FadeInSection>
        )}

        {/* Show Featured Expert and How It Works video side by side when logged in */}
        {user && featuredExpert && (
          <FadeInSection>
            <section className={styles.featuredExpertSection}>
              <div className={styles.columns}>
                {/* Featured Expert */}
                <div>
                  <h2 className={styles.sectionTitle}>Featured Expert</h2>
                  <div
                    className={styles.featuredCard}
                    onClick={() => navigate(`/experts/${featuredExpert._id ?? featuredExpert.id}`)}
                    style={{ cursor: 'pointer' }}
                    title={`View ${featuredExpert.name}`}
                  >
                    <img
                      src={featuredExpert.avatar}
                      alt={featuredExpert.name}
                      className={styles.avatarLarge}
                    />
                    <div>
                      <h3>{featuredExpert.name}</h3>
                      <p>
                        <strong>Domain:</strong> {featuredExpert.domain}
                      </p>
                      <p>
                        <strong>Location:</strong> {featuredExpert.location}
                      </p>
                      <p>{featuredExpert.bio || 'Expert in their domain.'}</p>
                    </div>
                  </div>
                </div>
                {/* How It Works Video */}
                <div className={styles.videoColumn}>
                  <h2 className={styles.sectionLogin}>"Finding the Right Expert: Watch the Conversation"</h2>
                  <div className={styles.videoLogin}>
                  <video width="100%" controls style={{ borderRadius: 10, background: '#000' }}>
                    <source src="/videos/MyPlotagonMovie.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  </div>
                </div>
              </div>
            </section>
          </FadeInSection>
        )}

        {/* Recommended Experts Section - only when logged in */}
        {user && (
          <FadeInSection>
            <section className={styles.recommended}>
              <h2><b>Recommended Experts</b></h2>
              <div className={styles.expertsGrid}>
                {recommendedExperts.map(exp => (
                  <div
                    key={exp._id ?? exp.id}
                    className={styles.expertCard}
                    onClick={() => navigate(`/experts/${exp._id ?? exp.id}`)}
                    style={{ cursor: 'pointer' }}
                    title={`View ${exp.name}`}
                  >
                    {exp.avatar ? (
                      <img src={exp.avatar} alt={exp.name} className={styles.avatarMedium} />
                    ) : (
                      <div className={`${styles.avatarMedium} ${styles.initialsCircle}`}>
                        {exp.name?.[0] || '?'}
                      </div>
                    )}
                    <div className={styles.expertInfo}>
                      <div className={styles.nameRow}>
                        <span className={styles.expertName}>{exp.name}</span>
                        <span className={styles.domainBadge}>{capitalizeWords(exp.domain)}</span>
                      </div>
                      <div className={styles.locationRow}>{exp.location}</div>
                    </div>
                    {exp.linkedin_url && (
                      <a
                        href={exp.linkedin_url}
                        className={styles.linkedinLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="LinkedIn"
                        onClick={e => e.stopPropagation()}
                      >
                        LinkedIn
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </FadeInSection>
        )}

        {/* Trending Domains */}
        <FadeInSection>
          <section className={styles.trendingSection}>
            <h2><b>Trending Domains</b></h2>
            <div className={styles.slider}>
              {trendingDomains.map(domain => (
                <div key={domain.id ?? domain.name} className={styles.domainCard}>
                  <span className={styles.domainIcon}>{domain.icon}</span> {domain.name}
                </div>
              ))}
            </div>
          </section>
        </FadeInSection>

        {/* Trending Experts */}
        <FadeInSection>
          <section className={styles.trendingExpertsSection}>
            <h2><b>Trending Experts</b></h2>
            <div className={styles.trendingGrid}>
              {[0, 1, 2].map((offset, idx) => {
                const expert = trendingExperts[(carouselIndex + offset) % trendingExperts.length];
                return expert ? (
                  <div
                    key={expert._id ?? expert.id}
                    className={`${styles.trendingExpertCard} ${
                      idx === 1 ? styles.highlightedCard : ''
                    }`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/experts/${expert._id ?? expert.id}`)}
                    title={`View ${expert.name}`}
                  >
                    {expert.avatar ? (
                      <img
                        src={expert.avatar}
                        alt={expert.name}
                        className={styles.avatarMedium}
                      />
                    ) : (
                      <div className={`${styles.avatarMedium} ${styles.initialsCircle}`}>
                        {expert.name?.[0] || '?'}
                      </div>
                    )}
                    <div>
                      <div className={styles.expertName}>{expert.name}</div>
                      <div className={styles.expertDomain}>{expert.domain}</div>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </section>
        </FadeInSection>

        {/* Testimonials */}
        <FadeInSection>
          <section className={styles.testimonials}>
            <h2><b>What Our Users Say</b></h2>
            <TestimonialReveal testimonials={testimonials} />
          </section>
        </FadeInSection>

        {/* Request Button */}
        <FadeInSection>
          <section className={styles.requestSection}>
            <button
              className={styles.requestButton}
              onClick={() => alert('Request feature coming soon!')}
            >
              Can’t find your expert? Request help
            </button>
          </section>
        </FadeInSection>
      </div>
    </>
  );
}
