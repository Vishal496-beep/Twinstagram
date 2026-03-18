import { useState, useRef, useEffect } from "react";
import { X, Camera, Loader2, Image as ImageIcon } from "lucide-react";
import api from "../api/axios";

const EditProfileModal = ({ isOpen, onClose, user, onUpdateSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullname: "",
        bio: "",
    });

    // Preview States
    const [previewAvatar, setPreviewAvatar] = useState("");
    const [previewCover, setPreviewCover] = useState("");
    
    // File States
    const [avatarFile, setAvatarFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);

    const avatarInputRef = useRef();
    const coverInputRef = useRef();

    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                fullname: user.fullname || "",
                bio: user.bio || "",
            });
            setPreviewAvatar(user.avatar);
            setPreviewCover(user.coverImage);
            // Reset files on open
            setAvatarFile(null);
            setCoverFile(null);
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        // basic validation: 5MB limit
        if (file.size > 5 * 1024 * 1024) {
            alert("File is too large. Max 5MB allowed.");
            return;
        }

        const url = URL.createObjectURL(file);
        if (type === 'avatar') {
            setAvatarFile(file);
            setPreviewAvatar(url);
        } else {
            setCoverFile(file);
            setPreviewCover(url);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // 1. Update text details (fullname, bio)
            const detailsRes = await api.patch("/users/update-Details", {
                fullname: formData.fullname,
                bio: formData.bio,
            });

            let finalAvatar = user?.avatar;
            let finalCover = user?.coverImage;

            // 2. Update Avatar if changed
            if (avatarFile) {
                const avatarData = new FormData();
                avatarData.append("avatar", avatarFile); 
                const avatarRes = await api.patch("/users/avatar", avatarData);
                finalAvatar = avatarRes.data?.data?.avatar;
            }



            // 3. Update parent UI
            if (onUpdateSuccess) {
                onUpdateSuccess({
                    ...detailsRes.data.data,
                    avatar: finalAvatar,
                    coverImage: finalCover
                });
            }
            
            onClose();
        } catch (error) {
            console.error("Update error:", error);
            alert(error.response?.data?.message || "Update failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-4xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-900">
                    <h3 className="text-lg font-black uppercase tracking-widest text-white">Edit Profile</h3>
                    <button onClick={onClose} className="hover:bg-zinc-800 p-2 rounded-full transition-colors text-zinc-400">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    
                    {/* Images Section */}
                    <div className="space-y-6">
                        {/* Cover Image Selector */}
                        <div className="relative group">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Cover Image</label>
                            <div 
                                onClick={() => coverInputRef.current.click()}
                                className="h-32 w-full rounded-2xl bg-zinc-900 border-2 border-dashed border-zinc-800 overflow-hidden cursor-pointer group-hover:border-indigo-500/50 transition-all relative"
                            >
                                {previewCover ? (
                                    <img src={previewCover} className="w-full h-full object-cover opacity-60" alt="cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-zinc-600"><ImageIcon size={24}/></div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white" size={24} />
                                </div>
                            </div>
                            <input type="file" ref={coverInputRef} hidden onChange={(e) => handleFileChange(e, 'cover')} accept="image/*" />
                        </div>

                        {/* Avatar Selector */}
                        <div className="flex justify-center -mt-16 relative z-10">
                            <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current.click()}>
                                <div className="w-28 h-28 rounded-full bg-zinc-950 p-1.5 shadow-2xl">
                                    <img 
                                        src={previewAvatar || `https://ui-avatars.com/api/?name=${formData.fullname}`} 
                                        className="w-full h-full rounded-full object-cover border-2 border-indigo-500 group-hover:opacity-75 transition-all" 
                                        alt="preview" 
                                    />
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white drop-shadow-lg" size={24} />
                                </div>
                                <input type="file" ref={avatarInputRef} hidden onChange={(e) => handleFileChange(e, 'avatar')} accept="image/*" />
                            </div>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
                            <input 
                                type="text"
                                value={formData.fullname}
                                onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                placeholder="Your Name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Bio</label>
                            <textarea 
                                rows="3"
                                value={formData.bio}
                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                                placeholder="Tell your story..."
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-3 pt-2">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-zinc-900 text-zinc-400 font-bold py-4 rounded-2xl hover:bg-zinc-800 transition-all"
                        >
                            CANCEL
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="flex-2 bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "SAVE PROFILE"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;