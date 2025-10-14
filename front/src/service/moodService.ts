import axios from "axios";
import type {Playlist} from "../types/playlist.ts";


const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export const getMoodPlaylists = async (limit = 20): Promise<Playlist[]> => {
    try {
        const res = await axios.get(`${API_URL}/api/mood-playlists`, { params: { limit } });
        return res.data ?? [];
    } catch (error: any) {
        console.error("Error fetching mood playlists:", error?.message);
        return [];
    }
};
