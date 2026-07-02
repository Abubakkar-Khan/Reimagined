'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function UploadWidget({ onUploadSuccess }) {
  const [loading, setLoading] = useState(false);
  const [widget, setWidget] = useState(null);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    authorName: '',
    caption: '',
    prompt: '',
    detail: ''
  });

  useEffect(() => {
    const initWidget = async () => {
      if (window.cloudinary && !widget) {
        try {
          // Fetch the dynamic Cloudinary config from our backend API
          const res = await fetch('/api/cloudinary/config');
          if (!res.ok) throw new Error('Cloudinary config missing on backend');
          const config = await res.json();

          // Define the signature generator for secure uploads
          const generateSignature = async (callback, paramsToSign) => {
            const signRes = await fetch('/api/cloudinary/sign', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(paramsToSign)
            });
            const signData = await signRes.json();
            callback(signData.signature);
          };

          const w = window.cloudinary.createUploadWidget(
            {
              cloudName: config.cloudName,
              apiKey: config.apiKey,
              uploadSignature: generateSignature,
              sources: ['local', 'url'],
              multiple: false,
              clientAllowedFormats: ['jpg', 'png', 'jpeg'],
              maxImageFileSize: 25000000,
            },
            (error, result) => {
              if (!error && result && result.event === 'success') {
                setUploadedUrl(result.info.secure_url);
                setFormData(prev => ({
                  ...prev,
                  title: `Entry-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
                }));
                setShowDetailsForm(true);
              }
            }
          );
          setWidget(w);
        } catch (err) {
          console.error('Failed to init Cloudinary Widget:', err);
        }
      }
    };
    
    if (window.cloudinary) {
      initWidget();
    } else {
      const interval = setInterval(() => {
        if (window.cloudinary) {
          initWidget();
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [widget]);

  const handleSubmitDetails = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: uploadedUrl,
          title: formData.title,
          authorName: formData.authorName,
          caption: formData.caption,
          prompt: formData.prompt,
          detail: formData.detail
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to save image details.');
      } else {
        setShowDetailsForm(false);
        if (onUploadSuccess) onUploadSuccess();
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading image details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        className="btn-primary"
        onClick={() => {
          if (widget) {
            widget.open();
          } else {
            alert('Upload Widget is not ready. Please ensure CLOUDINARY_URL is set in your .env file and restart the server.');
          }
        }}
        disabled={loading}
        style={{ padding: '0.85rem 2.5rem', fontSize: '1.1rem', cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        Upload 360° Image
      </button>

      {showDetailsForm && typeof document !== 'undefined' && createPortal(
        <div className="form-overlay">
          <div className="form-modal glass-panel">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: '#fff' }}>Image Details</h3>
            <form onSubmit={handleSubmitDetails}>
              <div className="form-group">
                <label>Author / Username</label>
                <input 
                  type="text" 
                  placeholder="e.g. Creator123"
                  value={formData.authorName}
                  onChange={(e) => setFormData({...formData, authorName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Caption</label>
                <input 
                  type="text" 
                  placeholder="A short, catchy caption"
                  value={formData.caption}
                  onChange={(e) => setFormData({...formData, caption: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>AI Prompt (if generated)</label>
                <textarea 
                  rows="3"
                  placeholder="The exact prompt used..."
                  value={formData.prompt}
                  onChange={(e) => setFormData({...formData, prompt: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowDetailsForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Submit Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      <style jsx>{`
        .form-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.85);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(12px);
        }
        .form-modal {
          width: 100%;
          max-width: 500px;
          padding: 2.5rem;
          background: #050505;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
          text-align: left;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--accents-5);
          font-size: 0.9rem;
          font-weight: 500;
        }
        .form-group input, .form-group textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          background: #000;
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--geist-foreground);
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .form-group input:focus, .form-group textarea:focus {
          outline: none;
          border-color: var(--geist-success);
        }
      `}</style>
    </>
  );
}
