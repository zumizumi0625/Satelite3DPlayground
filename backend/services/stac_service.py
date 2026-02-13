from pystac_client import Client
from typing import List, Dict, Any, Optional
from datetime import datetime

class STACService:
    """Service class for interacting with STAC API"""

    def __init__(self, stac_api_url: str):
        self.stac_api_url = stac_api_url
        self.client = Client.open(stac_api_url)

    def search_sentinel2(
        self,
        bbox: List[float],
        date_start: str,
        date_end: str,
        cloud_cover: int = 20,
        max_items: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Search for Sentinel-2 L2A scenes

        Args:
            bbox: Bounding box [west, south, east, north]
            date_start: Start date in YYYY-MM-DD format
            date_end: End date in YYYY-MM-DD format
            cloud_cover: Maximum cloud cover percentage (0-100)
            max_items: Maximum number of items to return

        Returns:
            List of scene metadata dictionaries
        """
        try:
            # Create date range string
            date_range = f"{date_start}/{date_end}"

            # Perform search
            search = self.client.search(
                collections=["sentinel-2-l2a"],
                bbox=bbox,
                datetime=date_range,
                query={
                    "eo:cloud_cover": {"lt": cloud_cover}
                },
                max_items=max_items
            )

            # Process results
            scenes = []
            for item in search.items():
                scene_data = self._extract_scene_data(item)
                if scene_data:
                    scenes.append(scene_data)

            return scenes

        except Exception as e:
            print(f"Error searching STAC: {str(e)}")
            return []

    def _extract_scene_data(self, item) -> Optional[Dict[str, Any]]:
        """
        Extract relevant data from a STAC item

        Args:
            item: PYSTAC Item object

        Returns:
            Dictionary with scene metadata or None if required assets are missing
        """
        try:
            # Check if required assets exist
            required_assets = ['red', 'nir08', 'visual']
            if not all(asset in item.assets for asset in required_assets):
                print(f"Missing required assets for item {item.id}")
                return None

            # Extract metadata
            scene_data = {
                'scene_id': item.id,
                'date': item.datetime.isoformat() if item.datetime else None,
                'cloud_cover': item.properties.get('eo:cloud_cover', None),
                'thumbnail_url': item.assets['thumbnail'].href if 'thumbnail' in item.assets else None,
                'assets': {
                    'red': item.assets['red'].href,  # Band 4 - Red
                    'nir': item.assets['nir08'].href,  # Band 8 - NIR
                    'tci': item.assets['visual'].href,  # True Color Image (TCI)
                }
            }

            # Add additional useful metadata
            if 'proj:bbox' in item.properties:
                scene_data['bbox'] = item.properties['proj:bbox']

            if 'proj:epsg' in item.properties:
                scene_data['epsg'] = item.properties['proj:epsg']

            return scene_data

        except Exception as e:
            print(f"Error extracting scene data for {item.id}: {str(e)}")
            return None