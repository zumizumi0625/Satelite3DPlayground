import { Material, Color } from 'cesium';

/**
 * Creates a custom NDVI material for Cesium
 * NDVI = (NIR - Red) / (NIR + Red)
 */
export function createNdviMaterial(redUrl: string, nirUrl: string): Material {
  // Create a custom Fabric material for NDVI calculation
  const ndviMaterial = new Material({
    fabric: {
      type: 'NDVI',
      uniforms: {
        redTexture: redUrl,
        nirTexture: nirUrl,
        threshold: 0.0,  // Minimum NDVI value to display
        transparency: 0.2
      },
      components: {
        diffuse: 'getNdviColor()',
        alpha: 'getAlpha()'
      },
      source: `
        uniform sampler2D redTexture;
        uniform sampler2D nirTexture;
        uniform float threshold;
        uniform float transparency;

        vec3 getNdviColor() {
          vec2 st = materialInput.st;

          // Sample the red and NIR bands
          vec4 redSample = texture2D(redTexture, st);
          vec4 nirSample = texture2D(nirTexture, st);

          float red = redSample.r;
          float nir = nirSample.r;

          // Calculate NDVI
          float ndvi = (nir - red) / (nir + red + 0.001); // Add small epsilon to avoid division by zero

          // Map NDVI to color gradient
          vec3 color;
          if (ndvi < -0.2) {
            // Water/bare soil - blue to brown
            color = mix(vec3(0.0, 0.0, 0.8), vec3(0.5, 0.3, 0.1), (ndvi + 1.0) / 0.8);
          } else if (ndvi < 0.2) {
            // Bare soil to sparse vegetation - brown to yellow
            color = mix(vec3(0.5, 0.3, 0.1), vec3(1.0, 1.0, 0.0), (ndvi + 0.2) / 0.4);
          } else if (ndvi < 0.4) {
            // Sparse to moderate vegetation - yellow to light green
            color = mix(vec3(1.0, 1.0, 0.0), vec3(0.5, 0.8, 0.3), (ndvi - 0.2) / 0.2);
          } else {
            // Moderate to dense vegetation - light green to dark green
            color = mix(vec3(0.5, 0.8, 0.3), vec3(0.0, 0.5, 0.0), min((ndvi - 0.4) / 0.4, 1.0));
          }

          return color;
        }

        float getAlpha() {
          vec2 st = materialInput.st;
          vec4 redSample = texture2D(redTexture, st);
          vec4 nirSample = texture2D(nirTexture, st);

          float red = redSample.r;
          float nir = nirSample.r;
          float ndvi = (nir - red) / (nir + red + 0.001);

          // Apply threshold
          if (ndvi < threshold) {
            return 0.0;
          }

          return 1.0 - transparency;
        }
      `
    }
  });

  return ndviMaterial;
}

/**
 * Creates a simplified NDVI color material without texture inputs
 * This is for demonstration purposes when actual band data is not available
 */
export function createSimpleNdviMaterial(): Material {
  const simpleMaterial = new Material({
    fabric: {
      type: 'Color',
      uniforms: {
        color: new Color(0.0, 0.8, 0.0, 0.6) // Green with transparency
      }
    }
  });

  return simpleMaterial;
}