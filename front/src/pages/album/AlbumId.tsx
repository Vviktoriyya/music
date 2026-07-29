import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Header from "../../components/header/Header.tsx";
import type { AlbumData, Track as AlbumTrack } from "./interfaces/AlbumInfo.ts";
import type { Track as AppTrack } from "../../types/track.ts";
import { usePlayer } from "../../context/PlayerContext.tsx";
const AlbumId = () => {
    const { id } = useParams<{ id: string }>();
    const { playTrack } = usePlayer();
    const { data: album, isLoading, isError } = useQuery<AlbumData>({
        queryKey: ["album", id],
        queryFn: async () => { const res = await axios.get(`/api/album/${id}`); return res.data; },
        enabled: !!id,
    });
    if (isLoading) return <p className="mt-10 text-center">Loading album...</p>;
    if (isError) return <p className="mt-10 text-center text-red-500">Error loading album :(</p>;
    if (!album) return <p className="mt-10 text-center">Album not found.</p>;
    const tracks = album.tracks?.data || [];
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
        artist: { id: String(t.artist?.id ?? '0'), name: t.artist?.name ?? 'Unknown Artist' },
        cover: album.cover_xl || album.cover_big,
        release_date: album.release_date ?? null,
        album: { id: album.id, title: album.title, link: "", cover: album.cover_xl || album.cover_big, release_date: album.release_date ?? null },
        preview: t.preview ?? null,
    } as const);
    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white relative">
            <div className="relative z-20"><Header /></div>
            <div className="absolute inset-0 w-full h-full z-0" style={{ background: `linear-gradient(180deg, rgba(17, 113, 226, 1) 0%, rgba(83, 173, 214, 0.02) 40%, rgba(15, 15, 15, 0) 100%)`, opacity: 0.6 }} />
            <main className="relative z-10 w-full px-4 pt-[110px] pb-20 sm:px-6 lg:px-8 xl:px-[70px]">
                <div className="flex w-full max-w-6xl flex-col items-center rounded-[10px] p-4 sm:p-8">
                    <header className="mb-10 flex flex-col items-center text-center">
                        <img src={album.cover_xl || album.cover_big} alt={album.title} className="mb-4 h-52 w-52 rounded-2xl object-cover shadow-lg sm:h-60 sm:w-60" />
                        <h1 className="text-3xl font-bold">{album.title}</h1>
                        <p className="mt-1 text-lg text-gray-300">{album.artist?.name}</p>
                        <p className="mt-1 text-sm text-gray-400">Released: {formatReleaseDate(album.release_date)}</p>
                    </header>
                    <div className="w-full flex flex-col pt-5">
                        <div className="hidden w-full flex-col gap-2 xl:flex">
                            <div className="flex w-full text-left text-white font-semibold px-4 py-2">
                                <div className="w-[50px]" />
                                <div className="flex flex-1 items-center gap-2">
                                    <div className="flex-1 pl-3 pr-3">Title</div>
                                    <div className="w-[200px] flex-shrink-0">Artist</div>
                                    <div className="w-[150px] flex-shrink-0">Release Date</div>
                                    <div className="w-[80px] flex-shrink-0 pr-3">Time</div>
                                </div>
                            </div>
                            {tracks.map((track, idx) => (
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
                            {tracks.map((track, idx) => (
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
};
export default AlbumId;