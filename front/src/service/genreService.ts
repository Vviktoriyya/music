import axios from "axios";

const API_URL = "http://localhost:5000";

export type Genre = {
    id: number;
    name: string;
    picture: string;
};

export type Track = {
    id: number;
    title: string;
    artist: string;
    album: string;
    cover: string;
    link: string;
    duration: number;
    preview: string;
    rank: number;
};

export async function getGenres(): Promise<Genre[]> {
    try {
        const response = await axios.get(`${API_URL}/api/genres`);
        return response.data;
    } catch (err) {
        console.error("Error fetching genres:", err);
        return [];
    }
}

export async function getTracksByGenre(genreId: number, limit = 10): Promise<Track[]> {
    try {
        const response = await axios.get(`${API_URL}/api/genre/${genreId}/tracks`, {
            params: { limit },
        });
        return response.data;
    } catch (err) {
        console.error("Error fetching genre tracks:", err);
        return [];
    }
}
