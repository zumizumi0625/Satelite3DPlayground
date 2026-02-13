import { useRef, useEffect, useState } from 'react';
import { Viewer, Camera } from 'resium';
import { createWorldTerrainAsync, Math as CesiumMath } from 'cesium';
// import { Ion } from 'cesium'; // Uncomment when you add your Cesium Ion token

interface ViewportBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

interface GlobeProps {
  onBoundsChange?: (bounds: ViewportBounds) => void;
}

const Globe: React.FC<GlobeProps> = ({ onBoundsChange }) => {
  const viewerRef = useRef<any>(null);
  const [terrainProvider, setTerrainProvider] = useState<any>(null);

  useEffect(() => {
    // Set Cesium Ion default access token (optional but recommended)
    // You can get your own free token at https://cesium.com/ion/
    // Ion.defaultAccessToken = 'your-token-here';

    // Load Cesium World Terrain
    const loadTerrain = async () => {
      try {
        const terrain = await createWorldTerrainAsync({
          requestWaterMask: true,
          requestVertexNormals: true
        });
        setTerrainProvider(terrain);
      } catch (error) {
        console.error('Failed to load terrain:', error);
      }
    };
    loadTerrain();
  }, []);

  // Camera movement handler to track viewport bounds
  const handleCameraMove = () => {
    if (!viewerRef.current || !viewerRef.current.cesiumElement) return;

    const viewer = viewerRef.current.cesiumElement;
    const camera = viewer.camera;

    try {
      // Get the current viewport bounds
      const rectangle = camera.computeViewRectangle();

      if (rectangle && onBoundsChange) {
        const bounds: ViewportBounds = {
          west: CesiumMath.toDegrees(rectangle.west),
          south: CesiumMath.toDegrees(rectangle.south),
          east: CesiumMath.toDegrees(rectangle.east),
          north: CesiumMath.toDegrees(rectangle.north)
        };
        onBoundsChange(bounds);
      }
    } catch (error) {
      // computeViewRectangle can fail when viewing the globe from certain angles
      console.debug('Unable to compute view rectangle:', error);
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Viewer
        ref={viewerRef}
        full
        terrainProvider={terrainProvider}
        baseLayerPicker={false}
        navigationHelpButton={false}
        animation={false}
        timeline={false}
        vrButton={false}
        geocoder={false}
        homeButton={true}
        sceneModePicker={true}
        selectionIndicator={false}
        infoBox={false}
        scene3DOnly={false}
        shouldAnimate={true}
        creditContainer={document.createElement('div')} // Hide credits
      >
        {/* Camera component for handling camera events */}
        <Camera
          onMoveEnd={handleCameraMove}
          onChange={handleCameraMove}
        />
      </Viewer>
    </div>
  );
};

export default Globe;