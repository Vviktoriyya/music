import React, { useState } from "react";
import TrackModal from "../../../../components/TrackModal.tsx";
import type { Track } from "../../../../types/track.ts";
interface Props {
    topTracks: Track[];
}
const TopTracks: React.FC<Props> = ({ topTracks }) => {
    const [visibleCount, setVisibleCount] = useState(5);
    const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
    const handleViewMore = () => setVisibleCount(prev => prev + 5);
    const handleHide = () => setVisibleCount(5);
    const formatDate = (date?: string | null) => {
        if (!date) return "—";
        const [year, month, day] = date.split("-");
        if (!year || !month || !day) return "—";
        return `${day}.${month}.${year}`;
    };
    const formatDuration = (seconds?: number | null) => {
        if (!seconds && seconds !== 0) return "—";
        const min = Math.floor((seconds ?? 0) / 60);
        const sec = (seconds ?? 0) % 60;
        return `${min}:${sec.toString().padStart(2, "0")}`;
    };
    const getArtistName = (track: Track) => {
        if (!track.artist) return "Unknown Artist";
        return typeof track.artist === "string" ? track.artist : track.artist.name ?? "Unknown Artist";
    };
    return (
        <div className="pt-20 sm:pt-[100px]">
            <h2 className="pl-0 text-[30px] text-white font-[700] font-vazirmatn sm:pl-[35px] sm:text-[40px]">Popular</h2>
            <div className="hidden xl:block">
            <table className="mt-6 w-full border-separate border-spacing-y-2 text-[20px] text-white font-vazirmatn">
                <thead>
                <tr>
                    <th className="px-6 py-3 text-left">Track</th>
                    <th className="px-6 py-3 text-left">Release Date</th>
                    <th className="px-6 py-3 text-left">Played</th>
                    <th className="px-6 py-3 text-left">Time</th>
                </tr>
                </thead>
                <tbody>
                {topTracks.slice(0, visibleCount).map((track, i) => (
                    <tr
                        key={track.id}
                        onClick={() => setSelectedTrack(track)}
                        className="bg-gray-800 hover:bg-gray-700 rounded-lg h-[60px] cursor-pointer"
                    >
                        <td className="px-6 py-0">
                            <div className="flex items-center gap-4">
                                <span className="w-[20px] text-right text-gray-400">{i + 1}</span>
                                <img src={track.cover} alt={track.name} className="w-[60px] h-[60px] rounded-md" />
                                <div>
                                    <div>{track.name}</div>
                                    <div className="text-gray-400 text-[14px]">{getArtistName(track)}</div>
                                </div>
                            </div>
                        </td>
                        <td>{formatDate(track.release_date)}</td>
                        <td>{track.rank ? track.rank.toLocaleString() : "—"}</td>
                        <td>
                            <div className="flex items-center gap-2">
                                <span>{formatDuration(track.duration)}</span>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
            <div className="mt-6 flex flex-col gap-3 xl:hidden">
                {topTracks.slice(0, visibleCount).map((track, i) => (
                    <button
                        key={`${track.id}-mobile`}
                        type="button"
                        onClick={() => setSelectedTrack(track)}
                        className="flex w-full items-center gap-3 rounded-xl bg-gray-800 p-3 text-left transition-colors hover:bg-gray-700"
                    >
                        <span className="w-6 shrink-0 text-sm text-gray-400">{i + 1}</span>
                        <img src={track.cover} alt={track.name} className="h-14 w-14 rounded-md object-cover" />
                        <div className="min-w-0 flex-1">
                            <div className="truncate font-semibold">{track.name}</div>
                            <div className="truncate text-sm text-gray-400">{getArtistName(track)}</div>
                            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                                <span>{formatDate(track.release_date)}</span>
                                <span>{track.rank ? track.rank.toLocaleString() : "—"} plays</span>
                                <span>{formatDuration(track.duration)}</span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
            <div className="flex justify-center pt-6 gap-4">
                {visibleCount < topTracks.length && (
                    <button
                        onClick={handleViewMore}
                        className="px-6 py-2 rounded-lg text-white bg-gray-700 hover:bg-gray-600 transition"
                    >
                        View More
                    </button>
                )}
                {visibleCount > 5 && (
                    <button
                        onClick={handleHide}
                        className="px-6 py-2 rounded-lg text-white bg-gray-700 hover:bg-gray-600 transition"
                    >
                        Hide
                    </button>
                )}
            </div>
            {selectedTrack && <TrackModal track={selectedTrack} onClose={() => setSelectedTrack(null)} />}
        </div>
    );
};
export default TopTracks;
