import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Heart, MessageCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
  isVerified?: boolean;
}
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const ACCENT = '#000000';

interface ReviewListProps {
  productId?: string;
  reviews: Review[];
}

const ReviewList: React.FC<ReviewListProps> = ({ productId, reviews }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [localReviews, setLocalReviews] = useState<Review[]>(reviews);
  
  // Form State
  const [isWriting, setIsWriting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    if (productId && import.meta.env.VITE_SUPABASE_URL) {
      const fetchReviews = async () => {
        const { data } = await supabase
          .from('reviews')
          .select('*, profiles(name)')
          .eq('product_id', productId)
          .order('created_at', { ascending: false });
        
        if (data) {
          setLocalReviews(data.map((r: any) => ({
            id: r.id,
            user: r.profiles?.name || 'Müşteri',
            rating: r.rating,
            comment: r.comment,
            date: new Date(r.created_at).toLocaleDateString(),
            isVerified: r.is_verified_buyer
          })));
        }
      };
      fetchReviews();
    }
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/signin');
      return;
    }
    if (comment.trim().length < 5) {
      setErrorMsg('Please write a slightly longer review.');
      return;
    }

    if (productId && import.meta.env.VITE_SUPABASE_URL) {
      const { data, error } = await supabase.from('reviews').insert([{
        product_id: productId,
        user_id: user.id,
        rating,
        comment
      }]).select('*, profiles(name)').single();
      
      if (data) {
        const newReview: Review = {
          id: data.id,
          user: data.profiles?.name || user.name,
          rating: data.rating,
          comment: data.comment,
          date: 'Şimdi',
          isVerified: data.is_verified_buyer
        };
        setLocalReviews([newReview, ...localReviews]);
      }
    } else {
      // Local fallback
      const newReview: Review = {
        id: `rev_${Math.random().toString(36).substr(2, 9)}`,
        user: user.name,
        rating,
        comment,
        date: 'Şimdi',
        isVerified: false
      };
      setLocalReviews([newReview, ...localReviews]);
    }

    setIsWriting(false);
    setComment('');
    setRating(5);
    setErrorMsg('');
  };

  return (
    <section className="flex flex-col gap-10">
      <div className="flex items-end justify-between pb-6 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
        <div className="flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold" style={{ color: ACCENT }}>Verified Reviews</p>
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} className="fill-black text-black" />)}
            </div>
            <span className="text-black text-[14px] font-black tracking-tight">4.9</span>
            <span className="text-[13px]" style={{ color: 'rgba(0,0,0,0.3)' }}>/ 5.0</span>
          </div>
        </div>
        <button
          onClick={() => {
            if (!user) {
               navigate('/signin');
            } else {
               setIsWriting(!isWriting);
               setErrorMsg('');
            }
          }}
          className="text-[11px] font-bold uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl transition-all"
          style={{ border: '1px solid rgba(0,0,0,0.10)', color: 'rgba(0,0,0,0.4)', backgroundColor: isWriting ? '#1A1A1A' : 'transparent' }}
        >
          <span style={{ color: isWriting ? '#FFFFFF' : 'inherit' }}>{isWriting ? 'Cancel' : 'Write Review'}</span>
        </button>
      </div>

      <AnimatePresence>
        {isWriting && (
          <motion.div
            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="bg-[#FAFAFA] p-6 rounded-2xl border border-black/5 flex flex-col gap-5">
              {!user ? (
                <div className="flex items-center gap-3 text-amber-700 bg-amber-50 p-4 rounded-xl text-sm font-semibold">
                  <AlertCircle size={16} /> {errorMsg}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-black/40 mb-3">Your Rating</p>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <button 
                          key={i} 
                          type="button"
                          onClick={() => setRating(i)}
                          className="hover:scale-110 transition-transform active:scale-95"
                        >
                          <Star size={20} className={i <= rating ? "fill-black text-black" : "text-black/10 fill-transparent"} />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <textarea 
                      placeholder="Share your thoughts on the fit, quality, or feel..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full bg-white border border-black/10 rounded-xl p-4 text-[14px] leading-relaxed resize-none h-28 focus:outline-none focus:border-black/30 transition-colors"
                    />
                    {errorMsg && <p className="text-red-500 text-xs mt-2 font-medium">{errorMsg}</p>}
                  </div>

                  <button type="submit" className="self-end bg-black text-white px-7 py-3 rounded-xl text-[13px] font-bold hover:bg-zinc-800 transition-colors">
                    Submit Dispatch
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3">
        {localReviews.map((review, i) => (
          <div
            key={review.id}
            className="flex flex-col gap-4 p-5 rounded-[8px] anim-fade-up relative overflow-hidden"
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.03)', 
              border: '1px solid rgba(0,0,0,0.06)', 
              animationDelay: `${i * 0.05}s`,
              backdropFilter: 'blur(5px)'
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                   <span className="text-black text-[13px] font-black tracking-tight uppercase">{review.user}</span>
                   {(review as any).isVerified && (
                     <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-emerald-600">Verified Dispatch</span>
                   )}
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={8} className={j < review.rating ? 'fill-black text-black' : 'text-black/10 fill-transparent'} />
                  ))}
                </div>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-black/20">{review.date}</span>
            </div>

            <p className="text-[13px] leading-relaxed font-medium text-black/60 italic">
              "{review.comment}"
            </p>

            <div className="flex gap-6 pt-3 border-t border-black/[0.04]">
              {[
                { icon: <Heart size={10} />, label: 'Respect' },
                { icon: <MessageCircle size={10} />, label: 'Reply' },
              ].map(btn => (
                <button
                  key={btn.label}
                  className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] font-bold transition-colors text-black/30 hover:text-black"
                >
                  {btn.icon} {btn.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ReviewList;
