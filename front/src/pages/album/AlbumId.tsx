import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import Header from "../../components/header/Header.tsx";
import TrackModal from "../../components/TrackModal.tsx";

import type { AlbumData, Track as AlbumTrack } from "./interfaces/AlbumInfo.ts";
import type { Track as AppTrack } from "../../types/track.ts";

const AlbumId = () => {
    const { id } = useParams<{ id: string }>();
    const [selectedTrack, setSelectedTrack] = useState<AppTrack | null>(null);

    const { data: album, isLoading, isError } = useQuery<AlbumData>({
        queryKey: ["album", id],
        queryFn: async () => {
            const res = await axios.get(`/api/album/${id}`);
            return res.data;
        },
        enabled: !!id,
    });

    if (isLoading) {
        return <p className="mt-10 text-center">Loading album...</p>;
    }

    if (isError) {
        return <p className="mt-10 text-center text-red-500">Error loading album :(</p>;
    }

    if (!album) {
        return <p className="mt-10 text-center">Album not found.</p>;
    }

    const tracks = album.tracks?.data || [];

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
        return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    };

    const mapToAppTrack = (t: AlbumTrack): AppTrack => {
        const albumCover = album.cover_xl || album.cover_big;
        const albumReleaseDate: string = album.release_date;

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
            release_date: albumReleaseDate ?? null,
            album: {
                id: album.id,
                title: album.title,
                link: "",
                cover: albumCover,
                release_date: albumReleaseDate ?? null,
            },
            preview: t.preview ?? null,
        } as const;
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <Header />
            <main className="mx-auto pt-[110px] max-w-5xl px-4 pt-10">
                <header className="mb-10 flex flex-col items-center text-center">
                    <img
                        src={album.cover_xl || album.cover_big}
                        alt={album.title}
                        className="mb-4 h-60 w-60 rounded-2xl object-cover shadow-lg"
                    />
                    <h1 className="text-3xl font-bold">{album.title}</h1>
                    <p className="mt-1 text-lg text-gray-400">{album.artist?.name}</p>
                    <p className="mt-1 text-sm text-gray-500">
                        Released: {formatReleaseDate(album.release_date)}
                    </p>
                </header>

                <section>
                    <h2 className="mb-4 text-center text-2xl font-semibold">Album Tracks</h2>
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
                        {tracks.map((track, idx) => (
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
                </section>
            </main>
        </div>
    );
};

export default AlbumId;
