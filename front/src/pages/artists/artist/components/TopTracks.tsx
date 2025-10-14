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
        <div className="pt-[100px]">
            <h2 className="text-[40px] text-white font-[700] font-vazirmatn pl-[35px]">Popular</h2>

            <table className="w-full mt-6 text-white font-vazirmatn text-[20px] border-separate border-spacing-y-2">
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
