import Header from "../../components/header/Header.tsx";
import TrendingSongsList from "../../components/trending-song-list/TrendingSongsList.tsx";
import SingerList from "../../components/artist/SingerList.tsx";
import TopAlbums from "../../components/TopAlbums.tsx";
import MoodPlaylist from "../../components/mood-playlist/MoodPlaylist.tsx";
import { Link } from "react-router";
function MainContent() {
    return (
        <div className="relative flex flex-col items-start justify-start box-border px-4 pb-12 pt-[40px] sm:px-6 lg:px-8 xl:px-[80px]">
            <Header />
            <div className="relative hidden w-full xl:block mt-4">
                <img
                    src="/assets/img/girl.png"
                    className="rounded-[40px] w-full max-w-[1500px] h-[550px] object-cover "
                    alt="Music hero"
                />
                <div className="absolute left-[55px] top-[130px] z-10">
                    <div className="flex max-w-[410px] flex-col p-[10px]">
                        <h2 className="pb-6 text-left font-vazirmatn text-[45px] font-extrabold text-white">
                            All the <span className="text-[#EE10B0]">Best Songs</span><br />
                            in One Place
                        </h2>
                        <p className="font-vazirmatn text-[15px] font-light text-justify text-white/90">
                            On our website, you can access an amazing collection of popular and new songs.
                            Stream your favorite tracks in high quality and enjoy without interruptions.
                            Whatever your taste in music, we have it all for you!
                        </p>
                        <div className="flex gap-4 pt-[40px]">
                            <button className="w-[147px] h-[40px] flex justify-center items-center gap-[20px] px-[24px] pt-[5px] rounded-[4px] bg-[#EE10B0] text-white font-vazirmatn font-medium">
                                Discover Now
                            </button>
                            <Link
                                to="/playlist"
                                className="w-[152px] h-[40px] flex justify-center items-center px-[24px] pt-[5px] rounded-[4px] border border-[#0E9EEF] text-[#0E9EEF] font-vazirmatn font-medium whitespace-nowrap"
                            >
                                Create Playlist
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            {/* Trending Songs */}
            <div className="w-full pt-6 sm:pt-10 xl:pt-[60px]">
                <p className="font-vazirmatn text-[28px] text-white font-[700] text-left sm:text-[32px]">
                    Trending <span className="text-[#EE10B0]">Songs</span>
                </p>
            </div>
            <TrendingSongsList />
            {/* Popular Artist */}
            <div className="w-full pt-12 sm:pt-[74px]">
                <p className="font-vazirmatn text-[28px] text-white font-[700] text-left sm:text-[32px]">
                    Popular <span className="text-[#EE10B0]">Artist</span>
                </p>
            </div>
            <SingerList />
            {/* Top Albums */}
            <div className="w-full pt-12 sm:pt-[74px]">
                <p className="font-vazirmatn text-[28px] text-white font-[700] text-left sm:text-[32px]">
                    Top <span className="text-[#EE10B0]">Albums</span>
                </p>
            </div>
            <TopAlbums />
            {/* Mood Playlist */}
            <div className="w-full pt-12 sm:pt-[74px]">
                <p className="font-vazirmatn text-[28px] text-white font-[700] text-left sm:text-[32px]">
                    Mood <span className="text-[#EE10B0]">PlayList</span>
                </p>
            </div>
            <MoodPlaylist />
        </div>
    );
}
export default MainContent;