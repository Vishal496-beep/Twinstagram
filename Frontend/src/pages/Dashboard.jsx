import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Added for navigation
import api from "../api/axios.js";
import { 
    BarChart3, Eye, Heart, Users, Video, 
    Image as ImageIcon, MessageSquare, Loader2, Trash2, 
    ExternalLink, Plus, MoreVertical, TrendingUp,
    Settings, X, Film, Twitter
} from "lucide-react";

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [showCreateMenu, setShowCreateMenu] = useState(false); // Toggle for "Create New"

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, contentRes] = await Promise.all([
                api.get("/dashboard/stats"),
                api.get("/dashboard/p/v/t")
            ]);
            setStats(statsRes.data.data);
            setContent(contentRes.data.data);
        } catch (error) {
            console.error("Dashboard error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (id, type) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
        try {
            setDeletingId(id);
            const route = type === "video" ? `/video/${id}` : type === "tweet" ? `/tweet/${id}` : `/photo/${id}`;
            await api.delete(route);
            setContent(prev => prev.filter(item => item._id !== id));
        } catch (error) {
            alert("Failed to delete content");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-[#050505]">
            <div className="relative">
                <Loader2 className="animate-spin text-indigo-500" size={50} />
                <div className="absolute inset-0 blur-xl bg-indigo-500/20 animate-pulse"></div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-12">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-indigo-500 mb-2">
                        <TrendingUp size={18} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Creator Analytics</span>
                    </div>
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter">
                        Studio<span className="text-indigo-600">.</span>
                    </h1>
                </div>

                <div className="flex gap-3 relative">
                    {/* Fixed Edit Profile: Navigates to user profile or settings */}
                    <button 
                        onClick={() => navigate('/settings')}
                        className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                        <Settings size={14} /> Edit Profile
                    </button>

                    {/* Fixed Create New: Opens a selection menu */}
                    <button 
                        onClick={() => setShowCreateMenu(!showCreateMenu)}
                        className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all ${
                            showCreateMenu ? 'bg-zinc-200 text-black' : 'bg-indigo-600 text-white shadow-indigo-600/20'
                        }`}
                    >
                        {showCreateMenu ? <X size={16} /> : <Plus size={16} />} 
                        {showCreateMenu ? "Close" : "Create New"}
                    </button>

                    {/* Create Selection Dropdown */}
                    {showCreateMenu && (
                        <div className="absolute top-16 right-0 w-48 bg-zinc-900 border border-zinc-800 p-2 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in duration-200">
                            <CreateOption icon={<Film size={14}/>} label="Video" onClick={() => navigate('/upload-video')} />
                            <CreateOption icon={<ImageIcon size={14}/>} label="Photo" onClick={() => navigate('/upload-photo')} />
                            <CreateOption icon={<Twitter size={14}/>} label="Tweet" onClick={() => navigate('/new-tweet')} />
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Visualization */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                <StatCard label="Followers" value={stats?.followers} icon={<Users />} color="from-blue-600/20" border="group-hover:border-blue-500/50" />
                <StatCard label="Total Views" value={stats?.video?.views} icon={<Eye />} color="from-emerald-600/20" border="group-hover:border-emerald-500/50" />
                <StatCard label="Engagement" value={(stats?.video?.likes || 0) + (stats?.photo?.likes || 0) + (stats?.tweet?.likes || 0)} icon={<Heart />} color="from-rose-600/20" border="group-hover:border-rose-500/50" />
                <StatCard label="Total Content" value={content.length} icon={<Video />} color="from-indigo-600/20" border="group-hover:border-indigo-500/50" />
            </div>

            {/* Content Management Table */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
                    <div className="p-8 border-b border-zinc-800/50 flex justify-between items-center">
                        <h3 className="text-lg font-black uppercase italic tracking-tight">Recent Content</h3>
                        <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Showing {content.length} Items</div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-zinc-600 text-[10px] uppercase font-black tracking-widest border-b border-zinc-800/50">
                                    <th className="px-8 py-5 text-left">Status</th>
                                    <th className="px-8 py-5 text-left">Content Details</th>
                                    <th className="px-8 py-5 text-left">Reach</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/30">
                                {content.map((item) => (
                                    <tr key={item._id} className="group hover:bg-white/[0.02] transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                <span className="text-[10px] font-black uppercase text-zinc-400">Published</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative h-12 w-20 flex-shrink-0 rounded-xl overflow-hidden bg-zinc-800">
                                                    {(item.thumbnail || item.photo) ? (
                                                        <img src={item.thumbnail || item.photo} className="h-full w-full object-cover" alt="" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center"><MessageSquare size={16} className="text-zinc-600" /></div>
                                                    )}
                                                    <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/80 rounded text-[7px] font-black uppercase tracking-tighter text-white">
                                                        {item.type}
                                                    </div>
                                                </div>
                                                <div className="max-w-xs">
                                                    <p className="font-bold text-sm text-zinc-200 line-clamp-1 group-hover:text-white transition-colors">
                                                        {item.title || item.content}
                                                    </p>
                                                    <p className="text-[10px] text-zinc-500 font-bold mt-1">Uploaded {new Date(item.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex gap-6">
                                                <div>
                                                    <p className="text-xs font-black">{item.views || 0}</p>
                                                    <p className="text-[8px] text-zinc-600 uppercase font-black">Views</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-rose-500">{item.likesCount || 0}</p>
                                                    <p className="text-[8px] text-zinc-600 uppercase font-black">Likes</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => navigate(`/${item.type === 'video' ? 'v' : item.type}/${item._id}`)}
                                                    className="p-3 bg-zinc-800 hover:bg-indigo-600 text-white rounded-xl transition-all"
                                                >
                                                    <ExternalLink size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(item._id, item.type)}
                                                    disabled={deletingId === item._id}
                                                    className="p-3 bg-zinc-800 hover:bg-rose-600 text-white rounded-xl transition-all"
                                                >
                                                    {deletingId === item._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-components
const StatCard = ({ label, value, icon, color, border }) => (
    <div className={`relative group p-8 rounded-[2.5rem] bg-zinc-900/40 border border-zinc-800/50 transition-all duration-500 hover:-translate-y-1 ${border}`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]`} />
        <div className="relative z-10">
            <div className="mb-6 p-4 bg-zinc-900 rounded-2xl w-fit shadow-inner group-hover:text-white text-zinc-500 transition-colors">
                {React.cloneElement(icon, { size: 24 })}
            </div>
            <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">{label}</h4>
            <p className="text-4xl font-black italic tracking-tighter">
                {value?.toLocaleString() || 0}
            </p>
        </div>
    </div>
);

const CreateOption = ({ icon, label, onClick }) => (
    <button 
        onClick={onClick}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-600 rounded-xl transition-colors group"
    >
        <span className="text-zinc-500 group-hover:text-white transition-colors">{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
);

export default Dashboard;