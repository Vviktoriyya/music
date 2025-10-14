import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // ✅ Крок 1: Імпортуємо Link
import { type Album, getTopAlbums } from "../service/albumService.ts";

export default function TopAlbums() {
    const [albums, setAlbums] = useState<Album[]>([]);

    useEffect(() => {
        getTopAlbums(10).then(setAlbums);
    }, []);

    if (!albums.length) return <p>Loading top albums...</p>;

    return (
        <div className="flex flex-row flex-wrap gap-6">
            {albums.map((album) => (
                <Link
                    key={album.id}
                    to={`/albums/${album.id}`}
                    className="flex flex-col items-center w-[150px]"
                >
                    <img
                        src={album.cover}
                        alt={album.title}
                        className="w-[150px] h-[150px] object-cover rounded-md"
                    />
                    <p className="text-white font-semibold mt-2 text-center truncate w-[150px]">
                        {album.title}
                    </p>
                    <p className="text-gray-400 text-sm truncate w-[150px] text-center">
                        {album.artist}
                    </p>
                </Link>
            ))}
        </div>
    );
}