import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import api from "../api/axios";
import WhoToFollow from "./WhoToFollow.jsx"; // Ensure this file exists in the same folder

const TrendingSidebar = ({ darkMode }) => {
    const [trends, setTrends] = useState([]);

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                const res = await api.get("/tweet/trending");
                setTrends(res.data.data || []);
            } catch (err) {
                console.error("Trends fetch failed", err);
            }
        };
        fetchTrends();
    }, []);

    return (
        <div className="flex flex-col gap-6">
            {/* 1. Trends Section */}
            <div className={`p-6 rounded-3xl border ${
                darkMode ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm'
            }`}>
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <TrendingUp size={18} className="text-indigo-500" />
                    </div>
                    <h3 className="font-bold text-sm tracking-tight">Trends for you</h3>
                </div>

                <div className="space-y-6">
                    {trends.map((tag) => (
                        <div key={tag._id} className="group cursor-pointer">
                            <div className="flex items-center justify-between">
                                 <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Trending</p>
                            </div>
                            <p className={`text-sm font-bold transition-colors ${
                                darkMode ? 'text-zinc-200 group-hover:text-indigo-400' : 'text-zinc-900 group-hover:text-indigo-600'
                            }`}>
                                {tag._id}
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">{tag.count} Tweets</p>
                        </div>
                    ))}
                    
                    {trends.length === 0 && (
                        <p className="text-xs text-zinc-600 italic text-center">Nothing trending yet</p>
                    )}
                </div>
            </div>

            {/* 2. Follow Section */}
            <WhoToFollow darkMode={darkMode} />
        </div>
    );
};

export default TrendingSidebar;