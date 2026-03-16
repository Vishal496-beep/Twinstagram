import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios.js";
import { 
    Loader2, Play, Heart, MessageCircle, 
    Layers, Search, Image as ImageIcon, Twitter 
} from "lucide-react";

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("query") || "";
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("all");

    // --- Typewriter Logic ---
    const [animatedQuery, setAnimatedQuery] = useState("");
    
    useEffect(() => {
        let i = 0;
        setAnimatedQuery(""); 
        const speed = 70; // typing speed in ms
        
        const timer = setInterval(() => {
            if (i < query.length) {
                setAnimatedQuery((prev) => prev + query.charAt(i));
                i++;
            } else {
                clearInterval(timer);
            }
        }, speed);

        return () => clearInterval(timer);
    }, [query]);
    // ------------------------

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;
            try {
                setLoading(true);
                const res = await api.get(`/search/query?query=${query}`);
                setResults(res.data.data);
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [query]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-40">
            <div className="relative">
                <Loader2 className="animate-spin text-indigo-500" size={48} />
                <div className="absolute inset-0 blur-3xl bg-indigo-500/20"></div>
            </div>
            <p className="mt-8 text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 animate-pulse">Scanning Dimensions...</p>
        </div>
    );

    const noResults = !results || results.stats.totalFound === 0;

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
            <div className="mb-16">
                <div className="flex items-center gap-3 text-indigo-500 mb-4">
                    <Search size={14} className="animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Sector Analysis</span>
                </div>
                
                {/* Typewriter Header with Cursor */}
                <h2 className="text-6xl font-black italic tracking-tighter uppercase text-white min-h-[1.2em] flex items-center">
                    {animatedQuery}
                    <span className="inline-block w-2 h-12 bg-indigo-600 ml-3 animate-pulse shadow-[0_0_15px_rgba(79,70,229,0.8)]"></span>
                </h2>

                <div className="mt-10 flex gap-3 overflow-x-auto pb-4 no-scrollbar border-b border-zinc-900">
                    <TabBtn active={activeTab === "all"} onClick={() => setActiveTab("all")} label="Everything" count={results?.stats.totalFound} />
                    <TabBtn active={activeTab === "videos"} onClick={() => setActiveTab("videos")} label="Visions" count={results?.stats.videoCount} />
                    <TabBtn active={activeTab === "photos"} onClick={() => setActiveTab("photos")} label="Photos" count={results?.stats.photoCount} />
                    <TabBtn active={activeTab === "tweets"} onClick={() => setActiveTab("tweets")} label="Tweets" count={results?.stats.tweetCount} />
                </div>
            </div>

            {noResults ? (
                <div className="text-center py-40 rounded-[4rem] bg-zinc-900/10 border border-dashed border-zinc-800">
                    <Layers className="mx-auto text-zinc-800 mb-6" size={40} />
                    <p className="text-zinc-600 font-black uppercase tracking-widest text-[10px]">No artifacts found in this query string</p>
                </div>
            ) : (
                <div className="space-y-24">
                    {(activeTab === "all" || activeTab === "videos") && results?.videos.length > 0 && (
                        <section>
                            <SectionHeader title="Visual Transmissions" icon={<Play size={12}/>} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {results.videos.map(video => (
                                    <VideoCard key={video._id} video={video} />
                                ))}
                            </div>
                        </section>
                    )}

                    {(activeTab === "all" || activeTab === "photos") && results?.photos.length > 0 && (
                        <section>
                            <SectionHeader title="Captured Frames" icon={<ImageIcon size={12}/>} />
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {results.photos.map(photo => (
                                    <PhotoCard key={photo._id} photo={photo} />
                                ))}
                            </div>
                        </section>
                    )}

                    {(activeTab === "all" || activeTab === "tweets") && results?.tweets.length > 0 && (
                        <section>
                            <SectionHeader title="Logged Thoughts" icon={<Twitter size={12}/>} />
                            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                                {results.tweets.map(tweet => (
                                    <TweetCard key={tweet._id} tweet={tweet} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
};

// Helper components 
const TabBtn = ({ active, onClick, label, count }) => (
    <button onClick={onClick} className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl border transition-all ${
        active ? "bg-white text-black border-white shadow-xl scale-105" : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600"
    }`}>
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        {count > 0 && <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${active ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-400'}`}>{count}</span>}
    </button>
);

const SectionHeader = ({ title, icon }) => (
    <div className="flex items-center gap-4 mb-10">
        <div className="flex items-center gap-2 text-indigo-500 shrink-0">
            {icon}
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">{title}</h3>
        </div>
        <div className="h-[1px] w-full bg-gradient-to-r from-zinc-800 to-transparent"></div>
    </div>
);

const VideoCard = ({ video }) => (
    <Link to={`/v/${video._id}`} className="group relative block aspect-video overflow-hidden rounded-[2.5rem] bg-zinc-900 shadow-2xl border border-white/5">
        <img src={video.thumbnail} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt={video.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
        <div className="absolute bottom-6 left-8 right-8">
            <div className="flex items-center gap-3 mb-3">
                <img src={video.owner.avatar} className="w-6 h-6 rounded-full border border-white/20" alt="avatar" />
                <span className="text-[10px] font-black uppercase text-indigo-400">@{video.owner.username}</span>
            </div>
            <h4 className="text-2xl font-black text-white italic tracking-tighter line-clamp-1 group-hover:text-indigo-400 transition-colors">{video.title}</h4>
        </div>
        <div className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100 border border-white/20">
            <Play fill="white" size={18} className="ml-1" />
        </div>
    </Link>
);

const PhotoCard = ({ photo }) => (
    <div className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-zinc-900 border border-white/5 cursor-zoom-in">
        <img src={photo.photo} className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110" alt="search result" />
        <div className="absolute inset-0 bg-indigo-600/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
);

const TweetCard = ({ tweet }) => (
    <div className="break-inside-avoid p-8 rounded-[2rem] bg-zinc-900/30 border border-zinc-800 hover:border-indigo-500/30 transition-all">
        <div className="flex items-center gap-4 mb-6">
            <img src={tweet.owner.avatar} className="w-10 h-10 rounded-2xl border border-white/5" alt="avatar" />
            <div>
                <span className="block text-[10px] font-black uppercase tracking-tight text-white">@{tweet.owner.username}</span>
                <span className="text-[8px] text-zinc-600 font-bold uppercase">{new Date(tweet.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
        <p className="text-zinc-300 text-sm leading-relaxed mb-6 italic">"{tweet.content}"</p>
        <div className="flex gap-4 text-zinc-600">
            <div className="flex items-center gap-1.5 text-[9px] font-black"><Heart size={12}/> {Math.floor(Math.random()*200)}</div>
            <div className="flex items-center gap-1.5 text-[9px] font-black"><MessageCircle size={12}/> {Math.floor(Math.random()*50)}</div>
        </div>
    </div>
);

export default SearchResults;