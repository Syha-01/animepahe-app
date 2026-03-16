export interface AnimeBasic {
    id: string; // The session ID
    title: string;
    type?: string;
    episodes?: number;
    status?: string;
    season?: string;
    year?: number;
    score?: number;
    poster: string;
    session: string;
}

export interface AnimeDetails extends AnimeBasic {
    image?: string; // API returns 'image' for details, 'poster' for search
    synopsis: string;
    alternativeTitle?: string;
    japanese?: string;
    rating?: string;
    duration?: string;
    premiered?: string;
    studios?: { id: string, name: string }[];
    genres?: { id: string, title: string }[];
    external_links?: any[];
    recommendations?: any[];
}

export interface Episode {
    id: string; // The episode ID
    number?: number;
    episode?: number;
    title: string;
    created_at: string;
    session: string;
    snapshot?: string;
    duration?: string;
}

export interface StreamSource {
    url: string;
    resolution: string;
    embed: string;
    isM3U8: boolean;
    isDub: boolean;
    download?: string;
    fanSub?: string;
}

export interface StreamData {
    session: string;
    episode: string;
    anime_title: string;
    sources: StreamSource[];
}

export interface PaginatedResponse<T> {
    current_page?: number;     // old API style
    last_page?: number;        // old API style
    paginationInfo?: {         // new API style
        currentPage: number;
        lastPage: number;
        perPage: number;
        total: number;
    }
    data: T[];
}
