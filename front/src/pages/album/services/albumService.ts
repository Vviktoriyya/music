import axios from "axios";
import type {AlbumData} from "../interfaces/AlbumInfo.ts";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchAlbumById = async (id: string): Promise<AlbumData> => {
    const res = await axios.get(`${API_URL}/api/album/${id}`);
    return res.data;
};

export const fetchAlbum = async (): Promise<AlbumData> => {
    const res = await axios.get(`${API_URL}/api/album/random`);
    return res.data;
};