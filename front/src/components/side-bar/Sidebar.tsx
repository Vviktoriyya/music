import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext.tsx";
import { supabase } from "../../lib/supabaseClient.ts";
interface SidebarProps {
    onLinkClick?: () => void;
}
export default function Sidebar({ onLinkClick }: SidebarProps) {
    const { session, setSession } = useAuth();
    const navigate = useNavigate();
    return (
        <div className="box-border flex w-full max-w-[270px] flex-col items-start justify-start gap-4 p-6 md:pl-[40px] md:pr-[24px] md:pt-[40px] xl:w-[270px] xl:max-w-none xl:pl-[64px] xl:pr-[32px] xl:pt-[48px]">
            <h1 className="hidden w-full bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-left font-vazirmatn text-[32px] font-extrabold text-transparent xl:block">
                Melodies
            </h1>
            <p className="flex w-full items-center justify-start text-[12px] text-[#ee10b0] opacity-[0.6]">
                Menu
            </p>
            <SidebarItem icon="Home" text="Home" to="/" onClick={onLinkClick} />
            <SidebarItem icon="Discover" text="Discover" to="/discover" onClick={onLinkClick} />
            <SidebarItem icon="Albums" text="Albums" to="/albums" onClick={onLinkClick} />
            <SidebarItem icon="Artists" text="Artists" to="/artists" onClick={onLinkClick} />
            <p className="flex w-full items-center justify-start text-[12px] text-[#ee10b0] opacity-[0.6]">
                Playlist and favorite
            </p>
            <SidebarItem icon="Favorites" text="Favorites" to="/favorites" onClick={onLinkClick} />
            <SidebarItem icon="playlist" text="Your playlist" to="/Playlist" onClick={onLinkClick} />
            <SidebarItem icon="insights" text="Insights" to="/insights" onClick={onLinkClick} />
            {session && (
                <>
                    <p className="flex w-full items-center justify-start text-[12px] text-[#ee10b0] opacity-[0.6]">
                        Social
                    </p>
                    <SidebarItem icon="Artists" text="Profile" to="/profile" onClick={onLinkClick} />
                </>
            )}
            <p className="flex w-full items-center justify-start text-[12px] text-[#ee10b0] opacity-[0.6]">
                General
            </p>
            {session && (
                <SidebarItem
                    icon="logout"
                    text="Logout"
                    isLogout
                    onClick={async () => {
                        await supabase.auth.signOut();
                        setSession(null);
                        navigate("/");
                        if (onLinkClick) onLinkClick();
                    }}/>
            )}
        </div>
    );
}
interface SidebarItemProps {
    icon: string;
    text: string;
    to?: string;
    isLogout?: boolean;
    onClick?: () => void;
}
function SidebarItem({ icon, text, to, isLogout = false, onClick }: SidebarItemProps) {
    const location = useLocation();
    const isArtistsPage = to === '/artists' && location.pathname.startsWith('/artists');
    const content = (
        <>
            <img
                src={`/assets/icon/${icon}.png`}
                className="w-[16px] h-[16px] transition-all duration-200 ease-in-out group-hover:w-[25px] group-hover:h-[25px]"
                alt=""
            />
            <p className="text-[16px] font-[500] transition-all duration-200 ease-in-out group-hover:text-[22px] text-white">
                {text}
            </p>
        </>
    );
    if (isLogout) {
        return (
            <div
                onClick={onClick}
                className="group flex h-[40px] w-full cursor-pointer items-center justify-start gap-[8px] rounded-[10px] px-2 py-2 transition-all duration-200 ease-in-out hover:bg-[#EE10B0]">
                {content}
            </div>
        );
    }
    return (
        <NavLink
            to={to || '/'}
            onClick={onClick}
            className={({ isActive }) =>
                `group flex h-[40px] w-full cursor-pointer items-center justify-start gap-[8px] rounded-[10px] px-2 py-2 transition-all duration-200 ease-in-out hover:bg-[#EE10B0] ${isActive || isArtistsPage ? 'bg-[#EE10B0]' : ''}`
            }
        >
            {content}
        </NavLink>
    );
}