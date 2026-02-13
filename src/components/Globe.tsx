import { useRef, useEffect, useState } from 'react';
import { Viewer, Camera } from 'resium';
import { createWorldTerrainAsync, Math as CesiumMath, Cartesian3 } from 'cesium';
// import { Ion } from 'cesium'; // Uncomment when you add your Cesium Ion token

interface ViewportBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

interface GlobeProps {
  onBoundsChange?: (bounds: ViewportBounds) => void;
  viewerRef?: React.MutableRefObject<any>;
  sceneMode?: '3D' | '2D' | 'Columbus';
}

const Globe: React.FC<GlobeProps> = ({ onBoundsChange, viewerRef: externalViewerRef, sceneMode = '3D' }) => {
  const internalViewerRef = useRef<any>(null);
  const viewerRef = externalViewerRef || internalViewerRef;
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

  // Handle scene mode changes
  useEffect(() => {
    if (!viewerRef.current || !viewerRef.current.cesiumElement) return;

    const viewer = viewerRef.current.cesiumElement;
    const scene = viewer.scene;

    // Store current camera position before morphing
    const currentPosition = viewer.camera.positionWC.clone();

    switch (sceneMode) {
      case '2D':
        scene.morphTo2D(2.0); // Slower transition for stability
        // Ensure the camera is positioned correctly after morphing
        setTimeout(() => {
          if (viewer.scene.mode === 2) { // SceneMode.SCENE2D
            viewer.camera.setView({
              destination: viewer.scene.globe.ellipsoid.cartesianToCartographic(currentPosition)
            });
          }
        }, 2500);
        break;
      case '3D':
        scene.morphTo3D(2.0);
        break;
      case 'Columbus':
        scene.morphToColumbusView(2.0);
        break;
    }
  }, [sceneMode, viewerRef]);

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!viewerRef.current || !viewerRef.current.cesiumElement) return;

      const viewer = viewerRef.current.cesiumElement;
      const camera = viewer.camera;

      // Calculate move rate based on current altitude
      let moveRate;
      if (camera.positionCartographic) {
        moveRate = camera.positionCartographic.height / 100.0;
      } else {
        // Fallback for 2D mode
        moveRate = 10000; // Fixed rate for 2D mode
      }

      // Check if we're in 2D mode (SceneMode.SCENE2D = 2)
      const is2DMode = viewer.scene.mode === 2;

      switch (event.key) {
        case 'ArrowUp':
          if (is2DMode) {
            camera.moveUp(moveRate);
          } else {
            camera.moveForward(moveRate);
          }
          handleCameraMove();
          break;
        case 'ArrowDown':
          if (is2DMode) {
            camera.moveDown(moveRate);
          } else {
            camera.moveBackward(moveRate);
          }
          handleCameraMove();
          break;
        case 'ArrowLeft':
          camera.moveLeft(moveRate);
          handleCameraMove();
          break;
        case 'ArrowRight':
          camera.moveRight(moveRate);
          handleCameraMove();
          break;
        case 'PageUp':
          // In 2D mode, this zooms in
          if (is2DMode) {
            camera.zoomIn(2);
          } else {
            camera.moveUp(moveRate);
          }
          handleCameraMove();
          break;
        case 'PageDown':
          // In 2D mode, this zooms out
          if (is2DMode) {
            camera.zoomOut(2);
          } else {
            camera.moveDown(moveRate);
          }
          handleCameraMove();
          break;
      }
    };

    // Add keyboard event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
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
        homeButton={false}
        sceneModePicker={false}
        selectionIndicator={false}
        infoBox={false}
        scene3DOnly={false}
        shouldAnimate={true}
        creditContainer={document.createElement('div')} // Hide credits
        mapMode2D={1} // Use infinite scroll mode for 2D
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