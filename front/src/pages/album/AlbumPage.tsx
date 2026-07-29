import { useEffect, useState, useCallback } from "react";
import Header from "../../components/header/Header";
import TrackModal from "../../components/TrackModal.tsx";
import type { AlbumData, Track as AlbumTrack } from "./interfaces/AlbumInfo";
import type { Track as AppTrack } from "../../types/track";
import { fetchAlbum } from "./services/albumService";
export default function RandomAlbum() {
    const [album, setAlbum] = useState<AlbumData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTrack, setSelectedTrack] = useState<AppTrack | null>(null);
    const loadRandomAlbum = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchAlbum();
            setAlbum(data);
        } catch (e) {
            console.error(e);
            setError("Failed to load the album :(");
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        void loadRandomAlbum();
    }, [loadRandomAlbum]);
    const formatDuration = (seconds?: number) => {
        if (seconds === undefined || seconds === null) return "—";
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, "0")}`;
    };
    const formatReleaseDate = (date?: string | null) => {
        if (!date) return "—";
        const d = new Date(date);
        if (Number.isNaN(d.getTime())) return date;
        const day = d.getDate().toString().padStart(2, "0");
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
    };
    const mapToAppTrack = (t: AlbumTrack): AppTrack => {
        const albumCover: string = album?.cover_xl ?? album?.cover_big ?? "";
        const albumReleaseDate: string = album?.release_date ?? "";
        return {
            id: t.id,
            title: t.title,
            name: t.title,
            link: "",
            duration: t.duration ?? 0,
            rank: t.rank ?? 0,
            artist: {
                id: String(t.artist?.id ?? "0"),
                name: t.artist?.name ?? "Unknown Artist",
            },
            cover: albumCover,
            release_date: albumReleaseDate,
            album: {
                id: album?.id ?? 0,
                title: album?.title ?? "",
                link: "",
                cover: albumCover,
                release_date: albumReleaseDate,
            },
            preview: t.preview ?? null,
        } as const;
    };
    if (loading) return <p className="text-center mt-10">Loading...</p>;
    if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
    if (!album) return <p className="text-center mt-10">Album not found</p>;
    return (
        <div className="relative min-h-screen text-white overflow-hidden bg-[#0f0f0f]">
            {/* ✅ HEADER: ВИСОКИЙ Z-INDEX */}
            <div className="relative z-20">
                <Header />
            </div>
            {/* ✅ ЗОВНІШНІЙ ГРАДІЄНТ: НА ВСЮ ВИСОТУ І ПОВНІСТЮ ПОЗАДУ */}
            <div
                className="absolute inset-0 w-full h-full z-0"
                style={{
                    background:
                        "linear-gradient(91.68deg, rgba(16,113,226,1), rgba(82,172,213,0.02) 98%, rgba(139,203,230,0) 100%)",
                    opacity: 0.6,
                    zIndex: 0,
                }}
            ></div>
            {/* MAIN: Відносний, вищий z-index за фон, нижчий за Header */}
            <main className="relative z-10 w-full mx-auto px-4 pt-[110px] flex flex-col justify-center items-center">
                {/* БЛОК ВМІСТУ АЛЬБОМУ: Тепер просто має темний фон і займає повну ширину (відносно main) */}
                <div
                    className="rounded-[10px] p-8 w-full flex flex-col items-center"
                >
                    <img
                        src={album.cover_xl || album.cover_big}
                        alt={album.title}
                        className="w-[300px] h-[300px] object-cover rounded-2xl shadow-lg mb-6"
                    />
                    <h2 className="text-2xl font-bold mb-2 text-white">{album.title}</h2>
                    <p className="text-lg text-gray-300 mb-4">
                        {album.artist.name} • {formatReleaseDate(album.release_date)}
                    </p>
                    <button
                        onClick={loadRandomAlbum}
                        className="relative inline-block px-10 py-3 mb-8 font-bold text-zinc-300 border-2 border-fuchsia-600 rounded-xl transition-all duration-300 ease-in-out overflow-hidden shadow-[0_0_15px_rgba(217,70,239,0.5)]"
                    >
                        <div className="absolute inset-0 opacity-100">
                            <span className="absolute top-1/2 left-1/4 w-4 h-4 bg-fuchsia-500 rounded-full blur-md animate-float-up"></span>
                            <span
                                className="absolute top-1/3 left-2/3 w-2 h-2 bg-purple-500 rounded-full blur-sm animate-float-down"
                                style={{ animationDelay: "-4s" }}
                            ></span>
                            <span
                                className="absolute top-2/3 left-1/3 w-3 h-3 bg-fuchsia-400 rounded-full blur-sm animate-float-up"
                                style={{ animationDelay: "-2s" }}
                            ></span>
                            <span
                                className="absolute top-1/2 left-3/4 w-2 h-2 bg-purple-400 rounded-full blur-md animate-float-down"
                                style={{ animationDelay: "-6s" }}
                            ></span>
                        </div>
                        <span className="relative cursor-pointer flex items-center justify-center gap-2">
                            Generate Another Album
                        </span>
                    </button>
                    <div className="w-full flex flex-col">
                        <div className="flex flex-col gap-2 w-full">
                            <div className="flex w-full text-left text-white font-semibold px-4 py-2 ">
                                <div className="w-[50px]"></div>
                                <div className="flex-1"></div>
                                <div className="w-[200px]">Artist</div>
                                <div className="w-[150px]">Release Date</div>
                                <div className="w-[80px]">Time</div>
                            </div>
                            {album.tracks.data.map((track, idx) => (
                                <div
                                    key={track.id}
                                    onClick={() => setSelectedTrack(mapToAppTrack(track))}
                                    className="flex w-full items-center gap-2 cursor-pointer transition-colors duration-300 rounded-[5px] px-4"
                                >
                                    <div className="w-[50px] text-center text-[24px] font-semibold leading-[100%] tracking-[0%] text-white font-[Vazirmatn]">
                                        {idx + 1}
                                    </div>
                                    <div
                                        className="flex flex-1 items-center gap-2 bg-[rgba(30,30,30,1)] hover:bg-[rgba(50,50,50,1)] rounded-[5px] py-2"
                                    >
                                        <div className="flex-1 flex items-center gap-3 pl-3 pr-3">
                                            <img
                                                src={album.cover_medium || album.cover_big || album.cover_xl}
                                                alt={track.title}
                                                className="w-[50px] h-[50px] object-cover rounded-[5px]"
                                            />
                                            <span>{track.title}</span>
                                        </div>
                                        <div className="w-[200px] flex-shrink-0">{track.artist?.name ?? "—"}</div>
                                        <div className="w-[150px] flex-shrink-0">{formatReleaseDate(album.release_date)}</div>
                                        <div className="w-[80px] flex-shrink-0 pr-3">{formatDuration(track.duration)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {selectedTrack && (
                            <TrackModal track={selectedTrack} onClose={() => setSelectedTrack(null)} />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}