import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, X, Loader2, MessageSquare } from "lucide-react";
import api from "../utils/api";

const SalonReviewsModal = ({ salon, onClose }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await api.get(`/reviews/salon/${salon._id}`);
        if (data.success) {
          setReviews(data.reviews);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    if (salon) fetchReviews();
  }, [salon]);

  // Helper to render stars 
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        size={12} 
        className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-zinc-200 fill-transparent"} 
      />
    ));
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Drawer Sheet */}
      <motion.div 
        initial={{ y: "100%" }} 
        animate={{ y: 0 }} 
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative bg-white w-full max-w-lg sm:rounded-3xl rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10"
      >
        {/* Mobile Drag Handle */}
        <div className="w-full flex justify-center pt-4 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-zinc-200 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <div>
            <h2 className="text-xl font-black text-zinc-900 tracking-tight line-clamp-1">{salon.salonName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-0.5">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold text-zinc-900">{salon.rating ? salon.rating.toFixed(1) : "0.0"}</span>
              </div>
              <span className="text-xs font-medium text-zinc-400">({salon.reviewsCount || 0} reviews)</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full shadow-sm border border-zinc-200 hover:bg-zinc-100 transition active:scale-95 shrink-0">
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        {/* Reviews List Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar bg-zinc-50/30">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-400">
              <Loader2 className="animate-spin" size={28} />
              <p className="text-xs font-bold uppercase tracking-widest">Loading Reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-white border border-zinc-100 rounded-full flex items-center justify-center shadow-sm">
                <MessageSquare size={24} className="text-zinc-300" />
              </div>
              <p className="text-sm font-bold text-zinc-500">No reviews yet for this salon.</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="bg-white p-4 sm:p-5 rounded-[1.5rem] border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center font-bold text-emerald-600 text-sm border border-emerald-100">
                      {review.userId?.name ? review.userId.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900">{review.userId?.name || "Verified Customer"}</h4>
                      <p className="text-[10px] font-medium text-zinc-400 mt-0.5">
                        {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 bg-zinc-50 px-2 py-1.5 rounded-lg border border-zinc-100">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  "{review.reviewText}"
                </p>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SalonReviewsModal;