import Sidebar from "../components/side-bar/Sidebar.tsx";
import Footer from "../components/footer/Footer.tsx";
import { Outlet } from "react-router-dom";
import TrackModal from "../components/TrackModal.tsx";
import { usePlayer } from "../context/PlayerContext.tsx";
export default function AppLayout() {
    const { currentTrack, isMinimized, close } = usePlayer();
    return (
        <div className="relative flex min-h-screen w-full bg-[#181818]">
            <aside className="fixed left-0 top-0 z-50 hidden h-screen border-r-[2px] border-r-[#ee10b0] shadow-[8px_0_24.2px_0_rgba(238,16,176,0.15)] xl:block">
                <Sidebar />
            </aside>
            <div className="flex min-h-screen w-full flex-1 flex-col xl:ml-[270px]">
                <main className={`flex-1 overflow-x-clip transition-all ${isMinimized ? "pb-24" : ""}`}>
                    <Outlet />
                </main>
                <Footer />
            </div>
            {currentTrack && !isMinimized && (
                <TrackModal track={currentTrack} onClose={close} />
            )}
        </div>
    );
}