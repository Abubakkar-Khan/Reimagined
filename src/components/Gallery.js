'use client';
import { useState } from 'react';
import Viewer360 from './Viewer360';

const getThumbnailUrl = (url) => {
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

  const toggleLike = async (id, currentLiked) => {
    try {
      const res = await fetch(`/api/images/${id}/like`, { method: 'POST' });
      if (res.ok) {
        const { liked } = await res.json();
        setImages(images.map(img => {
          if (img.id === id) {
            return {
              ...img,
              hasLiked: liked,
              likesCount: img.likesCount + (liked ? 1 : -1)
            };
          }
          return img;
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--accents-5)' }}>Loading Gallery...</div>;
  }

  if (images.length === 0) {
    return <div style={{ textAlign: 'center', padding: '5rem 3rem', color: 'var(--accents-5)', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '24px' }}>No entries uploaded yet. Be the first to reimagine the world!</div>;
  }

  return (
    <div>
      <div className="gallery-grid">
        {images.map(img => (
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
              <h4 style={{ fontSize: '1.2rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>{img.title}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--accents-5)', marginBottom: '1rem' }}>By {img.authorName}</p>
              {img.caption && <p className="caption">{img.caption}</p>}
              <div className="gallery-actions">
                <button 
                  className={`btn-like ${img.hasLiked ? 'liked' : ''}`}
                  onClick={() => toggleLike(img.id, img.hasLiked)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={img.hasLiked ? "var(--geist-success)" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <span>{img.likesCount}</span>
                </button>
                <a href={getDownloadUrl(img.url)} target="_blank" rel="noopener noreferrer" download className="btn-download" title="Download High-Res Image">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedImage(null)}>✕</button>
            
            <div className="modal-viewer">
              {/* Ensure Viewer360 re-renders properly on selectedImage change */}
              <Viewer360 key={selectedImage.id} imageUrl={selectedImage.url} autoRotate={-1} />
              
              {/* Info Overlay */}
              <div className="modal-info-overlay">
                <h3>{selectedImage.title}</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--geist-success)', marginBottom: '0.75rem', fontWeight: 500 }}>By {selectedImage.authorName}</p>
                {selectedImage.detail && <p>{selectedImage.detail}</p>}
                {selectedImage.prompt && <p className="prompt-text"><strong>Prompt:</strong> {selectedImage.prompt}</p>}
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="modal-strip">
              <div className="modal-strip-inner">
                {images.map(img => (
                  <div 
                    key={img.id} 
                    className={`strip-thumb ${img.id === selectedImage.id ? 'active' : ''}`}
                    onClick={() => setSelectedImage(img)}
                    style={{ backgroundImage: `url(${getThumbnailUrl(img.url)})` }}
                    title={img.title}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
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
          color: var(--geist-success);
        }
        .btn-like.liked:hover {
          color: #4ade80;
        }
        .btn-download {
          display: flex;
          align-items: center;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--accents-5);
          text-decoration: none;
          transition: color 0.2s, transform 0.2s;
          background: rgba(255,255,255,0.05);
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .btn-download:hover {
          color: #fff;
          background: rgba(255,255,255,0.1);
          transform: translateY(-2px);
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
          border-color: var(--geist-success);
          transform: scale(1.05);
          box-shadow: 0 0 0 2px rgba(0, 112, 243, 0.3);
        }
      `}</style>
    </div>
  );
}
