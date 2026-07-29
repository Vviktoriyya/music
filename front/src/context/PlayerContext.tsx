import { createContext, useContext, useState, useRef, type ReactNode } from "react";
import type AudioPlayer from "react-h5-audio-player";
import type { Track } from "../types/track.ts";

interface PlayerContextType {
    currentTrack: Track | null;
    isMinimized: boolean;
    isModalOpen: boolean;
    audioPlayerRef: React.MutableRefObject<AudioPlayer | null>;
    playTrack: (track: Track) => Promise<void>;
    minimize: () => void;
    close: () => void;
    expand: () => void;
}

export const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
    const ctx = useContext(PlayerContext);
    if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
    return ctx;
};

/**
 * Якщо трек прийшов з Supabase (Favorites/Playlist) і не має preview/full,
 * дозавантажуємо їх з Deezer API через проксі.
 */
const enrichTrackIfNeeded = async (track: Track): Promise<Track> => {
    if (!track.id) return track;

    try {
        const proxyUrl = `http://localhost:5000/api/track/${track.id}`;
        const response = await fetch(proxyUrl);
        if (response.ok) {
            const fresh = await response.json();
            return {
                ...track,
                preview: fresh.preview ?? track.preview,
                full: fresh.full ?? fresh.preview ?? track.full,
            };
        }
    } catch (e) {
        console.warn("Proxy fetch failed:", e);
    }

    return track;
};

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const audioPlayerRef = useRef<AudioPlayer | null>(null);

    const playTrack = async (track: Track) => {
        const finalTrack = await enrichTrackIfNeeded(track);
        console.log("FINAL TRACK:", finalTrack.id, "preview:", finalTrack.preview, "full:", finalTrack.full);
        setCurrentTrack(finalTrack);
        setIsMinimized(false);
        setIsModalOpen(true);
    };

    const minimize = () => {
        setIsMinimized(true);
        setIsModalOpen(false);
    };

    const expand = () => {
        setIsMinimized(false);
        setIsModalOpen(true);
    };

    const close = () => {
        const audio = audioPlayerRef.current?.audio.current;
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
        setCurrentTrack(null);
        setIsMinimized(false);
        setIsModalOpen(false);
    };

    return (
        <PlayerContext.Provider value={{
            currentTrack, isMinimized, isModalOpen, audioPlayerRef,
            playTrack, minimize, close, expand
        }}>
            {children}
        </PlayerContext.Provider>
    );
};