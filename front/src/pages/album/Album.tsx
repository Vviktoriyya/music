import { useEffect, useState, useCallback } from "react";
import Header from "../../components/header/Header";
import type { AlbumData, Track as AlbumTrack } from "./interfaces/AlbumInfo";
import type { Track as AppTrack } from "../../types/track";
import { fetchAlbum } from "./services/albumService";
import { usePlayer } from "../../context/PlayerContext.tsx";
export default function RandomAlbum() {
    const [album, setAlbum] = useState<AlbumData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { playTrack } = usePlayer();
    const loadRandomAlbum = useCallback(async () => {
        try {
            setLoading(true); setError(null);
            const data = await fetchAlbum();
            setAlbum(data);
        } catch (e) {
            console.error(e);
            setError("Failed to load the album :(");
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { void loadRandomAlbum(); }, [loadRandomAlbum]);
    const formatDuration = (seconds?: number) => {
        if (seconds === undefined || seconds === null) return "—";
        return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
    };
    const formatReleaseDate = (date?: string | null) => {
        if (!date) return "—";
        const d = new Date(date);
        if (Number.isNaN(d.getTime())) return date;
        return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")}.${d.getFullYear()}`;
    };
    const mapToAppTrack = (t: AlbumTrack): AppTrack => ({
        id: t.id, title: t.title, name: t.title, link: "",
        duration: t.duration ?? 0, rank: t.rank ?? 0,
        artist: { id: String(t.artist?.id ?? "0"), name: t.artist?.name ?? "Unknown Artist" },
        cover: album?.cover_xl ?? album?.cover_big ?? "",
        release_date: album?.release_date ?? "",
        album: { id: album?.id ?? 0, title: album?.title ?? "", link: "", cover: album?.cover_xl ?? album?.cover_big ?? "", release_date: album?.release_date ?? "" },
        preview: t.preview ?? null,
    } as const);
    if (loading) return <p className="text-center mt-10">Loading...</p>;
    if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
    if (!album) return <p className="text-center mt-10">Album not found</p>;
    return (
        <div className="relative min-h-screen text-white overflow-hidden">
            <div className="relative z-20"><Header /></div>
            <div className="absolute inset-0 w-full h-full" style={{ background: "linear-gradient(91.68deg, rgba(16,113,226,1), rgba(82,172,213,0.02) 98%, rgba(139,203,230,0) 100%)", opacity: 0.6, zIndex: 0 }} />
            <main className="relative z-10 mx-auto flex w-full flex-col items-center justify-center px-4 pb-12 pt-[110px] sm:px-6 lg:px-8">
                <div className="flex w-full max-w-6xl flex-col items-center rounded-[10px] p-4 sm:p-8">
                    <img src={album.cover_xl || album.cover_big} alt={album.title} className="mb-6 h-[220px] w-[220px] rounded-2xl object-cover shadow-lg sm:h-[300px] sm:w-[300px]" />
                    <h2 className="mb-2 text-center text-2xl font-bold sm:text-3xl">{album.title}</h2>
                    <p className="mb-4 text-center text-base text-gray-300 sm:text-lg">{album.artist.name} • {formatReleaseDate(album.release_date)}</p>
                    <button onClick={loadRandomAlbum} className="relative inline-block px-10 py-3 mb-8 font-bold text-zinc-300 border-2 border-fuchsia-600 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(217,70,239,0.5)]">
                        <span className="relative cursor-pointer">Generate Another Album</span>
                    </button>
                    <div className="w-full flex flex-col">
                        <div className="hidden w-full flex-col gap-2 xl:flex">
                            {album.tracks.data.map((track, idx) => (
                                <div key={track.id} onClick={() => playTrack(mapToAppTrack(track))} className="flex w-full items-center gap-2 cursor-pointer transition-colors duration-300 rounded-[5px] px-4">
                                    <div className="w-[50px] text-center text-[24px] font-semibold text-white">{idx + 1}</div>
                                    <div className="flex flex-1 items-center gap-2 bg-[rgba(30,30,30,1)] hover:bg-[rgba(50,50,50,1)] rounded-[5px] py-2">
                                        <div className="flex-1 flex items-center gap-3 pl-3 pr-3">
                                            <img src={album.cover_medium || album.cover_big || album.cover_xl} alt={track.title} className="w-[50px] h-[50px] object-cover rounded-[5px]" />
                                            <span>{track.title}</span>
                                        </div>
                                        <div className="w-[200px] flex-shrink-0">{track.artist?.name ?? "—"}</div>
                                        <div className="w-[150px] flex-shrink-0">{formatReleaseDate(album.release_date)}</div>
                                        <div className="w-[80px] flex-shrink-0 pr-3">{formatDuration(track.duration)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex w-full flex-col gap-3 xl:hidden">
                            {album.tracks.data.map((track, idx) => (
                                <button key={`${track.id}-mobile`} type="button" onClick={() => playTrack(mapToAppTrack(track))} className="flex w-full items-center gap-3 rounded-xl bg-[rgba(30,30,30,1)] p-3 text-left text-white transition-colors hover:bg-[rgba(50,50,50,1)]">
                                    <span className="w-6 shrink-0 text-sm text-gray-400">{idx + 1}</span>
                                    <img src={album.cover_medium || album.cover_big || album.cover_xl} alt={track.title} className="h-14 w-14 rounded-md object-cover" />
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate font-semibold">{track.title}</div>
                                        <div className="truncate text-sm text-gray-400">{track.artist?.name ?? "-"}</div>
                                        <div className="mt-1 text-xs text-gray-500">{formatReleaseDate(album.release_date)} | {formatDuration(track.duration)}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}