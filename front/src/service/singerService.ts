import axios from "axios";

const API_URL = "http://localhost:5000";

export type Artist = {
    id: number;
    name: string;
    picture: string;
    picture_big: string;
    picture_xl: string;
};


export async function getTopArtists(): Promise<Artist[]> {
    try {
        const response = await axios.get(`${API_URL}/api/top-artists`);
        return response.data.map((artist: any) => ({
            id: artist.id,
            name: artist.name,
            picture: artist.picture,


        }));
    } catch (error) {
        console.error("Error fetching top artists:", error);
        return [];
    }
}
