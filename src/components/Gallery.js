'use client';
import { useState, useEffect } from 'react';
import Viewer360 from './Viewer360';

const getThumbnailUrl = (url) => {
  if (url === '/IIUI_360.png') return '/original-thumb.jpg';
  if (!url || !url.includes('cloudinary.com/')) return url;
  const parts = url.split('/upload/');
  if (parts.length === 2) {
    return `${parts[0]}/upload/w_400,q_auto,f_auto/${parts[1]}`;
  }
  return url;
};

// Force download of cloudinary images
const getDownloadUrl = (url) => {
  if (!url || !url.includes('cloudinary.com/')) return url;
  const parts = url.split('/upload/');
  if (parts.length === 2) {
    return `${parts[0]}/upload/fl_attachment/${parts[1]}`;
  }
  return url;
};

export default function Gallery({ images, setImages, loading }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [visibleCount, setVisibleCount] = useState(9);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    // Read ?image=id from URL on load
    if (typeof window !== 'undefined' && images.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const imageId = params.get('image');
      if (imageId) {
        const found = images.find(img => img.id === imageId || img.slug === imageId);
        if (found) {
          setSelectedImage(found);
          // Scroll to gallery section if requested
          setTimeout(() => {
            const gallerySection = document.getElementById('gallery');
            if (gallerySection) gallerySection.scrollIntoView({ behavior: 'smooth' });
          }, 300);
        }
      }
    }
  }, [images]);

  const handleShare = (id, authorName, slug) => {
    if (typeof navigator !== 'undefined') {
      const shareIdentifier = slug || id;
      const shareUrl = `${window.location.origin}${window.location.pathname}?image=${shareIdentifier}`;
      const shareText = `Check out this 360° reimagination of IIUI by ${authorName}!\n${shareUrl}`;
      navigator.clipboard.writeText(shareText)
        .then(() => {
          setCopiedId(id);
          setTimeout(() => setCopiedId(null), 2000);
        })
        .catch(() => console.error('Failed to copy link.'));
    }
  };

  const toggleLike = async (id, currentLiked) => {
    // Optimistic UI Update - instant interaction
    const previousImages = [...images];
    setImages(images.map(img => {
      if (img.id === id) {
        return {
          ...img,
          hasLiked: !currentLiked,
          likesCount: img.likesCount + (!currentLiked ? 1 : -1)
        };
      }
      return img;
    }));

    try {
      const res = await fetch(`/api/images/${id}/like`, { method: 'POST' });
      if (!res.ok) {
        // Revert if the backend fails
        setImages(previousImages);
      }
    } catch (err) {
      console.error('Like failed:', err);
      // Revert on error
      setImages(previousImages);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--accents-5)' }}>Loading Gallery...</div>;
  }

  if (images.length === 0) {
    return <div style={{ textAlign: 'center', padding: '5rem 3rem', color: 'var(--accents-5)', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '24px' }}>No entries uploaded yet. Be the first to reimagine the world!</div>;
  }

  const sortedImages = images;
  const displayedImages = sortedImages.slice(0, visibleCount);

  return (
    <div>
      <div className="gallery-grid">
        {displayedImages.map(img => (
          <div key={img.id} className="gallery-card glass-panel">
            <div 
              className="gallery-thumb" 
              style={{ backgroundImage: `url(${getThumbnailUrl(img.url)})` }}
              onClick={() => setSelectedImage(img)}
            >
              <div className="gallery-overlay">
                <span>View 360°</span>
              </div>
            </div>
            <div className="gallery-info">
              {img.title && !img.title.startsWith('Entry-') && (
                <h4 style={{ fontSize: '1.2rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>{img.title}</h4>
              )}
              <p style={{ fontSize: '0.85rem', color: 'var(--accents-5)', marginBottom: '1rem' }}>By {img.authorName}</p>
              {img.caption && <p className="caption">{img.caption}</p>}
              <div className="gallery-actions">
                <button 
                  className={`btn-like ${img.hasLiked ? 'liked' : ''}`}
                  onClick={() => toggleLike(img.id, img.hasLiked)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={img.hasLiked ? "#fff" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <span>{img.likesCount}</span>
                </button>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a href={getDownloadUrl(img.url)} target="_blank" rel="noopener noreferrer" download className="btn-action" title="Download High-Res Image">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.35rem' }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download
                  </a>
                  <button className={`btn-action ${copiedId === img.id ? 'copied' : ''}`} onClick={() => handleShare(img.id, img.authorName, img.slug)} title="Share Link">
                    {copiedId === img.id ? (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.35rem' }}>
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span style={{ color: '#4ade80' }}>Copied</span>
                      </>
                    ) : (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.35rem' }}>
                          <circle cx="18" cy="5" r="3"></circle>
                          <circle cx="6" cy="12" r="3"></circle>
                          <circle cx="18" cy="19" r="3"></circle>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                        Share
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {visibleCount < sortedImages.length && (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button 
            onClick={() => setVisibleCount(prev => prev + 9)}
            className="btn-load-more"
          >
            Load More
          </button>
        </div>
      )}

      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => {
              setSelectedImage(null);
              // Clean up URL if they close modal
              if (typeof window !== 'undefined') {
                const url = new URL(window.location);
                url.searchParams.delete('image');
                window.history.pushState({}, '', url);
              }
            }}>✕</button>
            
            <div className="modal-viewer">
              {/* Ensure Viewer360 re-renders properly on selectedImage change */}
              <Viewer360 key={selectedImage.id} imageUrl={selectedImage.url} autoRotate={-1} />
              
              {/* Info Overlay */}
              <div className="modal-info-overlay">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    {selectedImage.title && !selectedImage.title.startsWith('Entry-') && (
                      <h3>{selectedImage.title}</h3>
                    )}
                    <p style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.75rem', fontWeight: 500 }}>By {selectedImage.authorName}</p>
                  </div>
                  <button className={`btn-action ${copiedId === selectedImage.id ? 'copied' : ''}`} onClick={(e) => { e.stopPropagation(); handleShare(selectedImage.id, selectedImage.authorName, selectedImage.slug); }} title="Share Link" style={{ padding: '0.5rem', pointerEvents: 'auto' }}>
                    {copiedId === selectedImage.id ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18" cy="5" r="3"></circle>
                        <circle cx="6" cy="12" r="3"></circle>
                        <circle cx="18" cy="19" r="3"></circle>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                      </svg>
                    )}
                  </button>
                </div>
                {selectedImage.detail && <p style={{ pointerEvents: 'auto' }}>{selectedImage.detail}</p>}
                {selectedImage.prompt && <p className="prompt-text"><strong>Prompt:</strong> {selectedImage.prompt}</p>}
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="modal-strip">
              <div className="modal-strip-inner">
                {sortedImages.map(img => (
                  <div 
                    key={img.id} 
                    className={`strip-thumb ${img.id === selectedImage.id ? 'active' : ''}`}
                    onClick={() => setSelectedImage(img)}
                    style={{ backgroundImage: `url(${getThumbnailUrl(img.url)})` }}
                    title={img.title && !img.title.startsWith('Entry-') ? img.title : (img.caption || `By ${img.authorName}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .btn-load-more {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          padding: 0.85rem 2.5rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }
        .btn-load-more:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-2px);
        }
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
        }
        .gallery-card {
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          background: rgba(20,20,20,0.6);
          border: 1px solid rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
          border-radius: 20px;
        }
        .gallery-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
          border-color: rgba(255,255,255,0.15);
        }
        .gallery-thumb {
          width: 100%;
          height: 240px;
          background-size: cover;
          background-position: center;
          position: relative;
          cursor: pointer;
        }
        .gallery-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          backdrop-filter: blur(4px);
        }
        .gallery-thumb:hover .gallery-overlay {
          opacity: 1;
        }
        .gallery-overlay span {
          background: rgba(255,255,255,0.15);
          color: #fff;
          padding: 0.6rem 1.5rem;
          border-radius: 99px;
          border: 1px solid rgba(255,255,255,0.3);
          font-weight: 600;
          font-size: 0.95rem;
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .gallery-thumb:hover .gallery-overlay span {
          transform: scale(1.05);
          background: rgba(255,255,255,0.25);
        }
        .gallery-info {
          padding: 1.5rem;
        }
        .caption {
          color: var(--accents-5);
          font-size: 0.95rem;
          margin-bottom: 1.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .gallery-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 1.25rem;
        }
        .btn-like {
          background: none;
          border: none;
          color: var(--accents-5);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: color 0.2s, transform 0.2s;
        }
        .btn-like:hover {
          color: #fff;
          transform: scale(1.05);
        }
        .btn-like.liked {
          color: #fff;
        }
        .btn-like.liked:hover {
          color: #ddd;
        }
        .btn-action {
          display: flex;
          align-items: center;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--accents-5);
          text-decoration: none;
          transition: all 0.2s;
          background: rgba(255,255,255,0.05);
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.05);
          cursor: pointer;
        }
        .btn-action:hover {
          color: #fff;
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.15);
        }
        .btn-action.copied {
          border-color: rgba(74, 222, 128, 0.4);
          background: rgba(74, 222, 128, 0.1);
        }
        
        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.95);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          backdrop-filter: blur(10px);
        }
        .modal-content {
          background: #000;
          width: 100%;
          max-width: 1600px;
          height: 90vh;
          border-radius: 24px;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
        }
        .modal-close {
          position: absolute;
          top: 1.5rem; right: 1.5rem;
          background: rgba(0,0,0,0.6);
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          width: 44px; height: 44px;
          border-radius: 50%;
          font-size: 1.2rem;
          cursor: pointer;
          z-index: 100;
          backdrop-filter: blur(8px);
          transition: background 0.2s, transform 0.2s;
        }
        .modal-close:hover {
          background: rgba(0,0,0,0.9);
          transform: scale(1.1);
        }
        .modal-viewer {
          flex: 1;
          position: relative;
        }
        .modal-info-overlay {
          position: absolute;
          top: 2rem; left: 2rem;
          background: rgba(0,0,0,0.7);
          padding: 1.5rem;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(12px);
          max-width: 400px;
          z-index: 10;
          pointer-events: none; /* Let clicks pass through to viewer */
        }
        .modal-info-overlay h3 { margin-bottom: 0.5rem; font-size: 1.5rem; letter-spacing: -0.03em; color: #fff; }
        .modal-info-overlay p { color: #eee; line-height: 1.5; }
        .prompt-text {
          margin-top: 1rem;
          font-size: 0.85rem;
          color: var(--accents-5) !important;
          background: rgba(0,0,0,0.5);
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.05);
          max-height: 150px;
          overflow-y: auto;
          pointer-events: auto;
        }
        .prompt-text::-webkit-scrollbar { width: 4px; }
        .prompt-text::-webkit-scrollbar-track { background: transparent; }
        .prompt-text::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }

        @media (max-width: 768px) {
          .prompt-text {
            display: none;
          }
          .modal-info-overlay {
            top: auto; bottom: 1rem; left: 1rem; right: auto;
            max-width: 75%;
            padding: 1rem;
          }
          .modal-info-overlay h3 {
            font-size: 1.2rem;
            margin-bottom: 0.25rem;
          }
          .modal-info-overlay p {
            font-size: 0.85rem !important;
            margin-bottom: 0.5rem;
          }
          .modal-info-overlay .btn-action {
            padding: 0.35rem;
          }
          .modal-info-overlay .btn-action svg {
            width: 16px; height: 16px;
          }
        }
        
        /* Modal Thumbnail Strip */
        .modal-strip {
          background: #0a0a0a;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 1.25rem;
          height: 140px;
          display: flex;
          align-items: center;
        }
        .modal-strip-inner {
          display: flex;
          gap: 1.25rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
          width: 100%;
        }
        .modal-strip-inner::-webkit-scrollbar {
          height: 6px;
        }
        .modal-strip-inner::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 3px;
        }
        .modal-strip-inner::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
          border-radius: 3px;
        }
        .strip-thumb {
          flex: 0 0 140px;
          height: 90px;
          border-radius: 12px;
          background-size: cover;
          background-position: center;
          cursor: pointer;
          opacity: 0.5;
          transition: opacity 0.2s, transform 0.2s, border 0.2s;
          border: 2px solid transparent;
        }
        .strip-thumb:hover {
          opacity: 0.9;
          transform: translateY(-4px);
        }
        .strip-thumb.active {
          opacity: 1;
          border-color: #fff;
          transform: scale(1.05);
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
