

export interface Album {
    id: number;
    title: string;
    link: string;
    cover: string;
    cover_big?: string;
    release_date?: string;
}

export interface Track {
    name: string;
    cover?: string;
    id: number | string;
    title: string;
    link: string;
    duration: number;
    rank: number;
    artist: {
        id: string;
        name: string;
    };
    album: Album;
    preview?: string | null;
    full?: string | null;
    release_date?: string | null;
    addedAt?: string;
}

export interface Artist {
    id: string;
    name: string;
}

export interface Recording {
    id: string;
    title: string;
    artist?: string;
    cover?: string | null;
    preview?: string;
    full?: string;
    link?: string;
    duration?: number;
    rank?: number;
    releaseDate?: string;
}



// Тип, який повертає useSearch()
export interface SearchData {
    artists: Artist[];
    recordings: Recording[];
}
