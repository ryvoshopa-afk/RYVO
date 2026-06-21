import { Language, Theme, User } from '../types';
import { TRANSLATIONS } from '../constants/translations';
import { ShoppingBag, Heart, User as UserIcon, Sun, Moon, Settings, ShieldAlert, Languages, Search, Sliders, MessageSquare, Truck, Home, Facebook, Twitter, Instagram, Youtube, Music, Ghost } from 'lucide-react';

interface NavbarProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  currentTheme: Theme;
  onThemeToggle: () => void;
  favoritesCount: number;
  cartCount: number;
  currentUser: User | null;
  onCartOpen: () => void;
  onAuthOpen: () => void;
  onLogout: () => void;
  onNavigate: (view: 'home' | 'admin' | 'dashboard' | 'favorites' | 'chat' | 'track') => void;
  currentView: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onFavoritesOpen: () => void;
  shopLogo: string;
  socialLinks?: {
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
    snapchat: string;
    tiktok: string;
  };
}

export default function Navbar({
  currentLanguage,
  onLanguageChange,
  currentTheme,
  onThemeToggle,
  favoritesCount,
  cartCount,
  currentUser,
  onCartOpen,
  onAuthOpen,
  onLogout,
  onNavigate,
  currentView,
  searchQuery,
  onSearchChange,
  onFavoritesOpen,
  shopLogo,
  socialLinks
}: NavbarProps) {
  const t = TRANSLATIONS[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  const cycleLanguage = () => {
    if (currentLanguage === 'ar') onLanguageChange('en');
    else if (currentLanguage === 'en') onLanguageChange('fr');
    else onLanguageChange('ar');
  };

  return (
    <>
      {/* Top Announcement & Social Media Network Bar */}
      <div className="w-full bg-slate-900 text-slate-350 dark:bg-black text-[11px] py-1.5 border-b border-slate-200 dark:border-white/5 font-sans relative z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold select-none text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color,#38bdf8)] animate-pulse"></span>
            <span>{isRtl ? 'تسوق بثقة تامة مع حماية وضمان متكامل لجميع المشتريات 🔒' : 'Shop with 100% confidence & guaranteed safety index 🔒'}</span>
          </div>

          {/* Social Icons Stack */}
          <div className="flex items-center gap-3 text-slate-400">
            {socialLinks?.facebook && (
              <a
                href={socialLinks.facebook.startsWith('http') ? socialLinks.facebook : `https://${socialLinks.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
                className="hover:text-[var(--primary-color,#38bdf8)] transition-all p-1"
              >
                <Facebook className="w-3.5 h-3.5 text-blue-500 hover:scale-110" />
              </a>
            )}
            {socialLinks?.twitter && (
              <a
                href={socialLinks.twitter.startsWith('http') ? socialLinks.twitter : `https://${socialLinks.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Twitter/X"
                className="hover:text-[var(--primary-color,#38bdf8)] transition-all p-1"
              >
                <Twitter className="w-3.5 h-3.5 text-sky-400 hover:scale-110" />
              </a>
            )}
            {socialLinks?.instagram && (
              <a
                href={socialLinks.instagram.startsWith('http') ? socialLinks.instagram : `https://${socialLinks.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                className="hover:text-[var(--primary-color,#38bdf8)] transition-all p-1"
              >
                <Instagram className="w-3.5 h-3.5 text-pink-500 hover:scale-110" />
              </a>
            )}
            {socialLinks?.youtube && (
              <a
                href={socialLinks.youtube.startsWith('http') ? socialLinks.youtube : `https://${socialLinks.youtube}`}
                target="_blank"
                rel="noopener noreferrer"
                title="YouTube"
                className="hover:text-[var(--primary-color,#38bdf8)] transition-all p-1"
              >
                <Youtube className="w-3.5 h-3.5 text-red-500 hover:scale-110" />
              </a>
            )}
            {socialLinks?.snapchat && (
              <a
                href={socialLinks.snapchat.startsWith('http') ? socialLinks.snapchat : `https://${socialLinks.snapchat}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Snapchat"
                className="hover:text-[var(--primary-color,#38bdf8)] transition-all p-1"
              >
                <Ghost className="w-3.5 h-3.5 text-yellow-400 hover:scale-110" />
              </a>
            )}
            {socialLinks?.tiktok && (
              <a
                href={socialLinks.tiktok.startsWith('http') ? socialLinks.tiktok : `https://${socialLinks.tiktok}`}
                target="_blank"
                rel="noopener noreferrer"
                title="TikTok"
                className="hover:text-[var(--primary-color,#38bdf8)] transition-all p-1"
              >
                <Music className="w-3.5 h-3.5 text-teal-400 hover:scale-110" />
              </a>
            )}
          </div>
        </div>
      </div>

      <nav className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-[#11141D] border-b border-slate-150 dark:border-[#1E293B] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-3">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                id="ryvo-brand"
                onClick={() => onNavigate('home')}
                className="group flex items-center gap-1 text-lg font-black font-sans tracking-tight transition-opacity hover:opacity-85"
              >
                {shopLogo.startsWith('data:image') || shopLogo.includes('http') || shopLogo.includes('/') ? (
                  <img src={shopLogo} alt="Shop Logo" className="h-10 max-w-[150px] object-contain rounded-lg" referrerPolicy="no-referrer" />
                ) : shopLogo.toUpperCase().includes('RYVO') ? (
                  <>
                    <span className="text-[var(--primary-color, #38bdf8)]">RYVO</span>
                    <span className="text-slate-900 dark:text-white">
                      {shopLogo.toUpperCase().replace('RYVO', '').trim() || 'STORE'}
                    </span>
                  </>
                ) : (
                  <span className="bg-gradient-to-r from-[var(--primary-color, #38bdf8)] to-amber-500 bg-clip-text text-transparent uppercase">
                    {shopLogo}
                  </span>
                )}
              </button>

              {/* Quick Navigation Links */}
              <div className="hidden md:flex items-center gap-6">
                <button
                  id="nav-link-home"
                  onClick={() => onNavigate('home')}
                  className={`text-sm font-semibold transition-colors ${
                    currentView === 'home'
                      ? 'text-[var(--primary-color)] font-extrabold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t.home}
                </button>

                <button
                  id="nav-link-track"
                  onClick={() => onNavigate('track')}
                  className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                    currentView === 'track'
                      ? 'text-[var(--primary-color)] font-extrabold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-[var(--primary-color)]'
                  }`}
                >
                  <Truck className="w-4 h-4 text-amber-500" />
                  {t.track_tab || 'تتبع طلبك 🚚'}
                </button>

                <button
                  id="nav-link-chat"
                  onClick={() => onNavigate('chat')}
                  className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                    currentView === 'chat'
                      ? 'text-[var(--primary-color)] font-extrabold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-[var(--primary-color)]'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-[var(--primary-color)]" />
                  {t.support_tab || 'الدردشة 💬'}
                </button>
                
                {currentUser && currentUser.role === 'admin' ? (
                  <button
                    id="nav-link-admin"
                    onClick={() => onNavigate('admin')}
                    className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                      currentView === 'admin'
                        ? 'text-[var(--primary-color)] font-extrabold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-rose-500 dark:hover:text-red-400'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    {t.admin_panel}
                  </button>
                ) : currentUser ? (
                  <button
                    id="nav-link-dashboard"
                    onClick={() => onNavigate('dashboard')}
                    className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                      currentView === 'dashboard'
                        ? 'text-[var(--primary-color)] font-extrabold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-[var(--primary-color)]'
                    }`}
                  >
                    <Settings className="w-4 h-4 animate-spin-slow text-[var(--primary-color, #38bdf8)]" />
                    {t.customer_panel}
                  </button>
                ) : null}
              </div>
            </div>

            {/* Search bar inside header */}
            <div className="hidden lg:block w-72 max-w-xs relative">
              <div className={`absolute inset-y-0 ${isRtl ? 'left-3' : 'right-3'} flex items-center pointer-events-none text-gray-400`}>
                <Search className="w-4 h-4" />
              </div>
              <input
                id="global-search"
                type="text"
                placeholder={t.search_placeholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className={`w-full py-2 px-4 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-transparent focus:border-[var(--primary-color, #38bdf8)] focus:bg-white dark:focus:bg-[#0A0C10] text-slate-800 dark:text-gray-100 outline-none transition-all ${
                  isRtl ? 'pr-4 pl-10 text-right' : 'pl-4 pr-10 text-left'
                }`}
              />
            </div>

            {/* Accessories (Lang, Theme, Cart, Fav, Auth) */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              
              {/* Language cycle button for ultra-compact mobile layout */}
              <button
                onClick={cycleLanguage}
                className="sm:hidden flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-[#1E293B] text-[10px] font-black text-[var(--primary-color, #38bdf8)] uppercase tracking-tight transition-all active:scale-95"
                title="Change Language"
              >
                <Languages className="w-4 h-4 text-slate-650 dark:text-slate-400" />
                <span>{currentLanguage}</span>
              </button>

              {/* Language switch panel on desktop */}
              <div className="hidden sm:flex items-center bg-slate-100 dark:bg-[#0A0C10] rounded-xl p-1 gap-0.5 border dark:border-[#1E293B]">
                {(['ar', 'en', 'fr'] as Language[]).map((la) => (
                  <button
                    key={la}
                    id={`btn-lang-${la}`}
                    onClick={() => onLanguageChange(la)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-tight transition-all ${
                      currentLanguage === la
                        ? 'bg-[var(--primary-color)] text-slate-950 shadow-sm font-black'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {la}
                  </button>
                ))}
              </div>

              {/* Dark & Light mode switch */}
              <button
                id="theme-toggler"
                onClick={onThemeToggle}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-800 hover:scale-105 transition-transform"
                aria-label="Toggle Theme"
              >
                {currentTheme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>

              {/* Favorites Heart (Visible on tablet/desktop, mobile uses bottom Nav) */}
              <button
                id="favorites-shortcut"
                onClick={onFavoritesOpen}
                className="hidden sm:block p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-[#1E293B] text-rose-500 hover:scale-105 transition-transform relative animate-in fade-in"
              >
                <Heart className="w-4 h-4" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                    {favoritesCount}
                  </span>
                )}
              </button>

              {/* Shopping Bag / Cart */}
              <button
                id="cart-trigger"
                onClick={onCartOpen}
                className="p-2.5 rounded-xl bg-[var(--primary-color)]/10 dark:bg-[var(--primary-color)]/10 border border-slate-200 dark:border-[var(--primary-color)]/30 text-[var(--primary-color)] hover:scale-105 transition-transform relative"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white dark:bg-white dark:text-[#0A0C10] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* User credentials / Auth triggers */}
              {currentUser ? (
                <div className="flex items-center gap-1.5">
                  <button
                    id="user-profile-avatar"
                    onClick={() => onNavigate(currentUser.role === 'admin' ? 'admin' : 'dashboard')}
                    className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-gray-100 transition-colors border dark:border-[#1E293B]"
                  >
                    <UserIcon className="w-4 h-4 text-[var(--primary-color)]" />
                    <span className="max-w-[80px] truncate">{currentUser.name}</span>
                  </button>
                  <button
                    id="auth-logout-btn"
                    onClick={onLogout}
                    className="px-3 py-2 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-bold hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                  >
                    {t.logout}
                  </button>
                </div>
              ) : (
                <button
                  id="auth-login-trigger"
                  onClick={onAuthOpen}
                  className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 bg-[var(--primary-color)] text-slate-950 font-black hover:shadow-[0_0_15px_rgba(var(--primary-color-rgb, 56, 189, 248),0.3)] hover:scale-[1.02] active:scale-95 text-xs rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.login}</span>
                </button>
              )}

            </div>

          </div>
        </div>
      </nav>

      {/* Luxury Sticky Bottom Navigation Bar for Mobile screens */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0A0C10]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#1E293B] shadow-[0_-3px_30px_rgba(0,0,0,0.08)] md:hidden pb-safe">
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {/* Col 1: Home */}
          <button
            id="mobile-nav-home"
            onClick={() => onNavigate('home')}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full text-[10px] font-black transition-all ${
              currentView === 'home'
                ? 'text-[var(--primary-color, #38bdf8)] scale-105'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-850'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>{t.home}</span>
          </button>

          {/* Col 2: Track */}
          <button
            id="mobile-nav-track"
            onClick={() => onNavigate('track')}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full text-[10px] font-black transition-all ${
              currentView === 'track'
                ? 'text-[var(--primary-color, #38bdf8)] scale-105'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-850'
            }`}
          >
            <Truck className="w-5 h-5 text-amber-500" />
            <span>{t.track_tab ? t.track_tab.replace('🚚', '').trim() : 'تتبع'}</span>
          </button>

          {/* Col 3: Chat Support */}
          <button
            id="mobile-nav-chat"
            onClick={() => onNavigate('chat')}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full text-[10px] font-black transition-all ${
              currentView === 'chat'
                ? 'text-[var(--primary-color, #38bdf8)] scale-105'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-850'
            }`}
          >
            <MessageSquare className="w-5 h-5 text-[var(--primary-color)]" />
            <span>{t.chat_tab ? t.chat_tab.replace('💬', '').trim() : 'الدردشة'}</span>
          </button>

          {/* Col 4: Favorites */}
          <button
            id="mobile-nav-favorites"
            onClick={onFavoritesOpen}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full text-[10px] font-black transition-all ${
              currentView === 'favorites'
                ? 'text-rose-500 scale-105'
                : 'text-slate-400 dark:text-slate-500 hover:text-rose-450'
            } relative`}
          >
            <Heart className="w-5 h-5 text-rose-500" />
            <span>{t.favorites}</span>
            {favoritesCount > 0 && (
              <span className="absolute top-2 right-4 bg-rose-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Col 5: Profile Dashboard / Admin / Login */}
          <button
            id="mobile-nav-profile"
            onClick={() => {
              if (currentUser) {
                onNavigate(currentUser.role === 'admin' ? 'admin' : 'dashboard');
              } else {
                onAuthOpen();
              }
            }}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full text-[10px] font-black transition-all ${
              currentView === 'dashboard' || currentView === 'admin'
                ? 'text-[var(--primary-color, #38bdf8)] scale-105'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-850'
            }`}
          >
            {currentUser && currentUser.role === 'admin' ? (
              <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
            ) : (
              <UserIcon className="w-5 h-5 text-[var(--primary-color, #38bdf8)]" />
            )}
            <span>{currentUser ? (currentUser.role === 'admin' ? t.admin_panel.split(' ')[0] : t.customer_panel.split(' ')[0]) : t.login}</span>
          </button>
        </div>
      </div>
    </>
  );
}
