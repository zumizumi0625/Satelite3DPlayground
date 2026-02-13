import { useEffect, useRef, useState } from 'react';
import { Entity, ImageryLayer as CesiumImageryLayer, Viewer } from 'resium';
import {
  Rectangle,
  Math as CesiumMath,
  UrlTemplateImageryProvider,
  WebMapServiceImageryProvider,
  ImageryProvider,
  SingleTileImageryProvider,
  Credit,
  Material,
  Color
} from 'cesium';

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
  bbox?: number[];
}

interface ImageryLayerProps {
  scene: Scene | null;
  displayMode: 'tci' | 'ndvi';
  viewerRef?: React.RefObject<any>;
}

const ImageryLayer: React.FC<ImageryLayerProps> = ({ scene, displayMode, viewerRef }) => {
  const [imageryProvider, setImageryProvider] = useState<ImageryProvider | null>(null);
  const [ndviMaterial, setNdviMaterial] = useState<Material | null>(null);

  useEffect(() => {
    if (!scene || !viewerRef?.current?.cesiumElement) return;

    const viewer = viewerRef.current.cesiumElement;

    if (displayMode === 'tci') {
      // For TCI display, we'll use a proxy approach
      // Since COG files need special handling, we'll create a simple tile provider
      try {
        // Note: Direct COG display requires additional server-side processing
        // For now, we'll display using the URL as a single tile

        // Calculate approximate bounds (this would ideally come from scene metadata)
        // For demo, using a small area around scene center
        const bounds = Rectangle.fromDegrees(
          139.5, 35.5, // Southwest corner
          140.5, 36.5  // Northeast corner
        );

        // Create a single tile provider for the TCI image
        const provider = new SingleTileImageryProvider({
          url: scene.assets.tci,
          rectangle: bounds,
          credit: new Credit(`Sentinel-2 Scene: ${scene.scene_id}`)
        });

        setImageryProvider(provider);

        // Add the imagery layer to the viewer
        const layer = viewer.imageryLayers.addImageryProvider(provider);
        layer.alpha = 0.8; // Semi-transparent overlay

        // Cleanup function
        return () => {
          viewer.imageryLayers.remove(layer);
        };
      } catch (error) {
        console.error('Error loading TCI imagery:', error);
      }
    } else if (displayMode === 'ndvi') {
      // NDVI implementation will be added next
      console.log('NDVI mode selected - implementation coming next');
    }
  }, [scene, displayMode, viewerRef]);

  // Since we're managing the imagery layer directly on the viewer,
  // we don't need to return any JSX elements
  return null;
};

export default ImageryLayer;