import React from 'react';
import './terminal.css';

type ViewerContent = {
  kind: 'image' | 'video' | 'text' | 'link';
  title: string;
  src?: string;
  text?: string;
};

export const FileViewer: React.FC<{ content: ViewerContent; onClose: () => void }> = ({ content, onClose }) => {
  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <div className="overlay-card">
        <div className="overlay-header">
          <div className="overlay-title">{content.title}</div>
          <button className="overlay-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="overlay-body">
          {content.kind === 'image' && content.src && (
            <img className="media" src={content.src} alt={content.title} />
          )}
          {content.kind === 'video' && content.src && (
            <video className="media" src={content.src} controls />
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

