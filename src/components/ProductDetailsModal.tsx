import React from 'react';
import { Product, Language, CartItem, Review } from '../types';
import { TRANSLATIONS } from '../constants/translations';
import { X, Star, Heart, ShieldCheck, RefreshCw, Send, Plus, Minus, User } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProductDetailsModalProps {
  product: Product;
  currentLanguage: Language;
  onClose: () => void;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  onAddToCart: (quantity: number, color: string) => void;
  onBuyNow: (quantity: number, color: string) => void;
  reviews: Review[];
  onAddReview: (productId: string, name: string, rating: number, text: string) => void;
}

export default function ProductDetailsModal({
  product,
  currentLanguage,
  onClose,
  isFavorite,
  onFavoriteToggle,
  onAddToCart,
  onBuyNow,
  reviews,
  onAddReview
}: ProductDetailsModalProps) {
  const t = TRANSLATIONS[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  const name = currentLanguage === 'ar' ? product.name_ar : currentLanguage === 'fr' ? product.name_fr : product.name_en;
  const description = currentLanguage === 'ar' ? product.description_ar : currentLanguage === 'fr' ? product.description_fr : product.description_en;
  const featuresStr = currentLanguage === 'ar' ? product.features_ar : currentLanguage === 'fr' ? product.features_fr : product.features_en;
  const featuresList = featuresStr ? featuresStr.split(',').map(f => f.trim()) : [];
  
  // Rating states (derived dynamically from global reviews list)
  const productReviews = reviews.filter(r => r.product_id === product.id);
  const ratingAvg = productReviews.length > 0 
    ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1) 
    : '5.0';

  // Selected Premium Color state
  const [selectedColor, setSelectedColor] = useState<string>('black');

  // Quantity selection counter
  const [qty, setQty] = useState(1);

  // Gallery current image index
  const images = [product.image, ...(product.additional_images || [])];
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Review form states
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSent, setReviewSent] = useState(false);

  // Reset states on product change
  useEffect(() => {
    setActiveImgIndex(0);
    setQty(1);
    setReviewSent(false);
    setReviewName('');
    setReviewText('');
    setSelectedColor('black');
  }, [product]);

  const handleQtyIncrease = () => {
    if (qty < product.stock) setQty(prev => prev + 1);
  };

  const handleQtyDecrease = () => {
    if (qty > 1) setQty(prev => prev - 1);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewText.trim()) return;

    onAddReview(product.id, reviewName, reviewRating, reviewText);
    setReviewSent(true);
    setReviewName('');
    setReviewText('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        id="modal-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Modal Container */}
      <div
        id="product-details-dialog"
        className="relative bg-white dark:bg-[#11141D] rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-150 dark:border-[#1E293B] animate-in fade-in zoom-in-95 duration-200 text-slate-800 dark:text-gray-100"
      >
        {/* Close Button */}
        <button
          id="btn-details-modal-close"
          onClick={onClose}
          className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} z-10 p-2.5 rounded-full bg-slate-100 hover:bg-slate-900 hover:text-white dark:bg-slate-900 dark:hover:bg-[var(--primary-color, #38bdf8)] dark:hover:text-[#0A0C10] transition-all cursor-pointer`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Images Gallery */}
        <div className="flex-1 p-6 md:p-3 bg-slate-50 dark:bg-[#0A0C10] flex flex-col justify-between border-r dark:border-[#1E293B]">
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Big Main Image */}
            <div className="relative aspect-square w-full max-w-sm rounded-2xl overflow-hidden bg-white dark:bg-[#11141D] border border-slate-150 dark:border-[#1E293B] p-2 mb-6">
              <img
                src={images[activeImgIndex]}
                alt={name}
                referrerPolicy="no-referrer"
                className="object-contain w-full h-full mix-blend-normal transform scale-95 hover:scale-100 transition-all"
              />
            </div>

            {/* Gallery Selector thumbs */}
            {images.length > 1 && (
              <div className="flex items-center gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    id={`btn-details-gallery-${idx}`}
                    onClick={() => setActiveImgIndex(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden p-1 bg-white dark:bg-slate-900 border-2 transition-all ${
                      idx === activeImgIndex ? 'border-[var(--primary-color, #38bdf8)] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="object-cover w-full h-full rounded-lg" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Secure Trust features badges */}
          <div className="grid grid-cols-3 gap-2 mt-3 text-[10px] text-center font-bold text-slate-500 dark:text-slate-400">
            <div className="flex flex-col items-center gap-1.5 p-3 bg-white dark:bg-[#11141D] border dark:border-[#1E293B] rounded-xl">
              <ShieldCheck className="w-5 h-5 text-emerald-500 animate-pulse" />
              <span>{t.features_certified.split('•')[1]?.trim() || 'إرجاع سهل'}</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 bg-white dark:bg-[#11141D] border dark:border-[#1E293B] rounded-xl">
              <RefreshCw className="w-5 h-5 text-[var(--primary-color, #38bdf8)]" />
              <span>{t.features_certified.split('•')[0]?.trim() || 'دعم متواصل'}</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 bg-white dark:bg-[#11141D] border dark:border-[#1E293B] rounded-xl">
              <Star className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span>{t.features_certified.split('•')[2]?.trim() || 'شحن سريع'}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Information Panel */}
        <div className={`flex-1 p-6 md:p-3 flex flex-col justify-between max-h-[85vh] overflow-y-auto ${isRtl ? 'text-right' : 'text-left'}`}>
          <div className="space-y-6">
            
            {/* Header: Title & Heart Favorite */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest font-black text-[var(--primary-color, #38bdf8)]">
                  {t[product.category] || product.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-black leading-snug text-slate-900 dark:text-white">
                  {name}
                </h2>
              </div>
              <button
                id="btn-details-fav-toggle"
                onClick={onFavoriteToggle}
                className={`p-3 rounded-full shadow-md border hover:scale-105 active:scale-95 transition-all ${
                  isFavorite 
                    ? 'bg-rose-500 border-rose-500 text-white' 
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-[#1E293B] text-rose-500'
                }`}
              >
                <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-2">
              <span className="text-xs uppercase font-extrabold text-slate-400">{t.price}:</span>
              <span className="text-2xl sm:text-3xl font-black text-[var(--primary-color, #38bdf8)] dark:text-[var(--primary-color, #38bdf8)]">
                {product.price}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t.currency}</span>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs uppercase font-black tracking-wider text-slate-400">{t.description}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-850 leading-relaxed font-sans">
                {description}
              </p>
            </div>

            {/* Key Features Bullet points */}
            {featuresList.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-black tracking-wider text-slate-400">{t.features}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-600 dark:text-gray-800">
                  {featuresList.map((feat, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color, #38bdf8)] flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Premium Colors Selector */}
            <div className="space-y-2.5">
              <h4 className="text-xs uppercase font-black tracking-wider text-slate-400">{t.colors_label || 'الألوان المتاحة'}</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: t.black || 'أسود', code: '#000000', label: 'black' },
                  { name: t.white || 'أبيض', code: '#FFFFFF', label: 'white' },
                  { name: t.red || 'أحمر', code: '#EF4444', label: 'red' },
                ].map((col) => (
                  <button
                    key={col.label}
                    type="button"
                    onClick={() => setSelectedColor(col.label)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 transition-all text-xs font-black cursor-pointer ${
                      selectedColor === col.label
                        ? 'border-[var(--primary-color, #38bdf8)] bg-[var(--primary-color, #38bdf8)]/10 text-[var(--primary-color, #38bdf8)] dark:text-[var(--primary-color, #38bdf8)]'
                        : 'border-slate-200 dark:border-[#1E293B] hover:border-[var(--primary-color, #38bdf8)]/40 text-slate-500 dark:text-gray-400'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-200 dark:border-slate-700 flex-shrink-0"
                      style={{ backgroundColor: col.code }}
                    />
                    <span>{col.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector & Inventory state */}
            {product.stock > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs uppercase font-black tracking-wider text-slate-400">{t.stock}</h4>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-[#1E293B] rounded-xl p-1 text-sm font-bold">
                    <button
                      id="btn-details-qty-decrease"
                      onClick={handleQtyDecrease}
                      disabled={qty <= 1}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-5 font-black text-slate-900 dark:text-gray-100">{qty}</span>
                    <button
                      id="btn-details-qty-increase"
                      onClick={handleQtyIncrease}
                      disabled={qty >= product.stock}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    ({product.stock} {t.stock_count})
                  </span>
                </div>
              </div>
            )}

            {/* Buying Action buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <button
                id="btn-details-add-to-cart"
                onClick={() => onAddToCart(qty, selectedColor)}
                disabled={product.stock === 0}
                className={`flex-1 px-6 py-4 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer border shadow-md transition-all flex items-center justify-center gap-2 ${
                  product.stock > 0
                    ? 'bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/25 text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-slate-950 active:scale-95'
                    : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-400 dark:text-slate-650 cursor-not-allowed'
                }`}
              >
                {product.stock > 0 ? t.addToCart : t.out_of_stock}
              </button>
              
              <button
                id="btn-details-buy-now"
                onClick={() => onBuyNow(qty, selectedColor)}
                disabled={product.stock === 0}
                className={`flex-1 px-6 py-4 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg hover:scale-102 transition-all flex items-center justify-center gap-2 ${
                  product.stock > 0
                    ? 'bg-[var(--primary-color)] hover:opacity-90 text-slate-950 hover:shadow-[0_0_15px_rgba(var(--primary-color-rgb,56,189,248),0.35)] active:scale-95'
                    : 'bg-slate-100 dark:bg-[#11141D] text-slate-400 dark:text-slate-650 cursor-not-allowed'
                }`}
              >
                {product.stock > 0 ? t.buyNow : t.out_of_stock}
              </button>
            </div>

            {/* Reviews list & interactive review writer */}
            <div className="border-t border-slate-150 dark:border-[#1E293B] pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-gray-100">
                  {t.reviews} ({productReviews.length})
                </h3>
                <div className="flex items-center gap-1 text-xs font-bold text-[var(--primary-color, #38bdf8)] bg-[var(--primary-color, #38bdf8)]/10 px-2.5 py-1 rounded-lg">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{ratingAvg} / 5.0</span>
                </div>
              </div>

              {/* Render existing reviews */}
              <div className="space-y-4 max-h-48 overflow-y-auto pr-1">
                {productReviews.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4 font-bold">{t.no_reviews}</p>
                ) : (
                  productReviews.map((rev) => (
                    <div key={rev.id} className="bg-slate-50 dark:bg-[#0A0C10] rounded-xl p-4 space-y-1.5 border border-slate-150 dark:border-[#1E293B]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black text-slate-500 dark:text-slate-400">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-850">{rev.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-semibold text-slate-400">{rev.date}</span>
                          <div className="flex text-amber-400">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} className="w-8 h-8 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                        {rev.text}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* New review input form */}
              <div className="bg-slate-50 dark:bg-[#0A0C10] rounded-2xl p-4 border border-slate-150 dark:border-[#1E293B]">
                {reviewSent ? (
                  <p className="text-xs font-bold text-emerald-500 py-1 flex items-center gap-1.5 justify-center">
                    <span>{t.review_success}</span>
                  </p>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <h4 className="text-xs font-black text-slate-700 dark:text-slate-800">{t.write_a_review}</h4>
                    
                    {/* Star Rating Select slider */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{t.rating_label}:</span>
                      <div className="flex gap-1 text-gray-800">
                        {[1, 2, 3, 4, 5].map((starValue) => (
                          <button
                            key={starValue}
                            id={`btn-form-rating-${starValue}`}
                            type="button"
                            onClick={() => setReviewRating(starValue)}
                            className={`hover:scale-110 active:scale-95 transition-transform ${
                              starValue <= reviewRating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-750'
                            }`}
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Review Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        id="review-field-name"
                        type="text"
                        required
                        placeholder={currentLanguage === 'ar' ? 'الاسم الكريم' : 'Your name'}
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        className={`text-xs px-3 py-2 rounded-xl border bg-white dark:bg-slate-900 border-slate-150 dark:border-[#1E293B] focus:border-[var(--primary-color, #38bdf8)] text-slate-800 dark:text-white outline-none ${
                          isRtl ? 'text-right' : 'text-left'
                        }`}
                      />
                      <input
                        id="review-field-text"
                        type="text"
                        required
                        placeholder={t.review_placeholder}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className={`text-xs px-3 py-2 rounded-xl border bg-white dark:bg-slate-900 border-slate-150 dark:border-[#1E293B] focus:border-[var(--primary-color, #38bdf8)] text-slate-800 dark:text-white outline-none ${
                          isRtl ? 'text-right' : 'text-left'
                        }`}
                      />
                    </div>

                    <button
                      id="btn-review-submit"
                      type="submit"
                      className="w-full py-2 bg-[var(--primary-color)] hover:opacity-90 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:shadow-[0_0_15px_rgba(var(--primary-color-rgb,56,189,248),0.15)]"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t.submit_review}</span>
                    </button>
                  </form>
                )}
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
