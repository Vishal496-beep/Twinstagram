import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import TweetCard from "./TweetCard"; 
import EditContentModal from "./EditContentModal";
import { Send, Image as ImageIcon, X, Video, Globe, User as UserIcon } from "lucide-react";

const TweetSection = () => {
    const { user } = useAuth();
    const [tweets, setTweets] = useState([]);
    const [view, setView] = useState("explore"); // 'explore' or 'my-visions'
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [media, setMedia] = useState(null);
    const [preview, setPreview] = useState(null);

    const MAX_CHARS = 280;
    const charsRemaining = MAX_CHARS - content.length;
    const isOverLimit = charsRemaining < 0;

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTweet, setSelectedTweet] = useState(null);

    const fetchTweets = async () => {
        try {
            setLoading(true);
            // Switch endpoint based on active tab
            const endpoint = view === "explore" 
                ? "/tweet/explore" 
                : `/tweet/user/${user?._id}`;
            
            const res = await api.get(endpoint); 
            setTweets(res.data.data || []); 
        } catch (err) {
            console.error("Fetch tweets error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        if (user?._id) fetchTweets(); 
        return () => { if (preview) URL.revokeObjectURL(preview); };
    }, [user?._id, view]); // Re-fetch when view changes

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMedia(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const removeMedia = () => {
        setMedia(null);
        setPreview(null);
    };

    const handlePostTweet = async (e) => {
        e.preventDefault();
        if (!content.trim() && !media) return;

        const formData = new FormData();
        formData.append("content", content);
        if (media) {
            media.type.startsWith("video/") 
                ? formData.append("video", media) 
                : formData.append("image", media);
        }

        setLoading(true);
        try {
            await api.post("/tweet", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setContent("");
            removeMedia();
            fetchTweets();
        } catch (err) { 
            console.error("Post error:", err);
        } finally { 
            setLoading(false); 
        }
    };

    const handleDeleteTweet = async (id) => {
        if (!window.confirm("Delete this vision?")) return;
        try {
            await api.delete(`/tweet/${id}`);
            setTweets(prev => prev.filter(t => t._id !== id));
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            {/* Tab Switcher */}
            <div className="flex gap-8 mb-8 border-b border-white/5">
                <button 
                    onClick={() => setView("explore")}
                    className={`pb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                        view === 'explore' ? 'text-indigo-500 border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    <Globe size={14} /> Explore
                </button>
                <button 
                    onClick={() => setView("my-visions")}
                    className={`pb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                        view === 'my-visions' ? 'text-indigo-500 border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    <UserIcon size={14} /> My Visions
                </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handlePostTweet} className="mb-12">
                <div className={`flex gap-4 p-6 rounded-3xl bg-zinc-900/40 border transition-all ${
                    isOverLimit ? 'border-rose-500/50' : 'border-white/5 focus-within:border-indigo-500/50'
                }`}>
                    <img src={user?.avatar} className="w-12 h-12 rounded-full object-cover ring-2 ring-white/5" alt="me" />
                    <div className="flex-1">
                        <textarea 
                            className="w-full bg-transparent border-none outline-none text-zinc-200 placeholder:text-zinc-600 resize-none py-2 text-lg"
                            placeholder="Share a new vision..."
                            rows="3"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        {preview && (
                            <div className="relative mt-2 mb-4 group">
                                <button type="button" onClick={removeMedia} className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-full z-10">
                                    <X size={16} />
                                </button>
                                {media?.type.startsWith("video/") ? (
                                    <video src={preview} className="rounded-2xl w-full max-h-80 object-cover" controls />
                                ) : (
                                    <img src={preview} alt="preview" className="rounded-2xl w-full max-h-80 object-cover" />
                                )}
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-4 border-t border-white/5">
                            <div className="flex gap-2">
                                <label className="cursor-pointer p-2 hover:bg-indigo-500/10 rounded-full text-zinc-500 hover:text-indigo-400">
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    <ImageIcon size={20} />
                                </label>
                                <label className="cursor-pointer p-2 hover:bg-emerald-500/10 rounded-full text-zinc-500 hover:text-emerald-400">
                                    <input type="file" className="hidden" accept="video/*" onChange={handleFileChange} />
                                    <Video size={20} />
                                </label>
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading || (!content.trim() && !media) || isOverLimit}
                                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                            >
                                {loading ? "Publishing..." : <>Publish <Send size={14} /></>}
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {/* List */}
            <div className="space-y-6">
                {loading && tweets.length === 0 ? (
                    <div className="animate-pulse space-y-4">
                        {[1,2,3].map(i => <div key={i} className="h-40 bg-zinc-900/50 rounded-3xl" />)}
                    </div>
                ) : tweets.length > 0 ? (
                    tweets.map((tweet) => (
                        <TweetCard 
                            key={tweet._id} 
                            tweet={tweet} 
                            darkMode={true}
                            onDelete={handleDeleteTweet}
                            onEdit={(t) => { setSelectedTweet(t); setIsEditModalOpen(true); }}
                        />
                    ))
                ) : (
                    <div className="text-center py-20 border border-dashed border-white/5 rounded-3xl">
                        <p className="text-zinc-600 text-sm italic">Nothing to see here yet.</p>
                    </div>
                )}
            </div>

            {selectedTweet && (
                <EditContentModal 
                    isOpen={isEditModalOpen}
                    onClose={() => { setIsEditModalOpen(false); setSelectedTweet(null); }}
                    item={selectedTweet}
                    type="tweets"
                    onUpdateSuccess={() => { fetchTweets(); setIsEditModalOpen(false); }}
                    darkMode={true}
                />
            )}
        </div>
    );
};

export default TweetSection;