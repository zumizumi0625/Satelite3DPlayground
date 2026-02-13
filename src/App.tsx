import { useState, useEffect } from 'react';
import Globe from './components/Globe';
import './App.css';

interface ViewportBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

function App() {
  const [bounds, setBounds] = useState<ViewportBounds | null>(null);
  const [backendStatus, setBackendStatus] = useState<string>('Checking backend...');

  // Test backend connection on mount
  useEffect(() => {
    const testBackend = async () => {
      try {
        const response = await fetch('http://localhost:5000/');
        const data = await response.json();
        setBackendStatus(`Backend connected: ${data.message}`);
      } catch (error) {
        setBackendStatus('Backend not connected. Please start the Flask server.');
      }
    };
    testBackend();
  }, []);

  const handleBoundsChange = (newBounds: ViewportBounds) => {
    setBounds(newBounds);
  };

  return (
    <div className="App">
      {/* Status bar */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 1000,
        backgroundColor: 'rgba(42, 42, 42, 0.9)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        maxWidth: '300px'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Satellite 3D Playground</h3>
        <div>Backend: {backendStatus}</div>
        {bounds && (
          <div style={{ marginTop: '10px' }}>
            <div>Current Viewport:</div>
            <div>West: {bounds.west.toFixed(4)}°</div>
            <div>South: {bounds.south.toFixed(4)}°</div>
            <div>East: {bounds.east.toFixed(4)}°</div>
            <div>North: {bounds.north.toFixed(4)}°</div>
          </div>
        )}
      </div>

      {/* 3D Globe */}
      <Globe onBoundsChange={handleBoundsChange} />
    </div>
  );
}

export default App;