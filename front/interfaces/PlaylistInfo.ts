
export interface PlaylistTrack {
    id: number;
    title: string;
    link?: string;
    duration?: number;
    rank?: number;
    preview?: string | null;
    artist: {
        id: number;
        name: string;
    };
    album: {
        id: number;
        title: string;
        cover_medium?: string;
        release_date?: string;
    };
}


export interface PlaylistData {
    id: number;
    title: string;
    description: string;
    picture_xl: string;
    creator: { name: string };
    tracks: {
        data: PlaylistTrack[];
    };
}