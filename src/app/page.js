'use client';
import { useState, useEffect } from 'react';
import Viewer360 from '@/components/Viewer360';
import Gallery from '@/components/Gallery';
import UploadWidget from '@/components/UploadWidget';

export default function Home() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/images');
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUploadSuccess = () => {
    fetchImages();
  };

  // Use the most recently uploaded image as the hero, fallback to default
  const heroImage = images.length > 0 ? images[0].url : "/Street View 360.jpg";

  return (
    <main style={{ overflowX: 'hidden' }}>
      {/* Floating Pill Navigation */}
      <nav style={{ position: 'fixed', top: '1.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 100, background: 'rgba(10, 10, 10, 0.7)', backdropFilter: 'blur(16px)', padding: '0.5rem 1.5rem', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', gap: '3rem', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/GDGoC%20IIUI%20Logo.png" alt="GDGoC IIUI" style={{ height: '32px', objectFit: 'contain' }} />
          <div style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.05em', color: '#fff' }}>REIMAGINED</div>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <a href="#instructions" style={{ fontWeight: 500, color: 'var(--accents-5)', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='#fff'} onMouseOut={e => e.target.style.color='var(--accents-5)'}>Rules</a>
          <a href="#gallery" style={{ fontWeight: 500, color: 'var(--accents-5)', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='#fff'} onMouseOut={e => e.target.style.color='var(--accents-5)'}>Gallery</a>
          <a href="#upload" style={{ fontWeight: 500, color: 'var(--accents-5)', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='#fff'} onMouseOut={e => e.target.style.color='var(--accents-5)'}>Upload</a>
        </div>
      </nav>

      {/* Cinematic Hero Section */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '10rem', paddingBottom: '4rem', overflow: 'hidden' }}>
        
        {/* Ambient Background Glows */}
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translate(-50%, -50%)', width: '80vw', height: '80vw', maxWidth: '1000px', maxHeight: '1000px', background: 'radial-gradient(circle, rgba(0,112,243,0.15) 0%, rgba(0,0,0,0) 60%)', zIndex: -1, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(121,40,202,0.1) 0%, rgba(0,0,0,0) 60%)', zIndex: -1, pointerEvents: 'none' }} />

        {/* Hero Text */}
        <div style={{ textAlign: 'center', zIndex: 10, maxWidth: '900px', padding: '0 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={{ fontSize: 'clamp(3.5rem, 8vw, 6.5rem)', fontWeight: 800, lineHeight: '1', letterSpacing: '-0.05em', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 4px 30px rgba(0,0,0,0.4))' }}>
            Reimagine<br/>Faisal Masjid.
          </h1>
          
          <p style={{ color: 'var(--accents-5)', fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', marginBottom: '3.5rem', maxWidth: '650px', lineHeight: '1.6' }}>
            Download the original 360° capture, reimagine the iconic Faisal Masjid in any creative style you want, and compete for the best creation!
          </p>
          
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/Street%20View%20360.jpg" download="Faisal_Masjid_Original_360.jpg" style={{ display: 'inline-flex', alignItems: 'center', padding: '0.85rem 2.5rem', fontSize: '1.1rem', fontWeight: 600, color: '#000', background: '#fff', borderRadius: '12px', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(255,255,255,0.4)' }}
               onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
               onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              Download Original
            </a>
            <div id="upload" style={{ position: 'relative', zIndex: 20 }}>
              <UploadWidget onUploadSuccess={handleUploadSuccess} />
            </div>
            <a href="#gallery" style={{ display: 'inline-flex', alignItems: 'center', padding: '0.85rem 2.5rem', fontSize: '1.1rem', fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', transition: 'all 0.2s', backdropFilter: 'blur(10px)' }}
               onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
               onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(0)' }}>
              Explore Gallery
            </a>
          </div>
        </div>

        {/* Cinematic Viewer Frame - Shows latest image */}
        <div style={{ position: 'relative', width: '92%', maxWidth: '1600px', height: '65vh', minHeight: '500px', marginTop: '6rem', borderRadius: '32px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 60px rgba(0, 112, 243, 0.15)', zIndex: 10, transform: 'perspective(1200px) rotateX(2deg)', transformOrigin: 'top' }}>
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'radial-gradient(ellipse at bottom, transparent 0%, rgba(0,0,0,0.5) 100%)' }} />
          {/* Ensure Viewer completely re-renders if heroImage changes */}
          <Viewer360 key={heroImage} imageUrl={heroImage} autoRotate={-1.5} hfov={100} />
          <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', zIndex: 10, background: 'rgba(0,0,0,0.6)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)' }}>
            Now Viewing: {images.length > 0 ? images[0].title : 'Default 360'}
          </div>
        </div>
      </section>

      {/* Competition Instructions */}
      <section id="instructions" style={{ padding: '6rem 2rem 2rem', background: '#000', position: 'relative' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', background: 'rgba(25,25,25,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '4rem', backdropFilter: 'blur(20px)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '3rem', textAlign: 'center', background: 'linear-gradient(to right, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Competition Instructions
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem' }}>1</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>Download Original</h3>
              <p style={{ color: 'var(--accents-5)', lineHeight: '1.6' }}>Download the original base 360° image of Faisal Masjid provided above to use as your canvas.</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem' }}>2</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>Use AI to Reimagine</h3>
              <p style={{ color: 'var(--accents-5)', lineHeight: '1.6' }}>Use AI tools or editing software to completely reimagine the Masjid in a new, unique style!</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem' }}>3</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>Upload to Share</h3>
              <p style={{ color: 'var(--accents-5)', lineHeight: '1.6' }}>Upload your creation and enter your real Name (this exact name will be used to generate your certificate).</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" style={{ padding: '8rem 2rem', background: '#000', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)' }} />
        
        <div className="container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #999)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Competition Gallery</h2>
            <p style={{ color: 'var(--accents-5)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>Discover and vote on the best 360° creations submitted by the community.</p>
          </div>
          
          <Gallery images={images} setImages={setImages} loading={loading} />
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '4rem 0', textAlign: 'center', background: '#050505', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <p style={{ fontSize: '1rem', letterSpacing: '0.02em', color: 'var(--accents-5)' }}>GDGoC presents Reimagined</p>
        </div>
      </footer>
    </main>
  );
}
