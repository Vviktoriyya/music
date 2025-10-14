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
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
            <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl w-[420px]">
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
