import { createContext, useContext, useState, type ReactNode } from "react";
import type { Track } from "../types/track.ts";
interface PlayerContextType {
    currentTrack: Track | null;
    isMinimized: boolean;
    playTrack: (track: Track) => void;
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
export const PlayerProvider = ({ children }: { children: ReactNode }) => {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const playTrack = (track: Track) => {
        setCurrentTrack(track);
        setIsMinimized(false);
    };
    const minimize = () => setIsMinimized(true);
    const expand = () => setIsMinimized(false);
    const close = () => { setCurrentTrack(null); setIsMinimized(false); };
    return (
        <PlayerContext.Provider value={{ currentTrack, isMinimized, playTrack, minimize, close, expand }}>
            {children}
        </PlayerContext.Provider>
    );
};
