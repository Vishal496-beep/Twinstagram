import { useState } from "react";
import api from "../api/axios";

const UploadVideoModal = ({ isOpen, onClose, onUploadSuccess }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e) => {
        e.preventDefault();
        setUploading(true);

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("videoFile", videoFile);
        formData.append("thumbnail", thumbnail);

        try {
            await api.post("/video", formData); // Matches your video.routes.js
            alert("Video uploaded successfully!");
            onUploadSuccess();
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Upload Video</h2>
                <form onSubmit={handleUpload} className="flex flex-col gap-4">
                    <input type="text" placeholder="Title" required className="bg-black border border-zinc-800 p-2 rounded"
                        onChange={(e) => setTitle(e.target.value)} />
                    
                    <textarea placeholder="Description" required className="bg-black border border-zinc-800 p-2 rounded h-24"
                        onChange={(e) => setDescription(e.target.value)} />

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-zinc-500">Video File</label>
                        <input type="file" accept="video/*" required onChange={(e) => setVideoFile(e.target.files[0])} 
                            className="text-sm file:bg-zinc-800 file:text-white file:border-0 file:px-3 file:py-1 file:rounded" />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-zinc-500">Thumbnail Image</label>
                        <input type="file" accept="image/*" required onChange={(e) => setThumbnail(e.target.files[0])} 
                            className="text-sm file:bg-zinc-800 file:text-white file:border-0 file:px-3 file:py-1 file:rounded" />
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white">Cancel</button>
                        <button type="submit" disabled={uploading} className="bg-blue-600 px-6 py-2 rounded font-bold disabled:opacity-50">
                            {uploading ? "Uploading..." : "Publish"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadVideoModal;