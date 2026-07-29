import { useEffect, useState } from "react";
import { usePlayer } from "../context/PlayerContext.tsx";
import { useFavorites } from "../pages/favorites/hooks/useFavorites.ts";
import favoriteIcon from "/assets/icon/favorite.png";
import favoriteSavedIcon from "/assets/icon/favoriteSaved.png";

const DEFAULT_COVER = "/default-artist.png";

const formatTime = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
};

/**
 * MiniPlayer не має свого AudioPlayer.
 * Він керує тим AudioPlayer що в TrackModal через audioPlayerRef з PlayerContext.
 */
export default function MiniPlayer() {
    const { currentTrack, isMinimized, audioPlayerRef, expand, close } = usePlayer();
    const { isFavorite, addFavorite, removeFavorite } = useFavorites();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // підписка на події audio через ref
    useEffect(() => {
        if (!isMinimized) return;

        let audio = audioPlayerRef.current?.audio.current;

        const setup = () => {
            audio = audioPlayerRef.current?.audio.current;
            if (!audio) return false;

            setIsPlaying(!audio.paused);
            setCurrentTime(audio.currentTime);
            setDuration(audio.duration || 0);

            const handlePlay = () => setIsPlaying(true);
            const handlePause = () => setIsPlaying(false);
            const handleTimeUpdate = () => setCurrentTime(audio!.currentTime);
            const handleLoadedMeta = () => setDuration(audio!.duration || 0);

            audio.addEventListener("play", handlePlay);
            audio.addEventListener("pause", handlePause);
            audio.addEventListener("timeupdate", handleTimeUpdate);
            audio.addEventListener("loadedmetadata", handleLoadedMeta);

            return () => {
                audio?.removeEventListener("play", handlePlay);
                audio?.removeEventListener("pause", handlePause);
                audio?.removeEventListener("timeupdate", handleTimeUpdate);
                audio?.removeEventListener("loadedmetadata", handleLoadedMeta);
            };
        };

        // якщо audio готовий — підписуємось одразу
        let cleanup = setup();

        // якщо ні — пробуємо через короткий інтервал
        if (!cleanup) {
            const timer = setInterval(() => {
                const result = setup();
                if (result) {
                    cleanup = result;
                    clearInterval(timer);
                }
            }, 100);
            return () => clearInterval(timer);
        }

        return cleanup || undefined;
    }, [isMinimized, currentTrack?.id]);

    if (!currentTrack || !isMinimized) return null;

    const favorite = isFavorite(currentTrack.id);
    const artistName = typeof currentTrack.artist === "string"
        ? currentTrack.artist
        : currentTrack.artist?.name ?? "Unknown";

    const togglePlay = () => {
        const audio = audioPlayerRef.current?.audio.current;
        if (!audio) return;
        if (audio.paused) audio.play().catch(console.error);
        else audio.pause();
    };

    const handleSeek = (time: number) => {
        const audio = audioPlayerRef.current?.audio.current;
        if (audio) audio.currentTime = time;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[99998] xl:left-[270px] animate-in slide-in-from-bottom duration-300">
            <div className="bg-[#1a1a1a] border-t border-[#EE10B0]/30 shadow-2xl shadow-[#EE10B0]/10 px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center gap-4">

                    {/* Cover + info — клік розгортає */}
                    <button
                        onClick={expand}
                        className="flex items-center gap-3 min-w-0 flex-shrink-0 hover:opacity-80 transition"
                    >
                        <img
                            src={currentTrack.cover || DEFAULT_COVER}
                            alt={currentTrack.title}
                            className="w-12 h-12 rounded-lg object-cover border border-[#EE10B0]/30"
                            onError={(e) => { e.currentTarget.src = DEFAULT_COVER; }}
                        />
                        <div className="text-left hidden sm:block">
                            <p className="text-white font-semibold text-sm truncate max-w-[160px]">{currentTrack.title}</p>
                            <p className="text-gray-400 text-xs truncate max-w-[160px]">{artistName}</p>
                        </div>
                    </button>

                    {/* Play/Pause */}
                    <button
                        onClick={togglePlay}
                        className="shrink-0 w-10 h-10 rounded-full bg-[#EE10B0] text-white flex items-center justify-center hover:scale-105 transition"
                        title={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="6" y="5" width="4" height="14" rx="1"/>
                                <rect x="14" y="5" width="4" height="14" rx="1"/>
                            </svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        )}
                    </button>

                    {/* Progress + час */}
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-10 text-right">{formatTime(currentTime)}</span>
                        <input
                            type="range"
                            min={0}
                            max={duration || 0}
                            value={currentTime}
                            onChange={(e) => handleSeek(Number(e.target.value))}
                            className="flex-1 h-1 accent-[#EE10B0] cursor-pointer"
                            style={{ background: `linear-gradient(to right, #EE10B0 ${progress}%, #444 ${progress}%)` }}
                        />
                        <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
                    </div>

                    {/* Favorite */}
                    <button
                        onClick={() => favorite ? removeFavorite(currentTrack.id) : addFavorite({ ...currentTrack, duration: currentTrack.duration ?? 0, rank: currentTrack.rank ?? 0 })}
                        className="shrink-0 p-2 hover:scale-110 transition"
                        title={favorite ? "Remove from favorites" : "Add to favorites"}
                    >
                        <img
                            src={favorite ? favoriteSavedIcon : favoriteIcon}
                            className={`w-5 h-5 transition-all duration-300 ${favorite ? "scale-110 brightness-125 drop-shadow-[0_0_8px_#ff477e]" : "opacity-60 hover:opacity-100"}`}
                            alt="Favorite"
                        />
                    </button>

                    {/* Expand */}
                    <button
                        onClick={expand}
                        className="shrink-0 p-2 text-gray-400 hover:text-white transition text-lg"
                        title="Expand player"
                    >
                        ↑
                    </button>

                    {/* Close */}
                    <button
                        onClick={close}
                        className="shrink-0 p-2 text-gray-500 hover:text-red-400 transition text-lg"
                        title="Close player"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
}