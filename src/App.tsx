import { useState, useEffect } from 'react';
import { Product, Language, Theme, CartItem, Order, User, Review } from './types';
import { INITIAL_PRODUCTS } from './constants/initialProducts';
import { TRANSLATIONS } from './constants/translations';
import { updateSEO, generateSitemapXML, generateRobotsTXT } from './utils/seo';

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductDetailsModal from './components/ProductDetailsModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import CustomerDashboard from './components/CustomerDashboard';
import AdminPanel from './components/AdminPanel';
import SupportChat from './components/SupportChat';
import OrderTrack from './components/OrderTrack';

// Icons
import { ShieldCheck, Eye, Sparkles, AlertCircle, Heart, FileCode, CheckCircle, Search } from 'lucide-react';

export default function App() {
  // Theme & Language
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('ryvo_theme');
    return (saved as Theme) || 'light';
  });

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('ryvo_lang');
    return (saved as Language) || 'ar';
  });

  // Database core states
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('ryvo_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('ryvo_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('ryvo_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [];
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('ryvo_favorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ryvo_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return null;
  });

   // UI Active visibility states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeView, setActiveView] = useState<'home' | 'admin' | 'dashboard' | 'favorites' | 'chat' | 'track'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Multi-Review rating sync list state
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('ryvo_product_reviews');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    // Default fallback reviews so shop displays credible customer validation from start
    return [
      {
        id: 'rev-1',
        product_id: 'prod-1',
        product_name: 'دراجة جبلية هوائية',
        name: 'فهد الحربي',
        rating: 5,
        text: 'مذهلة جداً وخاماتها ممتازة جداً للدفع والجبال الوعرة! أنصح بها بشدة.',
        date: '2026-06-15'
      },
      {
        id: 'rev-2',
        product_id: 'prod-2',
        product_name: 'ساعة يد ذكية فاخرة',
        name: 'سحر العتيبي',
        rating: 4,
        text: 'ساعة فخمة جداً، شاشتها واضحة ومقاومة للماء والخدش، التوصيل كان سريع.',
        date: '2026-06-18'
      }
    ];
  });

  // Customizable logo state
  const [shopLogo, setShopLogo] = useState<string>(() => {
    return localStorage.getItem('ryvo_shop_logo') || 'RYVO STORE';
  });

  // Customizable accent brand color state
  const [brandColor, setBrandColor] = useState<string>(() => {
    return localStorage.getItem('ryvo_brand_color') || '#38bdf8';
  });

  // Social media links state
  const [socialLinks, setSocialLinks] = useState(() => {
    try {
      const saved = localStorage.getItem('ryvo_social_links');
      return saved ? JSON.parse(saved) : {
        facebook: 'https://facebook.com',
        twitter: 'https://twitter.com',
        instagram: 'https://instagram.com',
        youtube: 'https://youtube.com',
        snapchat: '',
        tiktok: '',
      };
    } catch (e) {
      return {
        facebook: 'https://facebook.com',
        twitter: 'https://twitter.com',
        instagram: 'https://instagram.com',
        youtube: 'https://youtube.com',
        snapchat: '',
        tiktok: '',
      };
    }
  });

  // Customizable advertising slides (Hero section)
  const [heroSlides, setHeroSlides] = useState<any[] | null>(null);

  // Custom admins with specific allowed panels
  const [customAdmins, setCustomAdmins] = useState<any[]>([]);

  // Periodically fetch global configuration from the Express backend
  useEffect(() => {
    const fetchGlobalSettings = async () => {
      try {
        const response = await fetch('/api/global-settings');
        if (response.ok) {
          const data = await response.json();
          if (data.brandColor && data.brandColor !== brandColor) {
            setBrandColor(data.brandColor);
          }
          if (data.shopLogo && data.shopLogo !== shopLogo) {
            setShopLogo(data.shopLogo);
          }
          if (data.socialLinks) {
            setSocialLinks(data.socialLinks);
          }
          if (data.heroSlides !== undefined) {
            setHeroSlides(data.heroSlides);
          }
          if (data.customAdmins) {
            setCustomAdmins(data.customAdmins);
            
            // Sync with local registered users lists so custom admins can log in seamlessly
            const savedUsers = localStorage.getItem('ryvo_registered_users');
            if (savedUsers) {
              const parsed = JSON.parse(savedUsers);
              let changed = false;
              data.customAdmins.forEach((adm: any) => {
                const idx = parsed.findIndex((pu: any) => pu.email.toLowerCase() === adm.email.toLowerCase());
                if (idx > -1) {
                  if (
                    JSON.stringify(parsed[idx].allowedPanels) !== JSON.stringify(adm.allowedPanels) || 
                    parsed[idx].password !== adm.password ||
                    parsed[idx].name !== adm.name
                  ) {
                    parsed[idx].allowedPanels = adm.allowedPanels;
                    parsed[idx].password = adm.password;
                    parsed[idx].name = adm.name;
                    changed = true;
                  }
                } else {
                  parsed.push({
                    email: adm.email,
                    name: adm.name,
                    role: 'admin',
                    favorites: [],
                    password: adm.password || '123456',
                    allowedPanels: adm.allowedPanels
                  });
                  changed = true;
                }
              });
              if (changed) {
                localStorage.setItem('ryvo_registered_users', JSON.stringify(parsed));
                
                // Live sync current logged-in user if permissions changed
                const currentLogged = localStorage.getItem('ryvo_user');
                if (currentLogged) {
                  try {
                    const loggedObj = JSON.parse(currentLogged);
                    const matchedAdm = data.customAdmins.find((ca: any) => ca.email.toLowerCase() === loggedObj.email.toLowerCase());
                    if (matchedAdm) {
                      const updatedLogged = {
                        ...loggedObj,
                        name: matchedAdm.name,
                        allowedPanels: matchedAdm.allowedPanels
                      };
                      if (
                        JSON.stringify(loggedObj.allowedPanels) !== JSON.stringify(updatedLogged.allowedPanels) ||
                        loggedObj.name !== updatedLogged.name
                      ) {
                        setCurrentUser(updatedLogged);
                      }
                    }
                  } catch (e) {}
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching settings from API:', err);
      }
    };

    fetchGlobalSettings();
    const interval = setInterval(fetchGlobalSettings, 5000);
    return () => clearInterval(interval);
  }, [brandColor, shopLogo]);

  // Sync callbacks to save changes on backend
  const handleUpdateLogo = async (logo: string) => {
    setShopLogo(logo);
    try {
      await fetch('/api/global-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopLogo: logo }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateBrandColor = async (color: string) => {
    setBrandColor(color);
    try {
      await fetch('/api/global-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandColor: color }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateSocialLinks = async (links: typeof socialLinks) => {
    setSocialLinks(links);
    localStorage.setItem('ryvo_social_links', JSON.stringify(links));
    try {
      await fetch('/api/global-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ socialLinks: links }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateHeroSlides = async (slides: any[] | null) => {
    setHeroSlides(slides);
    try {
      await fetch('/api/global-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heroSlides: slides }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateCustomAdmins = async (admins: any[]) => {
    setCustomAdmins(admins);
    try {
      await fetch('/api/global-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customAdmins: admins }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Modals sliders managers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // SEO modal viewer
  const [seoModalType, setSeoModalType] = useState<'sitemap' | 'robots' | null>(null);

  // Sync Storage
  useEffect(() => {
    localStorage.setItem('ryvo_shop_logo', shopLogo);
  }, [shopLogo]);

  useEffect(() => {
    localStorage.setItem('ryvo_brand_color', brandColor);
    const root = window.document.documentElement;
    root.style.setProperty('--primary-color', brandColor);
    
    try {
      let hex = brandColor.replace('#', '');
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        root.style.setProperty('--primary-color-rgb', `${r}, ${g}, ${b}`);
      }
    } catch (_) {}
  }, [brandColor]);

  useEffect(() => {
    localStorage.setItem('ryvo_product_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('ryvo_theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('ryvo_lang', language);
    // Adjust layout direction HTML attribute
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    updateSEO({ product: selectedProduct || undefined, category: activeCategory, language });
  }, [language, selectedProduct, activeCategory]);

  useEffect(() => {
    localStorage.setItem('ryvo_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('ryvo_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('ryvo_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('ryvo_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('ryvo_user', currentUser ? JSON.stringify(currentUser) : '');
  }, [currentUser]);

  // Core functions
  const handleThemeToggle = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  const handleCartAdd = (product: Product, quantity: number, color?: string) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.product.id === product.id && item.color === (color || 'أسود'));
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity = Math.min(product.stock, updated[idx].quantity + quantity);
        return updated;
      }
      return [...prev, { product, quantity, color: color || 'أسود' }];
    });
    setIsCartOpen(true);
  };

  const handleAddReview = (productId: string, name: string, rating: number, text: string) => {
    const prod = products.find(p => p.id === productId);
    const newReview: Review = {
      id: `rev-${Math.floor(1000 + Math.random() * 9000)}`,
      product_id: productId,
      product_name: prod ? (language === 'ar' ? prod.name_ar : prod.name_en) : 'منتج غير معروف',
      name,
      rating,
      text,
      date: new Date().toISOString().split('T')[0]
    };
    setReviews(prev => [newReview, ...prev]);

    // Update catalog average rating count/sum dynamically in state
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            rating_sum: p.rating_sum + rating,
            rating_count: p.rating_count + 1
          };
        }
        return p;
      });
    });
  };

  const handleDeleteReview = (reviewId: string) => {
    const rev = reviews.find(r => r.id === reviewId);
    if (!rev) return;
    setReviews(prev => prev.filter(r => r.id !== reviewId));

    // Restore updated rating count/sum
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        if (p.id === rev.product_id) {
          return {
            ...p,
            rating_sum: Math.max(0, p.rating_sum - rev.rating),
            rating_count: Math.max(0, p.rating_count - 1)
          };
        }
        return p;
      });
    });
  };

  const handleUpdateCartQty = (pId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === pId) {
          const newQty = Math.max(1, Math.min(item.product.stock, item.quantity + delta));
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const handleRemoveCartItem = (pId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== pId));
  };

  const handleFavoriteToggle = (pId: string) => {
    setFavorites(prev => {
      if (prev.includes(pId)) {
        return prev.filter(id => id !== pId);
      }
      return [...prev, pId];
    });
  };

  const sendSimulatedCustomerEmail = (toEmail: string, subject: string, body: string) => {
    let current: any[] = [];
    const saved = localStorage.getItem('ryvo_customer_emails');
    if (saved) {
      try { current = JSON.parse(saved); } catch (e) {}
    }
    const today = new Date();
    const formattedDate = today.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMail = {
      id: `email-${Math.floor(Math.random() * 9999999)}-${Date.now()}`,
      to: toEmail,
      subject,
      body,
      date: formattedDate,
      time: formattedTime
    };

    localStorage.setItem('ryvo_customer_emails', JSON.stringify([...current, newMail]));
  };

  const handleOrderSuccess = (newOrder: Order) => {
    // 1. Record completed order
    setOrders(prev => [newOrder, ...prev]);

    // 2. Subtract stocks from catalog database
    setProducts(prevProducts => {
      return prevProducts.map(prod => {
        const orderItem = newOrder.items.find(it => it.product_id === prod.id);
        if (orderItem) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - orderItem.quantity)
          };
        }
        return prod;
      });
    });

    // 3. Clear shopping cart
    setCart([]);
    setIsCheckoutOpen(false);

    // 4. Send automated Order Confirmation Email Receipt to Virtual Customer Inbox
    const emailSubject = language === 'ar' 
      ? 'تم استلام وتأكيد طلبك الفاخر بنجاح! 🛍️✨' 
      : 'Ryvo Store Order Confirmation Registered! 🛍️✨';
    
    const itemsDescription = newOrder.items.map(it => `${it.name} (x${it.quantity}) [${language === 'ar' ? 'اللون:' : 'Color:'} ${it.color || 'أسود'}]`).join('، ');
    
    const emailBody = language === 'ar'
      ? `عزيزنا العميل الفاخر ${newOrder.customer_name}،\n\nنود إبلاغك بأنه تم تأكيد استلام طلبك رقم (#${newOrder.id}) لدينا بنجاح ونعمل الآن على قدم وساق لتجهيزه!\n\nتفاصيل طلبك:\n• المنتجات: ${itemsDescription}\n• مجموع المنتجات المطلوبة الكلي: ${newOrder.items.reduce((acc, it) => acc + it.quantity, 0)} قطع\n• القيمة الكلية المدفوعة: ${newOrder.total} ريال سعودي\n• عنوان الشحن: ${newOrder.address}\n\nشكراً لتسوقكم وثقتكم بمتجر رايفو! 💎`
      : `Dear ${newOrder.customer_name},\n\nWe are delighted to confirm that your order (#${newOrder.id}) has been placed and received successfully! Our operations team is preparing your package.\n\nYour Order Details:\n• Items: ${itemsDescription}\n• Total quantity: ${newOrder.items.reduce((acc, it) => acc + it.quantity, 0)} units\n• Paid Amount: ${newOrder.total} SAR\n• Destination: ${newOrder.address}\n\nThank you for choosing Ryvo Store! 💎`;

    sendSimulatedCustomerEmail(newOrder.user_email, emailSubject, emailBody);
  };

  // Auth Callbacks
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setActiveView('admin');
    } else {
      setActiveView('dashboard');
    }
  };

  // Admin Callbacks
  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => {
      return prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p));
    });
  };

  const handleDeleteProduct = (pId: string) => {
    setProducts(prev => prev.filter(p => p.id !== pId));
  };

  const handleUpdateOrderStatus = (ordId: string, status: Order['status']) => {
    setOrders(prev => {
      const match = prev.find(o => o.id === ordId);
      if (match) {
        // Send status email dynamically
        let statusAr = 'تحت الإجراء';
        let statusEn = 'processing';
        
        if (status === 'shipped') {
          statusAr = 'تم شحنه وتسليمه لشركة التوصيل 🚚';
          statusEn = 'shipped & handed to carrier 🚚';
        } else if (status === 'delivered') {
          statusAr = 'تم التوصيل والاستلام بنجاح 🎉';
          statusEn = 'successfully delivered and received 🎉';
        } else if (status === 'cancelled') {
          statusAr = 'تم إلغاؤه ⛔';
          statusEn = 'cancelled ⛔';
        }

        const emailSubject = language === 'ar'
          ? `تحديث جديد بخصوص حالة طلبك (#${ordId})`
          : `New Update regarding your Ryvo order status (#${ordId})`;

        const emailBody = language === 'ar'
          ? `عزيزنا العميل الفاخر ${match.customer_name}،\n\nنود مسارعتك بالبشرى وتحديث حالة طلبك رقم (#${ordId}) لدينا.\n\nالحالة الجديدة المعتمدة الآن: [ ${statusAr} ]\n\nسنستمر في موافاتك بكل تحديث فوري فور حدوثه. طاب يومك بكل خير! ✨`
          : `Dear ${match.customer_name},\n\nWe would like to share an update about your ongoing order (#${ordId}).\n\nUpdated Status: [ ${statusEn} ]\n\nWe will keep notifying you immediately of any progress. Have a beautiful day! ✨`;

        sendSimulatedCustomerEmail(match.user_email, emailSubject, emailBody);
      }
      return prev.map(o => {
        if (o.id === ordId) {
          const history = o.status_history ? [...o.status_history] : [
            { status: 'pending', timestamp: new Date(o.date).toISOString() }
          ];
          // Append the new status with the current timestamp
          history.push({
            status,
            timestamp: new Date().toISOString()
          });
          return {
            ...o,
            status,
            status_history: history
          };
        }
        return o;
      });
    });
  };

  // Filter products for gallery grid
  const searchFilteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const translationTitle = language === 'ar' ? p.name_ar : language === 'fr' ? p.name_fr : p.name_en;
    const matchesQuery = !searchQuery.trim() || translationTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${
      theme === 'dark' ? 'bg-[#0A0C10] text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Top Warning Banner if user is on simulated credentials */}
      {currentUser && currentUser.role === 'admin' && (
        <div className="bg-gradient-to-r from-rose-500 to-amber-500 text-white py-2 text-center text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 px-4 shadow-sm">
          <ShieldCheck className="w-4 h-4 animate-bounce" />
          <span>{language === 'ar' ? 'أنت تتصفح حالياً كمدير مسؤول للمتجر !' : 'Active Administrative Dev Sandbox Session!'}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
        currentTheme={theme}
        onThemeToggle={handleThemeToggle}
        favoritesCount={favorites.length}
        cartCount={cart.reduce((s, item) => s + item.quantity, 0)}
        currentUser={currentUser}
        onCartOpen={() => setIsCartOpen(true)}
        onAuthOpen={() => setIsAuthOpen(true)}
        shopLogo={shopLogo}
        socialLinks={socialLinks}
        onLogout={() => {
          setCurrentUser(null);
          setFavorites([]);
          setActiveView('home');
        }}
        onNavigate={(view) => {
          setActiveView(view);
          if (view === 'home') {
            setActiveCategory('all');
            setSearchQuery('');
          }
        }}
        currentView={activeView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFavoritesOpen={() => {
          if (!currentUser) setIsAuthOpen(true);
          else setActiveView('dashboard');
        }}
      />

      {/* Main Container Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-3 py-3 md:py-12">
        
        {/* VIEW 1: ADMIN CONTROL PANEL PANEL */}
        {activeView === 'admin' && currentUser?.role === 'admin' ? (
          <AdminPanel
            currentUser={currentUser}
            currentLanguage={language}
            products={products}
            orders={orders}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            reviews={reviews}
            onDeleteReview={handleDeleteReview}
            shopLogo={shopLogo}
            onUpdateLogo={handleUpdateLogo}
            brandColor={brandColor}
            onUpdateBrandColor={handleUpdateBrandColor}
            socialLinks={socialLinks}
            onUpdateSocialLinks={handleUpdateSocialLinks}
            heroSlides={heroSlides}
            onUpdateHeroSlides={handleUpdateHeroSlides}
            customAdmins={customAdmins}
            onUpdateCustomAdmins={handleUpdateCustomAdmins}
          />
        ) : activeView === 'chat' ? (
          /* VIEW 1.2: SUPPORT ONLINE CHAT PANEL */
          <SupportChat currentLanguage={language} />
        ) : activeView === 'track' ? (
          /* VIEW 1.3: ORDER TRACKING TIMELINE PANEL */
          <OrderTrack currentLanguage={language} orders={orders} />
        ) : activeView === 'dashboard' && currentUser ? (
          /* VIEW 2: CUSTOMER MY ACCOUNT PORTAL */
          <CustomerDashboard
            currentUser={currentUser}
            currentLanguage={language}
            orders={orders}
            allProducts={products}
            favorites={favorites}
            onFavoriteToggle={handleFavoriteToggle}
            onProductClick={(p) => setSelectedProduct(p)}
            onUpdateUserName={(newName) => {
              if (currentUser) {
                setCurrentUser({ ...currentUser, name: newName });
              }
            }}
          />
        ) : (
          /* VIEW 3: MAIN MARKET SHOWCASE */
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* Carousel Promotional Header */}
            <Hero
              currentLanguage={language}
              heroSlides={heroSlides}
              onShopClick={() => {
                const galleryEl = document.getElementById('market-gallery-grid');
                if (galleryEl) galleryEl.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Catalog Sectors Filters */}
            <div className="space-y-6">
              <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-200 pb-5 ${
                isRtl ? 'sm:flex-row-reverse text-right' : 'sm:flex-row text-left'
              }`}>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black">{t.products}</h2>
                  <p className="text-xs text-slate-400 font-bold tracking-wide">{t.tagline}</p>
                </div>

                {/* Categories tab pills list */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-150/10 dark:bg-[#11141D] p-1.5 rounded-2xl border border-slate-100 dark:border-[#1E293B]">
                  {[
                    { id: 'all', label: t.all },
                    { id: 'bikes', label: t.bikes },
                    { id: 'cars', label: t.cars },
                    { id: 'electronics', label: t.electronics },
                    { id: 'accessories', label: t.accessories }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      id={`btn-category-tab-${cat.id}`}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setSearchQuery('');
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer ${
                        activeCategory === cat.id
                          ? 'bg-slate-900 text-white dark:bg-[var(--primary-color, #38bdf8)] dark:text-[#0A0C10] shadow-md'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid cards showcase */}
              <div id="market-gallery-grid">
                {searchFilteredProducts.length === 0 ? (
                  /* Empty state catalog */
                  <div className="bg-white dark:bg-[#111827] rounded-3xl p-16 text-center border border-slate-100 dark:border-slate-200 max-w-xl mx-auto space-y-4">
                    <AlertCircle className="w-12 h-12 text-slate-800 dark:text-slate-650 mx-auto animate-pulse" />
                    <p className="text-xs font-bold font-sans text-slate-450 leading-relaxed">
                      {language === 'ar' 
                        ? 'عذراً، لم يتم العثور على أي منتجات مطابقة لبحثك في المتجر حالياً.' 
                        : 'No matched products found matching search query.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-3">
                    {searchFilteredProducts.map(prod => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        currentLanguage={language}
                        isFavorite={favorites.includes(prod.id)}
                        onFavoriteToggle={() => handleFavoriteToggle(prod.id)}
                        onViewDetails={() => setSelectedProduct(prod)}
                        onQuickAdd={() => handleCartAdd(prod, 1)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* About & Trust indicators banner */}
            <div className="bg-[#11141D] rounded-3xl p-3 sm:p-12 text-white relative overflow-hidden border border-slate-150 dark:border-[#1E293B] shadow-sm mt-12">
              <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-br from-[var(--primary-color, #38bdf8)]/10 to-transparent rounded-full blur-3xl -mr-32 -mt-32"></div>
              
              <div className="relative max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--primary-color, #38bdf8)]/10 text-[var(--primary-color, #38bdf8)] border border-[var(--primary-color, #38bdf8)]/20 rounded-full text-[10px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.store_name}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black leading-snug">{language === 'ar' ? 'فلسفتنا وخدمتنا الفاخرة لمنتجاتنا 🤝' : 'Exquisite Commercial Standards 🤝'}</h3>
                <p className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed">
                  {language === 'ar' 
                    ? 'متجر رايفو ملتزم بتقديم المنتجات الفاخرة وسيارات المستقبل والدراجات الجبلية الاحترافية بأعلى معايير جودة الصناعة بضمان كامل 100٪ ودعم فني متاح لك على مدار الساعة لتسهيل التبادل والشراء الآمن.' 
                    : 'Ryvo Store delivers professional racing bicycles, autonomous electric vehicles, smart gadgets and leather selections tailored for global enthusiasts, supported with a secure 14-day substitution policy and 24/7 communications.'}
                </p>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer Area */}
      <footer className="bg-slate-100 dark:bg-[#0A0C10] border-t border-slate-200 dark:border-[#1E293B] py-12 mt-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-3 text-center space-y-6">
          
          {/* Certifications badges column */}
          <p className="text-xs font-black text-[var(--primary-color, #38bdf8)] tracking-wider">
            {t.features_certified}
          </p>

          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 max-w-md mx-auto">
            {t.footer_text}
          </p>

          {/* Dynamic Google SEO Audits (Toggle Sitemap/Robots modal dynamically) */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1 hover:text-amber-500 cursor-pointer" onClick={() => setSeoModalType('sitemap')}>
              <FileCode className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sitemap.xml (Google SEO)</span>
            </span>
            <span className="text-slate-850 dark:text-slate-700">|</span>
            <span className="flex items-center gap-1 hover:text-amber-500 cursor-pointer" onClick={() => setSeoModalType('robots')}>
              <FileCode className="w-3.5 h-3.5 text-sky-500" />
              <span>Robots.txt (Search Console)</span>
            </span>
          </div>

        </div>
      </footer>

      {/* ALL MODALS & FLYOUTS DIALOGS INJECTS */}

      {/* MODAL 1: Product detail view modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          currentLanguage={language}
          onClose={() => setSelectedProduct(null)}
          isFavorite={favorites.includes(selectedProduct.id)}
          onFavoriteToggle={() => handleFavoriteToggle(selectedProduct.id)}
          onAddToCart={(quantity, color) => {
            handleCartAdd(selectedProduct, quantity, color);
            setSelectedProduct(null);
          }}
          onBuyNow={(quantity, color) => {
            handleCartAdd(selectedProduct, quantity, color);
            setSelectedProduct(null);
            setIsCheckoutOpen(true);
          }}
          reviews={reviews}
          onAddReview={handleAddReview}
        />
      )}

      {/* MODAL 2: Cart drawer flying from side */}
      {isCartOpen && (
        <CartDrawer
          cart={cart}
          currentLanguage={language}
          onClose={() => setIsCartOpen(false)}
          onUpdateQty={handleUpdateCartQty}
          onRemoveItem={handleRemoveCartItem}
          onCheckout={() => {
            setIsCartOpen(false);
            if (!currentUser) setIsAuthOpen(true);
            else setIsCheckoutOpen(true);
          }}
        />
      )}

      {/* MODAL 3: Secure Checkout / billing checkout modal */}
      {isCheckoutOpen && cart.length > 0 && (
        <CheckoutModal
          cart={cart}
          currentLanguage={language}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderSuccess={handleOrderSuccess}
          userEmail={currentUser?.email || ''}
          userName={currentUser?.name || ''}
        />
      )}

      {/* MODAL 4: User sign-in authenticator modal */}
      {isAuthOpen && (
        <AuthModal
          currentLanguage={language}
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* MODAL 5: Google SEO XML & TXT audit inspect dialog */}
      {seoModalType && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setSeoModalType(null)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"></div>
          
          <div className="bg-white dark:bg-[#11141D] rounded-3xl p-6 sm:p-8 w-full max-w-2xl border border-slate-150 dark:border-[#1E293B] text-left font-sans text-xs relative select-all flex flex-col justify-between">
            <button onClick={() => setSeoModalType(null)} className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-50 dark:bg-slate-800"><XIcon /></button>
            
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm uppercase text-[var(--primary-color, #38bdf8)] tracking-wider flex items-center gap-1.5 border-b pb-3 border-slate-100 dark:border-[#1E293B]">
                <FileCode className="w-4 h-4" />
                <span>Google Search Console Metadata Parser Tool</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                This contains the live compiled compliant SEO outputs Google robots index:
              </p>
              
              <pre className="p-4 bg-slate-50 dark:bg-[#141d30] rounded-2xl overflow-x-auto text-[10px] font-mono border border-slate-150 text-slate-320 dark:text-amber-400 max-h-64">
                {seoModalType === 'sitemap' ? generateSitemapXML(products) : generateRobotsTXT()}
              </pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}
