import { useState, useEffect, useRef } from 'react';
import Globe from './components/Globe';
import ControlPanel from './components/ControlPanel';
import SceneList from './components/SceneList';
import ImageryLayer from './components/ImageryLayer';
import apiClient from './api/client';
import './App.css';

interface ViewportBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

interface Scene {
  scene_id: string;
  date: string;
  cloud_cover: number;
  thumbnail_url: string | null;
  assets: {
    red: string;
    nir: string;
    tci: string;
  };
}

interface SearchParams {
  bbox: [number, number, number, number] | null;
  date_start: string;
  date_end: string;
  cloud_cover: number;
}

function App() {
  const viewerRef = useRef<any>(null);
  const [bounds, setBounds] = useState<ViewportBounds | null>(null);
  const [backendStatus, setBackendStatus] = useState<string>('Checking backend...');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [displayMode, setDisplayMode] = useState<'tci' | 'ndvi'>('tci');
  const [showResults, setShowResults] = useState<boolean>(false);
  const [sceneMode, setSceneMode] = useState<'3D' | '2D' | 'Columbus'>('3D');

  // Test backend connection on mount
  useEffect(() => {
    const testBackend = async () => {
      try {
        const connected = await apiClient.testConnection();
        if (connected) {
          setBackendStatus('Backend connected');
        } else {
          setBackendStatus('Backend connection failed');
        }
      } catch (error) {
        setBackendStatus('Backend not connected. Please start the Flask server.');
      }
    };
    testBackend();
  }, []);

  const handleBoundsChange = (newBounds: ViewportBounds) => {
    setBounds(newBounds);
  };

  const handleSearch = async (params: SearchParams) => {
    if (!params.bbox) {
      alert('No search area defined');
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      const results = await apiClient.searchImagery(params);
      setScenes(results);

      if (results.length === 0) {
        alert('No imagery found for the specified parameters. Try adjusting the date range or cloud cover.');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please check the backend connection and try again.');
      setScenes([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSceneSelect = (scene: Scene) => {
    setSelectedScene(scene);
    console.log('Selected scene:', scene.scene_id);
    console.log('TCI URL:', scene.assets.tci);
    // The imagery will be displayed automatically via the ImageryLayer component
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
        maxWidth: '200px'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Satellite 3D Playground</h3>
        <div style={{ fontSize: '11px' }}>
          {backendStatus === 'Backend connected' ? (
            <span style={{ color: '#4CAF50' }}>✓ {backendStatus}</span>
          ) : (
            <span style={{ color: '#ff9800' }}>⚠ {backendStatus}</span>
          )}
        </div>
      </div>

      {/* View Mode Controls - positioned to avoid overlap */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: 'rgba(42, 42, 42, 0.9)',
        color: 'white',
        padding: '5px',
        borderRadius: '5px',
        display: 'flex',
        gap: '5px'
      }}>
        <button
          onClick={() => setSceneMode('3D')}
          style={{
            padding: '5px 10px',
            backgroundColor: sceneMode === '3D' ? '#4CAF50' : '#555',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          3D
        </button>
        <button
          onClick={() => setSceneMode('2D')}
          style={{
            padding: '5px 10px',
            backgroundColor: sceneMode === '2D' ? '#4CAF50' : '#555',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          2D
        </button>
        <button
          onClick={() => setSceneMode('Columbus')}
          style={{
            padding: '5px 10px',
            backgroundColor: sceneMode === 'Columbus' ? '#4CAF50' : '#555',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Columbus
        </button>
      </div>

      {/* Control Panel for search */}
      <ControlPanel
        currentBounds={bounds}
        onSearch={handleSearch}
        isSearching={isSearching}
        displayMode={displayMode}
        onDisplayModeChange={setDisplayMode}
        hasSelectedScene={selectedScene !== null}
      />

      {/* Search Results */}
      {showResults && (
        <SceneList
          scenes={scenes}
          onSceneSelect={handleSceneSelect}
          selectedSceneId={selectedScene?.scene_id}
        />
      )}

      {/* Imagery Layer (placeholder for Phase 2) */}
      <ImageryLayer
        scene={selectedScene}
        displayMode={displayMode}
        viewerRef={viewerRef}
      />

      {/* 3D Globe */}
      <Globe
        onBoundsChange={handleBoundsChange}
        viewerRef={viewerRef}
        sceneMode={sceneMode}
      />
    </div>
  );
}

export default App;