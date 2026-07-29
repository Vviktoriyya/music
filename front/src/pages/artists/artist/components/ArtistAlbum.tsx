import { type FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import plusIcon from "/assets/icon/plus.png";
import type { ArtistAlbum } from "../interfaces/artistTypes.ts";
interface Props {
    albums: ArtistAlbum[];
    isLoading: boolean;
}
const ArtistAlbums: FC<Props> = ({ albums, isLoading }) => {
    const [showAll, setShowAll] = useState(false);
    const navigate = useNavigate(); // 🔹 Хук для переходів
    if (isLoading) return <div className="pl-10 pt-4 text-white">Loading albums...</div>;
    const visibleAlbums = showAll ? albums : albums.slice(0, 7);
    const formatDate = (date?: string | null) => {
        if (!date) return "—";
        const d = new Date(date);
        return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("uk-UA");
    };
    const handleAlbumClick = (albumId: number) => {
        navigate(`/album/${albumId}`);
    };
    return (
        <div className="w-full pt-[50px] sm:pt-[70px] sm:pl-[35px]">
            <h2 className="mb-[10px] text-[30px] text-white font-[700] font-vazirmatn sm:text-[40px]">Albums</h2>
            <div className="grid grid-cols-2 gap-4 pt-[14px] sm:grid-cols-3 lg:grid-cols-4 xl:flex xl:flex-row xl:flex-wrap xl:gap-[24px] xl:items-center">
                {visibleAlbums.map((a) => (
                    <div
                        key={a.id}
                        onClick={() => handleAlbumClick(a.id)} // 🔹 Клік по альбому
                        className="w-[165px] h-[214px] flex flex-col items-center bg-[#1f1f1f]
                                   hover:bg-[#2a2a2a] rounded-[10px] p-[10px] transition cursor-pointer"
                    >
                        <div className="w-[145px] h-[150px] rounded-[10px] overflow-hidden bg-gray-700">
                            <img
                                src={a.cover}
                                alt={a.title}
                                className="w-full h-full object-cover rounded-[10px]"
                            />
                        </div>
                        <p
                            className="mt-2 text-white text-[16px] font-[500]
                                       text-center w-[145px] truncate"
                            title={a.title}
                        >
                            {a.title}
                        </p>
                        <p
                            className="text-white text-[12px] font-[300] opacity-80
                                       text-center w-[145px] truncate"
                        >
                            {formatDate(a.release_date)}
                        </p>
                    </div>
                ))}
                {!showAll && albums.length > 7 && (
                    <div
                        className="flex flex-col items-center cursor-pointer"
                        onClick={() => setShowAll(true)}
                    >
                        <div className="w-[62px] h-[62px] flex justify-center items-center bg-[#1E1E1E] rounded-full">
                            <img src={plusIcon} className="w-[24px] h-[24px]" alt="View more" />
                        </div>
                        <p className="text-white mt-2 text-[16px] font-medium">View All</p>
                    </div>
                )}
            </div>
            {showAll && (
                <div className="mt-4 flex justify-center">
                    <button
                        onClick={() => setShowAll(false)}
                        className="px-6 py-2 rounded-lg text-white font-bold
                                   bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500
                                   hover:scale-105 transition"
                    >
                        Hide
                    </button>
                </div>
            )}
        </div>
    );
};
export default ArtistAlbums;
