import './App.css'
import React, { useState, useCallback } from 'react'
import Terminal from './components/Terminal'
import Website from './components/Website'

function App() {
  const [mode, setMode] = useState<'terminal' | 'website'>('terminal')
  const handleSwitch = useCallback((next: 'terminal' | 'website') => setMode(next), [])
  return (
    <div style={{ minHeight: '100vh' }}>
      {mode === 'terminal' ? (
        <Terminal ownerName="Logan Carlson" onSwitchMode={handleSwitch} />
      ) : (
        <Website ownerName="Logan Carlson" onSwitchMode={handleSwitch} />
      )}
    </div>
  )
}

export default App
