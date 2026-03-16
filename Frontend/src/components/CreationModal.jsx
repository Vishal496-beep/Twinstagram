import { useState } from "react";
import { X, Video, Image, MessageSquare, Upload, Sparkles, ShieldCheck } from "lucide-react";
import api from "../api/axios";

const CreationModal = ({ isOpen, onClose, initialTab = "video" }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [loading, setLoading] = useState(false);
    const [caption, setCaption] = useState("");
    const [file, setFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null); // NEW: Dedicated thumbnail state
    const [preview, setPreview] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
    };

    const handleThumbnailChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) setThumbnail(selectedFile);
    };

    const handlePublish = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    
    try {
        if (activeTab === "photo") {
            formData.append("caption", caption);
            formData.append("photoFile", file); 
            await api.post("/photo", formData); 
        } 
        else if (activeTab === "video") {
            // Check if both files exist before sending
            if (!file || !thumbnail) {
                alert("Please select both a video file and a thumbnail image.");
                setLoading(false);
                return;
            }

            // 1. Title and Description are usually REQUIRED in the Video Schema
            formData.append("title", caption || "Untitled Vision");
            formData.append("description", caption || "No description provided");
            
            // 2. Names must match your upload.fields in video.routes.js exactly
            formData.append("videoFile", file);
            formData.append("thumbnail", thumbnail); 
            
            // 3. POST to /video (singular)
            await api.post("/video", formData); 
        } 
        else if (activeTab === "tweet") {
            await api.post("/tweet", { content: caption });
        }

        onClose();
        // Reset states...
        window.location.reload(); 
    } catch (err) {
        // Detailed error logging
        console.error("Upload Error Details:", err.response?.data || err.message);
        alert(err.response?.data?.message || "Upload failed. Check console for details.");
    } finally {
        setLoading(false);
    }
};

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <div className="bg-zinc-950 border border-white/10 w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl">
                
                <div className="px-8 pt-8 pb-4 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Create Vision</h2>
                        <p className="text-zinc-500 text-xs">Share your latest creation.</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:rotate-90 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-8 py-4">
                    <div className="flex p-1.5 bg-zinc-900/50 rounded-2xl border border-white/5 gap-1">
                        {[{ id: "video", label: "Video", icon: Video }, { id: "photo", label: "Photo", icon: Image }, { id: "tweet", label: "Tweet", icon: MessageSquare }].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setPreview(null); setFile(null); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === tab.id ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                                }`}
                            >
                                <tab.icon size={14} /> {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handlePublish} className="px-8 pb-8 space-y-5">
                    {activeTab !== "tweet" && (
                        <div className="space-y-4">
                            <div className="relative group">
                                <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept={activeTab === "video" ? "video/*" : "image/*"} />
                                <div className={`aspect-video rounded-3xl border-2 border-dashed flex items-center justify-center ${preview ? "border-transparent bg-zinc-900" : "border-white/10 bg-white/5"}`}>
                                    {preview ? (
                                        activeTab === "video" ? <video src={preview} className="w-full h-full object-cover rounded-3xl" /> : <img src={preview} className="w-full h-full object-cover rounded-3xl" />
                                    ) : (
                                        <div className="text-center">
                                            <Upload className="text-zinc-400 mx-auto mb-2" size={20} />
                                            <span className="text-zinc-400 text-[10px] uppercase font-black">Select {activeTab}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* THUMBNAIL INPUT FOR VIDEOS */}
                            {activeTab === "video" && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Video Thumbnail (Required)</label>
                                    <input 
                                        type="file" 
                                        onChange={handleThumbnailChange} 
                                        accept="image/*"
                                        className="w-full bg-zinc-900 text-xs text-zinc-400 file:bg-indigo-600 file:text-white file:border-none file:px-4 file:py-2 file:rounded-lg file:mr-4 file:cursor-pointer rounded-xl border border-white/5 p-2"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <textarea
                        placeholder={activeTab === "tweet" ? "Share a thought..." : "Write a caption..."}
                        className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl p-5 text-sm text-zinc-200 outline-none focus:ring-1 ring-indigo-500/50 min-h-25 resize-none"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                    />

                    <button 
                        disabled={loading || (!file && activeTab !== 'tweet')}
                        className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-2 ${
                            loading ? "bg-zinc-800 text-zinc-500" : "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20"
                        }`}
                    >
                        {loading ? "Syncing..." : <><Sparkles size={14} /> Publish {activeTab}</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreationModal;