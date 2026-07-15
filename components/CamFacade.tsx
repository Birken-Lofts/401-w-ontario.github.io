'use client';

import { useState } from 'react';

const EMBED_SRC = 'https://www.youtube-nocookie.com/embed/DdyWM2B-FYQ?autoplay=1&mute=1';

export default function CamFacade() {
  const [playing, setPlaying] = useState(false);

  const preconnect = () => {
    if (document.querySelector('link[data-yt-preconnect]')) return;
    const l = document.createElement('link');
    l.rel = 'preconnect';
    l.href = 'https://www.youtube-nocookie.com';
    l.setAttribute('data-yt-preconnect', '');
    document.head.appendChild(l);
  };

  if (playing) {
    return (
      <iframe
        src={EMBED_SRC}
        title="Ohio Feeder Ramp live stream"
        allow="autoplay; encrypted-media; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      className="cam-facade"
      onClick={() => setPlaying(true)}
      onPointerEnter={preconnect}
      onTouchStart={preconnect}
      aria-label="Play the live stream"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/cam-poster.webp" alt="" width={1280} height={720} fetchPriority="high" />
      <span className="cam-live-badge">LIVE</span>
      <span className="cam-play">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
        Play live stream
      </span>
    </button>
  );
}
