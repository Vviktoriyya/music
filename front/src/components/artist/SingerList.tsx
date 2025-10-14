import React, { useEffect, useState } from "react";
import {type Artist, getTopArtists} from "../../service/singerService";
import { useNavigate } from "react-router-dom";

const SingerList: React.FC = () => {
    const [artists, setArtists] = useState<Artist[]>([]);
    const [showAll, setShowAll] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        getTopArtists().then(setArtists);
    }, []);

    const firstEight = artists.slice(0, 8);
    const remaining = artists.slice(8);

    const ArtistCard = ({ artist }: { artist: Artist }) => (
        <div
            className="flex flex-col justify-start items-center gap-[23px] w-[132.5px] h-[178px] cursor-pointer"
            onClick={() =>
                navigate(`/artists/${artist.id}`, { state: { artist } })
            }
        >
            <div className="w-[130px] h-[130px] rounded-full bg-gray-700 overflow-hidden">
                <img
                    src={artist.picture}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                />

            </div>
            <p className="text-white font-vazirmatn text-[16px] font-[400] leading-[100%] text-center w-[132.5px] h-[25px] truncate">
                {artist.name}
            </p>
        </div>
    );

    const chunkArray = (arr: Artist[], chunkSize: number) => {
        const chunks = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
            chunks.push(arr.slice(i, i + chunkSize));
        }
        return chunks;
    };

    const remainingChunks = chunkArray(remaining, 8);

    return (
        <div className="flex flex-col justify-center items-start gap-4">
            <div className="flex flex-row gap-[35px] justify-start items-center p-4">
                {firstEight.map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} />
                ))}
                {!showAll && remaining.length > 0 && (
                    <div
                        className="w-[132.5px] h-[178px] flex flex-col items-center justify-center cursor-pointer"
                        onClick={() => setShowAll(true)}
                    >
                        <div className="w-[62px] h-[62px] flex justify-center items-center rounded-full bg-[#1E1E1E]">
                            <img
                                src="assets/icon/plus.png"
                                className="w-[24px] h-[24px]"
                                alt="View all"
                            />
                        </div>
                        <p className="mt-2 text-white font-vazirmatn text-[16px] font-medium ">
                            View All
                        </p>
                    </div>
                )}
            </div>

            {showAll &&
                remainingChunks.map((chunk, index) => (
                    <div key={index} className="flex flex-row gap-[35px] justify-start p-4">
                        {chunk.map((artist) => (
                            <ArtistCard key={artist.id} artist={artist} />
                        ))}
                    </div>
                ))}

            {showAll && (
                <div className="mt-4 flex justify-center w-full">
                    <button
                        onClick={() => setShowAll(false)}
                        className="px-6 py-2 rounded-lg cursor-pointer text-white font-bold relative overflow-hidden
                                   bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500
                                   shadow-lg transition-all duration-500 ease-in-out
                                   hover:scale-105 hover:shadow-2xl
                                   active:scale-95"
                    >
                        <span className="relative z-10">Hide</span>
                        <span className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400
                                        opacity-50 rounded-lg animate-gradient-x"></span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default SingerList;
