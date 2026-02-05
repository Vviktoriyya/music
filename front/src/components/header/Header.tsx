import { useState, useEffect } from "react";
import Search from "../search/Search.tsx";
import AuthModal from "../auth/AuthModal.tsx";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/superbaseClient";
import userIcon from "/assets/icon/user.png";
import BurgerMenu from "../burger-menu/BurgerMenu.tsx";

export default function Header() {
    const [isModalOpen, setModalOpen] = useState(false);
    const [authType, setAuthType] = useState<"login" | "signup">("login");
    const { session } = useAuth();
    const [username, setUsername] = useState<string | null>(
        (session?.user?.user_metadata?.username as string) || null
    );

    useEffect(() => {
        if (session) setModalOpen(false);
        const fetchUsername = async () => {
            if (!session?.user) { setUsername(null); return; }
            const metaUsername = session.user.user_metadata.username as string | undefined;
            if (metaUsername) { setUsername(metaUsername); return; }
            const { data, error } = await supabase.from("profiles").select("username").eq("id", session.user.id).single();
            if (error) { console.log("Error fetching username:", error.message); setUsername(null); }
            else { setUsername(data?.username || null); }
        };
        fetchUsername();
    }, [session]);

    return (
        <header className="top-0 absolute pt-[80px] left-0 w-full lg:max-w-[1450px] z-20  px-8 sm:px-6 lg:px-10 py-4 xl:left-[30px]  xl:w-[calc(100%-270px)]">
            <div className="flex justify-between items-center max-w-[1450px] mx-auto gap-6">

                <div className="flex-shrink min-w-0">
                    <Search />
                </div>

                <h1 className="font-vazirmatn text-[32px] font-extrabold text-center whitespace-nowrap xl:hidden">
                    <span className="text-blue-500">Home</span> <span className="text-[#EE10B0]">page</span>
                </h1>
                {/*  <div className="hidden xl:flex items-center gap-10">
                    <a
                        //href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white cursor-pointer font-vazirmatn text-[20px] font-[500] whitespace-nowrap"
                    >
                        About Us
                    </a>
                    <a
                        //href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white cursor-pointer font-vazirmatn text-[20px] font-[500] whitespace-nowrap"
                    >
                        Contact
                    </a>
                </div>
*/}

                <div className="hidden xl:flex items-center shrink-0">
                    {session ? (
                        <div className="flex items-center gap-3">
                            <img src={userIcon} alt="User" className="w-9 h-9 rounded-full border-2 border-pink-500" />
                            <span className="text-white text-[18px] font-medium whitespace-nowrap">
                                {username || session.user.email}
                            </span>
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <button onClick={() => { setAuthType("login"); setModalOpen(true); }} className="cursor-pointer w-[140px] h-[42px] text-[18px] flex justify-center items-center border border-[#EE10B0] text-[#EE10B0] rounded-[6px] hover:bg-[#EE10B0]/20 transition">
                                Login
                            </button>
                            <button onClick={() => { setAuthType("signup"); setModalOpen(true); }} className="cursor-pointer w-[140px] h-[42px] text-[18px] flex justify-center items-center rounded-[6px] bg-[#EE10B0] text-white hover:bg-[#ff36c3] transition">
                                Sign Up
                            </button>
                        </div>
                    )}
                </div>

                <div className="xl:hidden">
                    <BurgerMenu />
                </div>
            </div>

            {!session && (
                <AuthModal open={isModalOpen} onClose={() => setModalOpen(false)} type={authType} />
            )}
        </header>
    );
}