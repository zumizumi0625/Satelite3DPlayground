import { useState } from 'react';

interface SearchParams {
  bbox: [number, number, number, number] | null;
  date_start: string;
  date_end: string;
  cloud_cover: number;
}

interface ControlPanelProps {
  currentBounds: {
    west: number;
    south: number;
    east: number;
    north: number;
  } | null;
  onSearch: (params: SearchParams) => void;
  isSearching: boolean;
  displayMode: 'tci' | 'ndvi';
  onDisplayModeChange: (mode: 'tci' | 'ndvi') => void;
  hasSelectedScene: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  currentBounds,
  onSearch,
  isSearching,
  displayMode,
  onDisplayModeChange,
  hasSelectedScene
}) => {
  const [dateStart, setDateStart] = useState<string>('2024-01-01');
  const [dateEnd, setDateEnd] = useState<string>('2024-12-31');
  const [cloudCover, setCloudCover] = useState<number>(20);

  const handleSearch = () => {
    if (!currentBounds) {
      alert('Please position the camera to define a search area');
      return;
    }

    const searchParams: SearchParams = {
      bbox: [
        currentBounds.west,
        currentBounds.south,
        currentBounds.east,
        currentBounds.north
      ],
      date_start: dateStart,
      date_end: dateEnd,
      cloud_cover: cloudCover
    };

    onSearch(searchParams);
  };

  return (
    <div style={{
      position: 'absolute',
      top: 10,
      right: 10,
      width: '300px',
      zIndex: 1000,
      backgroundColor: 'rgba(42, 42, 42, 0.95)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>Search Sentinel-2 Imagery</h3>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
          Start Date:
        </label>
        <input
          type="date"
          value={dateStart}
          onChange={(e) => setDateStart(e.target.value)}
          style={{
            width: '100%',
            padding: '6px',
            backgroundColor: '#333',
            color: 'white',
            border: '1px solid #555',
            borderRadius: '4px'
          }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
          End Date:
        </label>
        <input
          type="date"
          value={dateEnd}
          onChange={(e) => setDateEnd(e.target.value)}
          style={{
            width: '100%',
            padding: '6px',
            backgroundColor: '#333',
            color: 'white',
            border: '1px solid #555',
            borderRadius: '4px'
          }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
          Max Cloud Cover: {cloudCover}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={cloudCover}
          onChange={(e) => setCloudCover(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      {currentBounds && (
        <div style={{
          marginBottom: '12px',
          padding: '8px',
          backgroundColor: '#2a2a2a',
          borderRadius: '4px',
          fontSize: '11px'
        }}>
          <div>Search Area:</div>
          <div>West: {currentBounds.west.toFixed(3)}°</div>
          <div>East: {currentBounds.east.toFixed(3)}°</div>
          <div>North: {currentBounds.north.toFixed(3)}°</div>
          <div>South: {currentBounds.south.toFixed(3)}°</div>
        </div>
      )}

      <button
        onClick={handleSearch}
        disabled={isSearching || !currentBounds}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: isSearching ? '#555' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isSearching || !currentBounds ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        {isSearching ? 'Searching...' : 'Search Imagery'}
      </button>

      {/* Display Mode Toggle */}
      {hasSelectedScene && (
        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #555' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
            Display Mode:
          </label>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button
              onClick={() => onDisplayModeChange('tci')}
              style={{
                flex: 1,
                padding: '6px',
                backgroundColor: displayMode === 'tci' ? '#4CAF50' : '#333',
                color: 'white',
                border: '1px solid #555',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              True Color
            </button>
            <button
              onClick={() => onDisplayModeChange('ndvi')}
              style={{
                flex: 1,
                padding: '6px',
                backgroundColor: displayMode === 'ndvi' ? '#4CAF50' : '#333',
                color: 'white',
                border: '1px solid #555',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              NDVI
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: '10px', fontSize: '11px', color: '#aaa' }}>
        <div>Keyboard Controls:</div>
        <div>↑↓←→: Move camera</div>
        <div>PageUp/PageDown: Adjust altitude</div>
      </div>
    </div>
  );
};

export default ControlPanel;