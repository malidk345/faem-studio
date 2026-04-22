import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Heart, MessageCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
  isVerified?: boolean;
}

const ACCENT = '#000000';

interface ReviewListProps {
  productId?: string;
  reviews: Review[];
}

const ReviewList: React.FC<ReviewListProps> = ({ productId, reviews }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
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
      const { data } = await supabase.from('reviews').insert([{
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
      <div className="flex items-end justify-between pb-6 border-b border-zinc-100">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-zinc-900">{t('review.verified')}</p>
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}
            </div>
            <span className="text-zinc-900 text-[14px] font-black tracking-tight">4.9</span>
            <span className="text-[13px] text-zinc-400">/ 5.0</span>
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
          className={`text-[11px] font-bold uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl transition-all border ${isWriting
              ? 'bg-zinc-900 text-white border-zinc-900'
              : 'bg-white text-zinc-500 border-zinc-200 hover:text-zinc-900 hover:border-zinc-300'
            }`}
        >
          <span>{isWriting ? 'İptal' : t('review.write')}</span>
        </button>
      </div>

      <AnimatePresence>
        {isWriting && (
          <motion.div
            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <div className="apple-card p-6 flex flex-col gap-5">
              {!user ? (
                <div className="flex items-center gap-3 text-amber-700 bg-amber-50 p-4 rounded-xl text-sm font-semibold">
                  <AlertCircle size={16} /> {errorMsg}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-3">{t('review.rating_label')}</p>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setRating(i)}
                          className="hover:scale-110 transition-transform active:scale-95"
                        >
                          <Star size={20} className={i <= rating ? "fill-amber-400 text-amber-400" : "text-zinc-200 fill-transparent"} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <textarea
                      placeholder={t('review.placeholder')}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-xl p-4 text-[14px] leading-relaxed resize-none h-28 focus:outline-none focus:border-zinc-400 transition-colors"
                    />
                    {errorMsg && <p className="text-rose-500 text-xs mt-2 font-medium">{errorMsg}</p>}
                  </div>

                  <button type="submit" className="self-end bg-zinc-900 text-white px-7 py-3 rounded-xl text-[13px] font-bold hover:bg-zinc-800 transition-colors">
                    {t('review.submit')}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3">
        {/* Count Header */}
        <div className="px-1 mb-2">
          <span className="text-[11px] font-black uppercase tracking-widest text-black/30">
            {localReviews.length} {t('search.results')}
          </span>
        </div>

        {localReviews.map((review, i) => (
          <div
            key={review.id}
            className="flex flex-col gap-4 p-5 md:p-6 apple-card anim-fade-up relative overflow-hidden group"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-900 text-sm font-black tracking-tight uppercase">{review.user}</span>
                  {(review as any).isVerified && (
                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {t('review.verified')}
                    </span>
                  )}
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={10} className={j < review.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200 fill-transparent'} />
                  ))}
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{review.date}</span>
            </div>

            <p className="text-sm leading-relaxed font-medium text-zinc-600">
              "{review.comment}"
            </p>

            <div className="flex gap-6 pt-4 mt-2 border-t border-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold transition-colors text-zinc-400 hover:text-zinc-900">
                <Heart size={12} /> {t('review.respect')}
              </button>
              <button className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold transition-colors text-zinc-400 hover:text-zinc-900" onClick={() => setIsWriting(true)}>
                <MessageCircle size={12} /> {t('review.reply')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ReviewList;
