export const API_BASE_URL = 'http://192.168.31.173:3000';

export const API_ENDPOINTS = {
    airing: '/api/airing',
    search: '/api/search',
    anime: '/api', // /api/:session
    episodes: '/api', // /api/:session/releases
    stream: '/api/play', // /api/play/:session?episodeId=...
} as const;
