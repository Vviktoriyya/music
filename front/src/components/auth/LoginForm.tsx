import {type FC, useState} from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "../../lib/superbaseClient";
import logoAuth from "/assets/img/logoAuth.png";
import { useAuth } from "../../context/AuthContext";

const schema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

const LoginForm: FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
    const { setSession } = useAuth();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setErrorMessage("");

        const { data: authData, error } = await supabase.auth.signInWithPassword({
            email: data.email.trim(),
            password: data.password,
        });

        if (error) {
            setErrorMessage(error.message);
            setLoading(false);
            return;
        }

        if (authData.session) setSession(authData.session);

        setLoading(false);
        reset();
        if (onSuccess) onSuccess();
    };

    return (
        <div className="flex items-center justify-center">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-[382px] flex flex-col items-center gap-6 rounded-2xl px-6 py-8"
                style={{
                    background: "rgba(18, 18, 18, 0.8)",
                    boxShadow: "0 0 20px 5px rgba(255, 255, 255, 0.2)",
                }}
            >
                <div className="flex flex-col items-center mb-2">
                    <img src={logoAuth} alt="Melodies" className="w-[68px] h-[77px]" />
                    <h1
                        className="text-[24px] font-bold mt-2"
                        style={{
                            background: "linear-gradient(90deg, #EE10B0, #0E9EEF)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Melodies
                    </h1>
                </div>

                <h2 className="w-full text-left text-[24px] font-bold mb-4 text-white">
                    Login To Continue
                </h2>

                {/* Email */}
                <div className="flex flex-col w-full gap-2">
                    <label className="text-[16px] font-medium text-white">E-Mail</label>
                    <input
                        type="email"
                        placeholder="Enter Your E-Mail"
                        {...register("email")}
                        className="border-2 border-[#D9D9D9] rounded-[4px] px-3 py-2 bg-transparent text-white text-[12px] opacity-80 focus:outline-none"
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div className="flex flex-col w-full gap-2">
                    <label className="text-[16px] font-medium text-white">Password</label>
                    <input
                        type="password"
                        placeholder="Enter Your Password"
                        {...register("password")}
                        className="border-2 border-[#D9D9D9] rounded-[4px] px-3 py-2 bg-transparent text-white text-[12px] opacity-80 focus:outline-none"
                    />
                    {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#EE10B0] hover:bg-[#c80d8f] text-white font-bold py-2 rounded-[4px] mt-4 transition"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                {errorMessage && (
                    <p className="text-red-500 font-bold text-sm mt-3">{errorMessage}</p>
                )}
            </form>
        </div>
    );
};

export default LoginForm;
