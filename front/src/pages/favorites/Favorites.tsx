import React, { useState } from "react";
import TrackModal from "../../components/TrackModal.tsx";
import type { Track } from "../../types/track.ts";
import { useFavorites } from "./hooks/useFavorites.ts";
import Header from "../../components/header/Header.tsx";
import { useAuth } from "../../context/AuthContext";

const Favorites: React.FC = () => {
    const { session } = useAuth();
    const { favorites, removeFavorite } = useFavorites();
    const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

    const formatDate = (date?: string | null) => {
        if (!date) return "—";
        const d = new Date(date);
        if (Number.isNaN(d.getTime())) return "—";
        const day = d.getDate().toString().padStart(2, "0");
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const formatDuration = (seconds?: number | null) => {
        if (!seconds && seconds !== 0) return "—";
        const min = Math.floor((seconds ?? 0) / 60);
        const sec = (seconds ?? 0) % 60;
        return `${min}:${sec.toString().padStart(2, "0")}`;
    };

    return (
        <div className="w-full pt-[30px] min-h-screen bg-[#0f0f0f]">
            <Header />
            <div className="pt-[100px] pl-[64px] text-white font-vazirmatn">
                <h1 className="text-[32px] font-bold text-white mb-6">
                    Favorites <span className="text-[#EE10B0]">Music</span>
                </h1>

                {!session && (
                    <p className="text-center text-gray-400 text-[20px] mt-20">
                        Спочатку зареєструйтесь або увійдіть
                    </p>
                )}

                {session && favorites.length === 0 && (
                    <p className="text-center text-gray-400 text-[20px] mt-20">
                        No favorite tracks yet :(<br /> Tap the heart icon in the player to add some :)
                    </p>
                )}

                {session && favorites.length > 0 && (
                    <table className="w-full pb-[50px] pr-[100px] mt-6 text-white text-[20px] border-separate border-spacing-y-2">
                        <thead>
                        <tr>
                            <th className="px-6 py-3 text-left">Track</th>
                            <th className="px-6 py-3 text-left">Release Date</th>
                            <th className="px-6 py-3 text-left">Played</th>
                            <th className="px-6 py-3 text-left">Time</th>
                            <th className="px-6 py-3 text-left"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {favorites.map((track, i) => (
                            <tr
                                key={track.id}
                                onClick={() => setSelectedTrack(track)}
                                className="bg-gray-800 hover:bg-gray-700 rounded-lg h-[60px] cursor-pointer transition-all duration-300"
                            >
                                <td className="px-6 py-0">
                                    <div className="flex items-center gap-4">
                                        <span className="w-[20px] text-right text-gray-400">{i + 1}</span>
                                        <img src={track.cover} alt={track.name} className="w-[60px] h-[60px] rounded-md" />
                                        <div>
                                            <div className="font-semibold">{track.name}</div>
                                            <div className="text-gray-400 text-[14px]">{track.artist.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{formatDate(track.release_date)}</td>
                                <td>{track.rank ? track.rank.toLocaleString() : "—"}</td>
                                <td><span>{formatDuration(track.duration)}</span></td>
                                <td>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFavorite(track.id);
                                        }}
                                        className="text-red-400 flex items-center hover:text-red-500 hover:scale-110 transition-transform"
                                        title="Remove from favorites"
                                    >
                                        <img src={'assets/icon/cancel.png'} className={'w-[35px] cursor-pointer'} alt="Remove favorite"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}

                {selectedTrack && <TrackModal track={selectedTrack} onClose={() => setSelectedTrack(null)} />}
            </div>
        </div>
    );
};

export default Favorites;
