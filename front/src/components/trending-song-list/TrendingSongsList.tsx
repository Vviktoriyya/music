import React, { useEffect, useState } from "react";
import { getTrendingSongs } from "../../service/trendingService.ts";
import 'react-h5-audio-player/lib/styles.css';
import TrackModal from "../TrackModal.tsx";
import type { Track } from "../../types/track.ts";

const TrendingSongsList: React.FC = () => {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [showAll, setShowAll] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

    useEffect(() => {
        let isMounted = true;
        getTrendingSongs(40)
            .then((data) => {
                if (isMounted) {
                    const mapped = (data ?? []).map(track => ({
                        ...track,
                        duration: track.duration ?? 0,
                        release_date: track.release_date ?? null,
                        rank: track.rank ?? 0
                    }));
                    setTracks(mapped);
                }
            })
            .catch(() => {
                if (isMounted) setTracks([]);
            });
        return () => { isMounted = false; };
    }, []);

    const getArtistName = (track: Track) => {
        if (!track.artist) return "Unknown Artist";
        return typeof track.artist === "string" ? track.artist : track.artist.name ?? "Unknown Artist";
    };

    const firstSix = tracks.slice(0, 7);
    const remaining = tracks.slice(6);

    const TrackCard = ({ track }: { track: Track }) => (
        <div
            onClick={() => setSelectedTrack(track)}
            className="relative w-[175px] h-[214px] flex flex-col justify-center items-center px-[15px] py-[4px] rounded-[10px] bg-[#1f1f1f] hover:bg-[#2a2a2a] cursor-pointer transition"
        >
            <div className="w-[145px] h-[150px] rounded-[10px] bg-gray-700 overflow-hidden">
                {track.cover && (
                    <img
                        src={track.cover}
                        alt={track.name}
                        className="w-full h-full object-cover rounded-[10px]"
                    />
                )}
            </div>
            <p className="w-[150px] mt-2 h-[25px] text-white font-vazirmatn text-[16px] font-[500] text-left overflow-hidden whitespace-nowrap text-ellipsis">
                {track.name}
            </p>
            <p className="w-[150px] h-[19px] text-white font-vazirmatn text-[12px] font-[300] leading-[100%] text-left opacity-80 overflow-hidden whitespace-nowrap text-ellipsis">
                {getArtistName(track)}
            </p>
        </div>
    );

    return (
        <div className="flex flex-col gap-6 relative">
            <div className="w-[1100px] h-[214px] flex flex-row pt-[14px] justify-start items-center gap-[24px]">
                {firstSix.map(track => <TrackCard key={track.id} track={track} />)}

                {!showAll && remaining.length > 0 && (
                    <div className="flex flex-col items-center cursor-pointer" onClick={() => setShowAll(true)}>
                        <div className="w-[62px] h-[62px] flex justify-center items-center p-[18px_19px] rounded-full bg-[#1E1E1E]">
                            <img src="assets/icon/plus.png" className="w-[24px] h-[24px]" alt="View all" />
                        </div>
                        <p className="w-[58px] h-[25px] text-white font-vazirmatn text-[16px] font-medium leading-[100%] text-left mt-2">
                            View All
                        </p>
                    </div>
                )}
            </div>

            {showAll && remaining.length > 0 && (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap justify-start gap-[24px]">
                        {remaining.map(track => <TrackCard key={track.id} track={track} />)}
                    </div>
                    <div className="mt-4 flex justify-center">
                        <button
                            onClick={() => setShowAll(false)}
                            className="px-6 py-2 rounded-lg cursor-pointer text-white font-bold relative overflow-hidden
                            bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500
                            shadow-lg transition-all duration-500 ease-in-out
                            hover:scale-105 hover:shadow-2xl
                            active:scale-95 animate-pulse-btn"
                        >
                            <span className="relative z-10">Hide</span>
                            <span className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400
                            animate-gradient-x opacity-50 rounded-lg"></span>
                        </button>
                    </div>
                </div>
            )}

            {selectedTrack && <TrackModal track={selectedTrack} onClose={() => setSelectedTrack(null)} />}
        </div>
    );
};

export default TrendingSongsList;
