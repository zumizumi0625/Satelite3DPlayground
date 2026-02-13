import { useState } from 'react';

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

interface SceneListProps {
  scenes: Scene[];
  onSceneSelect: (scene: Scene) => void;
  selectedSceneId?: string | null;
}

const SceneList: React.FC<SceneListProps> = ({ scenes, onSceneSelect, selectedSceneId }) => {
  const [expandedScene, setExpandedScene] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleExpand = (sceneId: string) => {
    setExpandedScene(expandedScene === sceneId ? null : sceneId);
  };

  if (scenes.length === 0) {
    return (
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        width: '350px',
        maxHeight: '400px',
        zIndex: 1000,
        backgroundColor: 'rgba(42, 42, 42, 0.95)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        overflowY: 'auto'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Search Results</h3>
        <p style={{ color: '#aaa', fontSize: '14px' }}>
          No scenes found. Try adjusting your search parameters.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute',
      bottom: 10,
      left: 10,
      width: '350px',
      maxHeight: '400px',
      zIndex: 1000,
      backgroundColor: 'rgba(42, 42, 42, 0.95)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
      overflowY: 'auto'
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
        Search Results ({scenes.length} scenes)
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {scenes.map((scene) => (
          <div
            key={scene.scene_id}
            style={{
              backgroundColor: selectedSceneId === scene.scene_id ? '#3a3a3a' : '#2a2a2a',
              padding: '10px',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              border: selectedSceneId === scene.scene_id ? '2px solid #4CAF50' : '2px solid transparent'
            }}
            onClick={() => toggleExpand(scene.scene_id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {scene.scene_id.substring(0, 30)}...
                </div>
                <div style={{ fontSize: '11px', color: '#aaa' }}>
                  {formatDate(scene.date)}
                </div>
                <div style={{ fontSize: '11px', color: '#aaa' }}>
                  Cloud Cover: {scene.cloud_cover.toFixed(1)}%
                </div>
              </div>
              {scene.thumbnail_url && (
                <img
                  src={scene.thumbnail_url}
                  alt="Thumbnail"
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
            </div>

            {expandedScene === scene.scene_id && (
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #444' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSceneSelect(scene);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginBottom: '8px'
                  }}
                >
                  Display on Map
                </button>
                <div style={{ fontSize: '10px', color: '#888' }}>
                  <div>ID: {scene.scene_id}</div>
                  <div style={{ wordBreak: 'break-all' }}>
                    TCI: {scene.assets.tci.substring(0, 50)}...
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SceneList;