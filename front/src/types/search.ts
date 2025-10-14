export interface Artist {
    id: string;
    name: string;
}

export interface Recording {
    id: number | string;
    title: string;
    artist?: string;
    cover?: string | null;
    preview?: string;
    full?: string;
    link?: string;
    duration?: number;
    rank?: number;
    releaseDate?: string | null;

}


// Тип, який повертає useSearch()
export interface SearchData {
    artists: Artist[];
    recordings: Recording[];
}
