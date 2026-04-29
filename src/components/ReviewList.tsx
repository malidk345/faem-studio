import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Heart, MessageCircle, AlertCircle, Check } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync with props
  React.useEffect(() => {
    if (reviews.length > 0) {
      setLocalReviews(reviews);
    }
  }, [reviews]);

  // Fetch reviews if they aren't passed as props (standalone usage)
  React.useEffect(() => {
    if (productId && reviews.length === 0) {
      const fetchReviews = async () => {
        try {
          const { data: reviewsData, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

          if (error) {
            console.error("Supabase fetch error:", error);
            return;
          }

          if (reviewsData && reviewsData.length > 0) {
            // Fetch profiles separately to avoid cross-schema join issues
            const userIds = [...new Set(reviewsData.map(r => r.user_id))];
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, name')
              .in('id', userIds);
              
            const profileMap = new Map(profilesData?.map(p => [p.id, p.name]) || []);

            setLocalReviews(reviewsData.map((r: any) => ({
              id: r.id,
              user: profileMap.get(r.user_id) || 'Müşteri',
              rating: r.rating,
              comment: r.comment,
              date: new Date(r.created_at).toLocaleDateString('tr-TR'),
              isVerified: r.is_verified_buyer
            })));
          }
        } catch (e) {
          console.error("Review fetch exception:", e);
        }
      };
      fetchReviews();
    }
  }, [productId, reviews]);

  // Dynamic Statistics
  const stats = useMemo(() => {
    if (localReviews.length === 0) return { avg: 0, total: 0, distribution: [0, 0, 0, 0, 0] };
    
    const total = localReviews.length;
    const sum = localReviews.reduce((s, r) => s + r.rating, 0);
    const avg = parseFloat((sum / total).toFixed(1));
    
    const distribution = [0, 0, 0, 0, 0];
    localReviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        distribution[r.rating - 1]++;
      }
    });
    
    return { avg, total, distribution: distribution.reverse() }; // 5 to 1
  }, [localReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/signin');
      return;
    }
    if (comment.trim().length < 5) {
      setErrorMsg('Lütfen biraz daha detaylı bir yorum yazın.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.from('reviews').insert([{
        product_id: productId,
        user_id: user.id,
        rating,
        comment
      }]).select().single();

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      if (data) {
        const newReview: Review = {
          id: data.id,
          user: user.name || 'Müşteri',
          rating: data.rating,
          comment: data.comment,
          date: 'Şimdi',
          isVerified: data.is_verified_buyer
        };
        setLocalReviews([newReview, ...localReviews]);
        setIsWriting(false);
        setComment('');
        setRating(5);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Yorum gönderilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex flex-col gap-12">
      {/* ── Summary & Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] gap-10 items-start pb-10 border-b border-zinc-100">
        <div className="flex flex-col gap-4">
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-zinc-400">Genel Değerlendirme</p>
          <div className="flex items-center gap-6">
            <div className="text-5xl font-black tracking-tighter text-zinc-900">{stats.avg === 0 ? '-' : stats.avg}</div>
            <div className="flex flex-col gap-1">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < Math.round(stats.avg) ? "fill-amber-400 text-amber-400" : "text-zinc-200 fill-transparent"} />
                ))}
              </div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">{stats.total} Yorum</span>
            </div>
          </div>
          <button
            onClick={() => {
              if (!user) navigate('/signin');
              else setIsWriting(!isWriting);
            }}
            className={`mt-4 w-full h-12 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all border ${
              isWriting ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-900'
            }`}
          >
            {isWriting ? 'Vazgeç' : t('review.write')}
          </button>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          {stats.distribution.map((count, i) => {
            const stars = 5 - i;
            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-4 group">
                <span className="text-[10px] font-black w-3 text-zinc-400">{stars}</span>
                <div className="flex-1 h-1.5 bg-zinc-50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "circOut" }}
                    className="h-full bg-zinc-900" 
                  />
                </div>
                <span className="text-[10px] font-bold w-8 text-zinc-300 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {isWriting && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="apple-card p-8 bg-zinc-50/50 border-zinc-100"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Puanınız</h4>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i)}
                      className="hover:scale-110 transition-transform active:scale-95"
                    >
                      <Star size={24} className={i <= rating ? "fill-amber-400 text-amber-400" : "text-zinc-200 fill-transparent"} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Yorumunuz</h4>
                <textarea
                  placeholder={t('review.placeholder')}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-white border border-zinc-100 rounded-2xl p-6 text-[15px] font-medium leading-relaxed resize-none h-32 focus:outline-none focus:border-zinc-900 transition-all shadow-sm"
                />
                {errorMsg && <p className="text-rose-500 text-[11px] font-black uppercase tracking-widest mt-2">{errorMsg}</p>}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="self-end bg-black text-white px-10 h-14 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-3 shadow-xl shadow-black/10"
              >
                {isSubmitting ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Yorumu Yayınla'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Review List ── */}
      <div className="flex flex-col gap-4">
        {localReviews.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <MessageCircle size={40} className="text-zinc-100" />
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-300">Henüz yorum yapılmamış.</p>
          </div>
        ) : (
          localReviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-8 apple-card border-zinc-50 group hover:border-zinc-200 transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-900 text-[13px] font-black tracking-tight uppercase">{review.user}</span>
                    {review.isVerified && (
                      <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <Check size={10} /> Doğrulanmış Alıcı
                      </div>
                    )}
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={10} className={j < review.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-100 fill-transparent'} />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">{review.date}</span>
              </div>

              <p className="text-[15px] leading-relaxed font-medium text-zinc-600">
                "{review.comment}"
              </p>

              <div className="flex gap-6 pt-6 mt-6 border-t border-zinc-50 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                <button className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black transition-colors text-zinc-300 hover:text-zinc-900">
                  <Heart size={12} strokeWidth={2.5} /> Faydalı ({Math.floor(Math.random() * 10)})
                </button>
                <button className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black transition-colors text-zinc-300 hover:text-zinc-900">
                  <MessageCircle size={12} strokeWidth={2.5} /> Yanıtla
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
};

export default ReviewList;
