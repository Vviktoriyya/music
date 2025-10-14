import { useState, useEffect } from "react";
import Search from "../search/Search.tsx";
import AuthModal from "../auth/AuthModal.tsx";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/superbaseClient";
import userIcon from "/assets/icon/user.png";

export default function Header() {
    const [isModalOpen, setModalOpen] = useState(false);
    const [authType, setAuthType] = useState<"login" | "signup">("login");

    // Змінено: ініціалізуємо username з метаданих сесії (якщо є)
    const { session } = useAuth();

    // Ім'я користувача, яке ми покажемо. Може бути з profiles або з metadata.
    const [username, setUsername] = useState<string | null>(
        (session?.user?.user_metadata?.username as string) || null
    );

    useEffect(() => {
        if (session) setModalOpen(false);

        const fetchUsername = async () => {
            if (session?.user) {
                // Пріоритет: метадані сесії
                const metaUsername = session.user.user_metadata.username as string | undefined;
                if (metaUsername) {
                    setUsername(metaUsername);
                    return; // Якщо є в метаданих, не робимо запит до DB одразу.
                }

                // Резерв: Запит до таблиці profiles
                const { data, error } = await supabase
                    .from("profiles")
                    .select("username")
                    .eq("id", session.user.id)
                    .single();

                if (error) {
                    console.log("Error fetching username:", error.message);
                    setUsername(null);
                } else {
                    setUsername(data?.username || null);
                }
            } else {
                setUsername(null);
            }
        };

        fetchUsername();
        // Додали session.user.user_metadata для реакції на зміну метаданих
    }, [session, session?.user?.user_metadata?.username]);

    return (
        <div className="absolute px-[33px] max-w-[1450px] z-10 w-full">
            <div className="pt-[26px] flex justify-between items-center w-full">
                <Search />
                <div className="flex pt-[5px] h-[25px] justify-center items-center gap-[150px]">
                    <p className="text-white cursor-pointer font-vazirmatn text-[20px] font-[500]">
                        About Us
                    </p>
                    <p className="text-white cursor-pointer font-vazirmatn text-[20px] font-[500]">
                        Contact
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {session ? (
                        <div className="flex items-center gap-3">
                            <img
                                src={userIcon}
                                alt="User"
                                className="w-9 h-9 rounded-full border-2 border-pink-500"
                            />
                            {/* === ВИПРАВЛЕННЯ: Використовуємо завантажене ім'я або email === */}
                            <span className="text-white hidden md:block">
                                {username || session.user.email}
                            </span>
                            {/* ============================================================= */}
                        </div>
                    ) : (
                        <div className="flex gap-[23px]">
                            <button
                                onClick={() => {
                                    setAuthType("login");
                                    setModalOpen(true);
                                }}
                                className="cursor-pointer w-[172px] text-[20px] h-[46px] flex justify-center items-center gap-[20px] px-[16px] box-border border text-[#EE10B0] border-[#EE10B0] rounded-[4px]"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => {
                                    setAuthType("signup");
                                    setModalOpen(true);
                                }}
                                className="cursor-pointer w-[172px] h-[46px] text-[20px] flex justify-center items-center gap-[20px] px-[16px] rounded-[4px] bg-[#EE10B0] text-white"
                            >
                                Sign Up
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {!session && <AuthModal open={isModalOpen} onClose={() => setModalOpen(false)} type={authType} />}
        </div>
    );
}