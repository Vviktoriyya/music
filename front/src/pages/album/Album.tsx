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
                id: String(t.artist?.id ?? '0'),
                name: t.artist?.name ?? 'Unknown Artist'
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
        <div className="min-h-screen bg-black text-white">
            <Header />
            <main className="mx-auto max-w-5xl px-4 pt-[110px] flex flex-col items-center">
                <img
                    src={album.cover_xl || album.cover_big}
                    alt={album.title}
                    className="w-[300px] h-[300px] object-cover rounded-2xl shadow-lg mb-6"
                />
                <h2 className="text-2xl font-bold mb-2 text-white">{album.title}</h2>
                <p className="text-lg text-gray-400 mb-4">
                    {album.artist.name} • {formatReleaseDate(album.release_date)}
                </p>

                <button
                    onClick={loadRandomAlbum}
                    className="
        relative inline-block px-10 py-3 mb-8
        font-bold text-zinc-300
        border-2 border-fuchsia-600
        rounded-xl
        transition-all duration-300 ease-in-out
        overflow-hidden
        shadow-[0_0_15px_rgba(217,70,239,0.5)]
    "
                >
                    <div className="absolute inset-0 opacity-100">
                        <span className="absolute top-1/2 left-1/4 w-4 h-4 bg-fuchsia-500 rounded-full blur-md animate-float-up"></span>
                        <span
                            className="absolute top-1/3 left-2/3 w-2 h-2 bg-purple-500 rounded-full blur-sm animate-float-down"
                            style={{ animationDelay: '-4s' }}
                        ></span>
                        <span
                            className="absolute top-2/3 left-1/3 w-3 h-3 bg-fuchsia-400 rounded-full blur-sm animate-float-up"
                            style={{ animationDelay: '-2s' }}
                        ></span>
                        <span
                            className="absolute top-1/2 left-3/4 w-2 h-2 bg-purple-400 rounded-full blur-md animate-float-down"
                            style={{ animationDelay: '-6s' }}
                        ></span>
                    </div>
                    <span className="relative cursor-pointer flex items-center justify-center gap-2">
                        Generate Another Album
                </span>
                </button>



                <div className="w-full max-w-5xl">
                    <h3 className="text-xl font-semibold mb-3 text-left text-white">Tracks</h3>
                    <table className="w-full text-white text-[20px] border-separate border-spacing-y-2">
                        <thead>
                        <tr>
                            <th className="px-6 py-3 text-left">#</th>
                            <th className="px-6 py-3 text-left">Title</th>
                            <th className="px-6 py-3 text-left">Artist</th>
                            <th className="px-6 py-3 text-left">Release Date</th>
                            <th className="px-6 py-3 text-left">Time</th>
                        </tr>
                        </thead>
                        <tbody>
                        {album.tracks.data.map((track, idx) => (
                            <tr
                                key={track.id}
                                onClick={() => setSelectedTrack(mapToAppTrack(track))}
                                className="cursor-pointer hover:bg-gray-700"
                            >
                                <td className="px-6 py-3">{idx + 1}</td>
                                <td className="px-6 py-3">{track.title}</td>
                                <td className="px-6 py-3">{track.artist?.name ?? "—"}</td>
                                <td className="px-6 py-3">{formatReleaseDate(album.release_date)}</td>
                                <td className="px-6 py-3">{formatDuration(track.duration)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {selectedTrack && (
                        <TrackModal
                            track={selectedTrack}
                            onClose={() => setSelectedTrack(null)}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
