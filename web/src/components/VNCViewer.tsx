import React, { useEffect, useRef, useState } from 'react';
import './VNCViewer.css';

interface VNCViewerProps {
  sessionId: string | null;
}

export default function VNCViewer({ sessionId }: VNCViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [connected, setConnected] = useState(false);
  const pollRef = useRef<number | null>(null);

  async function fetchScreenshot(): Promise<string | null> {
    if (!sessionId) return null;
    try {
      // Prefer Electron IPC if available
      const openmux = (window as any).openmux;
      if (openmux && openmux.sandboxRequest) {
        const res = await openmux.sandboxRequest({ path: `/e2b/sessions/${sessionId}/screenshot` });
        if (res?.isImage && res.data) return `data:${res.contentType || 'image/png'};base64,${res.data}`;
        if (res?.json && res.json.data) return `data:image/png;base64,${res.json.data}`;
        return null;
      }

      // Fallback to direct HTTP
      const resp = await fetch(`/e2b/sessions/${sessionId}/screenshot`);
      if (!resp.ok) return null;
      const blob = await resp.blob();
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error('screenshot error', e);
      return null;
    }
  }

  async function drawScreenshot() {
    const url = await fetchScreenshot();
    if (!url) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      setConnected(true);
    };
    img.onerror = () => {
      // ignore
    };
    img.src = url;
  }

  useEffect(() => {
    if (!sessionId) {
      setConnected(false);
      if (pollRef.current) window.clearInterval(pollRef.current);
      return;
    }

    // Start polling screenshots every 1.5s
    drawScreenshot();
    pollRef.current = window.setInterval(() => {
      drawScreenshot();
    }, 1500);

    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <div className="vnc-viewer">
      <div className="vnc-header">
        <h2>🌐 Desktop Browser</h2>
        <div className="vnc-info">
          <p>VNC Port: 5900</p>
          <p>Session: {sessionId ? sessionId.substring(0, 8) : 'none'}</p>
        </div>
      </div>

      <div className="vnc-container">
        {!connected && (
          <div className="vnc-placeholder">
            <p>🖥️ Desktop view will appear here</p>
            <p>Connecting to sandbox for session...</p>
            <p className="smaller">(Polls /e2b/sessions/:id/screenshot every 1.5s)</p>
          </div>
        )}
        <canvas ref={canvasRef} className="vnc-canvas" />
      </div>

      <div className="vnc-controls">
        <button
          onClick={async () => {
            await drawScreenshot();
          }}
        >
          📸 Screenshot
        </button>
        <button>⌨️ Send Keys</button>
        <button>🖱️ Toggle Trackpad</button>
      </div>
    </div>
  );
}
