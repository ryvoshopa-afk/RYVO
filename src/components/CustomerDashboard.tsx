import React from 'react';
import { Language, Order, Product, User } from '../types';
import { TRANSLATIONS } from '../constants/translations';
import { ShoppingBag, Heart, Settings, Plus, Key, Calendar, Mail, CheckCircle, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

interface CustomerDashboardProps {
  currentUser: User | null;
  currentLanguage: Language;
  orders: Order[];
  allProducts: Product[];
  favorites: string[];
  onFavoriteToggle: (pId: string) => void;
  onProductClick: (p: Product) => void;
  onUpdateUserName: (newName: string) => void;
}

export default function CustomerDashboard({
  currentUser,
  currentLanguage,
  orders,
  allProducts,
  favorites,
  onFavoriteToggle,
  onProductClick,
  onUpdateUserName
}: CustomerDashboardProps) {
  const t = TRANSLATIONS[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  const [activeTab, setActiveTab] = useState<'orders' | 'favorites' | 'settings' | 'inbox'>('orders');

  // Personal Settings fields
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!currentUser) return null;

  // Filter orders related to this user
  const userOrders = orders.filter(o => o.user_email.toLowerCase() === currentUser.email.toLowerCase());

  // Filter favorite products
  const favoriteProducts = allProducts.filter(p => favorites.includes(p.id));

  // Load simulated emails for this user
  const getInboxEmails = () => {
    const saved = localStorage.getItem('ryvo_customer_emails');
    if (saved) {
      try {
        const parsed: any[] = JSON.parse(saved);
        return parsed.filter(m => m.to.toLowerCase() === currentUser.email.toLowerCase());
      } catch (e) {
        // ignore
      }
    }
    return [];
  };

  const inboxEmails = getInboxEmails();

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;

    onUpdateUserName(profileName);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-3 py-6 text-slate-800 dark:text-gray-100">
      
      {/* Welcome Board */}
      <div className="bg-[#11141D] border border-slate-200 dark:border-[#1E293B] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden mb-3 shadow-sm">
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-br from-[var(--primary-color, #38bdf8)]/10 to-transparent rounded-full blur-3xl -mr-12 -mt-12"></div>
        
        <div className={`relative ${isRtl ? 'text-right' : 'text-left'} space-y-2`}>
          <h2 className="text-2xl sm:text-3xl font-black font-sans bg-gradient-to-r from-white to-[var(--primary-color, #38bdf8)] bg-clip-text text-transparent">
            {t.dashboard_welcome}
          </h2>
          <p className="text-xs text-slate-400">
            {currentUser.name} ({currentUser.email}) • {currentUser.role === 'admin' ? t.admin_panel : t.customer_panel}
          </p>
        </div>
      </div>

      {/* Tab Switch Headers */}
      <div className="flex bg-slate-100 dark:bg-[#0A0C10] border dark:border-[#1E293B] rounded-2xl p-1 gap-1 mb-3 max-w-2xl mx-auto flex-wrap sm:flex-nowrap">
        <button
          id="btn-dash-tab-orders"
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-white dark:bg-[#11141D] text-[var(--primary-color)] shadow-sm'
              : 'text-slate-500 hover:text-[var(--primary-color)]'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{t.dashboard_orders_tab}</span>
        </button>

        <button
          id="btn-dash-tab-favorites"
          onClick={() => setActiveTab('favorites')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'favorites'
              ? 'bg-white dark:bg-[#11141D] text-[var(--primary-color)] shadow-sm'
              : 'text-slate-500 hover:text-[var(--primary-color)]'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>{t.favorites}</span>
          {favorites.length > 0 && (
            <span className="bg-[var(--primary-color, #38bdf8)]/10 text-[var(--primary-color, #38bdf8)] text-[10px] px-2 py-0.5 rounded-full font-black">
              {favorites.length}
            </span>
          )}
        </button>

        <button
          id="btn-dash-tab-inbox"
          onClick={() => setActiveTab('inbox')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'inbox'
              ? 'bg-white dark:bg-[#11141D] text-[var(--primary-color)] shadow-sm'
              : 'text-slate-500 hover:text-[var(--primary-color)]'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>{isRtl ? 'البريد الوارد 📩' : 'Virtual Inbox 📩'}</span>
          {inboxEmails.length > 0 && (
            <span className="bg-amber-500/20 text-amber-500 text-[10px] px-2 py-0.5 rounded-full font-black">
              {inboxEmails.length}
            </span>
          )}
        </button>

        <button
          id="btn-dash-tab-settings"
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-white dark:bg-[#11141D] text-[var(--primary-color)] shadow-sm'
              : 'text-slate-500 hover:text-[var(--primary-color)]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>{t.dashboard_settings_tab}</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="animate-in fade-in duration-300">
        
        {/* TAB 1: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {userOrders.length === 0 ? (
              <div className="bg-white dark:bg-[#111827] rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-200/80 space-y-4 max-w-xl mx-auto">
                <ShoppingBag className="w-12 h-12 text-slate-800 dark:text-slate-600 mx-auto" />
                <p className="text-xs font-bold text-slate-450 leading-relaxed">{t.no_orders}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {userOrders.map((ord) => (
                  <div
                    key={ord.id}
                    id={`order-log-${ord.id}`}
                    className="bg-white dark:bg-[#131b2e] rounded-3xl p-6 border border-slate-100 dark:border-slate-200/80 shadow-sm space-y-4"
                  >
                    {/* Log Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-200 pb-4">
                      <div className="space-y-1 text-left">
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">{t.dashboard_order_id}</span>
                        <strong className="text-sm font-sans font-black text-rose-505">{ord.id}</strong>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 font-sans">
                          <Calendar className="w-4 h-4" />
                          <span>{ord.date}</span>
                        </div>

                        {/* Status Label badge */}
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase text-center ${
                          ord.status === 'delivered' 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : ord.status === 'shipped' 
                            ? 'bg-amber-500/10 text-amber-500 animate-pulse' 
                            : ord.status === 'cancelled' 
                            ? 'bg-rose-500/10 text-rose-500' 
                            : 'bg-indigo-500/10 text-indigo-500'
                        }`}>
                          {t[`dashboard_status_${ord.status}`] || ord.status}
                        </span>
                      </div>
                    </div>

                    {/* Ordered Items rows */}
                    <div className="space-y-3.5">
                      {ord.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between gap-4 text-xs">
                          <div className="flex items-center gap-3">
                            <img src={item.image} className="w-8 h-8 object-cover rounded-lg bg-slate-50 border border-slate-100 p-0.5" referrerPolicy="no-referrer" />
                            <span className="font-bold text-slate-800 dark:text-gray-200">{item.name}</span>
                            <span className="text-slate-400 font-black">x{item.quantity}</span>
                          </div>
                          <span className="font-bold text-slate-600 dark:text-gray-800">{item.price * item.quantity} {t.currency}</span>
                        </div>
                      ))}
                    </div>

                    {/* Log Footer Total */}
                    <div className="border-t border-slate-100 dark:border-[#1E293B] pt-3 flex justify-between font-black text-sm">
                      <span className="text-slate-400">{t.total}</span>
                      <span className="text-[var(--primary-color, #38bdf8)] text-base">{ord.total} {t.currency}</span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FAVORITE ITEMS */}
        {activeTab === 'favorites' && (
          <div>
            {favoriteProducts.length === 0 ? (
              <div className="bg-white dark:bg-[#11141D] rounded-3xl p-12 text-center border border-slate-150 dark:border-[#1E293B] space-y-4 max-w-xl mx-auto">
                <Heart className="w-12 h-12 text-slate-800 dark:text-slate-750 mx-auto" />
                <p className="text-xs font-bold text-slate-450 leading-relaxed">{t.empty_cart}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                {favoriteProducts.map((prod) => {
                  const pName = currentLanguage === 'ar' ? prod.name_ar : currentLanguage === 'fr' ? prod.name_fr : prod.name_en;
                  return (
                    <div
                      key={prod.id}
                      className="bg-white dark:bg-[#11141D] rounded-2xl p-4 border border-slate-150 dark:border-[#1E293B] flex items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={prod.image} className="w-12 h-12 object-cover rounded-xl bg-slate-900 p-1 flex-shrink-0" referrerPolicy="no-referrer" />
                        <div className="text-left truncate">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-gray-100 truncate">{pName}</h4>
                          <span className="text-[10px] font-black text-[var(--primary-color, #38bdf8)]">{prod.price} {t.currency}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          id={`dash-fav-view-${prod.id}`}
                          onClick={() => onProductClick(prod)}
                          className="p-1.5 bg-slate-150 dark:bg-slate-900 rounded-lg hover:bg-[var(--primary-color)] hover:text-slate-950 text-[var(--primary-color)] transition-colors cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`dash-fav-remove-${prod.id}`}
                          onClick={() => onFavoriteToggle(prod.id)}
                          className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                        >
                          <Heart className="w-3.5 h-3.5" fill="currentColor" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}        {/* TAB 3: SETTINGS PROFILE FORM */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-[#11141D] rounded-3xl p-6 sm:p-8 border border-slate-150 dark:border-[#1E293B] max-w-xl mx-auto shadow-sm">
            
            <form onSubmit={handleProfileSave} className="space-y-4">
              <h3 className="text-base font-black border-b border-slate-100 dark:border-[#1E293B] pb-3">{t.personal_info}</h3>

              {/* Save change success message */}
              {saveSuccess && (
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl text-xs font-bold border border-emerald-500/20 text-center flex items-center justify-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>{currentLanguage === 'ar' ? 'تم تحديث الملف الشخصي بنجاح!' : 'Profile updated successfully!'}</span>
                </div>
              )}

              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">{t.fullname_label}</label>
                <input
                  id="settings-fullname-field"
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className={`w-full text-xs px-3.5 py-3 rounded-xl border bg-slate-50 dark:bg-[#0A0C10] border-transparent focus:border-[var(--primary-color, #38bdf8)] focus:bg-white dark:focus:bg-black text-slate-850 dark:text-white outline-none transition-all ${
                    isRtl ? 'text-right' : 'text-left'
                  }`}
                />
              </div>

              <div className="space-y-1 text-left font-sans">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">{t.email_label}</label>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${isRtl ? 'left-3' : 'right-3'} flex items-center pointer-events-none text-slate-500`}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full text-xs py-3 px-3.5 pr-10 rounded-xl bg-slate-100 dark:bg-[#0A0C10] text-slate-400 dark:text-slate-550 border border-transparent cursor-not-allowed text-left font-sans"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t.csrf_protective}</span>
              </div>

              <button
                id="btn-settings-save"
                type="submit"
                className="w-full py-3 bg-[var(--primary-color)] hover:opacity-90 text-slate-950 font-black text-xs uppercase cursor-pointer rounded-xl transition-all active:scale-95 shadow-md"
              >
                {t.save_changes}
              </button>
            </form>

          </div>
        )}

        {/* TAB 4: INBOX / EMAILS */}
        {activeTab === 'inbox' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="bg-white dark:bg-[#11141D] rounded-3xl p-6 border border-slate-150 dark:border-[#1E293B] shadow-sm">
              <h3 className="text-base font-black border-b border-slate-100 dark:border-slate-200 pb-3 flex items-center gap-1.5 justify-between">
                <span>{isRtl ? 'صندوق الوارد الافتراضي 📬' : 'Your Virtual Inbox 📬'}</span>
                <span className="text-[10px] font-bold text-slate-400">({currentUser.email})</span>
              </h3>

              {inboxEmails.length === 0 ? (
                <div className="py-12 text-center text-slate-450 text-xs font-semibold space-y-3">
                  <span className="text-3xl block">✉️</span>
                  <p>{isRtl ? 'صندوق الوارد فارغ تماماً حالياً.' : 'Your virtual inbox is empty right now.'}</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 mt-4">
                  {inboxEmails.map((email: any) => (
                    <div key={email.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-amber-400 font-sans">{email.subject}</h4>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{email.date} • {email.time}</span>
                        </div>
                        <span className="text-[9px] bg-[var(--primary-color, #38bdf8)]/10 text-[var(--primary-color, #38bdf8)] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                          {isRtl ? 'مستلم' : 'Received'}
                        </span>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-[#0A0C10] rounded-2xl border border-slate-100 dark:border-slate-200/60 text-[11px] leading-relaxed font-sans whitespace-pre-wrap text-slate-700 dark:text-gray-800 text-left">
                        {email.body}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
