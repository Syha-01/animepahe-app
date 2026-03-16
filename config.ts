export const API_BASE_URL = 'https://animepahe-api-2-264812564939.us-central1.run.app';

export const API_ENDPOINTS = {
    airing: '/api/airing',
    search: '/api/search',
    anime: '/api', // /api/:session
    episodes: '/api', // /api/:session/releases
    stream: '/api/play', // /api/play/:session?episodeId=...
} as const;
