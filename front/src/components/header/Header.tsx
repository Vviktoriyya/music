import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Search from "../search/Search.tsx";
import AuthModal from "../auth/AuthModal.tsx";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../hooks/useProfile.ts";
import BurgerMenu from "../burger-menu/BurgerMenu.tsx";
const DEFAULT_AVATAR = "/assets/icon/user.png";
export default function Header() {
    const [isModalOpen, setModalOpen] = useState(false);
    const [authType, setAuthType] = useState<"login" | "signup">("login");
    const { session } = useAuth();
    const { profile, loading } = useProfile();
    const navigate = useNavigate();
    useEffect(() => {
        if (session) setModalOpen(false);
    }, [session]);
    const displayName =
        profile?.username ||
        (session?.user?.user_metadata?.username as string) ||
        session?.user?.email;
    const avatarUrl = profile?.avatar_url || DEFAULT_AVATAR;
    return (
        <header className="absolute left-0 top-[50px] z-20 w-full px-4 pb-4 pt-8 sm:px-6 lg:px-8 xl:left-[30px] xl:w-[calc(100%-270px)] xl:pt-10">
            <div className="mx-auto flex max-w-[1450px] items-center justify-between gap-3 sm:gap-6">
                <div className="min-w-0 pl-[50px] flex-1 xl:flex-none">
                    <Search />
                </div>
                <h1 className="hidden text-center font-vazirmatn text-xl font-extrabold whitespace-nowrap sm:block xl:hidden">
                    <span className="text-blue-500">Home</span> <span className="text-[#EE10B0]">page</span>
                </h1>
                <div className="hidden xl:flex items-center shrink-0">
                    {session ? (
                        <div
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => navigate("/profile")}
                            title="Open profile">
                            {/* Поки профіль вантажиться — показуємо плейсхолдер замість миготіння */}
                            {loading && !profile ? (
                                <div className="w-9 h-9 rounded-full border-2 border-pink-500 bg-[#2a2a2a] animate-pulse" />
                            ) : (
                                <img
                                    src={avatarUrl}
                                    alt="User"
                                    className="w-9 h-9 rounded-full border-2 border-pink-500 object-cover group-hover:scale-105 transition"
                                    onError={(e) => {
                                        e.currentTarget.src = DEFAULT_AVATAR;
                                    }}/>
                            )}
                            <span className="text-white text-[18px] font-medium whitespace-nowrap group-hover:text-[#EE10B0] transition">
                                {displayName}
                            </span>
                        </div>
                    ) : (
                        <div className="flex  gap-4">
                            <button onClick={() => { setAuthType("login"); setModalOpen(true); }} className="cursor-pointer w-[140px] h-[42px] text-[18px] flex justify-center items-center border border-[#EE10B0] text-[#EE10B0] rounded-[6px] hover:bg-[#EE10B0]/20 transition">
                                Login
                            </button>
                            <button onClick={() => { setAuthType("signup"); setModalOpen(true); }} className="cursor-pointer w-[140px] h-[42px] text-[18px] flex justify-center items-center rounded-[6px] bg-[#EE10B0] text-white hover:bg-[#ff36c3] transition">
                                Sign Up
                            </button>
                        </div>
                    )}
                </div>
                <div className="shrink-0 xl:hidden">
                    <BurgerMenu />
                </div>
            </div>
            {!session && (
                <AuthModal open={isModalOpen} onClose={() => setModalOpen(false)} type={authType} />
            )}
        </header>
    );
}