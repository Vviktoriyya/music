import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/header/Header";
import TrackModal from "../../components/TrackModal.tsx";
import type { PlaylistData, PlaylistTrack } from "../../../interfaces/PlaylistInfo.ts";
import type { Track as AppTrack } from "../../types/track";
import { getPlaylistById } from "../../service/playListMood.ts";

export default function PlaylistPage() {
    const { id } = useParams<{ id: string }>();

    const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTrack, setSelectedTrack] = useState<AppTrack | null>(null);

    useEffect(() => {
        if (!id) {
            setError("Playlist ID is missing.");
            setLoading(false);
            return;
        }
        const loadPlaylist = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getPlaylistById(id);
                setPlaylist(data);
            } catch (e) {
                console.error("Failed to load playlist:", e);
                setError("Failed to load the playlist :(");
            } finally {
                setLoading(false);
            }
        };
        void loadPlaylist();
    }, [id]);

    const formatDuration = (seconds?: number) => {
        if (seconds === undefined || seconds === null) return "—";
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, "0")}`;
    };

    const mapToAppTrack = (t: PlaylistTrack): AppTrack => {
        const trackCover = t.album?.cover_medium ?? playlist?.picture_xl ?? "";

        return {
            id: t.id,
            title: t.title,
            name: t.title,
            link: t.link ?? "",
            duration: t.duration ?? 0,
            rank: t.rank ?? 0,
            artist: {
                id: String(t.artist?.id ?? '0'),
                name: t.artist?.name ?? 'Unknown Artist'
            },
            cover: trackCover,
            release_date: t.album?.release_date,
            album: {
                id: t.album?.id ?? 0,
                title: t.album?.title ?? "Unknown Album",
                link: "",
                cover: trackCover,
                release_date: t.album?.release_date,
            },
            preview: t.preview ?? null,
        } as const;
    };

    if (loading) return <p className="text-center mt-10">Loading playlist...</p>;
    if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
    if (!playlist) return <p className="text-center mt-10">Playlist not found</p>;

    return (
        <div className="min-h-screen bg-black text-white">
            <Header />
            <main className="mx-auto max-w-5xl px-4 pt-[110px] pb-16">
                <div className="flex flex-col items-center">
                    <img
                        src={playlist.picture_xl}
                        alt={playlist.title}
                        className="w-[300px] h-[300px] object-cover rounded-2xl shadow-lg mb-6"
                    />
                    <h2 className="text-2xl font-bold mb-1 text-white">{playlist.title}</h2>
                    <p className="text-lg text-gray-400 mb-2">Created by {playlist.creator.name}</p>
                    {playlist.description && (
                        <p className="text-md text-gray-500 text-center max-w-lg mb-8">{playlist.description}</p>
                    )}
                </div>

                <div className="w-full max-w-5xl">
                    <h3 className="text-xl font-semibold mb-3 text-left text-white">Tracks</h3>
                    <table className="w-full text-white text-[16px] border-separate border-spacing-y-2">
                        <thead>
                        <tr>
                            <th className="px-4 py-2 text-left text-gray-400">#</th>
                            <th className="px-4 py-2 text-left text-gray-400">Title</th>
                            <th className="px-4 py-2 text-left text-gray-400">Artist</th>
                            <th className="px-4 py-2 text-left text-gray-400">Plays</th>
                            <th className="px-4 py-2 text-left text-gray-400">Time</th>
                        </tr>
                        </thead>
                        <tbody>
                        {playlist.tracks.data.map((track, idx) => (
                            <tr
                                key={track.id}
                                // ✅ ВИПРАВЛЕНО: Тепер сюди передається об'єкт правильного типу `PlaylistTrack`
                                onClick={() => setSelectedTrack(mapToAppTrack(track))}
                                className="cursor-pointer hover:bg-gray-800 transition-colors rounded-lg"
                            >
                                <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                                <td className="px-4 py-3 font-semibold">{track.title}</td>
                                <td className="px-4 py-3 text-gray-300">{track.artist?.name ?? "—"}</td>
                                <td className="px-4 py-3 text-gray-300">{track.rank ? track.rank.toLocaleString() : "—"}</td>
                                <td className="px-4 py-3 text-gray-300">{formatDuration(track.duration)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {selectedTrack && (
                    <TrackModal track={selectedTrack} onClose={() => setSelectedTrack(null)} />
                )}
            </main>
        </div>
    );
}