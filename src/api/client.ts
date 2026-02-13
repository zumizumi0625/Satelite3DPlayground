import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

export interface SearchParams {
  bbox: [number, number, number, number] | null;
  date_start: string;
  date_end: string;
  cloud_cover: number;
  max_items?: number;
}

export interface Scene {
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
  epsg?: number;
}

export interface SearchResponse {
  status: string;
  count: number;
  scenes: Scene[];
}

class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Test backend connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/`);
      return response.status === 200;
    } catch (error) {
      console.error('Failed to connect to backend:', error);
      return false;
    }
  }

  /**
   * Search for Sentinel-2 imagery
   */
  async searchImagery(params: SearchParams): Promise<Scene[]> {
    try {
      const response = await axios.post<SearchResponse>(
        `${this.baseURL}/api/search`,
        {
          bbox: params.bbox,
          date_start: params.date_start,
          date_end: params.date_end,
          cloud_cover: params.cloud_cover,
          max_items: params.max_items || 10
        }
      );

      if (response.data.status === 'success') {
        return response.data.scenes;
      } else {
        console.error('Search failed:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error searching imagery:', error);
      throw error;
    }
  }
}

export default new APIClient();