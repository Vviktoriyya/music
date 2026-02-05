
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
        <div className="w-[270px] flex gap-[16px] flex-col items-start justify-start p-6 md:pl-[64px] md:pr-[32px] md:pt-[48px] box-border">
            <h1 className="hidden xl:block text-[32px] font-extrabold w-[174px] text-left bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent font-vazirmatn">
                Melodies
            </h1>

            <p className="w-[174px] h-[19px] text-[12px] opacity-[0.6] text-[#ee10b0] flex justify-start items-center">
                Menu
            </p>

            <SidebarItem icon="Home" text="Home" to="/" onClick={onLinkClick} />
            <SidebarItem icon="Discover" text="Discover" to="/discover" onClick={onLinkClick} />
            <SidebarItem icon="Albums" text="Albums" to="/albums" onClick={onLinkClick} />
            <SidebarItem icon="Artists" text="Artists" to="/artists" onClick={onLinkClick} />

            <p className="w-[174px] h-[19px] text-[12px] opacity-[0.6] text-[#ee10b0] flex justify-start items-center">
                Favorite
            </p>
            <SidebarItem icon="Favorites" text="Favorites" to="/favorites" onClick={onLinkClick} />

            <p className="w-[174px] h-[19px] text-[12px] opacity-[0.6] text-[#ee10b0] flex justify-start items-center">
                General
            </p>
            {session && (
                <SidebarItem
                    icon="Logout"
                    text="Logout"
                    isLogout
                    onClick={async () => {
                        await supabase.auth.signOut();
                        setSession(null);
                        navigate("/");
                        if (onLinkClick) onLinkClick();
                    }}
                />
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
                className="cursor-pointer group flex gap-[8px] w-[174px] h-[40px] justify-start items-center px-2 py-2 rounded-[10px] transition-all duration-200 ease-in-out hover:bg-[#EE10B0]"
            >
                {content}
            </div>
        );
    }

    return (
        <NavLink
            to={to || '/'}
            onClick={onClick}
            className={({ isActive }) =>
                `cursor-pointer group flex gap-[8px] w-[174px] h-[40px] justify-start items-center px-2 py-2 rounded-[10px] transition-all duration-200 ease-in-out hover:bg-[#EE10B0] ${isActive || isArtistsPage ? 'bg-[#EE10B0]' : ''}`
            }
        >
            {content}
        </NavLink>
    );
}