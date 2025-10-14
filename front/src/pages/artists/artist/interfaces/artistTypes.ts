

export interface Artist {
    id: number;
    name: string;
    picture: string;
    picture_big?: string;
    picture_xl?: string;
}

export interface TopTrack {
    id: number;
    name: string;
    artist: string;
    album: string;
    cover: string;
    release_date?: string | null;
    rank?: number | null;
    duration?: number | null;
    preview?: string | null;
}

export interface ArtistAlbum {
    id: number;
    title: string;
    cover: string;
    release_date?: string | null;
}
