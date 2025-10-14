import { useEffect, useState } from "react";
import { type Genre, type Track, getGenres, getTracksByGenre } from "../../service/genreService";
import Header from "../../components/header/Header.tsx";
import TrackModal from "../../components/TrackModal.tsx";
import type { Track as AppTrack } from "../../types/track";
import SingerList from "../../components/artist/SingerList.tsx";
import MoodPlaylist from "../../components/mood-playlist/MoodPlaylist.tsx";
import TopAlbums from "../../components/TopAlbums.tsx";

export default function GenresPage() {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [showAll, setShowAll] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState<AppTrack | null>(null);

    useEffect(() => {
        getGenres().then(list => setGenres(list.slice(0, 40)));
    }, []);

    useEffect(() => {
        if (!selectedGenre) {
            setTracks([]);
            return;
        }
        getTracksByGenre(selectedGenre.id, 20).then(setTracks);
    }, [selectedGenre]);

    const formatDuration = (seconds?: number) => {
        if (seconds === undefined || seconds === null || seconds === 0) return "—";
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, "0")}`;
    };

    const mapToAppTrack = (t: Track): AppTrack => {
        return {
            id: t.id,
            title: t.title,
            name: t.title,
            link: t.link,
            duration: t.duration,
            rank: t.rank,
            artist: { id: '0', name: t.artist },
            cover: t.cover,
            release_date: undefined,
            album: { id: 0, title: t.album, link: "", cover: t.cover, release_date: undefined },
            preview: t.preview,
        } as const;
    };

    const Card = ({ title, img, onClick }: { title: string; img: string; onClick?: () => void }) => (
        <div className="relative w-[221px] h-[140px] rounded-[5px] cursor-pointer overflow-hidden flex justify-center items-center group" onClick={onClick}>
            <img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/40"></div>
            <p className="relative px-[5px] z-10 text-white text-center font-bold text-lg">{title}</p>
        </div>
    );

    const visibleGenres = showAll ? genres : genres.slice(0, 6);
    const hasMoreGenres = genres.length > 6;

    return (
        <div className={'flex pt-[30px]'}>
            <Header />
            <div className="pt-[90px] pl-[64px] pb-16 w-full pr-8">
                <h1 className="text-[32px] font-bold text-white mb-6">
                    Music <span className="text-[#EE10B0]">Genres</span>
                </h1>

                <div className="flex flex-wrap gap-[24px]">
                    {visibleGenres.map((genre) => (
                        <Card key={genre.id} title={genre.name} img={genre.picture} onClick={() => setSelectedGenre(genre)} />
                    ))}
                </div>

                {hasMoreGenres && (
                    <div className="mt-6 flex justify-center">
                        {showAll ? (
                            <button onClick={() => setShowAll(false)} className="px-6 py-2 rounded-lg cursor-pointer text-white font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 shadow-lg hover:scale-105 active:scale-95 transition-transform">
                                Hide
                            </button>
                        ) : (
                            <button onClick={() => setShowAll(true)} className="px-6 py-2 rounded-lg cursor-pointer text-white font-bold bg-gray-700 hover:bg-gray-600 shadow-lg hover:scale-105 active:scale-95 transition-transform">
                                View All
                            </button>
                        )}
                    </div>
                )}

                {selectedGenre && tracks.length > 0 && (
                    <div className="mt-12 w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-[24px] font-bold text-white">Top Tracks in {selectedGenre.name}</h2>
                            <button
                                onClick={() => setSelectedGenre(null)}
                                className="text-gray-400 hover:text-white text-4xl font-bold transition-colors"
                                title="Close track list"
                            >
                                &times;
                            </button>
                        </div>
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
                                <tr key={track.id} onClick={() => setSelectedTrack(mapToAppTrack(track))} className="cursor-pointer hover:bg-gray-800 transition-colors rounded-lg">
                                    <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                                    <td className="px-4 py-3 font-semibold flex items-center gap-4">
                                        <img src={track.cover} alt={track.title} className="w-10 h-10 rounded-md" />
                                        {track.title}
                                    </td>
                                    <td className="px-4 py-3 text-gray-300">{track.artist}</td>
                                    <td className="px-4 py-3 text-gray-300">{track.album}</td>
                                    <td className="px-4 py-3 text-gray-300">{formatDuration(track.duration)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {selectedTrack && (
                    <TrackModal track={selectedTrack} onClose={() => setSelectedTrack(null)} />
                )}

                {/* --- Інші секції --- */}
                <div className="pt-[74px] w-full">
                    <p className="w-[265px] h-[50px] font-vazirmatn text-[32px] text-white font-[700] text-left">
                        Popular <span className="text-[#EE10B0]">Artist</span>
                    </p>
                </div>
                <SingerList />

                <div className="pt-[74px] w-full">
                    <p className="w-[265px] h-[50px] font-vazirmatn text-[32px] text-white font-[700] text-left">
                        Mood <span className="text-[#EE10B0]">PlayList</span>
                    </p>
                </div>
                <MoodPlaylist/>
                <div className="pt-[74px] w-full">
                    <p className="w-[265px] h-[50px] font-vazirmatn text-[32px] text-white font-[700] text-left">
                        Top <span className="text-[#EE10B0]">Albums</span>
                    </p>
                </div>

                <TopAlbums/>
            </div>
        </div>
    );
}