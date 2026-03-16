import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, Loader2 } from "lucide-react";
import api from "../api/axios.js";

const EditContentModal = ({ isOpen, onClose, item, type, onUpdateSuccess, darkMode }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        content: "" 
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (item && isOpen) {
            setFormData({
                title: item.title || "",
                description: item.description || "",
                content: item.content || item.text || "" 
            });
            setError("");
        }
    }, [item, isOpen]);

    if (!isOpen) return null;

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        
        try {
            let endpoint = "";
            let payload = {};

            // Aligning with standard RESTful routes based on your project structure
            switch (type) {
                case "tweets":
                    endpoint = `/tweets/${item._id}`; // Standardized plural
                    payload = { content: formData.content };
                    break;
                case "videos":
                    endpoint = `/videos/${item._id}`;
                    payload = { title: formData.title, description: formData.description };
                    break;
                case "photos":
                    endpoint = `/photos/${item._id}`;
                    payload = { title: formData.title, description: formData.description };
                    break;
                default:
                    throw new Error("Invalid content type");
            }

            const response = await api.patch(endpoint, payload);

            if (response.data.success) {
                onUpdateSuccess(response.data.data); 
                onClose();
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to sync updates to the cloud.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className={`w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border ${
                darkMode ? 'bg-zinc-950 border-white/10 text-white' : 'bg-white border-zinc-200 text-zinc-900'
            }`}>
                {/* Header */}
                <div className="flex items-center justify-between p-8 pb-4">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter italic">
                            Edit {type.slice(0, -1)}
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">Refine your digital footprint</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className={`p-2 rounded-full transition-all ${darkMode ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleUpdate} className="p-8 pt-4 space-y-6">
                    {error && (
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20 animate-pulse">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {type === 'tweets' ? (
                        <div className="space-y-2">
                            <div className="flex justify-between items-end px-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Content</label>
                                <span className={`text-[9px] font-bold ${formData.content.length > 280 ? 'text-red-500' : 'text-zinc-600'}`}>
                                    {formData.content.length}/280
                                </span>
                            </div>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Edit your thoughts..."
                                className={`w-full p-5 rounded-3xl border min-h-40 resize-none outline-none transition-all text-sm leading-relaxed ${
                                    darkMode 
                                    ? 'bg-zinc-900/50 border-zinc-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10' 
                                    : 'bg-zinc-50 border-zinc-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5'
                                }`}
                                required
                            />
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Headline</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className={`w-full p-4 rounded-2xl border outline-none transition-all font-bold ${
                                        darkMode 
                                        ? 'bg-zinc-900/50 border-zinc-800 focus:border-indigo-500' 
                                        : 'bg-zinc-50 border-zinc-200 focus:border-indigo-500'
                                    }`}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Narrative</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Add context..."
                                    className={`w-full p-4 rounded-2xl border min-h-25 resize-none outline-none transition-all text-sm ${
                                        darkMode 
                                        ? 'bg-zinc-900/50 border-zinc-800 focus:border-indigo-500' 
                                        : 'bg-zinc-50 border-zinc-200 focus:border-indigo-500'
                                    }`}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                darkMode ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-500'
                            }`}
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={loading || (type === 'tweets' && formData.content.length > 280)}
                            className="flex-2 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-500 hover:-translate-y-0.5 transition-all shadow-xl shadow-indigo-500/25 disabled:opacity-50 disabled:transform-none"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <><Save size={16} /> Publish Changes</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditContentModal;