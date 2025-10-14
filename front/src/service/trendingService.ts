import axios from "axios";
import type { Track } from "../types/track";

const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

interface ApiAlbum {
    id?: number | string;
    title?: string;
    cover?: string;
    cover_big?: string;
    release_date?: string;
    link?: string;
}
interface ApiArtist {
    id?: number | string;
    name?: string;
}

interface ApiTrack {
    id?: number | string;
    title?: string;
    name?: string;
    artist?: string | ApiArtist;
    album?: ApiAlbum;
    cover?: string;
    preview?: string | null;
    full?: string | null;
    link?: string;
    duration?: number | string;
    rank?: number | string;
    release_date?: string | null;
}


const toNumber = (value: unknown, fallback = 0): number => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

export const getTrendingSongs = async (limit = 20): Promise<Track[]> => {
    try {
        const res = await axios.get<ApiTrack[]>(`${API_URL}/api/trending`, {
            params: { limit },
        });

        const tracks = Array.isArray(res.data) ? res.data : [];

        return tracks.map((track): Track => {
            const name = track.title ?? track.name ?? "Unknown";

            // Гарантуємо, що artist завжди об'єкт
            const artistObj = (() => {
                if (!track.artist) {
                    return { id: "unknown", name: "Unknown" };
                }

                if (typeof track.artist === "string") {
                    return { id: "unknown", name: track.artist };
                }

                // Тепер TypeScript точно знає, що це об'єкт з name і, можливо, id
                return {
                    id: track.artist.id ? track.artist.id.toString() : "unknown",
                    name: track.artist.name ?? "Unknown",
                };
            })();


            const albumId = toNumber(track.album?.id, 0);
            const cover = track.album?.cover ?? track.cover ?? "";

            return {
                id: track.id ?? "unknown",
                name,
                title: name,
                artist: artistObj,
                cover,
                album: {
                    id: albumId,
                    title: track.album?.title ?? "Unknown Album",
                    link: track.album?.link ?? "",
                    cover,
                    cover_big: track.album?.cover_big,
                    release_date: track.album?.release_date,
                },
                preview: track.preview ?? null,
                full: track.full ?? null,
                link: track.link ?? "",
                duration: toNumber(track.duration, 0),
                rank: toNumber(track.rank, 0),
                release_date: track.release_date ?? track.album?.release_date ?? null,
            };
        });
    } catch (error) {
        console.error("Error fetching trending songs:", error);
        return [];
    }
};
