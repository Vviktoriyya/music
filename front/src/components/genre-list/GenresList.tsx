import { useEffect, useState } from "react";
import {type Genre, getGenres, getTracksByGenre, type Track} from "../../service/genreService";

export default function GenresList() {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
    const [tracks, setTracks] = useState<Track[]>([]);

    useEffect(() => {
        getGenres().then(setGenres);
    }, []);

    useEffect(() => {
        if (selectedGenre) {
            getTracksByGenre(selectedGenre.id, 10).then(setTracks);
        }
    }, [selectedGenre]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-4">Genres</h1>

            {/* Список жанрів */}
            <div className="flex flex-wrap gap-4 mb-6">
                {genres.map((genre) => (
                    <div
                        key={genre.id}
                        className={`cursor-pointer flex flex-col items-center p-2 rounded-lg transition
                        ${selectedGenre?.id === genre.id ? "bg-purple-600" : "bg-gray-800"}`}
                        onClick={() => setSelectedGenre(genre)}
                    >
                        <img src={genre.picture} alt={genre.name} className="w-20 h-20 rounded-full mb-2" />
                        <p className="text-white text-center">{genre.name}</p>
                    </div>
                ))}
            </div>

            {/* Топ треки обраного жанру */}
            {selectedGenre && (
                <>
                    <h2 className="text-xl font-semibold text-white mb-2">
                        Top tracks in {selectedGenre.name}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {tracks.map((track) => (
                            <a
                                key={track.id}
                                href={track.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center bg-gray-900 p-2 rounded-lg"
                            >
                                <img src={track.cover} alt={track.title} className="w-full h-40 object-cover rounded-md mb-2" />
                                <p className="text-white font-medium text-center truncate w-full">{track.title}</p>
                                <p className="text-gray-400 text-sm text-center truncate w-full">{track.artist}</p>
                            </a>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
