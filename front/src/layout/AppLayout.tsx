

import Sidebar from "../components/side-bar/Sidebar.tsx";
import Footer from "../components/footer/Footer.tsx";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
    return (
        <div className="relative w-full min-h-screen bg-[#181818] flex">

            <aside className="hidden xl:block fixed top-0 left-0 h-screen z-50 border-r-[2px] border-r-[#ee10b0] shadow-[8px_0_24.2px_0_rgba(238,16,176,0.15)]">
                <Sidebar />
            </aside>

            <div className="flex flex-col flex-1 w-full min-h-screen xl:ml-[270px]">
                <main className="flex-1">
                    <Outlet />
                </main>
                {<Footer />}
            </div>

        </div>
    );
}