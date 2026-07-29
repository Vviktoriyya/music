import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { usePlayer } from "../context/PlayerContext.tsx";
import { useFavorites } from "../pages/favorites/hooks/useFavorites.ts";
const DEFAULT_COVER = "/default-artist.png";
export default function MiniPlayer() {
    const { currentTrack, isMinimized, expand, close } = usePlayer();
    const { isFavorite, addFavorite, removeFavorite } = useFavorites();
    if (!currentTrack || !isMinimized) return null;
    const favorite = isFavorite(currentTrack.id);
    const src = currentTrack.full ?? currentTrack.preview ?? undefined;
    const artistName = typeof currentTrack.artist === "string"
        ? currentTrack.artist
        : currentTrack.artist?.name ?? "Unknown";
    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-[99998] xl:left-[270px] animate-in slide-in-from-bottom duration-300"
        >
            <div className="bg-[#1a1a1a] border-t border-[#EE10B0]/30 shadow-2xl shadow-[#EE10B0]/10 px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
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
                    <div className="flex-1 min-w-0">
                        <AudioPlayer
                            src={src}
                            layout="stacked-reverse"
                            showSkipControls={false}
                            showJumpControls={false}
                            autoPlayAfterSrcChange={true}
                            className="w-full mini-player-custom"
                            customAdditionalControls={[]}
                            customVolumeControls={[]}
                        />
                    </div>
                    <button
                        onClick={() => favorite ? removeFavorite(currentTrack.id) : addFavorite({ ...currentTrack, duration: currentTrack.duration ?? 0, rank: currentTrack.rank ?? 0 })}
                        className="shrink-0 p-2 hover:scale-110 transition"
                        title={favorite ? "Remove from favorites" : "Add to favorites"}
                    >
                        <img
                            className={`w-5 h-5 transition-all duration-300 ${favorite ? "scale-110 brightness-125 drop-shadow-[0_0_8px_#ff477e]" : "opacity-60 hover:opacity-100"}`}
                            alt="Favorite"
                        />
                    </button>
                    <button
                        onClick={expand}
                        className="shrink-0 p-2 text-gray-400 hover:text-white transition text-lg"
                        title="Expand player"
                    >
                        ↑
                    </button>
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