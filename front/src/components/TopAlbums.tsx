import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { type Album, getTopAlbums } from "../service/albumService.ts";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
export default function TopAlbums() {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [showAll, setShowAll] = useState(false);
    useEffect(() => {
        getTopAlbums(20).then(setAlbums);
    }, []);
    if (!albums.length) return <p>Loading top albums...</p>;
    const initialDisplayCount = 9;
    const displayedAlbums = albums.slice(0, initialDisplayCount);
    const remainingAlbums = albums.slice(initialDisplayCount);
    const AlbumCard = ({ album }: { album: Album }) => (
        <Link
            to={`/albums/${album.id}`}
            className="flex flex-col items-center w-full">
            <img
                src={album.cover}
                alt={album.title}
                className="w-full h-[130px] object-cover rounded-md"/>
            <p className="text-white font-semibold mt-2 text-center truncate w-full">
                {album.title}</p>
            <p className="text-gray-400 text-sm truncate w-full text-center">
                {album.artist}</p>
        </Link>
    );
    return (
        <div className="w-full">
            <div className="hidden xl:block">
                <div className="flex flex-wrap justify-start gap-[25px]">
                    {displayedAlbums.map((album) => (
                        <div key={album.id} className="w-[130px]">
                            <AlbumCard album={album} />
                        </div>
                    ))}
                    {!showAll && remainingAlbums.length > 0 && (
                        <div className="w-[130px] h-[178px] flex flex-col items-center justify-center cursor-pointer" onClick={() => setShowAll(true)}>
                            <div className="w-[62px] h-[62px] flex justify-center items-center rounded-full bg-[#1E1E1E]">
                                <img src="assets/icon/plus.png" className="w-[24px] h-[24px]" alt="View all" />
                            </div>
                            <p className="mt-2 text-white font-vazirmatn text-[16px] font-medium">View All</p>
                        </div>
                    )}
                </div>
                {showAll && remainingAlbums.length > 0 && (
                    <div className="flex flex-col gap-4 mt-6">
                        <div className="flex flex-wrap justify-start gap-6">
                            {remainingAlbums.map(album => (
                                <div key={album.id} className="w-[130px]">
                                    <AlbumCard album={album} />
                                </div>
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
                    {albums.map((album) => (
                        <SwiperSlide key={album.id} style={{ width: '130px' }}>
                            <AlbumCard album={album} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
}