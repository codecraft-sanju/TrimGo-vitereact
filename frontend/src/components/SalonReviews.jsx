import React, { useState, useEffect } from "react";
import { Star, MessageSquare, Loader2, Calendar, User, Search, Filter } from "lucide-react";
import api from "../utils/api";

const SalonReviews = ({ salonId, salonRating, totalReviews }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await api.get(`/reviews/salon/${salonId}`);
        if (data.success) {
          setReviews(data.reviews);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    if (salonId) fetchReviews();
  }, [salonId]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-GB', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    });
  };

  // Helper to render stars based on rating
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star 
        key={index} 
        size={12} 
        className={index < rating ? "text-yellow-400 fill-yellow-400" : "text-zinc-700"} 
      />
    ));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24 lg:pb-10">
      
      {/* 1. Header & Quick Stats Card */}
      <div className="flex flex-col md:flex-row items-center gap-6 bg-zinc-900/50 p-6 rounded-3xl border border-white/5">
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-black text-white flex items-center justify-center md:justify-start gap-3">
            <MessageSquare className="text-yellow-400" size={28} /> Client Feedback
          </h2>
          <p className="text-sm text-zinc-400 mt-1">Monitor your service quality through customer reviews.</p>
        </div>

        <div className="flex items-center gap-6 bg-zinc-950 p-5 rounded-2xl border border-white/10 shadow-xl">
          <div className="text-center px-2">
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-3xl font-black text-white">
                {salonRating > 0 ? salonRating.toFixed(1) : "0.0"}
              </span>
              <Star size={20} className="text-yellow-400 fill-yellow-400 mb-1" />
            </div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">Average Rating</p>
          </div>
          
          <div className="w-px h-12 bg-white/10"></div>
          
          <div className="text-center px-2">
            <p className="text-3xl font-black text-white">{totalReviews || 0}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">Total Reviews</p>
          </div>
        </div>
      </div>

      {/* 2. Reviews Grid/List Area */}
      <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden flex flex-col min-h-[450px]">
        <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <h3 className="font-bold text-zinc-200 flex items-center gap-2">
            Recent Reviews
          </h3>
          <div className="px-3 py-1 bg-zinc-800 rounded-full border border-white/5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Live Updates
          </div>
        </div>

        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="relative">
                <Loader2 className="animate-spin text-yellow-400" size={40} />
                <Star size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white fill-white" />
              </div>
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Fetching your feedback...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4 border border-white/5">
                <MessageSquare size={32} className="text-zinc-600" />
              </div>
              <h4 className="text-lg font-bold text-zinc-300">No reviews yet</h4>
              <p className="text-sm text-zinc-500 max-w-xs mt-1">When customers complete their service and leave a rating, it will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {reviews.map((review) => (
                <div 
                  key={review._id} 
                  className="group bg-zinc-900/80 border border-white/5 p-5 rounded-2xl hover:border-yellow-400/20 hover:bg-zinc-900 transition-all duration-300 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-700 flex items-center justify-center font-black text-zinc-400 border border-white/5 group-hover:from-yellow-400 group-hover:to-yellow-600 group-hover:text-black transition-all">
                        {review.userId?.name ? review.userId.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white group-hover:text-yellow-400 transition-colors">
                          {review.userId?.name || "Verified Customer"}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                           <div className="flex gap-0.5 bg-black/40 px-1.5 py-0.5 rounded-md border border-white/5">
                              {renderStars(review.rating)}
                           </div>
                           <span className="text-[10px] text-zinc-500 font-medium">•</span>
                           <span className="text-[10px] text-zinc-500 font-bold flex items-center gap-1 uppercase">
                             {formatDate(review.createdAt)}
                           </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <span className="absolute -top-2 -left-2 text-4xl text-zinc-800 font-serif opacity-50">“</span>
                    <p className="text-sm text-zinc-400 leading-relaxed pl-3 relative z-10 italic">
                      {review.reviewText}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* 3. Small Hint */}
      <div className="text-center">
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold flex items-center justify-center gap-2">
           <Star size={10} className="fill-zinc-600" /> Only completed services can be reviewed <Star size={10} className="fill-zinc-600" />
        </p>
      </div>
    </div>
  );
};

export default SalonReviews;