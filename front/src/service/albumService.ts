import axios from "axios";
import type {AlbumData} from "../pages/album/interfaces/AlbumInfo.ts";

const API_URL = "http://localhost:5000";

export type Album = {
    id: number;
    title: string;
    cover: string;
    artist: string;
    link: string;
};

export const getTopAlbums = async (limit = 10): Promise<Album[]> => {
    try {
        const response = await axios.get<Album[]>(`${API_URL}/api/top-albums?limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching top albums:", error);
        return [];
    }
};

export const getAlbumById = async (id: string): Promise<AlbumData> => {
    try {
        const response = await axios.get<AlbumData>(`${API_URL}/api/album/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching album with ID ${id}:`, error);
        throw error;
    }
};