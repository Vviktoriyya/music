import Header from "../../components/header/Header.tsx";
import TrendingSongsList from "../../components/trending-song-list/TrendingSongsList.tsx";
import SingerList from "../../components/artist/SingerList.tsx";
import TopAlbums from "../../components/TopAlbums.tsx";
import MoodPlaylist from "../../components/mood-playlist/MoodPlaylist.tsx";


function MainContent() {
    return (
        <div className="px-[80px] flex-col flex pt-[48px] justify-start items-start box-border relative">

            {<div className="relative hidden xl:block">
                <img
                    src="/assets/img/girl.png"
                    className="rounded-[40px] w-full max-w-[1550px] h-[550px] object-cover mx-auto"
                />
            </div>}

            <Header/>
            {<div className="absolute z-1 pt-[148px] px-[55px] hidden xl:block">
                <div className="w-[352px] h-[146px] flex flex-col p-[10px]">
                    <h2 className="w-[410px] h-[156px] font-vazirmatn text-[45px] font-extrabold pb-[36px] text-left text-white">
                        All the <span className="text-[#EE10B0]">Best Songs</span><br/>
                        in One Place
                    </h2>

                    <p className="w-[410px] h-[76px] font-vazirmatn text-[15px] font-light text-justify opacity-[2px] text-white">
                        On our website, you can access an amazing collection of popular and new songs.
                        Stream your favorite tracks in high quality and enjoy without interruptions.
                        Whatever your taste in music, we have it all for you!
                    </p>

                    <div className="flex gap-4 pt-[50px]">
                        <button
                            className="w-[147px] h-[40px] flex justify-center items-center gap-[20px] px-[24px] pt-[5px] rounded-[4px] bg-[#EE10B0] text-white font-vazirmatn font-medium">
                            Discover Now
                        </button>
                        <button
                            className="w-[152px] h-[40px] flex justify-center items-center px-[24px] pt-[5px] rounded-[4px] border border-[#0E9EEF] text-[#0E9EEF] font-vazirmatn font-medium whitespace-nowrap">
                            Create Playlist
                        </button>
                    </div>
                </div>
            </div>

}

            <div className="lg:pt-[174px] pt-[150px] md:pt-[150px] w-full">
                <p className="w-[265px] h-[50px] font-vazirmatn text-[32px] text-white font-[700] text-left">
                    Trending <span className="text-[#EE10B0]">Songs</span>
                </p>
            </div>

            <TrendingSongsList/>

            <div className="pt-[74px] w-full">
                <p className="w-[265px] h-[50px] font-vazirmatn text-[32px] text-white font-[700] text-left">
                    Popular <span className="text-[#EE10B0]">Artist</span>
                </p>
            </div>

            <SingerList/>

            <div className="pt-[74px] w-full">
                <p className="w-[265px] h-[50px] font-vazirmatn text-[32px] text-white font-[700] text-left">
                    Top <span className="text-[#EE10B0]">Albums</span>
                </p>
            </div>
            <TopAlbums/>
            {
                <>
                    <div className="pt-[74px] w-full">
                        <p className="w-[265px] h-[50px] font-vazirmatn text-[32px] text-white font-[700] text-left">
                            Mood <span className="text-[#EE10B0]">PlayList</span>
                        </p>
                    </div>
                    <MoodPlaylist />
                </>
            }
        </div>
    );
}

export default MainContent;