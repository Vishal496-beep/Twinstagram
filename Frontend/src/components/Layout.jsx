import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom"; 
import { useAuth } from "../context/AuthContext.jsx";
import CreationModal from "./CreationModal.jsx";
import TrendingSidebar from "./TrendingSidebar.jsx";
import { 
    Sun, Moon, Home, Plus, Image, Twitter, 
    LogOut, User, Search as SearchIcon, Compass,
    LayoutDashboard // Added Dashboard Icon
} from "lucide-react";

const Layout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation(); 
    
    const [isCreationOpen, setIsCreationOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("theme") !== "light"; 
    });

    useEffect(() => {
        localStorage.setItem("theme", darkMode ? "dark" : "light");
        const root = document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [darkMode]);

    const handleLogout = async () => {
        logout();
        navigate("/login");
    };

    const handleSearch = (e) => {
        if (e.key === "Enter" && searchQuery.trim()) {
            navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
        }
    };

    const getLinkStyle = (path) => {
        const isActive = location.pathname === path || (path === "/videos" && location.pathname.startsWith("/v/"));
        const base = "flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-300 group relative overflow-hidden";
        
        if (isActive) {
            return `${base} ${darkMode 
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
                : "bg-indigo-600 text-white shadow-md shadow-indigo-200 border border-indigo-500"}`;
        }
        return `${base} ${darkMode 
            ? "text-zinc-500 hover:text-zinc-200 hover:bg-white/5 border border-transparent" 
            : "text-zinc-500 hover:text-zinc-900 hover:bg-black/5 border border-transparent"}`;
    };

    return (
        <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-500 ${darkMode ? "bg-black text-white" : "bg-zinc-50 text-zinc-900"}`}>
            
            {/* Sidebar Navigation */}
            <aside className={`w-72 border-r p-6 flex flex-col justify-between transition-colors ${darkMode ? "border-zinc-800 bg-black" : "border-zinc-200 bg-white"}`}>
                <div className="space-y-8">
                    <div className="px-4">
                        <h1 className={`text-2xl font-black italic tracking-tighter uppercase ${darkMode ? "text-white" : "text-black"}`}>
                            Vision<span className="text-indigo-500">.</span>
                        </h1>
                    </div>
                    
                    <nav className="flex flex-col gap-1.5">
                        <Link to="/videos" className={getLinkStyle("/videos")}>
                            <Home size={22} /> <span>Home</span>
                        </Link>
                        
                        {/* --- NEW DASHBOARD LINK --- */}
                        <Link to="/dashboard" className={getLinkStyle("/dashboard")}>
                            <LayoutDashboard size={22} /> <span>Dashboard</span>
                        </Link>
                        {/* ------------------------- */}

                        <Link to="/search" className={getLinkStyle("/search")}>
                            <Compass size={22} /> <span>Explore</span>
                        </Link>
                        <Link to="/photos" className={getLinkStyle("/photos")}>
                            <Image size={22} /> <span>Photos</span>
                        </Link>
                        <Link to="/tweets" className={getLinkStyle("/tweets")}>
                            <Twitter size={22} /> <span>Tweets</span>
                        </Link>
                        
                        <div className="my-4 px-2">
                            <button 
                                onClick={() => setIsCreationOpen(true)} 
                                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 shadow-lg active:scale-95 ${
                                    darkMode ? "bg-white text-black hover:bg-zinc-200" : "bg-zinc-900 text-white hover:bg-black"
                                }`}
                            >
                                <Plus size={18} strokeWidth={3} /> Upload
                            </button>
                        </div>
                        <Link to="/profile" className={getLinkStyle("/profile")}>
                            <User size={22} /> <span>Profile</span>
                        </Link>
                    </nav>
                </div>

                <div className="space-y-4">
                    <button 
                        onClick={() => setDarkMode(!darkMode)} 
                        className={`w-full flex items-center justify-center p-3 rounded-2xl border transition-all ${
                            darkMode ? 'bg-zinc-900/50 border-white/5 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-500'
                        }`}
                    >
                        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                        <span className="ml-3 text-[10px] font-black uppercase tracking-widest">{darkMode ? 'Light' : 'Dark'}</span>
                    </button>

                    <div className={`p-4 rounded-4xl border ${darkMode ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <img src={user?.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/20" />
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold truncate">@{user?.username}</span>
                                <span className="text-[10px] text-green-500 uppercase font-black tracking-widest">Active</span>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-500/60 hover:text-red-500 rounded-xl transition-all">
                            <LogOut size={14} /> Log Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={`flex-1 overflow-y-auto ${darkMode ? "bg-[#050505]" : "bg-zinc-50/50"}`}>
                <header className={`h-20 flex items-center px-10 sticky top-0 backdrop-blur-xl z-10 transition-colors ${darkMode ? "bg-black/60 border-b border-white/5" : "bg-white/60 border-b border-zinc-200"}`}>
                    <div className="relative w-full max-w-lg group">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search Vision universe..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            className={`w-full pl-12 pr-6 py-3 rounded-2xl text-sm focus:outline-none transition-all ${
                                darkMode ? "bg-zinc-900/50 border border-white/5" : "bg-zinc-100 border border-transparent"
                            }`}
                        />
                    </div>
                </header>
                
                <div className="flex items-start justify-center max-w-400 mx-auto">
                    <div className="flex-1 max-w-4xl p-6 lg:p-10">
                        <Outlet context={{ darkMode }} />
                    </div>

                    {location.pathname === "/tweets" && (
                        <aside className="hidden xl:block w-80 p-10 pl-0 sticky top-20">
                            <TrendingSidebar darkMode={darkMode} />
                        </aside>
                    )}
                </div>
            </main>

            <CreationModal 
                isOpen={isCreationOpen} 
                onClose={() => setIsCreationOpen(false)} 
            />
        </div>
    );
};

export default Layout;