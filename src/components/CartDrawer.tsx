import { CartItem, Language } from '../types';
import { TRANSLATIONS } from '../constants/translations';
import { X, Trash2, Plus, Minus, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';

interface CartDrawerProps {
  cart: CartItem[];
  currentLanguage: Language;
  onClose: () => void;
  onUpdateQty: (pId: string, delta: number) => void;
  onRemoveItem: (pId: string) => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  cart,
  currentLanguage,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onCheckout
}: CartDrawerProps) {
  const t = TRANSLATIONS[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  
  // Free shipping above 500 SAR, else standard 35 SAR
  const shippingCost = subtotal > 500 || subtotal === 0 ? 0 : 35;
  const total = subtotal + shippingCost;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        id="cart-backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/50 dark:bg-black/80 backdrop-blur-sm transition-opacity"
      ></div>

      <div className={`absolute inset-y-0 ${isRtl ? 'left-0' : 'right-0'} max-w-md w-full bg-white dark:bg-[#11141D] shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-[#1E293B] animate-in slide-in-from-right duration-300 text-slate-800 dark:text-gray-100`}>
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[var(--primary-color, #38bdf8)]" />
            <h2 className="text-lg font-black">{t.cart_title}</h2>
            <span className="bg-[var(--primary-color, #38bdf8)]/10 text-[var(--primary-color, #38bdf8)] px-2.5 py-0.5 rounded-full text-[10px] font-black">
              {cart.reduce((s, it) => s + it.quantity, 0)}
            </span>
          </div>
          <button
            id="btn-cart-drawer-close"
            onClick={onClose}
            className="p-2.5 rounded-full bg-slate-50 hover:bg-[var(--primary-color)] hover:text-slate-950 dark:bg-slate-900 dark:hover:bg-[var(--primary-color)] dark:hover:text-[#0A0C10] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-[#0A0C10] flex items-center justify-center text-slate-800 dark:text-slate-700 border dark:border-[#1E293B]">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-xs text-slate-400 font-bold max-w-xs leading-relaxed">
                {t.empty_cart}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => {
                const name = currentLanguage === 'ar' ? item.product.name_ar : currentLanguage === 'fr' ? item.product.name_fr : item.product.name_en;
                return (
                  <div
                    key={item.product.id}
                    id={`cart-item-${item.product.id}`}
                    className="flex items-center gap-4 bg-slate-50 dark:bg-[#0A0C10] rounded-2xl p-4 border border-slate-150 dark:border-[#1E293B] transition-all"
                  >
                    {/* Item Image */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-slate-900 p-1 flex-shrink-0 border border-slate-100/50 dark:border-slate-200">
                      <img src={item.product.image} alt={name} className="object-cover w-full h-full rounded-lg" referrerPolicy="no-referrer" />
                    </div>

                    {/* Description & Action adjustments */}
                    <div className={`flex-1 min-w-0 space-y-1.5 ${isRtl ? 'text-right' : 'text-left'}`}>
                      <h4 className="font-bold text-slate-800 dark:text-gray-150 text-xs sm:text-sm truncate">
                        {name}
                      </h4>
                      {item.color && (
                        <div className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500">
                          <span>{t.selected_color || 'اللون المختار'}: </span>
                          <span className="text-[var(--primary-color, #38bdf8)] uppercase">{t[item.color] || item.color}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        {/* Unit price indicator */}
                        <span className="text-xs font-black text-rose-500 dark:text-[var(--primary-color, #38bdf8)] block">
                          {item.product.price} {t.currency}
                        </span>

                        {/* Quantity switches */}
                        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-205 dark:border-[#1E293B] p-0.5 rounded-lg text-xs">
                          <button
                            id={`btn-cart-qty-dec-${item.product.id}`}
                            onClick={() => onUpdateQty(item.product.id, -1)}
                            disabled={item.quantity <= 1}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                          >
                            <Minus className="w-8 h-8" />
                          </button>
                          <span className="px-2.5 font-bold text-slate-900 dark:text-gray-100">{item.quantity}</span>
                          <button
                            id={`btn-cart-qty-inc-${item.product.id}`}
                            onClick={() => onUpdateQty(item.product.id, 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                          >
                            <Plus className="w-8 h-8" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      id={`btn-cart-remove-${item.product.id}`}
                      onClick={() => onRemoveItem(item.product.id)}
                      className="p-2 hover:bg-rose-500 hover:text-white text-rose-500 rounded-xl transition-all cursor-pointer"
                      title={t.remove_item}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer Calculations */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-slate-200 dark:border-[#1E293B] bg-slate-55/40 dark:bg-[#0A0C10] space-y-4">
            
            {/* Calculation rows */}
            <div className="space-y-2 text-xs font-semibold text-slate-550 dark:text-slate-400">
              <div className="flex items-center justify-between">
                <span>{t.subtotal}</span>
                <span className="font-bold text-slate-800 dark:text-white">{subtotal} {t.currency}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[var(--primary-color, #38bdf8)]" />
                  <span>{t.shipping}</span>
                </span>
                <span className={`font-bold ${shippingCost === 0 ? 'text-[var(--primary-color, #38bdf8)]' : 'text-slate-800 dark:text-white'}`}>
                  {shippingCost === 0 ? t.free : `${shippingCost} ${t.currency}`}
                </span>
              </div>

              {shippingCost > 0 && (
                <p className="text-[10px] text-[var(--primary-color, #38bdf8)] font-semibold">
                  {currentLanguage === 'ar' 
                    ? 'أضف منتجات بأكثر من 500 ر.س لتحصل على شحن مجاني تماماً!' 
                    : currentLanguage === 'fr' 
                    ? 'Ajoutez plus de 500 SAR pour économiser la livraison !'
                    : 'Spend over 500 SAR to activate completely free courier shipping!'}
                </p>
              )}
            </div>

            {/* Total */}
            <div className="border-t border-slate-200 dark:border-[#1E293B] pt-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-500 dark:text-slate-400">
                <span>{currentLanguage === 'ar' ? 'مجموع كمية السلع:' : 'Total Quantity of items:'}</span>
                <span className="font-mono bg-[var(--primary-color, #38bdf8)]/10 text-[var(--primary-color, #38bdf8)] px-2 py-0.5 rounded-lg">{cart.reduce((s, it) => s + it.quantity, 0)} {currentLanguage === 'ar' ? 'قطع' : 'units'}</span>
              </div>
              
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-black">{t.total}</span>
                <span className="text-lg font-black text-rose-500 dark:text-rose-450">
                  {total} {t.currency}
                </span>
              </div>
            </div>

            {/* Shield tag */}
            <div className="flex items-center gap-1.5 justify-center py-1 text-[10px] font-bold text-slate-400">
              <ShieldCheck className="w-4 h-4 text-[var(--primary-color, #38bdf8)]" />
              <span>{t.csrf_protective}</span>
            </div>

            {/* Proceed to checkout button */}
            <button
              id="btn-cart-drawer-checkout"
              onClick={onCheckout}
              className="w-full py-4 bg-[var(--primary-color)] hover:opacity-90 text-slate-950 font-black hover:scale-102 hover:shadow-[0_0_15px_rgba(var(--primary-color-rgb,56,189,248),0.3)] rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              <span>{t.checkout_btn}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
