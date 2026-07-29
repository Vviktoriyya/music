import { useEffect, useState } from "react";
import { type Genre, type Track, getGenres, getTracksByGenre } from "../../service/genreService";
import Header from "../../components/header/Header.tsx";
import type { Track as AppTrack } from "../../types/track";
import SingerList from "../../components/artist/SingerList.tsx";
import MoodPlaylist from "../../components/mood-playlist/MoodPlaylist.tsx";
import TopAlbums from "../../components/TopAlbums.tsx";
import { usePlayer } from "../../context/PlayerContext.tsx";
export default function GenresPage() {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [showAll, setShowAll] = useState(false);
    const { playTrack } = usePlayer();
    useEffect(() => { getGenres().then(list => setGenres(list.slice(0, 40))); }, []);
    useEffect(() => {
        if (!selectedGenre) { setTracks([]); return; }
        getTracksByGenre(selectedGenre.id, 20).then(setTracks);
    }, [selectedGenre]);
    const formatDuration = (seconds?: number) => {
        if (seconds === undefined || seconds === null || seconds === 0) return "—";
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, "0")}`;
    };
    const mapToAppTrack = (t: Track): AppTrack => ({
        id: t.id, title: t.title, name: t.title, link: t.link, duration: t.duration, rank: t.rank,
        artist: { id: '0', name: t.artist }, cover: t.cover, release_date: undefined,
        album: { id: 0, title: t.album, link: "", cover: t.cover, release_date: undefined },
        preview: t.preview,
    } as const);
    const Card = ({ title, img, onClick }: { title: string; img: string; onClick?: () => void }) => (
        <div className="group relative flex h-[140px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-[5px] sm:max-w-[221px]" onClick={onClick}>
            <img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/40" />
            <p className="relative px-[5px] z-10 text-white text-center font-bold text-lg">{title}</p>
        </div>
    );
    const visibleGenres = showAll ? genres : genres.slice(0, 6);
    return (
        <div className="relative flex pt-[30px]">
            <Header />
            <div className="w-full px-4 pb-12 pt-24 sm:px-6 lg:px-8 xl:px-16 xl:pt-[130px]">
                <h1 className="mb-6 text-[28px] font-bold text-white sm:text-[32px]">
                    Music <span className="text-[#EE10B0]">Genres</span>
                </h1>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:flex xl:flex-wrap xl:gap-[24px]">
                    {visibleGenres.map((genre) => (
                        <Card key={genre.id} title={genre.name} img={genre.picture} onClick={() => setSelectedGenre(genre)} />
                    ))}
                </div>
                {genres.length > 6 && (
                    <div className="mt-6 flex justify-center">
                        <button onClick={() => setShowAll(!showAll)} className={`px-6 py-2 rounded-lg cursor-pointer text-white font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform ${showAll ? "bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500" : "bg-gray-700 hover:bg-gray-600"}`}>
                            {showAll ? "Hide" : "View All"}
                        </button>
                    </div>
                )}
                {selectedGenre && tracks.length > 0 && (
                    <div className="mt-12 w-full">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <h2 className="text-[22px] font-bold text-white sm:text-[24px]">Top Tracks in {selectedGenre.name}</h2>
                            <button onClick={() => setSelectedGenre(null)} className="text-gray-400 hover:text-white text-4xl font-bold transition-colors">&times;</button>
                        </div>
                        <div className="hidden xl:block xl:overflow-x-auto">
                            <table className="w-full text-white text-[16px] border-separate border-spacing-y-2">
                                <thead>
                                <tr className="text-gray-400">
                                    <th className="px-4 py-2 text-left">#</th>
                                    <th className="px-4 py-2 text-left">Title</th>
                                    <th className="px-4 py-2 text-left">Artist</th>
                                    <th className="px-4 py-2 text-left">Album</th>
                                    <th className="px-4 py-2 text-left">Time</th>
                                </tr>
                                </thead>
                                <tbody>
                                {tracks.map((track, idx) => (
                                    <tr key={track.id} onClick={() => playTrack(mapToAppTrack(track))} className="cursor-pointer hover:bg-gray-800 transition-colors rounded-lg">
                                        <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-4 font-semibold">
                                                <img src={track.cover} alt={track.title} className="w-10 h-10 rounded-md" />
                                                <span>{track.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">{track.artist}</td>
                                        <td className="px-4 py-3 text-gray-300">{track.album}</td>
                                        <td className="px-4 py-3 text-gray-300">{formatDuration(track.duration)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex flex-col gap-3 xl:hidden">
                            {tracks.map((track, idx) => (
                                <button key={`${track.id}-mobile`} type="button" onClick={() => playTrack(mapToAppTrack(track))} className="flex w-full items-center gap-3 rounded-xl bg-[#202020] p-3 text-left text-white transition-colors hover:bg-[#2b2b2b]">
                                    <span className="w-6 shrink-0 text-sm text-gray-400">{idx + 1}</span>
                                    <img src={track.cover} alt={track.title} className="h-12 w-12 rounded-md object-cover" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-semibold">{track.title}</p>
                                        <p className="truncate text-sm text-gray-400">{track.artist}</p>
                                    </div>
                                    <span className="shrink-0 text-sm text-gray-300">{formatDuration(track.duration)}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <div className="w-full pt-12 sm:pt-[74px]">
                    <p className="font-vazirmatn text-[28px] text-white font-[700] text-left sm:text-[32px]">Popular <span className="text-[#EE10B0]">Artist</span></p>
                </div>
                <SingerList />
                <div className="w-full pt-12 sm:pt-[74px]">
                    <p className="font-vazirmatn text-[28px] text-white font-[700] text-left sm:text-[32px]">Mood <span className="text-[#EE10B0]">PlayList</span></p>
                </div>
                <MoodPlaylist />
                <div className="w-full pt-12 sm:pt-[74px]">
                    <p className="font-vazirmatn text-[28px] text-white font-[700] text-left sm:text-[32px]">Top <span className="text-[#EE10B0]">Albums</span></p>
                </div>
                <TopAlbums />
            </div>
        </div>
    );
}