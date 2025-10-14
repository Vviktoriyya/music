
import Sidebar from "../components/side-bar/Sidebar.tsx";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
    return (
        <div className="relative w-full h-screen overflow-y-auto overflow-x-hidden bg-[#181818]">
            <div className="fixed z-50 h-screen border-r-[2px] border-r-[#ee10b0] shadow-[8px_0_24.2px_0_rgba(238,16,176,0.15)]">
                <Sidebar />
            </div>

            <div className="ml-[290px] origin-top-left transform ">
                <Outlet />
            </div>
        </div>
    );
}
