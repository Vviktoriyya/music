import axios from "axios";
import type { AlbumData } from "../interfaces/AlbumInfo.ts";


export const fetchAlbumById = async (id: string): Promise<AlbumData> => {
    const res = await axios.get(`/api/album/${id}`);
    return res.data;
};

export const fetchAlbum = async (): Promise<AlbumData> => {
    const res = await axios.get(`/api/album/random`);
    return res.data;
};