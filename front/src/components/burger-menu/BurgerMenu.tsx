import { useEffect, useState } from "react";
import { X, Menu } from "lucide-react";
import Sidebar from "../side-bar/Sidebar.tsx";
import AuthModal from "../auth/AuthModal.tsx";
import { useAuth } from "../../context/AuthContext.tsx";
export default function BurgerMenu() {
    const [isOpen, setOpen] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const [authType, setAuthType] = useState<"login" | "signup">("login");
    const { session } = useAuth();
    const handleCloseMenu = () => setOpen(false);
    useEffect(() => {
        if (typeof window === "undefined") return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = isOpen ? "hidden" : "auto";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);
    return (
        <>
            <button onClick={() => setOpen(true)} className="z-40 text-[#EE10B0]">
                <Menu size={28} />
            </button>
            {isOpen && (
                <div
                    onClick={handleCloseMenu}
                    className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                ></div>
            )}
            <div
                className={`fixed top-0 left-0 h-screen bg-[#181818] z-50 overflow-y-auto 
                           transition-transform duration-300 ease-in-out 
                           w-[min(82vw,320px)] 
                           ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-800">
                    <h1 className="text-[32px] font-extrabold bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent font-vazirmatn">
                        Melodies
                    </h1>
                    <button onClick={handleCloseMenu} className="text-white p-2">
                        <X size={30} />
                    </button>
                </div>
                <div className="p-2">
                    <Sidebar onLinkClick={handleCloseMenu} />
                    {!session && (
                        <div className="flex flex-col gap-4 mt-8 pt-4 border-t border-gray-700">
                            <button
                                onClick={() => {
                                    setAuthType("login");
                                    setModalOpen(true);
                                    handleCloseMenu();
                                }}
                                className="cursor-pointer w-full text-[20px] h-[46px] flex justify-center items-center gap-[20px] px-[16px] box-border border text-[#EE10B0] border-[#EE10B0] rounded-[4px]"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => {
                                    setAuthType("signup");
                                    setModalOpen(true);
                                    handleCloseMenu();
                                }}
                                className="cursor-pointer w-full h-[46px] text-[20px] flex justify-center items-center gap-[20px] px-[16px] rounded-[4px] bg-[#EE10B0] text-white"
                            >
                                Sign Up
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {!session && <AuthModal open={isModalOpen} onClose={() => setModalOpen(false)} type={authType} />}
        </>
    );
}
