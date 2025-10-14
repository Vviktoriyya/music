import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

interface Playlist {
    id: number;
    cover?: string;
}

interface CardProps {
    img: string;
}


const Card: React.FC<CardProps> = ({ img }) => (
    <div className="w-[175px] cursor-pointer flex flex-col items-center">
        <div className="w-[145px] h-[145px] rounded-[10px] overflow-hidden bg-gray-700 shadow-lg">
            {img && <img src={img} alt="Playlist cover" className="w-full h-full object-cover" />}
        </div>
    </div>
);

const MoodPlaylist: React.FC = () => {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    useEffect(() => {
        axios.get("http://localhost:5000/api/mood-playlists")
            .then(res => setPlaylists(res.data))
            .catch(err => console.error(err));
    }, []);

    if (!playlists.length) return <p>Loading playlists...</p>;

    return (
        <div className="flex gap-[24px] flex-wrap">
            {playlists.map(pl => (
                <Link key={pl.id} to={`/playlists/${pl.id}`}>
                    <Card img={pl.cover || ""} />
                </Link>
            ))}
        </div>
    );
};

export default MoodPlaylist;