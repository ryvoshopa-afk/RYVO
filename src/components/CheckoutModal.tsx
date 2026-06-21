import React from 'react';
import { CartItem, Language, Order } from '../types';
import { TRANSLATIONS } from '../constants/translations';
import { X, ShieldCheck, CheckCircle2, Loader2, Sparkles, CreditCard, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

interface CheckoutModalProps {
  cart: CartItem[];
  currentLanguage: Language;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
  userEmail?: string;
  userName?: string;
}

export default function CheckoutModal({
  cart,
  currentLanguage,
  onClose,
  onOrderSuccess,
  userEmail = '',
  userName = ''
}: CheckoutModalProps) {
  const t = TRANSLATIONS[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingCost = subtotal > 500 ? 0 : 35;
  const total = subtotal + shippingCost;

  // Form states
  const [fullname, setFullname] = useState(userName);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(userEmail);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullname.trim() || !address.trim() || !phone.trim() || !email.trim()) {
      alert(t.error_empty_fields);
      return;
    }

    setIsSubmitting(true);

    // Simulate CSRF / API latency
    setTimeout(() => {
      const uniqueId = `RYVO-${Math.floor(1000 + Math.random() * 9000)}-SA`;
      
      const newOrder: Order = {
        id: uniqueId,
        customer_name: fullname,
        user_email: email,
        address,
        phone,
        payment_method: paymentMethod,
        items: cart.map(it => ({
          product_id: it.product.id,
          name: currentLanguage === 'ar' ? it.product.name_ar : currentLanguage === 'fr' ? it.product.name_fr : it.product.name_en,
          price: it.product.price,
          quantity: itemQuantity(it),
          image: it.product.image,
          color: it.color
        })),
        total,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        csrf_token_verified: true,
        status_history: [
          {
            status: 'pending',
            timestamp: new Date().toISOString()
          }
        ]
      };

      setIsSubmitting(false);
      setSubmittedOrder(newOrder);
      onOrderSuccess(newOrder); // Update state in App.tsx to subtract stock & record order
    }, 1500);
  };

  const itemQuantity = (item: CartItem) => item.quantity;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/60 dark:bg-black/85 backdrop-blur-sm transition-opacity"></div>

      {/* Modal Dialog */}
      <div id="checkout-form-dialog" className="relative bg-white dark:bg-[#11141D] rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-150 dark:border-[#1E293B] animate-in fade-in zoom-in-95 duration-200 text-slate-800 dark:text-gray-100">
        
        {/* Close Button */}
        <button
          id="btn-checkout-close"
          onClick={onClose}
          className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} z-10 p-2.5 rounded-full bg-slate-50 hover:bg-[var(--primary-color)] hover:text-slate-950 dark:bg-slate-900 dark:hover:bg-[var(--primary-color)] dark:hover:text-[#0A0C10] transition-all cursor-pointer`}
        >
          <X className="w-4 h-4" />
        </button>

        {submittedOrder ? (
          /* Success Screen */
          <div className="w-full p-3 text-center space-y-6 max-w-xl mx-auto py-12 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto text-4xl">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t.order_success_title}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                {t.order_success_text} 
                <strong className="text-rose-500 font-sans block text-lg tracking-wider mt-1.5 font-black bg-rose-500/10 py-1.5 rounded-xl border border-rose-500/20">
                  {submittedOrder.id}
                </strong>
              </p>
            </div>

            {/* Receipt Summary */}
            <div className="bg-slate-50 dark:bg-[#152033] rounded-2xl p-6 border border-slate-100 dark:border-slate-200 text-xs text-left font-sans space-y-4">
              <h3 className="font-bold border-b border-slate-200 dark:border-slate-700 pb-2 text-center text-slate-400 uppercase tracking-widest">{t.dashboard_orders_tab}</h3>
              
              <div className="space-y-2.5">
                {submittedOrder.items.map((it, i) => (
                  <div key={i} className="flex justify-between items-center text-slate-600 dark:text-slate-850">
                    <span className="font-medium">{it.name} <strong className="text-slate-400">x{it.quantity}</strong></span>
                    <span className="font-bold">{it.price * it.quantity} {t.currency}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-2.5 flex justify-between font-black text-slate-950 dark:text-gray-100">
                <span>{t.total}</span>
                <span className="text-rose-500">{submittedOrder.total} {t.currency}</span>
              </div>
            </div>

            <button
              id="btn-checkout-success-close"
              onClick={onClose}
              className="px-6 py-3 bg-[var(--primary-color)] hover:opacity-90 text-slate-950 font-bold rounded-xl text-xs uppercase cursor-pointer transition-all"
            >
              {t.close_btn}
            </button>
          </div>
        ) : (
          /* Form Screen */
          <>
            {/* Left Side: Receipt Items Breakdown */}
            <div className="flex-1 p-6 md:p-3 bg-slate-105 dark:bg-[#0A0C10] flex flex-col justify-between border-r dark:border-[#1E293B]">
              <div>
                <span className="text-xs font-black uppercase text-[var(--primary-color, #38bdf8)] tracking-wider flex items-center gap-1.5 mb-4">
                  <ShoppingBag className="w-4 h-4" />
                  {t.cart_title}
                </span>

                <div className="space-y-4 max-h-[35vh] overflow-y-auto pr-1">
                  {cart.map(item => {
                    const name = currentLanguage === 'ar' ? item.product.name_ar : currentLanguage === 'fr' ? item.product.name_fr : item.product.name_en;
                    return (
                      <div key={item.product.id} className="flex items-center gap-3 bg-white dark:bg-[#11141D] p-3 rounded-xl border border-slate-150 dark:border-[#1E293B]">
                        <img src={item.product.image} className="w-10 h-10 object-cover rounded-lg" referrerPolicy="no-referrer" />
                        <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
                          <h4 className="text-xs font-bold truncate text-slate-800 dark:text-gray-200">{name}</h4>
                          <span className="text-[10px] font-bold text-slate-400">{item.quantity} x {item.product.price} {t.currency}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Subtotal summaries */}
              <div className="border-t border-slate-200 dark:border-slate-850 pt-6 mt-6 space-y-2.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>{t.subtotal}</span>
                  <span className="text-slate-800 dark:text-white">{subtotal} {t.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.shipping}</span>
                  <span className={shippingCost === 0 ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}>
                    {shippingCost === 0 ? t.free : `${shippingCost} ${t.currency}`}
                  </span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-850 pt-3 flex justify-between text-sm text-slate-900 dark:text-white">
                  <span className="font-black">{t.total}</span>
                  <span className="text-base text-rose-500 font-black">{total} {t.currency}</span>
                </div>
              </div>
            </div>

            {/* Right Side: Inputs Column */}
            <div className={`flex-1 p-6 md:p-3 flex flex-col justify-between ${isRtl ? 'text-right' : 'text-left'}`}>
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">{t.checkout_title}</h2>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t.csrf_protective}</span>
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-3.5 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">{t.fullname_label}</label>
                    <input
                      id="checkout-fullname"
                      type="text"
                      required
                      value={fullname}
                      onChange={(e) => setFullname(e.target.value)}
                      className={`w-full text-xs px-3.5 py-3 rounded-xl border bg-slate-50 dark:bg-slate-900 border-transparent focus:border-[var(--primary-color, #38bdf8)] focus:bg-white dark:focus:bg-[#0A0C10] text-slate-850 dark:text-white outline-none transition-all ${
                        isRtl ? 'text-right' : 'text-left'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">{t.address_label}</label>
                    <input
                      id="checkout-address"
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={`w-full text-xs px-3.5 py-3 rounded-xl border bg-slate-50 dark:bg-slate-900 border-transparent focus:border-[var(--primary-color, #38bdf8)] focus:bg-white dark:focus:bg-[#0A0C10] text-slate-850 dark:text-white outline-none transition-all ${
                        isRtl ? 'text-right' : 'text-left'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">{t.email_label}</label>
                      <input
                        id="checkout-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full text-xs px-3.5 py-3 rounded-xl border bg-slate-50 dark:bg-slate-900 border-transparent focus:border-[var(--primary-color, #38bdf8)] focus:bg-white dark:focus:bg-[#0A0C10] text-slate-850 dark:text-white outline-none transition-all ${
                          isRtl ? 'text-right' : 'text-left'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">{t.phone_label}</label>
                      <input
                        id="checkout-phone"
                        type="tel"
                        required
                        placeholder="05xxxxxxx"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`w-full text-xs px-3.5 py-3 rounded-xl border bg-slate-50 dark:bg-slate-900 border-transparent focus:border-[var(--primary-color, #38bdf8)] focus:bg-white dark:focus:bg-[#0A0C10] text-slate-850 dark:text-white outline-none transition-all ${
                          isRtl ? 'text-right' : 'text-left'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">{t.payment_method}</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'cod', label: t.payment_cash },
                        { id: 'card', label: t.payment_card },
                        { id: 'apple', label: t.payment_apple }
                      ].map(meth => (
                        <button
                          key={meth.id}
                          id={`btn-payment-${meth.id}`}
                          type="button"
                          onClick={() => setPaymentMethod(meth.id)}
                          className={`p-3 rounded-xl border-2 text-center text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            paymentMethod === meth.id
                              ? 'border-[var(--primary-color, #38bdf8)] bg-[var(--primary-color, #38bdf8)]/5 text-[var(--primary-color, #38bdf8)]'
                              : 'border-slate-100 dark:border-slate-200 hover:border-slate-200 dark:hover:border-slate-700 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          <CreditCard className="w-4 h-4 text-slate-450" />
                          <span className="text-[10px] leading-tight description-lang">{meth.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submitting CSRF feedback */}
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-600 dark:text-gray-800">
                    <Loader2 className="w-4 h-4 animate-spin text-[var(--primary-color, #38bdf8)]" />
                    <span>{t.processing_order}</span>
                  </div>
                ) : (
                  <button
                    id="btn-checkout-submit"
                    type="submit"
                    className="w-full py-4 mt-2 bg-[var(--primary-color)] hover:opacity-90 text-slate-950 font-black hover:scale-[1.01] rounded-xl transition-all cursor-pointer text-xs uppercase shadow-md hover:shadow-[0_0_15px_rgba(var(--primary-color-rgb,56,189,248),0.35)]"
                  >
                    {t.confirm_order_btn}
                  </button>
                )}
              </form>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
