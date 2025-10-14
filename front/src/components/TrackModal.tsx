import React from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import type { Track } from "../types/track.ts";

import favoriteIcon from "/assets/icon/favorite.png";
import favoriteSavedIcon from "/assets/icon/favoriteSaved.png";
import { useFavorites } from "../pages/favorites/hooks/useFavorites.ts";

interface TrackModalProps {
    track: Track;
    onClose: () => void;
}

const TrackModal: React.FC<TrackModalProps> = ({ track, onClose }) => {
    const { addFavorite, removeFavorite, isFavorite } = useFavorites();
    const favorite = isFavorite(track.id);

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (favorite) removeFavorite(track.id);
        else addFavorite({
            ...track,
            duration: track.duration ?? 0,
            release_date: track.release_date ?? new Date().toISOString(),
            rank: track.rank ?? 0,
            addedAt: new Date().toISOString(),
        });
    };

    const getArtistName = (track: Track) => {
        if (!track.artist) return "Unknown Artist";
        return typeof track.artist === "string" ? track.artist : track.artist.name ?? "Unknown Artist";
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[9999]" onClick={onClose}>
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative bg-[#181818] rounded-2xl p-6 w-[400px] flex flex-col items-center text-white"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white text-xl font-bold hover:text-red-500 transition"
                >
                    <img
                        src="assets/icon/cancel.png"
                        className="w-[25px] cursor-pointer invert brightness-200 hover:opacity-80 transition"
                    />
                </button>

                {track.cover && <img src={track.cover} alt={track.name} className="w-[250px] h-[250px] object-cover rounded-xl mb-4" />}

                <div>
                    <h1>{track.title}</h1>
                    <p>{getArtistName(track)}</p>
                </div>

                {(track?.full || track?.preview) && (
                    <div className="w-full relative flex flex-col items-center">
                        <div className="absolute left-5 pt-[100px] -translate-y-1/2 z-10">
                            <button
                                onClick={handleFavoriteClick}
                                title={favorite ? "Remove from favorites" : "Add to favorites"}
                                className="group relative flex items-center justify-center"
                            >
                                <img
                                    src={favorite ? favoriteSavedIcon : favoriteIcon}
                                    className={`w-[28px] h-[28px] transition-all duration-300 ${
                                        favorite
                                            ? "scale-110 brightness-125 drop-shadow-[0_0_10px_#ff477e]"
                                            : "group-hover:scale-110 group-hover:brightness-125 group-hover:drop-shadow-[0_0_6px_#ff7bb5]"
                                    }`}
                                    alt="Favorite"
                                />
                                <span className="absolute left-10 bg-[#ff2f77] text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                                    {favorite ? "In favorites" : "Add to favorites"}
                                </span>
                            </button>
                        </div>

                        <AudioPlayer
                            src={track?.full ?? track?.preview ?? undefined}
                            layout="stacked-reverse"
                            showSkipControls={false}
                            showJumpControls={false}
                            autoPlayAfterSrcChange={true}
                            className="w-full rounded-xl mt-2 audio-player-custom pl-10"
                        />
                        <a
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${track.title} ${getArtistName(track)}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative inline-block px-10 py-3 mt-4
               font-bold text-white
               border-2 border-zinc-700
               rounded-[10px]
               overflow-hidden
               group
               hover:border-fuchsia-600 hover:shadow-[0_0_15px_rgba(217,70,239,0.5)]
               artist-glow"
                        >
                            <span className="absolute top-1/2 left-1/4 w-4 h-4 bg-fuchsia-500 rounded-full blur-md animate-float-up"></span>
                            <span className="absolute top-1/3 left-2/3 w-2 h-2 bg-purple-500 rounded-full blur-sm animate-float-down"></span>
                            <span className="absolute top-2/3 left-1/3 w-3 h-3 bg-fuchsia-400 rounded-full blur-sm animate-float-up"></span>
                            <span className="absolute top-1/2 left-3/4 w-2 h-2 bg-purple-400 rounded-full blur-md animate-float-down"></span>

                            <span className="relative z-10">Listen full</span>
                        </a>

                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackModal;
