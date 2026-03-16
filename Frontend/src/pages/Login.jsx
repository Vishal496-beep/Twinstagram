import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Mail, Lock, Loader2, ShieldCheck } from "lucide-react";

const Login = () => {
    const [id, setId] = useState(""); 
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("/users/login", {
                email: id.includes("@") ? id : undefined,
                username: !id.includes("@") ? id : undefined,
                password
            });

            login(res.data.data.user);
            navigate("/videos"); 
        } catch (err) {
            alert(err.response?.data?.message || "Login Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-[#050505] text-zinc-100 px-6 font-sans">
            <div className="w-full max-w-100 flex flex-col gap-6">
                
                <header className="text-center space-y-2">
                    <div className="flex justify-center mb-2">
                        <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                            <ShieldCheck className="text-blue-500" size={32} />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-[0.2em] uppercase bg-linear-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                        Vision
                    </h1>
                    <p className="text-zinc-500 text-sm">Welcome back to the ecosystem</p>
                </header>

                <form 
                    onSubmit={handleSubmit} 
                    className="bg-zinc-900/30 border border-zinc-800/50 p-8 flex flex-col gap-5 rounded-2xl backdrop-blur-sm shadow-2xl shadow-black"
                >
                    <div className="space-y-4">
                        {/* Identity Input (Email or Username) */}
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Username or Email"
                                className="w-full bg-zinc-800/40 text-sm py-3 pl-10 pr-4 border border-zinc-800 rounded-xl focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-zinc-600"
                                onChange={(e) => setId(e.target.value)}
                                required
                            />
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={16} />
                        </div>

                        {/* Password Input */}
                        <div className="relative group">
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full bg-zinc-800/40 text-sm py-3 pl-10 pr-4 border border-zinc-800 rounded-xl focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-zinc-600"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={16} />
                        </div>
                    </div>

                    <button 
                        disabled={loading}
                        type="submit" 
                        className="w-full bg-white text-black hover:bg-zinc-200 disabled:opacity-50 py-3 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 mt-2 shadow-xl shadow-white/5"
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin text-black" />
                        ) : (
                            <>
                                <LogIn size={18} />
                                <span>Sign In</span>
                            </>
                        )}
                    </button>

                    <div className="flex items-center gap-4 my-2">
                        <div className="h-px flex-1 bg-zinc-800"></div>
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Secure Access</span>
                        <div className="h-px flex-1 bg-zinc-800"></div>
                    </div>

                    <p className="text-center text-zinc-500 text-[13px]">
                        Forgot your password? <button type="button" className="text-zinc-300 hover:text-white transition-colors">Reset here</button>
                    </p>
                </form>

                <div className="text-center">
                    <p className="text-zinc-500 text-sm">
                        New to the platform?{' '}
                        <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            Create Vision Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;