import React from 'react'
import './website.css'

type WebsiteProps = {
  ownerName: string
  onSwitchMode?: (mode: 'terminal' | 'website') => void
}

const Website: React.FC<WebsiteProps> = ({ ownerName, onSwitchMode }) => {
  return (
    <div className="site-root">
      <svg className="site-bg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0a2315"/>
            <stop offset="100%" stopColor="#03140b"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g1)" />
        <g className="grid">
          {Array.from({ length: 60 }).map((_, i) => (
            <line key={`v-${i}`} x1={(i+1)*24} y1="0" x2={(i+1)*24} y2="900" stroke="rgba(0,255,140,0.08)" strokeWidth="1" />
          ))}
          {Array.from({ length: 30 }).map((_, i) => (
            <line key={`h-${i}`} x1="0" y1={(i+1)*28} x2="1440" y2={(i+1)*28} stroke="rgba(0,255,140,0.06)" strokeWidth="1" />
          ))}
        </g>
        <g className="glow">
          <circle cx="1100" cy="120" r="140" fill="rgba(0,255,160,0.08)" />
          <circle cx="220" cy="680" r="180" fill="rgba(0,255,160,0.06)" />
        </g>
      </svg>

      <header className="site-header">
        <div className="brand">{ownerName}</div>
        <nav className="nav">
          <a href="#about">About</a>
          <a href="#projects">Projects</a>
          <a href="#gallery">Gallery</a>
          <a href="#contact">Contact</a>
          <button className="mode-toggle" onClick={() => onSwitchMode?.('terminal')}>Terminal ▓</button>
        </nav>
      </header>

      <main className="site-main">
        <section id="hero" className="hero">
          <h1><span className="accent">Building</span> reliable web apps</h1>
          <p>Full‑stack engineer focused on performance, DX, and accessible UI. TypeScript, React, Node, Go.</p>
          <div className="cta">
            <a className="btn primary" href="#projects">View Projects</a>
            <button className="btn ghost" onClick={() => onSwitchMode?.('terminal')}>Open Terminal</button>
          </div>
        </section>

        <section id="about" className="card">
          <h2>About</h2>
          <p>I design and build end‑to‑end features with an emphasis on code quality and observability — from API to pixel, with tests.</p>
        </section>

        <section id="projects" className="card">
          <h2>Projects</h2>
          <ul className="list">
            <li>
              <h3>Matrix Terminal</h3>
              <p>Retro‑futuristic terminal UI with local FS, GitHub integration, and media viewer.</p>
            </li>
            <li>
              <h3>Realtime Dashboard</h3>
              <p>WebSocket‑powered telemetry with streaming charts and alerts.</p>
            </li>
          </ul>
        </section>

        <section id="gallery" className="card">
          <h2>Gallery</h2>
          <div className="gallery">
            {['1501785888041-af3ef285b470','1491553895911-0055eca6402d','1519681393784-d120267933ba','1500530855697-b586d89ba3ee'].map((id) => (
              <img key={id} src={`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=70`} alt="gallery"/>
            ))}
          </div>
        </section>

        <section id="contact" className="card">
          <h2>Contact</h2>
          <p>Email: logan@yourdomain.example</p>
          <p>LinkedIn: linkedin.com/in/logancarlson</p>
        </section>
      </main>

      <footer className="site-footer">© {new Date().getFullYear()} {ownerName}</footer>
    </div>
  )
}

export default Website


