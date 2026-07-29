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
        <div className="relative flex justify-center  h-full w-full pt-[100px]">
            <Header />
            <div className="px-4 pb-12 pt-24 text-white font-vazirmatn sm:px-6 lg:px-8 xl:px-16 xl:pt-[100px]">
                <h1 className="mb-6 text-[28px] font-bold text-white sm:text-[32px]">
                    Favorites <span className="text-[#EE10B0]">Music</span>
                </h1>
                {!session && (
                    <p className="text-center text-gray-400 text-[20px] mt-20">
                        Please register or log in first :)
                    </p>
                )}
                {session && favorites.length === 0 && (
                    <p className="text-center text-gray-400 text-[20px] mt-20">
                        No favorite tracks yet :(<br /> Tap the heart icon in the player to add some :)
                    </p>
                )}
                {session && favorites.length > 0 && (
                    <>
                        {/* Desktop версія */}
                        <div className="hidden xl:block ">
                            <table className="mt-6 w-[1300px] border-separate border-spacing-y-2 text-[18px] text-white">
                                <thead>
                                <tr className="text-left text-gray-400">
                                    <th className="px-6 py-3 text-left font-medium">#</th>
                                    <th className="px-6 py-3 text-left font-medium">Track</th>
                                    <th className="px-6 py-3 text-left font-medium">Release Date</th>
                                    <th className="px-6 py-3 text-left font-medium">Played</th>
                                    <th className="px-6 py-3 text-left font-medium">Time</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                                </thead>
                                <tbody>
                                {favorites.map((track, i) => (
                                    <tr
                                        key={track.id}
                                        onClick={() => setSelectedTrack(track)}
                                        className="bg-gray-800 hover:bg-gray-700 rounded-lg h-[60px] cursor-pointer transition-all duration-300"
                                    >
                                        <td className="px-6 py-0 w-[50px]">
                                            <span className="text-gray-400 text-[16px]">{i + 1}</span>
                                        </td>
                                        <td className="px-6 py-0">
                                            <div className="flex items-center gap-4">
                                                <img src={track.cover} alt={track.name} className="w-[50px] h-[50px] rounded-md object-cover" />
                                                <div>
                                                    <div className="font-semibold">{track.name}</div>
                                                    <div className="text-gray-400 text-[14px]">{track.artist.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-0 text-gray-300">{formatDate(track.release_date)}</td>
                                        <td className="px-6 py-0 text-gray-300">{track.rank ? track.rank.toLocaleString() : "—"}</td>
                                        <td className="px-6 py-0 text-gray-300">{formatDuration(track.duration)}</td>
                                        <td className="px-6 py-0">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFavorite(track.id);
                                                }}
                                                className="text-red-400 flex items-center hover:text-red-500 hover:scale-110 transition-transform"
                                                title="Remove from favorites"
                                            >
                                                <img src={'assets/icon/cancel.png'} className={'w-[30px] cursor-pointer'} alt="Remove favorite" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Мобільна версія */}
                        <div className="mt-6 flex flex-col gap-3 xl:hidden">
                            {favorites.map((track, i) => (
                                <div
                                    key={track.id}
                                    onClick={() => setSelectedTrack(track)}
                                    className="flex cursor-pointer items-center gap-3 rounded-xl bg-gray-800 p-3 transition-colors hover:bg-gray-700"
                                >
                                    <span className="w-6 shrink-0 text-sm text-gray-400">{i + 1}</span>
                                    <img src={track.cover} alt={track.name} className="h-14 w-14 rounded-md object-cover" />
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate font-semibold">{track.name}</div>
                                        <div className="truncate text-sm text-gray-400">{track.artist.name}</div>
                                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                                            <span>{formatDate(track.release_date)}</span>
                                            <span>{track.rank ? track.rank.toLocaleString() : "—"} plays</span>
                                            <span>{formatDuration(track.duration)}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFavorite(track.id);
                                        }}
                                        className="shrink-0"
                                        title="Remove from favorites"
                                    >
                                        <img src={"assets/icon/cancel.png"} className={"w-7 cursor-pointer"} alt="Remove favorite" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                {selectedTrack && <TrackModal track={selectedTrack} onClose={() => setSelectedTrack(null)} />}
            </div>
        </div>
    );
};
export default Favorites;