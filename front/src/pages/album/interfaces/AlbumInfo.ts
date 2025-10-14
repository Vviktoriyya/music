export interface Artist {
    name: string;
    id: number;
}

export interface Track {
    id: number;
    title: string;
    preview: string | null;
    artist: Artist;
    duration?: number;
    rank?: number;
    releaseDate?: string | null;
}

export interface AlbumData {
    id: number;
    title: string;
    cover_xl: string;
    cover_big: string;
    release_date: string;
    artist: Artist;
    tracks: {
        data: Track[];
    };
}