import React, { useMemo, useState } from 'react';
import './terminal.css';

type ViewerContent = {
  kind: 'image' | 'video' | 'text' | 'link';
  title: string;
  src?: string;
  text?: string;
};

export const FileViewer: React.FC<{ content: ViewerContent; onClose: () => void }> = ({ content, onClose }) => {
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const fallbackCandidates = useMemo(() => {
    if (content.kind !== 'image') return [] as string[];
    const list: string[] = [];
    if (content.src) list.push(content.src);
    list.push(
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
      `https://picsum.photos/1200/800?random=${Date.now()}`,
    );
    return list;
  }, [content.kind, content.src]);
  const [imgIndex, setImgIndex] = useState(0);
  const activeImg = fallbackCandidates[imgIndex];

  const onImgError = () => {
    if (imgIndex < fallbackCandidates.length - 1) setImgIndex(i => i + 1);
    else setImageError(true);
  };
  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <div className="overlay-card">
        <div className="overlay-header">
          <div className="overlay-title">{content.title}</div>
          <button className="overlay-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="overlay-body">
          {content.kind === 'image' && (activeImg || imageError) && (
            imageError ? (
              <div className="overlay-text">Failed to load image. {content.src && (<a className="link-out" href={content.src} target="_blank" rel="noreferrer">Open source ↗</a>)}
              </div>
            ) : (
              <img className="media" src={activeImg} alt={content.title} onError={onImgError} />
            )
          )}
          {content.kind === 'video' && content.src && (
            videoError ? (
              <div className="overlay-text">Failed to load video. <a className="link-out" href={content.src} target="_blank" rel="noreferrer">Open source ↗</a></div>
            ) : (
              <video className="media" src={content.src} controls onError={() => setVideoError(true)} />
            )
          )}
          {content.kind === 'link' && content.src && (
            <a href={content.src} target="_blank" rel="noreferrer" className="link-out">Open link ↗</a>
          )}
          {content.kind === 'text' && (
            <pre className="overlay-text">{content.text}</pre>
          )}
        </div>
      </div>
    </div>
  );
};

