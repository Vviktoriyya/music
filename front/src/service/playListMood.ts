import axios from "axios";
import type {PlaylistData} from "../../interfaces/PlaylistInfo.ts";


const API_URL = "http://localhost:5000";


export const getPlaylistById = async (id: string): Promise<PlaylistData> => {
    try {
        const response = await axios.get<PlaylistData>(`${API_URL}/api/playlists/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching playlist with ID ${id}:`, error);
        throw error;
    }
};

