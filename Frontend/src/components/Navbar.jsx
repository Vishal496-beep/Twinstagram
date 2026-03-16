import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Upload, User, LogOut, Menu, X } from "lucide-react";

const Navbar = ({ user, onLogout }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
            setSearchQuery("");
            setIsMenuOpen(false);
        }
    };

    return (
        <nav className="sticky top-0 z-50 w-full bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5 px-4 lg:px-8 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                
                {/* LOGO */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                        <span className="text-white font-black text-xl">V</span>
                    </div>
                    <span className="hidden md:block font-black text-white uppercase tracking-tighter text-lg">Vision</span>
                </Link>

                {/* SEARCH BAR */}
                <form onSubmit={handleSearch} className="flex-1 max-w-xl relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input 
                        type="text"
                        placeholder="Search across dimensions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-2.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-zinc-900 transition-all placeholder:text-zinc-600"
                    />
                </form>

                {/* ACTIONS */}
                <div className="hidden md:flex items-center gap-3">
                    <Link to="/upload" className="p-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all" title="Upload Vision">
                        <Upload size={20} />
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-3 pl-3 border-l border-zinc-800">
                            <Link to={`/profile/${user._id}`}>
                                <img 
                                    src={user.avatar} 
                                    className="w-9 h-9 rounded-full border border-white/10 hover:border-indigo-500 transition-colors object-cover" 
                                    alt="profile" 
                                />
                            </Link>
                            <button onClick={onLogout} className="p-2.5 text-zinc-500 hover:text-red-400 transition-colors">
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="bg-white text-black px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-lg">
                            Connect
                        </Link>
                    )}
                </div>

                {/* MOBILE MENU TOGGLE */}
                <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* MOBILE MENU */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-zinc-950 border-b border-zinc-800 p-6 space-y-4 flex flex-col items-center animate-in slide-in-from-top">
                    <Link to="/upload" className="text-zinc-400 font-bold uppercase text-xs tracking-widest" onClick={() => setIsMenuOpen(false)}>Upload</Link>
                    {user ? (
                        <>
                            <Link to={`/profile/${user._id}`} className="text-zinc-400 font-bold uppercase text-xs tracking-widest" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                            <button onClick={onLogout} className="text-red-500 font-bold uppercase text-xs tracking-widest">Disconnect</button>
                        </>
                    ) : (
                        <Link to="/login" className="text-white font-bold uppercase text-xs tracking-widest" onClick={() => setIsMenuOpen(false)}>Connect</Link>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;