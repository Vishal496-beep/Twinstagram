import { useState } from "react";
import api from "../api/axios.js";

const UploadPhotoModal = ({ isOpen, onClose, onUploadSuccess }) => {
    const [caption, setCaption] = useState(""); 
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("photoFile", imageFile);
    formData.append("isPublic", "true");

    try {
        const response = await api.post("/photo", formData);

        alert("Photo shared successfully!");
        onUploadSuccess();
        onClose();
    } catch (err) {
        console.error("Upload Error:", err.response?.data);
        alert(err.response?.data?.message || "Upload failed");
    } finally {
        setUploading(false);
    }
};

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center  p-4 backdrop-blur-sm">
            <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">New Post</h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white">✕</button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Caption</label>
                        <textarea 
                            placeholder="Write a caption..." 
                            required 
                            className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-sm focus:border-pink-500 outline-none resize-none h-24 text-white" 
                            onChange={(e) => setCaption(e.target.value)} 
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Select Image</label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            required 
                            className="block w-full text-xs text-zinc-400 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
                            onChange={(e) => setImageFile(e.target.files[0])} 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={uploading} 
                        className="bg-pink-600 hover:bg-pink-500 py-3 rounded-xl font-bold transition-all disabled:opacity-50 mt-2 text-white"
                    >
                        {uploading ? "Uploading..." : "Share Post"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadPhotoModal;