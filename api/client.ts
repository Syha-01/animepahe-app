import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config';
import type { AnimeBasic, AnimeDetails, Episode, PaginatedResponse, StreamData } from '../types';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
});

export const apiClient = {
    getAiring: async (page: number = 1): Promise<PaginatedResponse<AnimeBasic>> => {
        const response = await api.get(`${API_ENDPOINTS.airing}?page=${page}`);
        const result = response.data;
        // Normalize: airing endpoint returns 'image' (snapshot), not 'poster'
        // Wrap in image proxy to bypass 403 forbidden hotlink blocks
        if (result.data && Array.isArray(result.data)) {
            result.data = result.data.map((item: any) => {
                const rawUrl = item.poster || item.image || null;
                return {
                    ...item,
                    poster: rawUrl ? `${API_BASE_URL}/api/proxy-image?url=${encodeURIComponent(rawUrl)}` : null,
                };
            });
        }
        return result;
    },

    searchAnime: async (query: string): Promise<PaginatedResponse<AnimeBasic>> => {
        const response = await api.get(`${API_ENDPOINTS.search}?q=${encodeURIComponent(query)}`);
        return response.data;
    },

    getAnimeDetails: async (session: string): Promise<AnimeDetails> => {
        const response = await api.get(`${API_ENDPOINTS.anime}/${session}`);
        const data = response.data;
        // Normalize: API returns 'image' for details page, but our type uses 'poster'
        if (!data.poster && data.image) {
            data.poster = data.image;
        }
        return data;
    },

    getEpisodes: async (session: string, page: number = 1, sort: 'episode_desc' | 'episode_asc' = 'episode_asc'): Promise<PaginatedResponse<Episode>> => {
        const response = await api.get(`${API_ENDPOINTS.episodes}/${session}/releases?sort=${sort}&page=${page}`);
        return response.data;
    },

    getStreamLinks: async (session: string, episodeId: string): Promise<StreamData> => {
        const response = await api.get(`${API_ENDPOINTS.stream}/${session}?episodeId=${episodeId}`);
        return response.data;
    }
};

export default apiClient;
