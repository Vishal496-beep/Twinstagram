import { useEffect, useState, useCallback, useRef } from "react";
import api from "../api/axios.js";
import PhotoModal from "../components/PhotoModal.jsx";
import { Heart, Search, Edit2, Trash2, Sun, Moon, Sparkles } from "lucide-react";

const PhotoFeed = () => {
    const [photos, setPhotos] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editCaption, setEditCaption] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [darkMode, setDarkMode] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    // 1. Fetch User - Corrected to GET and /currentUser
    const fetchUser = async () => {
        try {
            const userRes = await api.get("/users/currentUser"); 
            // Handle common data nesting patterns
            const userData = userRes.data?.data || userRes.data;
            setCurrentUserId(userData?._id);
        } catch (err) { 
            console.error("Auth error: Login might have expired.", err.message); 
        }
    };

    // 2. Fetch Photos - Improved data extraction
    const fetchPhotos = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get("/photo"); 
            
            // Log this to see your data structure in F12 console
            console.log("Photo Response:", response.data);

            // This handles: response.data.data.docs (pagination) or response.data.data (standard)
            const rawData = response.data?.data;
            const finalArray = Array.isArray(rawData?.docs) 
                ? rawData.docs 
                : (Array.isArray(rawData) ? rawData : []);
            
            setPhotos(finalArray);
        } catch (err) {
            console.error("Fetch failed:", err);
            setPhotos([]); 
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { 
        fetchUser(); 
        fetchPhotos();
    }, [fetchPhotos]);

    // Handlers
    const handleDelete = async (photoId) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/photo/${photoId}`);
            setPhotos(prev => prev.filter(p => p._id !== photoId));
        } catch (err) { alert("Delete failed"); }
    };

    const handleUpdate = async (photoId) => {
        if (!editCaption.trim()) return setEditingId(null);
        try {
            const res = await api.patch(`/photo/${photoId}`, { caption: editCaption });
            const updatedCaption = res.data?.data?.caption || editCaption;
            setPhotos(prev => prev.map(p => p._id === photoId ? { ...p, caption: updatedCaption } : p));
            setEditingId(null);
        } catch (err) { alert("Update failed"); }
    };

    const handleLike = async (photoId) => {
        setPhotos(prev => prev.map(p => 
            p._id === photoId ? { 
                ...p, 
                isLiked: !p.isLiked, 
                likesCount: p.isLiked ? (p.likesCount || 1) - 1 : (p.likesCount || 0) + 1
            } : p
        ));
        try {
            await api.post(`/like/toggle/p/${photoId}`); 
        } catch (err) { fetchPhotos(); }
    };

    return (
        <div className={`${darkMode ? 'bg-[#09090b] text-zinc-100' : 'bg-zinc-50 text-zinc-900'} min-h-screen transition-colors duration-500`}>
            <div className="max-w-7xl mx-auto p-6">
                
                <header className={`flex flex-col md:flex-row gap-6 justify-between items-center mb-12 p-5 rounded-3xl border shadow-2xl backdrop-blur-xl sticky top-6 z-50 transition-all ${darkMode ? 'bg-zinc-900/40 border-white/5 shadow-black' : 'bg-white/70 border-zinc-200'}`}>
                    <div className="flex items-center gap-8 w-full md:w-auto">
                        <div className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-12 transition-transform shadow-[0_0_20px_rgba(79,70,229,0.5)]">
                                <Sparkles className="text-white w-6 h-6" />
                            </div>
                            <h1 className="font-black text-2xl tracking-tight uppercase">Vision</h1>
                        </div>
                        
                        <div className="relative flex-1 md:w-96 group">
                            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${darkMode ? 'text-zinc-500 group-focus-within:text-indigo-400' : 'text-zinc-400'}`} />
                            <input 
                                type="text"
                                placeholder="Search photos..."
                                className={`w-full pl-12 pr-4 py-3 text-sm rounded-2xl outline-none border transition-all ${darkMode ? 'bg-zinc-950 border-white/5 focus:border-indigo-500/50' : 'bg-zinc-100 border-transparent focus:bg-white'}`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-2xl border transition-all ${darkMode ? 'bg-zinc-950 border-white/10 text-yellow-500' : 'bg-white border-zinc-200 text-indigo-600'}`}>
                        {darkMode ? <Sun size={20} fill="currentColor" /> : <Moon size={20} fill="currentColor" />}
                    </button>
                </header>

                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                    {Array.isArray(photos) && photos.length > 0 ? (
                        photos.map((photo) => {
                            const isOwner = String(photo.owner?._id || photo.owner) === String(currentUserId);
                            
                            // 3. IMPORTANT: Use the correct field name from your MongoDB/Cloudinary
                            const imageSrc = photo.photoFile || photo.imageUrl || photo.url;

                            return (
                                <div key={photo._id} className={`group relative break-inside-avoid rounded-4xl overflow-hidden border transition-all duration-700 ${darkMode ? 'bg-zinc-900 border-white/5 hover:border-indigo-500/50' : 'bg-white border-zinc-200 shadow-xl'}`}>
                                    <div className="relative overflow-hidden" onDoubleClick={() => handleLike(photo._id)}>
                                        <img 
                                            src={imageSrc} 
                                            onClick={() => setSelectedPhoto(photo)}
                                            className="w-full h-auto block transform transition-transform duration-1000 group-hover:scale-110 cursor-zoom-in" 
                                            alt={photo.caption} 
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-6 flex flex-col justify-end">
                                             <p className="text-white text-sm font-bold">@{photo.owner?.username || "creator"}</p>
                                        </div>
                                    </div>
                                    <div className="p-5 flex justify-between items-center">
                                        <button onClick={() => handleLike(photo._id)} className={`flex items-center gap-2 ${photo.isLiked ? 'text-red-500' : 'text-zinc-500'}`}>
                                            <Heart size={20} fill={photo.isLiked ? "currentColor" : "none"} />
                                            <span className="text-sm font-black">{photo.likesCount || 0}</span>
                                        </button>
                                        {isOwner && (
                                            <div className="flex gap-2">
                                                <button onClick={() => { setEditingId(photo._id); setEditCaption(photo.caption || ""); }} className="text-indigo-400"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(photo._id)} className="text-red-400"><Trash2 size={16} /></button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="px-6 pb-6 text-sm">
                                        {editingId === photo._id ? (
                                            <input autoFocus className="w-full bg-zinc-950 text-white p-1 rounded border border-indigo-500" value={editCaption} onChange={(e) => setEditCaption(e.target.value)} onBlur={() => handleUpdate(photo._id)} />
                                        ) : (
                                            <p className="line-clamp-2">{photo.caption || "Untitled Vision"}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : !loading && (
                        <div className="col-span-full text-center py-20 opacity-50 italic">
                            No visions found. Try uploading your first masterpiece.
                        </div>
                    )}
                </div>
            </div>
            {selectedPhoto && <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} onLike={handleLike} />}
        </div>
    );
};

export default PhotoFeed;