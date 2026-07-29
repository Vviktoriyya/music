import React from "react";
import LoginForm from "./LoginForm.tsx";
import RegistrationForm from "./RegistrationForm.tsx";
type AuthModalProps = {
    open: boolean;
    onClose: () => void;
    type: 'login' | 'signup';
};
const AuthModal: React.FC<AuthModalProps> = ({ open, onClose, type }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
            <div className="relative w-full max-w-[420px] rounded-2xl bg-white/10 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
                <button
                    onClick={onClose}
                    className="absolute top-[30px] right-[40px] text-white text-2xl font-bold hover:scale-110 transition"
                >
                    ×
                </button>
                {type === "login" ? <LoginForm /> : <RegistrationForm />}
            </div>
        </div>
    );
};
export default AuthModal;
