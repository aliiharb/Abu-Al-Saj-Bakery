import axios from 'axios';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const SUPABASE_MENU_IMAGE_MARKER = '/storage/v1/object/public/menu-images/';

const api = axios.create({
  baseURL: API_BASE_URL
});

function safelyDecodePath(path) {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('abu_saj_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export function resolveImageUrl(url) {
  if (!url) return '';

  const markerIndex = url.indexOf(SUPABASE_MENU_IMAGE_MARKER);
  if (markerIndex === -1) return url;

  const objectPath = url.slice(markerIndex + SUPABASE_MENU_IMAGE_MARKER.length).split('?')[0];
  return `${API_BASE_URL}/api/images?path=${encodeURIComponent(safelyDecodePath(objectPath))}`;
}
