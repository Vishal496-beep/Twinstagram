import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Camera, Loader2, Mail, Lock, User, AtSign } from "lucide-react";

const Register = () => {
    const [formData, setFormData] = useState({ fullname: "", username: "", email: "", password: "" });
    const [avatar, setAvatar] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => data.append(key, value));
        if (avatar) data.append("avatar", avatar);

        try {
            await api.post("/users/register", data);
            navigate("/login");
        } catch (err) {
            alert(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-[#050505] text-zinc-100 px-6 font-sans">
            <div className="w-full max-w-100 flex flex-col gap-6">
                
                <header className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-[0.2em] uppercase bg-linear-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                        Vision
                    </h1>
                    <p className="text-zinc-500 text-sm">Create your professional identity</p>
                </header>

                <form 
                    onSubmit={handleSubmit} 
                    className="bg-zinc-900/30 border border-zinc-800/50 p-8 flex flex-col items-center gap-5 rounded-2xl backdrop-blur-sm"
                >
                    {/* Professional Avatar Picker */}
                    <div className="relative group">
                        <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-zinc-700 overflow-hidden bg-zinc-900 flex items-center justify-center transition-all group-hover:border-blue-500/50">
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <Camera className="text-zinc-600 group-hover:text-zinc-400" size={24} />
                            )}
                        </div>
                        <input type="file" className="hidden" id="avatar-upload" onChange={handleFileChange} accept="image/*" />
                        <label 
                            htmlFor="avatar-upload"
                            className="absolute -bottom-2 -right-2 bg-blue-600 p-1.5 rounded-lg cursor-pointer hover:bg-blue-500 transition shadow-lg shadow-blue-600/20"
                        >
                            <UserPlus size={14} className="text-white" />
                        </label>
                    </div>

                    <div className="w-full space-y-3">
                        {/* Custom Input Wrapper */}
                        {[
                            { id: 'fullname', type: 'text', icon: User, placeholder: 'Full Name' },
                            { id: 'username', type: 'text', icon: AtSign, placeholder: 'Username' },
                            { id: 'email', type: 'email', icon: Mail, placeholder: 'Email Address' },
                            { id: 'password', type: 'password', icon: Lock, placeholder: 'Password' }
                        ].map((input) => (
                            <div key={input.id} className="relative group">
                                <input
                                    type={input.type}
                                    placeholder={input.placeholder}
                                    className="w-full bg-zinc-800/40 text-sm py-3 pl-10 pr-4 border border-zinc-800 rounded-xl focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-zinc-600"
                                    onChange={(e) => setFormData({...formData, [input.id]: e.target.value})}
                                    required
                                />
                                <input.icon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={16} />
                            </div>
                        ))}
                    </div>

                    <button 
                        disabled={loading}
                        type="submit" 
                        className="w-full bg-white text-black hover:bg-zinc-200 disabled:opacity-50 py-3 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 mt-2 shadow-xl shadow-white/5"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin text-black" /> : "Create Account"}
                    </button>
                </form>

                <p className="text-center text-zinc-500 text-sm">
                    Already part of Vision?{' '}
                    <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;