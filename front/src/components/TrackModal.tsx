import React, { useEffect } from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import type { Track } from "../types/track.ts";
import { useFavorites } from "../pages/favorites/hooks/useFavorites.ts";
import { useListeningStats } from "../pages/personalActivity/hooks/useListeningStats.ts";
import { usePlayer } from "../context/PlayerContext.tsx";
interface TrackModalProps {
    track: Track;
    onClose: () => void; // повне закриття (хрестик)
}
const TrackModal: React.FC<TrackModalProps> = ({ track, onClose }) => {
    const { addFavorite, removeFavorite, isFavorite } = useFavorites();
    const { logTrackInteraction } = useListeningStats();
    const { minimize } = usePlayer();
    const favorite = isFavorite(track.id);
    useEffect(() => {
        document.body.style.overflow = "hidden";
        logTrackInteraction({
            trackId: Number(track.id),
            artistId: typeof track.artist === "string" ? undefined : track.artist?.id ? Number(track.artist.id) : undefined,
            action: "click",
        }).catch(console.error);
        return () => { document.body.style.overflow = "auto"; };
    }, [track.id]);
    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (favorite) {
            removeFavorite(track.id);
        } else {
            addFavorite({ ...track, duration: track.duration ?? 0, release_date: track.release_date ?? new Date().toISOString(), rank: track.rank ?? 0 });
        }
        logTrackInteraction({
            trackId: Number(track.id),
            artistId: typeof track.artist === "string" ? undefined : track.artist?.id ? Number(track.artist.id) : undefined,
            action: "favorite",
        }).catch(console.error);
    };
    const getArtistName = (t: Track) => {
        if (!t.artist) return "Unknown Artist";
        return typeof t.artist === "string" ? t.artist : t.artist.name ?? "Unknown Artist";
    };
    const favoriteButton = (
        <button onClick={handleFavoriteClick} title={favorite ? "Remove from favorites" : "Add to favorites"} className="group relative flex items-center justify-center rhap_button-clear">
            <img
                className={`w-6 h-6 transition-all duration-300 ${favorite ? "scale-110 brightness-125 drop-shadow-[0_0_10px_#ff477e]" : "opacity-70 group-hover:opacity-100"}`}
                alt="Favorite"/>
        </button>
    );
    const listenFullButton = (
        <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${track.title} ${getArtistName(track)}`)}`}
            target="_blank" rel="noopener noreferrer"
            title="Listen full version on YouTube"
            className="rhap_button-clear z-[10] text-sm font-semibold text-gray-400 hover:text-white transition-colors no-underline"
            onClick={(e) => e.stopPropagation()}>
            Full
        </a>
    );
    return (
        <div
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/70 px-4 py-6 sm:px-6"
            onClick={minimize}>
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative flex w-full max-w-[400px] flex-col items-center rounded-2xl bg-[#181818] p-4 text-white sm:p-6
                           transition-all duration-300 ease-in-out"
                style={{ animation: "slideUp 0.25s ease-out" }}>
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="absolute top-4 right-4 text-white hover:text-red-500 transition"
                    title="Close">
                    <img src="assets/icon/cancel.png" className="w-[25px] cursor-pointer invert brightness-200 hover:opacity-80 transition" alt="Close" />
                </button>
                {/* Drag handle + підказка */}
                <div className="flex flex-col items-center mb-3 cursor-pointer" onClick={minimize}>
                    <div className="w-10 h-1 bg-gray-600 rounded-full mb-1" />
                    <p className="text-[10px] text-gray-600 select-none">Tap outside to minimize</p>
                </div>
                {track.cover && (
                    <img src={track.cover} alt={track.name} className="mb-4 h-[200px] w-full max-w-[230px] rounded-xl object-cover sm:h-[230px]" />
                )}
                <div className="text-center mb-2">
                    <h1 className="text-xl font-bold">{track.title}</h1>
                    <p className="text-gray-400">{getArtistName(track)}</p>
                </div>
                {(track?.full || track?.preview) && (
                    <div className="w-full flex flex-col items-center mt-2">
                        <AudioPlayer
                            src={track.full ?? track.preview ?? undefined}

                            onPlay={() => console.log("PLAY START")}
                            onPause={() => console.log("PAUSED")}
                            onError={(e) => console.log("AUDIO ERROR", e)}

                            layout="stacked-reverse"
                            showSkipControls={false}
                            showJumpControls={false}
                            autoPlayAfterSrcChange={false}

                            className="w-full rounded-xl audio-player-custom"

                            customAdditionalControls={[
                                <div key="custom-controls" className="flex items-center gap-x-2">
                                    {favoriteButton}
                                    {listenFullButton}
                                </div>
                            ]}
                        />
                    </div>
                )}
            </div>
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(40px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};
export default TrackModal;