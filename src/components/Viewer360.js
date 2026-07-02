'use client';
import { useEffect, useRef } from 'react';

export default function Viewer360({ imageUrl, pitch = 0, yaw = 0, hfov = 110, autoLoad = true, autoRotate = -2 }) {
  const viewerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const initViewer = () => {
      if (window.pannellum && containerRef.current && !viewerRef.current) {
        viewerRef.current = window.pannellum.viewer(containerRef.current, {
          type: 'equirectangular',
          panorama: imageUrl,
          autoLoad: autoLoad,
          pitch: pitch,
          yaw: yaw,
          hfov: hfov,
          autoRotate: autoRotate,
          compass: false,
          showZoomCtrl: true,
          showFullscreenCtrl: true
        });
      }
    };

    if (window.pannellum) {
      initViewer();
    } else {
      const interval = setInterval(() => {
        if (window.pannellum) {
          initViewer();
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [imageUrl, autoLoad, pitch, yaw, hfov, autoRotate]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
