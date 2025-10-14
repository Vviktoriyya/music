import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/header/Header";
import TrackModal from "../../components/TrackModal.tsx";
import type { AlbumData, Track as AlbumTrack } from "./interfaces/AlbumInfo";
import type { Track as AppTrack } from "../../types/track";
import { getAlbumById } from "../../service/albumService";


export default function AlbumPage() {
    const { id } = useParams<{ id: string }>();

    const [album, setAlbum] = useState<AlbumData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTrack, setSelectedTrack] = useState<AppTrack | null>(null);

    useEffect(() => {
        if (!id) {
            setError("Album ID is missing.");
            setLoading(false);
            return;
        }

        const loadAlbum = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getAlbumById(id);
                setAlbum(data);
            } catch (e) {
                console.error(e);
                setError("Failed to load the album :(");
            } finally {
                setLoading(false);
            }
        };

        void loadAlbum();
    }, [id]);

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
            release_date: album?.release_date,
            album: {
                id: album?.id ?? 0,
                title: album?.title ?? "",
                link: "",
                cover: albumCover,
                release_date: album?.release_date,
            },
            preview: t.preview ?? null,
        } as const;
    };

    if (loading) return <p className="text-center mt-10">Loading album...</p>;
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

                <div className="w-full max-w-5xl">
                    <h3 className="text-xl font-semibold mb-3 text-left text-white">Tracks</h3>
                    <table className="w-full text-white text-[20px] border-separate border-spacing-y-2">
                        <thead>
                        <tr>
                            <th className="px-6 py-3 text-left">#</th>
                            <th className="px-6 py-3 text-left">Title</th>
                            <th className="px-6 py-3 text-left">Artist</th>
                            <th className="px-6 py-3 text-left">Release Date</th>
                            <th className="px-6 py-3 text-left">Plays</th>
                            <th className="px-6 py-3 text-left">Time</th>
                        </tr>
                        </thead>
                        <tbody>
                        {album.tracks.data.map((track, idx) => (
                            <tr
                                key={track.id}
                                onClick={() => setSelectedTrack(mapToAppTrack(track))}
                                className="cursor-pointer hover:bg-gray-700 transition-colors"
                            >
                                <td className="px-6 py-3">{idx + 1}</td>
                                <td className="px-6 py-3">{track.title}</td>
                                <td className="px-6 py-3">{track.artist?.name ?? "—"}</td>
                                <td className="px-6 py-3">{formatReleaseDate(album.release_date)}</td>
                                <td className="px-6 py-3">{track.rank ? track.rank.toLocaleString() : "—"}</td>
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