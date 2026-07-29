import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
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
    const [showAll, setShowAll] = useState(false);
    useEffect(() => {
        axios.get("http://localhost:5000/api/mood-playlists")
            .then(res => setPlaylists(res.data))
            .catch(err => console.error(err));
    }, []);
    if (!playlists.length) return <p>Loading playlists...</p>;
    const initialDisplayCount = 7;
    const displayedPlaylists = playlists.slice(0, initialDisplayCount);
    const remainingPlaylists = playlists.slice(initialDisplayCount);
    return (
        <div className="w-full">
            <div className="hidden xl:block">
                <div className="flex w-full items-center">
                    <div className="flex flex-nowrap gap-6">
                        {displayedPlaylists.map(pl => (
                            <Link key={pl.id} to={`/playlists/${pl.id}`} className="shrink-0">
                                <Card img={pl.cover || ""} />
                            </Link>
                        ))}
                    </div>
                    {!showAll && remainingPlaylists.length > 0 && (
                        <div className="w-[175px] h-[145px] flex flex-col items-center justify-center cursor-pointer shrink-0 ml-auto" onClick={() => setShowAll(true)}>
                            <div className="w-[62px] h-[62px] flex justify-center items-center rounded-full bg-[#1E1E1E]">
                                <img src="assets/icon/plus.png" className="w-[24px] h-[24px]" alt="View all" />
                            </div>
                            <p className="mt-2 text-white font-vazirmatn text-[16px] font-medium">View All</p>
                        </div>
                    )}
                </div>
                {showAll && remainingPlaylists.length > 0 && (
                    <div className="flex flex-col gap-4 mt-6">
                        <div className="flex flex-wrap gap-[20px]">
                            {remainingPlaylists.map(pl => (
                                <Link key={pl.id} to={`/playlists/${pl.id}`}><Card img={pl.cover || ""} /></Link>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-center">
                            <button onClick={() => setShowAll(false)} className="px-6 py-2 rounded-lg cursor-pointer text-white font-bold bg-gradient-to-r from-pink-500 to-purple-500 hover:scale-105 transition">
                                Hide
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className="xl:hidden">
                <Swiper
                    slidesPerView={'auto'}
                    spaceBetween={16}
                    className="w-full">
                    {playlists.map(pl => (
                        <SwiperSlide key={pl.id} style={{ width: '175px' }}>
                            <Link to={`/playlists/${pl.id}`}>
                                <Card img={pl.cover || ""} />
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
};
export default MoodPlaylist;