import React from 'react';
import { Product, Language } from '../types';
import { TRANSLATIONS } from '../constants/translations';
import { Star, Heart, Eye, ArrowLeftRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  currentLanguage: Language;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  onViewDetails: () => void;
  onQuickAdd: () => void;
  key?: any;
}

export default function ProductCard({
  product,
  currentLanguage,
  isFavorite,
  onFavoriteToggle,
  onViewDetails,
  onQuickAdd
}: ProductCardProps) {
  const t = TRANSLATIONS[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  // Get translations based on language
  const name = currentLanguage === 'ar' ? product.name_ar : currentLanguage === 'fr' ? product.name_fr : product.name_en;
  const tag = currentLanguage === 'ar' ? product.tag_ar : currentLanguage === 'fr' ? product.tag_fr : product.tag_en;
  const categoryLabel = t[product.category] || product.category;

  // Calculate rating average
  const ratingAvg = product.rating_count > 0 ? (product.rating_sum / product.rating_count).toFixed(1) : '5.0';

  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-white dark:bg-[#11141D] rounded-2xl overflow-hidden border border-slate-150 dark:border-[#1E293B] shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col relative dark:hover:border-[var(--primary-color, #38bdf8)]/50"
    >
      {/* Corner Tag/Badge */}
      {tag && (
        <span className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} z-10 px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider bg-gradient-to-r from-slate-900 to-slate-800 text-white dark:bg-[var(--primary-color, #38bdf8)]/10 dark:text-[var(--primary-color, #38bdf8)] dark:from-transparent dark:to-transparent dark:border dark:border-[var(--primary-color, #38bdf8)]/30 shadow-md`}>
          {tag}
        </span>
      )}

      {/* Product Image & Hover Action Overlay */}
      <div className="relative aspect-square w-full bg-slate-50 dark:bg-[#18233c] overflow-hidden">
        <img
          src={product.image}
          alt={name}
          referrerPolicy="no-referrer"
          className="object-cover w-full h-full transform scale-100 group-hover:scale-105 transition-transform duration-700"
        />
        
        {/* Hover buttons overlay */}
        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            id={`btn-card-view-details-${product.id}`}
            onClick={onViewDetails}
            className="p-3 bg-white hover:bg-[var(--primary-color)] hover:text-slate-950 dark:bg-slate-800 dark:hover:bg-[var(--primary-color)] dark:hover:text-[#0A0C10] text-slate-800 dark:text-gray-100 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
            title={t.view_details}
          >
            <Eye className="w-5 h-5" />
          </button>
          
          <button
            id={`btn-card-toggle-favorite-${product.id}`}
            onClick={onFavoriteToggle}
            className={`p-3 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all ${
              isFavorite ? 'bg-rose-500 text-white' : 'bg-white text-rose-500 dark:bg-slate-800 dark:hover:bg-rose-500/10 hover:bg-rose-50'
            }`}
            title={t.favorites}
          >
            <Heart className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* Content details */}
      <div className={`p-5 flex-1 flex flex-col justify-between ${isRtl ? 'text-right' : 'text-left'}`}>
        <div>
          {/* Category label */}
          <span className="text-[10px] uppercase tracking-widest font-black text-amber-500 dark:text-[var(--primary-color, #38bdf8)] mb-1.5 block">
            {categoryLabel}
          </span>

          {/* Title */}
          <h3 className="font-bold text-slate-850 dark:text-gray-150 text-sm sm:text-base line-clamp-2 leading-snug group-hover:text-amber-500 dark:group-hover:text-[var(--primary-color, #38bdf8)] transition-colors mb-2">
            {name}
          </h3>

          {/* Rating stars & stock indicator */}
          <div className={`flex items-center gap-1.5 mb-3 text-xs ${isRtl ? 'flex-row-reverse justify-end' : 'flex-row'}`}>
            <div className="flex text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-bold text-slate-500 dark:text-slate-400">{ratingAvg}</span>
            <span className="text-slate-800 dark:text-slate-700">|</span>
            <span className={`font-semibold ${product.stock > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {product.stock > 0 ? `${product.stock} ${t.stock_count}` : t.out_of_stock}
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-slate-100 dark:border-[#1E293B] pt-4 flex items-center justify-between gap-3">
          <div className={`flex flex-col ${isRtl ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t.price}</span>
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-baseline gap-0.5">
              <span>{product.price}</span>
              <span className="text-[10px] font-bold">{t.currency}</span>
            </span>
          </div>

          <button
            id={`btn-card-quick-add-${product.id}`}
            onClick={onQuickAdd}
            disabled={product.stock === 0}
            className={`px-3 py-2 sm:px-4 rounded-xl text-xs font-bold leading-none cursor-pointer transition-all flex items-center gap-1.5 ${
              product.stock > 0
                ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-slate-950 border border-[var(--primary-color)]/25 font-extrabold shadow-sm active:scale-95'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-transparent cursor-not-allowed'
            }`}
          >
            {product.stock > 0 ? (
              <>
                <span className="hidden sm:inline">{t.quick_add}</span>
                <span className="inline sm:hidden">+ 🛒</span>
              </>
            ) : (
              t.out_of_stock
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
