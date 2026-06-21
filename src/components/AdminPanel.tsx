import React from 'react';
import { Language, Order, Product, User, Review } from '../types';
import { TRANSLATIONS } from '../constants/translations';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  Truck,
  RotateCcw,
  ShieldCheck,
  Search,
  Check,
  LayoutDashboard,
  BarChart3,
  MessageSquare,
  Sparkles,
  Mail,
  Send
} from 'lucide-react';
import { useState } from 'react';

interface AdminPanelProps {
  currentUser: User | null;
  currentLanguage: Language;
  products: Product[];
  orders: Order[];
  onAddProduct: (p: Product) => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (pId: string) => void;
  onUpdateOrderStatus: (ordId: string, status: Order['status']) => void;
  reviews: Review[];
  onDeleteReview: (revId: string) => void;
  shopLogo: string;
  onUpdateLogo: (logo: string) => void;
  brandColor: string;
  onUpdateBrandColor: (color: string) => void;
}

export default function AdminPanel({
  currentUser,
  currentLanguage,
  products,
  orders,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  reviews,
  onDeleteReview,
  shopLogo,
  onUpdateLogo,
  brandColor,
  onUpdateBrandColor
}: AdminPanelProps) {
  const t = TRANSLATIONS[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  const [adminTab, setAdminTab] = useState<'products' | 'orders' | 'analytics' | 'comments' | 'logo' | 'support' | 'users_passwords'>('products');
  const [adminSearch, setAdminSearch] = useState('');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Product Form states
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameFr, setNameFr] = useState('');
  const [descAr, setDescAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descFr, setDescFr] = useState('');
  const [featuresAr, setFeaturesAr] = useState('');
  const [featuresEn, setFeaturesEn] = useState('');
  const [featuresFr, setFeaturesFr] = useState('');
  const [tagAr, setTagAr] = useState('');
  const [tagEn, setTagEn] = useState('');
  const [tagFr, setTagFr] = useState('');
  const [image, setImage] = useState('');
  const [price, setPrice] = useState(10);
  const [stock, setStock] = useState(5);
  const [category, setCategory] = useState('bikes');

  // Success Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- Admin Support Management state ---
  const [supportMessages, setSupportMessages] = useState<any[]>(() => {
    const saved = localStorage.getItem('ryvo_support_messages');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'welcome',
        sender: 'support',
        text: currentLanguage === 'ar' 
          ? 'مرحباً بك في مركز دعم متجر رايفو! كيف يمكنني مساعدتك اليوم بخصوص طلباتك أو منتجاتنا الفاخرة؟ 👋'
          : 'Welcome to Ryvo Store Support Center! How can I assist you with your orders today? 👋',
        time: '12:00 م'
      }
    ];
  });
  const [supportReply, setSupportReply] = useState('');

  const sendSupportReply = () => {
    if (!supportReply.trim()) return;
    const newMsg = {
      id: `msg-support-reply-${Date.now()}`,
      sender: 'support',
      text: supportReply,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [...supportMessages, newMsg];
    setSupportMessages(updated);
    localStorage.setItem('ryvo_support_messages', JSON.stringify(updated));
    setSupportReply('');
    triggerToast(isRtl ? 'تم إرسال ردك كدعم فني بنجاح!' : 'Your support reply sent successfully!');
  };

  const clearSupportChat = () => {
    if (confirm(isRtl ? 'هل تود مسح الدردشة مع الدعم بالكامل؟' : 'Clear support conversation history?')) {
      const defaultMsg = [
        {
          id: 'welcome',
          sender: 'support',
          text: currentLanguage === 'ar' ? 'البدء من جديد 💬' : 'Restart conversation 💬',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setSupportMessages(defaultMsg);
      localStorage.setItem('ryvo_support_messages', JSON.stringify(defaultMsg));
      triggerToast(isRtl ? 'تم مسح سجل الدردشة' : 'Support conversation cleared.');
    }
  };

  // --- Admin Customers Management state ---
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('ryvo_registered_users');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { email: 'ryvo.shopa@gmail.com', name: 'أدمن رايفو', role: 'admin', favorites: [], password: '123456' },
      { email: 'customer@ryvo.shop', name: 'زبون تجريبي', role: 'customer', favorites: [], password: '123' }
    ];
  });
  
  // Selected customer for password change
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  // Notify Customer states
  const [notifyingOrder, setNotifyingOrder] = useState<Order | null>(null);
  const [notificationSubject, setNotificationSubject] = useState('');
  const [notificationBody, setNotificationBody] = useState('');

  const prepareNotification = (ord: Order) => {
    setNotifyingOrder(ord);
    
    const isArabic = currentLanguage === 'ar';
    const status = ord.status;
    let subject = '';
    let body = '';

    if (status === 'pending') {
      subject = isArabic 
        ? `تحديث بشأن طلبك من متجر رايفو رقم #${ord.id}` 
        : `Update on your Ryvo Store Order #${ord.id}`;
      body = isArabic
        ? `مرحباً ${ord.customer_name}،\n\nنشكرك على التسوق من متجر رايفو! لقد تلقينا طلبك رقم #${ord.id} بإجمالي قدره ${ord.total} ${t.currency}، وحالة الطلب حالياً هي قيد المراجعة.\n\nسنقوم بتحديثك فور تغيير حالة الطلب.\n\nأطيب التحيات،\nفريق رايفو`
        : `Hello ${ord.customer_name},\n\nThank you for shopping with Ryvo Store! We have received your order #${ord.id} totaling ${ord.total} ${t.currency} and it is currently pending review.\n\nWe will update you as soon as the status changes.\n\nBest regards,\nRyvo Team`;
    } else if (status === 'processing') {
      subject = isArabic 
        ? `طلبك من متجر رايفو رقم #${ord.id} قيد التحضير الآن` 
        : `Your Ryvo Store Order #${ord.id} is now processing`;
      body = isArabic
        ? `مرحباً ${ord.customer_name}،\n\nأخبار رائعة! طلبك من متجر رايفو رقم #${ord.id} هو الآن قيد التحضير والتجهيز. يقوم خبراؤنا بفحص وتجهيز معداتك الفاخرة بعناية.\n\nعنوان الشحن: ${ord.address}\n\nسنرسل لك تحديثاً آخر بمجرد شحنه.\n\nأطيب التحيات،\nفريق رايفو`
        : `Hello ${ord.customer_name},\n\nGreat news! Your Ryvo Store order #${ord.id} is now being prepared/processed. Our specialists are carefully inspecting and preparing your premium gear.\n\nShipping address: ${ord.address}\n\nWe will send another update when it ships.\n\nBest regards,\nRyvo Team`;
    } else if (status === 'shipped') {
      subject = isArabic 
        ? `تم شحن طلبك من متجر رايفو رقم #${ord.id}! 🚀` 
        : `Your Ryvo Store Order #${ord.id} has been shipped! 🚀`;
      body = isArabic
        ? `مرحباً ${ord.customer_name}،\n\nلقد تم تسليم طلبك من متجر رايفو رقم #${ord.id} إلى شركة الشحن وهو الآن في طريقه إليك!\n\nعنوان التوصيل: ${ord.address}\n\nيمكنك تتبع حالة طلبك مباشرة من لوحة التحكم الخاصة بك.\n\nأطيب التحيات،\nفريق رايفو`
        : `Hello ${ord.customer_name},\n\nYour Ryvo Store order #${ord.id} has been handed over to our shipping courier and is on its way to you!\n\nDelivery address: ${ord.address}\n\nTrack your order status directly inside your customer dashboard.\n\nBest regards,\nRyvo Team`;
    } else if (status === 'delivered') {
      subject = isArabic 
        ? `تم توصيل طلبك من متجر رايفو رقم #${ord.id} بنجاح! 🎉` 
        : `Ryvo Store Order #${ord.id} successfully delivered! 🎉`;
      body = isArabic
        ? `مرحباً ${ord.customer_name}،\n\nيسعدنا تأكيد أنه قد تم توصيل طلبك رقم #${ord.id} وتسليمه بنجاح!\n\nنتمنى أن تنال مشترياتك الفاخرة إعجابك ورضاك. يرجى إعلامنا إذا كان لديك أي تعليقات أو مراجعات تود مشاركتها.\n\nشكرًا لاختيارك متجر رايفو!\n\nأطيب التحيات،\nفريق رايفو`
        : `Hello ${ord.customer_name},\n\nWe are delighted to confirm that your order #${ord.id} has been successfully delivered and completed!\n\nWe hope you enjoy your premium purchase. Please let us know if you have any feedback or reviews to share.\n\nThank you for choosing Ryvo Store!\n\nBest regards,\nRyvo Team`;
    } else if (status === 'cancelled') {
      subject = isArabic 
        ? `تحديث: تم إلغاء طلبك من متجر رايفو رقم #${ord.id}` 
        : `Update: Ryvo Store Order #${ord.id} cancelled`;
      body = isArabic
        ? `مرحباً ${ord.customer_name}،\n\nنأسف لإبلاغك بأنه قد تم إلغاء طلبك من متجر رايفو رقم #${ord.id} بإجمالي قدره ${ord.total} ${t.currency}.\n\nإذا كان لديك أي أسئلة أو تود الاستفسار، فلا تتردد في الاتصال بنا عبر دردشة الدعم الفني.\n\nأطيب التحيات،\nفريق رايفو`
        : `Hello ${ord.customer_name},\n\nWe regret to inform you that your Ryvo Store order #${ord.id} totaling ${ord.total} ${t.currency} has been cancelled.\n\nIf you have any questions or require detailed information, please feel free to reach out to our support chat.\n\nBest regards,\nRyvo Team`;
    }

    setNotificationSubject(subject);
    setNotificationBody(body);
  };

  const handleSendNotification = () => {
    if (!notifyingOrder) return;
    if (!notificationSubject.trim() || !notificationBody.trim()) {
      triggerToast(isRtl ? 'يرجى ملء عنوان ومضمون الإشعار!' : 'Please fill out both the subject and the body!');
      return;
    }

    // Read current emails
    let currentEmails: any[] = [];
    const saved = localStorage.getItem('ryvo_customer_emails');
    if (saved) {
      try { currentEmails = JSON.parse(saved); } catch (e) {}
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newNotificationEmail = {
      id: `email-notification-${Math.floor(Math.random() * 9999999)}-${Date.now()}`,
      to: notifyingOrder.user_email,
      subject: notificationSubject.trim(),
      body: notificationBody.trim(),
      date: formattedDate,
      time: formattedTime,
      read: false
    };

    const finalEmails = [newNotificationEmail, ...currentEmails];
    localStorage.setItem('ryvo_customer_emails', JSON.stringify(finalEmails));

    triggerToast(isRtl ? 'تم إرسال إشعار تحديث الطلب للعميل بنجاح! 📨' : 'Order update notification sent successfully to customer! 📨');
    setNotifyingOrder(null);
  };

  const handlePasswordChangeByAdmin = () => {
    if (!selectedUserEmail) {
      triggerToast(isRtl ? 'يرجى اختيار بريد العميل!' : 'Please select a customer email first!');
      return;
    }
    if (!newPassword.trim()) {
      triggerToast(isRtl ? 'يرجى كتابة كلمة المرور الجديدة!' : 'Please enter the new password!');
      return;
    }
    const updated = registeredUsers.map(u => {
      if (u.email.toLowerCase() === selectedUserEmail.toLowerCase()) {
        return { ...u, password: newPassword };
      }
      return u;
    });
    setRegisteredUsers(updated);
    localStorage.setItem('ryvo_registered_users', JSON.stringify(updated));
    setNewPassword('');
    triggerToast(isRtl ? 'تم تغيير كلمة مرور العميل بنجاح!' : 'Customer password changed successfully!');
  };

  // Group emails messaging
  const [groupSubjects, setGroupSubjects] = useState('');
  const [groupBody, setGroupBody] = useState('');
  const [selectedGroupEmails, setSelectedGroupEmails] = useState<string[]>([]);

  const toggleGroupEmailSelection = (email: string) => {
    if (selectedGroupEmails.includes(email)) {
      setSelectedGroupEmails(selectedGroupEmails.filter(e => e !== email));
    } else {
      setSelectedGroupEmails([...selectedGroupEmails, email]);
    }
  };

  const sendGroupEmail = () => {
    if (selectedGroupEmails.length === 0) {
      triggerToast(isRtl ? 'يرجى اختيار مستلم واحد على الأقل!' : 'Please select at least one recipient!');
      return;
    }
    if (!groupSubjects.trim() || !groupBody.trim()) {
      triggerToast(isRtl ? 'يرجى تعبئة عنوان ومضمون الرسالة!' : 'Please fulfill email subject and body text!');
      return;
    }
    
    // Read current emails
    let currentEmails: any[] = [];
    const saved = localStorage.getItem('ryvo_customer_emails');
    if (saved) {
      try { currentEmails = JSON.parse(saved); } catch (e) {}
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newSimulatedEmails = selectedGroupEmails.map(email => ({
      id: `email-group-${Math.floor(Math.random() * 9999999)}-${Date.now()}`,
      to: email,
      subject: groupSubjects,
      body: groupBody,
      date: formattedDate,
      time: formattedTime
    }));

    const finalEmails = [...currentEmails, ...newSimulatedEmails];
    localStorage.setItem('ryvo_customer_emails', JSON.stringify(finalEmails));
    
    setGroupSubjects('');
    setGroupBody('');
    setSelectedGroupEmails([]);
    triggerToast(isRtl ? 'تم إرسال الرسالة الجماعية لبريد العملاء بنجاح! 📨' : 'Group message sent to customers successfully! 📨');
  };

  if (!currentUser || currentUser.role !== 'admin') return null;

  // Filter lists
  const filteredProducts = products.filter(p => {
    const term = adminSearch.toLowerCase();
    return p.name_ar.toLowerCase().includes(term) || p.name_en.toLowerCase().includes(term) || p.name_fr.toLowerCase().includes(term);
  });

  // Calculate high stats
  const totalSalesVal = orders.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + o.total, 0);
  const activeOrdersCount = orders.length;
  const productsCount = products.length;
  const visitorsSimulationCount = 1290;

  // Edit action
  const startEditing = (p: Product) => {
    setEditingId(p.id);
    setNameAr(p.name_ar);
    setNameEn(p.name_en);
    setNameFr(p.name_fr);
    setDescAr(p.description_ar);
    setDescEn(p.description_en);
    setDescFr(p.description_fr);
    setFeaturesAr(p.features_ar);
    setFeaturesEn(p.features_en);
    setFeaturesFr(p.features_fr);
    setTagAr(p.tag_ar);
    setTagEn(p.tag_en);
    setTagFr(p.tag_fr);
    setImage(p.image);
    setPrice(p.price);
    setStock(p.stock);
    setCategory(p.category);
    
    setShowForm(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setNameAr('');
    setNameEn('');
    setNameFr('');
    setDescAr('');
    setDescEn('');
    setDescFr('');
    setFeaturesAr('');
    setFeaturesEn('');
    setFeaturesFr('');
    setTagAr('');
    setTagEn('');
    setTagFr('');
    setImage('');
    setPrice(10);
    setStock(5);
    setCategory('bikes');
    setShowForm(false);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      // Editing
      const updated: Product = {
        id: editingId,
        name_ar: nameAr,
        name_en: nameEn,
        name_fr: nameFr,
        description_ar: descAr,
        description_en: descEn,
        description_fr: descFr,
        features_ar: featuresAr,
        features_en: featuresEn,
        features_fr: featuresFr,
        tag_ar: tagAr,
        tag_en: tagEn,
        tag_fr: tagFr,
        image,
        price,
        stock,
        category,
        rating_sum: 25,
        rating_count: 5
      };

      onUpdateProduct(updated);
      triggerToast(currentLanguage === 'ar' ? 'تم تعديل المنتج الفاخر وحفظه بنجاح!' : 'Product setup successfully modified!');
    } else {
      // Submitting new
      const uniqueId = `prod-${Math.floor(100 + Math.random() * 900)}`;
      const brandNew: Product = {
        id: uniqueId,
        name_ar: nameAr,
        name_en: nameEn,
        name_fr: nameFr,
        description_ar: descAr,
        description_en: descEn,
        description_fr: descFr,
        features_ar: featuresAr,
        features_en: featuresEn,
        features_fr: featuresFr,
        tag_ar: tagAr || (currentLanguage === 'ar' ? 'جديد' : 'New'),
        tag_en: tagEn || 'New',
        tag_fr: tagFr || 'Nouveau',
        image: image || 'https://images.unsplash.com/photo-1523275335684-87898b6baf30?auto=format&fit=crop&w=800&q=80',
        price,
        stock,
        category,
        rating_sum: 5,
        rating_count: 1
      };

      onAddProduct(brandNew);
      triggerToast(currentLanguage === 'ar' ? 'تم إضافة المنتج الفاخر وعرضه في المتجر للبيع!' : 'New product successfully published to catalog!');
    }

    resetForm();
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDelete = (pId: string) => {
    if (confirm(t.admin_confirm_delete)) {
      onDeleteProduct(pId);
      triggerToast(currentLanguage === 'ar' ? 'تم مسح وحذف المنتج تماماً من السجلات.' : 'Selected item deleted successfully.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-3 py-6 text-slate-800 dark:text-gray-100">
      
      {/* Title Panel */}
      <div className="bg-[#1e293b] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden mb-3 shadow-sm">
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-br from-rose-500/10 to-amber-500/20 rounded-full blur-3xl -mr-12 -mt-12"></div>
        <div className={`relative ${isRtl ? 'text-right' : 'text-left'} space-y-2`}>
          <h2 className="text-xl sm:text-2xl font-black font-sans bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">
            {t.admin_title}
          </h2>
          <p className="text-xs text-slate-800">
            {t.admin_subtitle}
          </p>
        </div>
      </div>

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-3 text-left font-sans">
        
        {/* Sales */}
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl p-5 border border-slate-100 dark:border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">{t.admin_total_sales}</span>
            <strong className="text-lg sm:text-xl font-black text-rose-500 font-sans">{totalSalesVal} <span className="text-[10px] font-bold">{t.currency}</span></strong>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500/15 to-orange-500/5 text-rose-500 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Orders count */}
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl p-5 border border-slate-100 dark:border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">{t.admin_total_orders}</span>
            <strong className="text-lg sm:text-xl font-black text-amber-500 font-sans">{activeOrdersCount}</strong>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/15 to-orange-500/5 text-amber-500 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Products count */}
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl p-5 border border-slate-100 dark:border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">{t.admin_total_products}</span>
            <strong className="text-lg sm:text-xl font-black text-indigo-505 dark:text-indigo-400 font-sans">{productsCount}</strong>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/15 to-blue-500/5 text-indigo-500 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Simulated Visitors count */}
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl p-5 border border-slate-100 dark:border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">{t.admin_active_users}</span>
            <strong className="text-lg sm:text-xl font-black text-emerald-500 font-sans">{visitorsSimulationCount}</strong>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/15 to-teal-500/5 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 animate-pulse" />
          </div>
        </div>

      </div>

      {/* Toast Alert confirmation notifier */}
      {toastMessage && (
        <div className="p-4 bg-emerald-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-500/20 fixed bottom-6 left-6 z-50 animate-bounce flex items-center gap-1.5">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Administrative View selectors tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 gap-1 mb-3 max-w-5xl mx-auto flex-wrap sm:flex-nowrap justify-center">
        <button
          id="btn-admin-tab-products"
          onClick={() => setAdminTab('products')}
          className={`flex-1 py-3 px-2 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            adminTab === 'products'
              ? 'bg-white dark:bg-[#131a29] text-slate-900 dark:text-amber-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{t.admin_tab_products}</span>
        </button>

        <button
          id="btn-admin-tab-orders"
          onClick={() => setAdminTab('orders')}
          className={`flex-1 py-3 px-2 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            adminTab === 'orders'
              ? 'bg-white dark:bg-[#131a29] text-slate-900 dark:text-amber-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{t.admin_tab_orders}</span>
        </button>

        <button
          id="btn-admin-tab-analytics"
          onClick={() => setAdminTab('analytics')}
          className={`flex-1 py-3 px-2 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            adminTab === 'analytics'
              ? 'bg-white dark:bg-[#131a29] text-slate-900 dark:text-amber-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{t.admin_tab_sales}</span>
        </button>

        <button
          id="btn-admin-tab-comments"
          onClick={() => setAdminTab('comments')}
          className={`flex-1 py-3 px-2 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            adminTab === 'comments'
              ? 'bg-white dark:bg-[#131a29] text-slate-900 dark:text-amber-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{isRtl ? 'التعليقات' : 'Reviews'}</span>
        </button>

        <button
          id="btn-admin-tab-support"
          onClick={() => setAdminTab('support')}
          className={`flex-1 py-3 px-2 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            adminTab === 'support'
              ? 'bg-white dark:bg-[#131a29] text-slate-900 dark:text-amber-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-500" />
          <span>{isRtl ? 'الدعم الفني 🛠' : 'Support tech 🛠'}</span>
        </button>

        <button
          id="btn-admin-tab-users-passwords"
          onClick={() => setAdminTab('users_passwords')}
          className={`flex-1 py-3 px-2 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            adminTab === 'users_passwords'
              ? 'bg-white dark:bg-[#131a29] text-slate-900 dark:text-amber-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-[var(--primary-color, #38bdf8)]" />
          <span>{isRtl ? 'إدارة العملاء 👤' : 'Customers 👤'}</span>
        </button>

        <button
          id="btn-admin-tab-logo"
          onClick={() => setAdminTab('logo')}
          className={`flex-1 py-3 px-2 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            adminTab === 'logo'
              ? 'bg-white dark:bg-[#131a29] text-slate-900 dark:text-amber-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{t.admin_tab_logo || 'تخصيص الشعار 🎨'}</span>
        </button>
      </div>

      {/* PANELS WORKSPACE */}
      <div className="animate-in fade-in duration-350">
        
        {/* PANEL A: PRODUCTS SYSTEM & FORM */}
        {adminTab === 'products' && (
          <div className="space-y-6">
            
            {/* Form Toggle & search bar row */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                id="btn-admin-form-toggle"
                onClick={() => {
                  if (showForm) resetForm();
                  else setShowForm(true);
                }}
                className="px-6 py-3 bg-slate-900 dark:bg-amber-500 hover:opacity-90 text-white dark:text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>{showForm ? t.close_btn : t.admin_add_product}</span>
              </button>

              <div className="relative w-full max-w-sm">
                <div className={`absolute inset-y-0 ${isRtl ? 'left-3' : 'right-3'} flex items-center pointer-events-none text-slate-400`}>
                  <Search className="w-4 h-4" />
                </div>
                <input
                  id="admin-product-search"
                  type="text"
                  placeholder={t.admin_search_product}
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-amber-400 outline-none text-slate-800 dark:text-white transition-all ${
                    isRtl ? 'pr-4 pl-10 text-right' : 'pl-4 pr-10 text-left'
                  }`}
                />
              </div>
            </div>

            {/* EXPANDABLE ADD/EDIT PRODUCT FORM */}
            {showForm && (
              <div className="bg-slate-50 dark:bg-[#131b2d] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-200 animate-in zoom-in-95 duration-200 text-left">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-amber-500 border-b border-slate-250 dark:border-slate-200 pb-3 mb-6 flex items-center gap-1.5">
                  <Package className="w-4 h-4" />
                  <span>{editingId ? t.admin_edit_product : t.admin_add_product}</span>
                </h3>

                <form onSubmit={handleProductSubmit} className="space-y-4 font-sans text-xs">
                  
                  {/* Name inputs trilang */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">{t.p_name_ar}</label>
                      <input type="text" required value={nameAr} onChange={e => setNameAr(e.target.value)} className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-bold" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">{t.p_name_en}</label>
                      <input type="text" required value={nameEn} onChange={e => setNameEn(e.target.value)} className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-bold" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">{t.p_name_fr}</label>
                      <input type="text" required value={nameFr} onChange={e => setNameFr(e.target.value)} className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-bold" />
                    </div>
                  </div>

                  {/* Descriptions trilang */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">{t.p_desc_ar}</label>
                      <textarea required value={descAr} onChange={e => setDescAr(e.target.value)} rows={3} className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">{t.p_desc_en}</label>
                      <textarea required value={descEn} onChange={e => setDescEn(e.target.value)} rows={3} className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">{t.p_desc_fr}</label>
                      <textarea required value={descFr} onChange={e => setDescFr(e.target.value)} rows={3} className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" />
                    </div>
                  </div>

                  {/* Features specifications parsed dynamically */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">{t.p_feat_ar}</label>
                      <input type="text" value={featuresAr} onChange={e => setFeaturesAr(e.target.value)} className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">{t.p_feat_en}</label>
                      <input type="text" value={featuresEn} onChange={e => setFeaturesEn(e.target.value)} className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">{t.p_feat_fr}</label>
                      <input type="text" value={featuresFr} onChange={e => setFeaturesFr(e.target.value)} className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" />
                    </div>
                  </div>

                  {/* Tags trilang */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">{t.p_tag_ar}</label>
                      <input type="text" value={tagAr} onChange={e => setTagAr(e.target.value)} className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">{t.p_tag_en}</label>
                      <input type="text" value={tagEn} onChange={e => setTagEn(e.target.value)} className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">{t.p_tag_fr}</label>
                      <input type="text" value={tagFr} onChange={e => setTagFr(e.target.value)} className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" />
                    </div>
                  </div>

                  {/* Price, Stock, Category, Image */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">{t.p_price}</label>
                      <input type="number" required min={1} value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-bold text-rose-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">{t.p_stock}</label>
                      <input type="number" required min={0} value={stock} onChange={e => setStock(Number(e.target.value))} className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-bold" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">{t.p_category}</label>
                      <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-bold font-sans">
                        <option value="bikes">{t.bikes}</option>
                        <option value="cars">{t.cars}</option>
                        <option value="electronics">{t.electronics}</option>
                        <option value="accessories">{t.accessories}</option>
                      </select>
                    </div>
                    <div className="space-y-1 sm:col-span-1">
                      <label className="font-bold text-slate-400">{t.p_image || 'صورة المنتج'}</label>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-200 hover:border-[var(--primary-color, #38bdf8)] transition-all cursor-pointer font-extrabold text-[10px] text-slate-500 dark:text-slate-400 overflow-hidden truncate">
                          <span>{image ? '✓ تم الرفع' : '📥 ارفع الصورة من جهازك'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setImage(reader.result as string);
                                  triggerToast(currentLanguage === 'ar' ? 'تم اختيار الصورة وتحميلها بنجاح!' : 'Local image successfully parsed!');
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        <input 
                          type="text" 
                          value={image} 
                          onChange={e => setImage(e.target.value)} 
                          placeholder="أو الصق رابط صورة..." 
                          className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-[10px]" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                    <span>{t.csrf_protective}</span>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button id="btn-admin-submit" type="submit" className="px-6 py-3.5 bg-slate-900 hover:bg-slate-850 dark:bg-amber-500 text-white dark:text-slate-900 font-black rounded-xl cursor-pointer">
                      {t.admin_save_product}
                    </button>
                    <button id="btn-admin-cancel" type="button" onClick={resetForm} className="px-6 py-3.5 bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-800 rounded-xl cursor-pointer">
                      {t.close_btn}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* PRODUCTS LOG DIRECTORY LIST */}
            <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-100 dark:border-slate-200/80 shadow-sm overflow-hidden text-xs text-left">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] font-sans">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#162139] text-slate-400 font-bold border-b border-slate-100 dark:border-slate-200 uppercase tracking-widest text-[10px]">
                      <th className="p-4">{t.p_image}</th>
                      <th className="p-4">{t.fullname_label}</th>
                      <th className="p-4">{t.p_category}</th>
                      <th className="p-4">{t.price}</th>
                      <th className="p-4">{t.stock}</th>
                      <th className="p-4 text-center">{t.admin_order_actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60 font-semibold text-slate-700 dark:text-slate-800">
                    {filteredProducts.map(p => {
                      const name = currentLanguage === 'ar' ? p.name_ar : currentLanguage === 'fr' ? p.name_fr : p.name_en;
                      return (
                        <tr key={p.id} id={`admin-product-row-${p.id}`} className="hover:bg-slate-50/50 dark:hover:bg-[#18233d]/40 transition-colors">
                          <td className="p-4">
                            <img src={p.image} className="w-10 h-10 object-cover rounded-lg bg-slate-50 border p-0.5" referrerPolicy="no-referrer" />
                          </td>
                          <td className="p-4 font-bold text-slate-900 dark:text-gray-100">{name}</td>
                          <td className="p-4 uppercase text-[10px] tracking-wider text-amber-500 font-extrabold">{t[p.category] || p.category}</td>
                          <td className="p-4 text-rose-500 font-black">{p.price} {t.currency}</td>
                          <td className="p-4 font-black">{p.stock}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                id={`btn-admin-edit-${p.id}`}
                                onClick={() => startEditing(p)}
                                className="p-2 bg-slate-100 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-amber-400 dark:hover:text-slate-950 rounded-lg hover:text-white transition-colors cursor-pointer"
                                title={t.admin_edit_product}
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                id={`btn-admin-delete-${p.id}`}
                                onClick={() => handleDelete(p.id)}
                                className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                                title={t.admin_delete_product}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* PANEL B: ORDERS MANAGEMENT QUEUE */}
        {adminTab === 'orders' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="bg-white dark:bg-[#111827] rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-200/80 space-y-4 max-w-xl mx-auto">
                <ShoppingBag className="w-12 h-12 text-slate-800 dark:text-slate-600 mx-auto" />
                <p className="text-xs font-bold text-slate-450 leading-relaxed">{t.admin_no_orders}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 text-xs text-left">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    id={`admin-order-card-${ord.id}`}
                    className="bg-white dark:bg-[#131b2e] rounded-3xl p-6 border border-slate-100 dark:border-slate-200/80 shadow-sm space-y-4"
                  >
                    
                    {/* Order header item details */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-150 dark:border-slate-200 pb-4">
                      <div className="space-y-1">
                        <small className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">{t.dashboard_order_id}</small>
                        <strong className="text-sm font-sans font-black text-rose-505">{ord.id}</strong>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <h4 className="font-bold text-slate-900 dark:text-white">{ord.customer_name}</h4>
                          <span className="text-[10px] text-slate-450 font-medium font-sans">{ord.user_email} • {ord.phone}</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          ord.status === 'delivered' 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : ord.status === 'shipped' 
                            ? 'bg-amber-500/10 text-amber-500' 
                            : ord.status === 'cancelled' 
                            ? 'bg-rose-500/10 text-rose-500' 
                            : 'bg-indigo-500/10 text-indigo-500'
                        }`}>
                          {t[`dashboard_status_${ord.status}`] || ord.status}
                        </span>
                      </div>
                    </div>

                    {/* Shipping Address coordinates */}
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      <strong className="text-slate-400 uppercase tracking-widest text-[10px]">{t.address_label}:</strong> {ord.address}
                    </p>

                    {/* Deliverable Items listed */}
                    <div className="space-y-2 text-xs font-semibold">
                      {ord.items.map((it, i) => (
                        <div key={i} className="flex justify-between text-slate-600 dark:text-slate-850 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-200/60">
                          <span>{it.name} <strong className="text-slate-400">x{it.quantity}</strong></span>
                          <span className="font-bold text-slate-800 dark:text-white">{it.price * it.quantity} {t.currency}</span>
                        </div>
                      ))}
                    </div>

                    {/* Total & Action Fulfiller triggers */}
                    <div className="border-t border-slate-50 dark:border-slate-200 pt-4 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase block">{t.total}</span>
                        <span className="text-base font-black text-rose-500">{ord.total} {t.currency}</span>
                      </div>

                      {/* State update controls */}
                      <div className="flex items-center gap-2">
                        <button
                          id={`btn-fulfill-pending-${ord.id}`}
                          onClick={() => onUpdateOrderStatus(ord.id, 'processing')}
                          disabled={ord.status === 'processing' || ord.status === 'cancelled' || ord.status === 'delivered'}
                          className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase cursor-pointer text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{t.dashboard_status_processing}</span>
                        </button>
                        
                        <button
                          id={`btn-fulfill-ship-${ord.id}`}
                          onClick={() => onUpdateOrderStatus(ord.id, 'shipped')}
                          disabled={ord.status === 'shipped' || ord.status === 'cancelled' || ord.status === 'delivered'}
                          className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase cursor-pointer text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1`}
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>{t.dashboard_status_shipped}</span>
                        </button>

                        <button
                          id={`btn-fulfill-deliver-${ord.id}`}
                          onClick={() => onUpdateOrderStatus(ord.id, 'delivered')}
                          disabled={ord.status === 'delivered' || ord.status === 'cancelled'}
                          className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase cursor-pointer text-emerald-505 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{t.dashboard_status_delivered}</span>
                        </button>

                        <button
                          id={`btn-fulfill-cancel-${ord.id}`}
                          onClick={() => onUpdateOrderStatus(ord.id, 'cancelled')}
                          disabled={ord.status === 'cancelled' || ord.status === 'delivered'}
                          className="px-3 py-2 text-rose-500 text-[10px] font-black hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                        >
                          {t.dashboard_status_cancelled}
                        </button>

                        <button
                          type="button"
                          id={`btn-notify-customer-${ord.id}`}
                          onClick={() => prepareNotification(ord)}
                          className="px-3 py-2 bg-[var(--primary-color)]/10 hover:bg-[var(--primary-color)] text-[var(--primary-color)] hover:text-slate-950 text-[10px] font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-[var(--primary-color)]/20 text-center uppercase"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>{isRtl ? 'إشعار العميل' : 'Notify Customer'}</span>
                        </button>

                        <button
                          type="button"
                          id={`btn-print-receipt-${ord.id}`}
                          onClick={() => setPrintingOrder(ord)}
                          className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-slate-950 text-[10px] font-black rounded-xl transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>🖨️</span>
                          <span>{isRtl ? 'طباعة الفاتورة' : 'Print Invoice'}</span>
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PANEL C: KPI SALES ANALYTICS CHART */}
        {adminTab === 'analytics' && (
          <div className="bg-white dark:bg-[#131b2e] rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-200/80 shadow-sm text-left animate-in zoom-in-95 duration-200">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-amber-500 border-b border-slate-100 dark:border-slate-200 pb-3 mb-6 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              <span>{t.admin_tab_sales}</span>
            </h3>

            {/* Custom crafted SVG bar columns bar graph */}
            <div className="space-y-6">
              <p className="text-xs text-slate-450 leading-relaxed font-sans max-w-xl">
                {currentLanguage === 'ar' 
                  ? 'مخطط المبيعات اليومية لرايفو ستور. يتم قياس المبيعات الإجمالية استجابةً للطلبات المحققة والآمنة لتتبع العائد والنمو التجاري.'
                  : 'Daily consolidated sale metric chart for Ryvo Store. Evaluates verified checked-out totals across daily traffic periods to map commercial growth.'}
              </p>

              {/* Graphic container */}
              <div className="bg-slate-50 dark:bg-[#0c121e] rounded-2xl p-6 border border-slate-100 dark:border-slate-850 flex items-end justify-between h-64 select-none relative font-sans text-[10px] font-bold text-slate-400">
                
                {/* Horizontal guide lines */}
                <div className="absolute inset-x-0 top-1/4 border-t border-slate-205 dark:border-slate-200/50 pointer-events-none"></div>
                <div className="absolute inset-x-0 top-2/4 border-t border-slate-205 dark:border-slate-200/50 pointer-events-none"></div>
                <div className="absolute inset-x-0 top-3/4 border-t border-slate-205 dark:border-slate-200/50 pointer-events-none"></div>

                {/* Simulated Daily columns bar graph data */}
                {[
                  { day: 'Sun', sales: 4500, height: '40%' },
                  { day: 'Mon', sales: 8200, height: '65%' },
                  { day: 'Tue', sales: 12500, height: '90%' },
                  { day: 'Wed', sales: 7100, height: '55%' },
                  { day: 'Thu', sales: 14500, height: '100%', highlight: true },
                  { day: 'Fri', sales: 9000, height: '70%' },
                  { day: 'Sat', sales: 5200, height: '45%' },
                ].map((col, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-3 z-10 flex-1 group">
                    <span className="opacity-0 group-hover:opacity-100 text-[9px] text-[#1e293b] dark:text-amber-400 bg-[#e2e8f0] dark:bg-slate-800 px-1.5 py-0.5 rounded transition-all duration-300 font-bold">
                      {col.sales} SAR
                    </span>
                    <div
                      style={{ height: col.height }}
                      className={`w-8 sm:w-12 rounded-t-xl transition-all duration-500 hover:scale-x-105 cursor-pointer shadow-md ${
                        col.highlight 
                          ? 'bg-gradient-to-t from-orange-500 to-rose-500 shadow-rose-500/10' 
                          : 'bg-indigo-500 dark:bg-indigo-400'
                      }`}
                    ></div>
                    <span className="text-[10px] tracking-tight uppercase font-extrabold">{col.day}</span>
                  </div>
                ))}

              </div>

              {/* Statistics bottom row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-500 pt-4">
                <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400">{currentLanguage === 'ar' ? 'متوسط السلة الشرائية' : 'Average Basket Value'}</span>
                  <div className="text-sm font-black text-slate-800 dark:text-white mt-1">1,450 SAR</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400">{currentLanguage === 'ar' ? 'معدل التحويل المالي' : 'Conversion Rate'}</span>
                  <div className="text-sm font-black text-emerald-500 mt-1">+3.24%</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400">{currentLanguage === 'ar' ? 'تصنيف المبيعات المفضلة' : 'Top Performing Category'}</span>
                  <div className="text-sm font-black text-amber-500 mt-1">{t.bikes}</div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* PANEL D: COMMENTS & RATINGS MODERATION PANEL */}
        {adminTab === 'comments' && (
          <div className="bg-white dark:bg-[#131b2e] rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-200/80 shadow-md text-left animate-in zoom-in-95 duration-200 space-y-6">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-amber-500 border-b border-slate-100 dark:border-slate-200 pb-3 mb-6 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>{t.admin_tab_reviews || 'التعليقات والتقييمات 💬'}</span>
            </h3>

            <p className="text-xs text-slate-450 leading-relaxed font-sans max-w-xl">
              {currentLanguage === 'ar'
                ? 'شاهد والغي جميع تعليقات وتقييمات العملاء المضافة لمختلف المنتجات لحماية وتحسين تقييم تصفح متجر رايفو.'
                : 'Inspect and remove user ratings or reviews posted under active catalog items inside your dashboard database.'}
            </p>

            {reviews.length === 0 ? (
              <div className="p-3 text-center text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-205 dark:border-slate-200">
                {currentLanguage === 'ar' ? 'لا توجد تعليقات أو تقييمات مضافة حالياً.' : 'No customer reviews recorded yet in this store.'}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-200/80">
                <table className="w-full text-xs font-semibold text-slate-700 dark:text-slate-800">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-850 font-black text-slate-450 text-[10px] uppercase">
                    <tr>
                      <th className={`p-4 ${isRtl ? 'text-right' : 'text-left'}`}>{currentLanguage === 'ar' ? 'المنتج' : 'Product'}</th>
                      <th className={`p-4 ${isRtl ? 'text-right' : 'text-left'}`}>{currentLanguage === 'ar' ? 'الكاتب' : 'Author'}</th>
                      <th className={`p-4 ${isRtl ? 'text-right' : 'text-left'}`}>{currentLanguage === 'ar' ? 'التقييم' : 'Rating'}</th>
                      <th className={`p-4 ${isRtl ? 'text-right' : 'text-left'}`}>{currentLanguage === 'ar' ? 'التعليق' : 'Comment'}</th>
                      <th className="p-4 text-center">{currentLanguage === 'ar' ? 'تاريخه' : 'Date'}</th>
                      <th className="p-4 text-center">{currentLanguage === 'ar' ? 'الإجراء' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#0A0C10]">
                    {reviews.map((rev) => (
                      <tr key={rev.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="p-4 font-black text-slate-900 dark:text-white max-w-[150px] truncate">{rev.product_name}</td>
                        <td className="p-4 font-bold text-slate-800 dark:text-slate-300">{rev.name}</td>
                        <td className="p-4">
                          <div className="flex text-amber-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={`text-sm ${i < rev.rating ? '★' : '☆'}`} />
                            ))}
                          </div>
                        </td>
                        <td className="p-4 font-sans text-slate-500 max-w-[200px] truncate leading-relaxed" title={rev.text}>
                          {rev.text}
                        </td>
                        <td className="p-4 text-center text-[10px] text-slate-450 font-mono font-bold whitespace-nowrap">{rev.date}</td>
                        <td className="p-4 text-center font-sans">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(currentLanguage === 'ar' ? 'هل تود حذف هذا التعليق نهائياً وتعديل معدل تقييم المنتج الفاخر تلقائياً؟' : 'Delete this comment and auto-adjust product ratings code?')) {
                                onDeleteReview(rev.id);
                                triggerToast(currentLanguage === 'ar' ? 'تم حذف التعليق وإعادة احتساب تقييمات السلعة!' : 'Comment deleted successfully!');
                              }
                            }}
                            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all font-black text-[10px] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline-block -mt-1 ltr:mr-1 rtl:ml-1" />
                            <span>{currentLanguage === 'ar' ? 'حذف' : 'Delete'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PANEL E: BRAND LOGO STYLE CUSTOMIZER */}
        {adminTab === 'logo' && (
          <div className="bg-white dark:bg-[#131b2e] rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-200/80 shadow-md text-left animate-in zoom-in-95 duration-200 space-y-6">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-amber-500 border-b border-[#1E293B] pb-3 mb-6 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{t.admin_tab_logo || 'تخصيص شعار المتجر 🎨'}</span>
            </h3>

            <p className="text-xs text-slate-450 leading-relaxed font-sans max-w-xl">
              {currentLanguage === 'ar'
                ? 'خصص هوية وشعار متجر رايفو المتميز مباشرة من هذه اللوحة. يمكنك كتابة الشعار كروية نصية وسيقوم الهيدر بتنسيقه تلقائياً أو رفع صورة شعار مخصصة.'
                : 'Modify and customize your primary header brand identity slogan live or upload a fine brand logo image.'}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* PANEL E.1: LOGO DESIGN */}
              <div className="space-y-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase">
                    {currentLanguage === 'ar' ? 'اسم الشعار المطلوب (نصي):' : 'Desired Logo Branding Slogan (Text):'}
                  </label>
                  <input
                    type="text"
                    required
                    value={shopLogo.startsWith('data:image') || shopLogo.includes('http') ? '' : shopLogo}
                    onChange={(e) => {
                      onUpdateLogo(e.target.value);
                    }}
                    placeholder="مثال: RYVO STORE"
                    className="w-full p-3 bg-white dark:bg-[#0A0C10] border border-slate-200 dark:border-slate-200 focus:border-[var(--primary-color, #38bdf8)] text-xs font-bold rounded-xl outline-none text-slate-800 dark:text-gray-100 transition-all text-center uppercase tracking-widest"
                  />
                </div>

                <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                  <label className="block text-xs font-bold text-slate-400 uppercase">
                    {currentLanguage === 'ar' ? 'رفع شعار المتجر كصورة 🖼️:' : 'Upload Brand Logo Image 🖼️:'}
                  </label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              onUpdateLogo(reader.result);
                              triggerToast(currentLanguage === 'ar' ? 'تم تحديث صورة الشعار بنجاح!' : 'Logo image uploaded successfully!');
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="block w-full text-[10px] text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[var(--primary-color, #38bdf8)]/10 file:text-[var(--primary-color, #38bdf8)] hover:file:bg-[var(--primary-color, #38bdf8)]/20 cursor-pointer"
                    />
                    
                    <span className="text-[10px] text-slate-400 block font-semibold">{currentLanguage === 'ar' ? 'أو أدخل رابط مستند الصورة المباشر:' : 'Or paste a direct logo image URL:'}</span>
                    <input
                      type="text"
                      onChange={(e) => {
                        if (e.target.value.trim()) {
                          onUpdateLogo(e.target.value.trim());
                        }
                      }}
                      placeholder="https://..."
                      className="w-full p-2.5 bg-white dark:bg-[#0A0C10] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-white rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-[#0A0C10] border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-2">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                    {currentLanguage === 'ar' ? 'معاينة الشعار الحالي' : 'Live Header Visualizing'}
                  </span>
                  
                  {/* Visual rendering preview resembling Navbar header logo */}
                  <div className="p-3 bg-slate-50 dark:bg-[#11141D] rounded-xl border border-slate-100 dark:border-slate-850 w-full text-center flex items-center justify-center">
                    {shopLogo.startsWith('data:image') || shopLogo.includes('http') || shopLogo.includes('/') ? (
                      <img src={shopLogo} alt="Shop Logo" className="h-10 max-w-[150px] object-contain rounded-lg" referrerPolicy="no-referrer" />
                    ) : shopLogo.toUpperCase().includes('RYVO') ? (
                      <span className="text-lg font-black font-sans tracking-tight">
                        <span className="text-[var(--primary-color, #38bdf8)]">RYVO</span>
                        <span className="text-slate-900 dark:text-white">
                          {shopLogo.toUpperCase().replace('RYVO', '').trim() || 'STORE'}
                        </span>
                      </span>
                    ) : (
                      <span className="text-sm font-black tracking-widest bg-gradient-to-r from-[var(--primary-color, #38bdf8)] to-amber-500 bg-clip-text text-transparent uppercase font-sans">
                        {shopLogo}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* PANEL E.2: BRAND ACCENT COLOR DESIGN */}
              <div className="space-y-5 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-1">
                    {currentLanguage === 'ar' ? 'تعديل اللون الرئيسي للموقع 🎨' : 'Website Primary Brand Color 🎨'}
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    {currentLanguage === 'ar'
                      ? 'اختر أي لون ترغب به ليكون اللون الرئيسي المعتمد بجميع أقسام متجرك، الأزرار، الأيقونات، وحالات التمرير.'
                      : 'Choose your desired color to be the primary accent throughout your online store, applying to buttons, links, icons, and menus.'}
                  </p>
                </div>

                {/* Color input native selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase">
                    {currentLanguage === 'ar' ? 'اختر اللون يدوياً 🖌️:' : 'Choose Custom Color 🖌️:'}
                  </label>
                  <div className="flex items-center gap-3 bg-white dark:bg-[#0A0C10] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => onUpdateBrandColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-800 p-0 bg-transparent overflow-hidden"
                    />
                    <div>
                      <span className="text-xs font-mono font-black text-slate-700 dark:text-gray-300 uppercase block">
                        {brandColor}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold block">
                        {currentLanguage === 'ar' ? 'اضغط على المربع لفتح لوحة درجات الألوان اللامحدودة' : 'Click the color swatch to open unlimited spectrum'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Color preset collections */}
                <div className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-400 uppercase">
                    {currentLanguage === 'ar' ? 'أو اختر من مجموعات الألوان الفاخرة المجهزة ✨:' : 'Or Choose from Premium Styled Presets ✨:'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { name: currentLanguage === 'ar' ? 'سماوي جليدي' : 'Ice Blue', val: '#38bdf8' },
                      { name: currentLanguage === 'ar' ? 'أزرق ملكي' : 'Royal Blue', val: '#3572FF' },
                      { name: currentLanguage === 'ar' ? 'ذهبي ساطع' : 'Bright Gold', val: '#f59e0b' },
                      { name: currentLanguage === 'ar' ? 'زمردي ملوكي' : 'Royal Emerald', val: '#10b981' },
                      { name: currentLanguage === 'ar' ? 'وردي قرمزي' : 'Crimson Blush', val: '#e11d48' },
                      { name: currentLanguage === 'ar' ? 'بنفسجي فاخر' : 'Imperial Violet', val: '#8b5cf6' },
                    ].map((preset) => {
                      const isActive = brandColor.toLowerCase() === preset.val.toLowerCase();
                      return (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => onUpdateBrandColor(preset.val)}
                          className={`flex items-center gap-2 p-2 rounded-xl border transition-all text-left text-[10px] font-black cursor-pointer ${
                            isActive
                              ? 'bg-white dark:bg-black border-slate-350 dark:border-[var(--primary-color, #38bdf8)] shadow-sm scale-103'
                              : 'bg-white/50 dark:bg-black/35 border-slate-200 dark:border-slate-900 hover:scale-102 hover:border-slate-300'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-black/10 dark:border-white/15"
                            style={{ backgroundColor: preset.val }}
                          />
                          <span className="truncate text-slate-700 dark:text-gray-300">
                            {preset.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mini mockup rendering widget to show styling response */}
                <div className="p-4 bg-white dark:bg-[#0A0C10] rounded-xl border border-slate-150 dark:border-slate-800 flex flex-col gap-2.5 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brandColor }} />
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                      {currentLanguage === 'ar' ? 'معاينة حية لتأثير التغيير' : 'Live Interaction Feedback Mockup'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      style={{ backgroundColor: brandColor }}
                      className="px-3 py-1.5 rounded-lg text-[9px] font-black text-white hover:opacity-90 transition-all cursor-none"
                    >
                      {currentLanguage === 'ar' ? 'أضف للسلة 🛒' : 'Add to Cart 🛒'}
                    </button>
                    <button
                      type="button"
                      style={{ borderColor: brandColor, color: brandColor }}
                      className="px-3 py-1.5 rounded-lg text-[9px] font-black border bg-transparent hover:bg-slate-50 transition-all cursor-none"
                    >
                      {currentLanguage === 'ar' ? 'شراء الآن ⚡' : 'Buy Now ⚡'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL F: ADMIN SUPPORT HUB */}
        {adminTab === 'support' && (
          <div className="bg-white dark:bg-[#131b2e] rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-200/80 shadow-md text-left animate-in zoom-in-95 duration-200 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-4">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                <span>{isRtl ? 'الرد على استفسارات الدعم الفني 🛠️' : 'Reply to Technical Support Inquiries 🛠️'}</span>
              </h3>
              <button
                type="button"
                onClick={clearSupportChat}
                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-505 text-rose-505 hover:text-white text-xs font-black rounded-lg cursor-pointer transition-all"
              >
                {isRtl ? 'حذف السجل' : 'Clear Chat History'}
              </button>
            </div>

            <p className="text-xs text-slate-450 leading-relaxed font-sans max-w-xl">
              {isRtl 
                ? 'لوحة إدارة المحادثات الفورية. يمكنك كتابة والرد على استفسارات مستخدمي محادثة الدعم الفني لمتجر رايفو من هذه الأداة التفاعلية الحيوية.'
                : 'Help desk workstation. Draft and submit official responses directly into customer chat streams here.'}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Chat log visualization */}
              <div className="lg:col-span-2 border border-slate-150 dark:border-slate-200 rounded-2xl p-4 bg-slate-50 dark:bg-[#0A0C10] flex flex-col h-[400px]">
                <div id="admin-chat-header" className="pb-2 border-b border-slate-200 dark:border-slate-200 flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                  <span>{isRtl ? 'سجل المحادثة الحي' : 'Live Chat Dialog History'}</span>
                  <span className="text-emerald-500">{supportMessages.length} {isRtl ? 'رسالة' : 'messages'}</span>
                </div>

                <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
                  {supportMessages.length === 0 ? (
                    <div className="text-center py-12 text-slate-450 text-[11px] font-bold">
                      {isRtl ? 'لا يوجد رسائل حالياً.' : 'No messages found.'}
                    </div>
                  ) : (
                    supportMessages.map((msg: any) => (
                      <div key={msg.id} className={`flex flex-col max-w-[85%] ${msg.sender === 'support' ? 'ms-auto items-end' : 'me-auto items-start'}`}>
                        <div className={`p-3 rounded-2xl text-[11px] font-medium leading-relaxed ${
                          msg.sender === 'support' 
                            ? 'bg-slate-900 border border-slate-200 text-white' 
                            : 'bg-[var(--primary-color, #38bdf8)]/10 text-slate-850 dark:text-gray-100 border border-[var(--primary-color, #38bdf8)]/20'
                        }`}>
                          <p className="whitespace-pre-wrap text-left font-sans">{msg.text}</p>
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold mt-1 px-1">{msg.sender === 'support' ? (isRtl ? 'أنت (الدعم الفني)' : 'You (Support)') : (isRtl ? 'العميل' : 'Customer')} • {msg.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Submission panel */}
              <div className="border border-slate-150 dark:border-slate-200 rounded-2xl p-5 bg-white dark:bg-[#11141D] flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">{isRtl ? 'صندوق الرد السريع 📨' : 'Quick Response Console 📨'}</h4>
                  <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{isRtl ? 'اكتب ردك كدعم فني وسوف يظهر كرسالة مستلمة في نافذة دردشة العميل فوراً لمتابعة متطلباته واحتياجاته.' : 'Submit official technical support lines. Your text displays instantly under support stream.'}</p>
                  
                  <textarea
                    value={supportReply}
                    onChange={(e) => setSupportReply(e.target.value)}
                    placeholder={isRtl ? 'اكتب إجابتك هنا...' : 'Type your answer...'}
                    rows={6}
                    className="w-full mt-2 text-xs p-3 rounded-xl border bg-slate-50 dark:bg-[#0A0C10] border-slate-200 dark:border-slate-200 focus:border-emerald-500 text-slate-850 dark:text-white outline-none font-sans"
                  />
                </div>

                <button
                  type="button"
                  onClick={sendSupportReply}
                  disabled={!supportReply.trim()}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                >
                  {isRtl ? 'إرسال الإجابة كدعم فني 🚀' : 'Submit Support Reply 🚀'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* PANEL G: USER & CREDENTIAL BROADCAST CONTROL CENTER */}
        {adminTab === 'users_passwords' && (
          <div className="bg-white dark:bg-[#131b2e] rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-200/80 shadow-md text-left animate-in zoom-in-95 duration-200 space-y-3">
            
            {/* Header */}
            <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-[var(--primary-color, #38bdf8)] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[var(--primary-color, #38bdf8)]" />
                <span>{isRtl ? 'إدارة حسابات وجواز مرور العملاء والرسائل الجماعية 👤' : 'Identify Management & Bulk Virtual Broadcast Senders 👤'}</span>
              </h3>
            </div>

            <p className="text-xs text-slate-450 leading-relaxed max-w-xl font-sans">
              {isRtl 
                ? 'تحكم كامل من هادئة الاستجابة. تمكنك من استعراض البريد الإلكتروني للمسجلين، تعديل وتغيير كلمات المرور، أو تحديد مستلمين وإرسال بريد جماعي لهم.'
                : 'Account supervisor console. Search customer profiles, manually modify active logins or select recipients to trigger virtual inbox emails.'}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              
              {/* Column 1: Password Changer box */}
              <div className="border border-slate-150 dark:border-slate-200 rounded-2xl p-5 bg-slate-50 dark:bg-[#11141D] space-y-4">
                <h4 className="text-xs font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-200 pb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>{isRtl ? 'تغيير كلمة المرور للعميل 🔑' : 'Manually Override Customer Passwords 🔑'}</span>
                </h4>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400">{isRtl ? 'اختر حساب العميل المطلوب:' : 'Select Target Customer Profiling:'}</label>
                    <select
                      value={selectedUserEmail}
                      onChange={(e) => setSelectedUserEmail(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border bg-white dark:bg-[#0A0C10] border-slate-200 dark:border-slate-200 text-slate-850 dark:text-white outline-none"
                    >
                      <option value="">{isRtl ? '-- حدد بريد العميل --' : '-- Choose customer account --'}</option>
                      {registeredUsers.filter(u => u.role !== 'admin').map(u => (
                        <option key={u.email} value={u.email}>{u.name || 'سائل مجهول'} ({u.email})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 font-sans">
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400">{isRtl ? 'كلمة المرور الجديدة المقررة:' : 'Assign Decisive New Password:'}</label>
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={isRtl ? 'مثال: pass12345' : 'e.g. secureNew123'}
                      className="w-full text-xs p-3 rounded-xl border bg-white dark:bg-[#0A0C10] border-slate-200 dark:border-slate-200 text-slate-850 dark:text-white outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handlePasswordChangeByAdmin}
                    className="w-full py-3 bg-[var(--primary-color)] hover:opacity-90 text-slate-950 font-black text-xs rounded-xl cursor-pointer hover:shadow-lg transition-all uppercase"
                  >
                    {isRtl ? 'تغيير كلمة المرور وتحديث السجل 🔑' : 'Force Update Customer Password 🔑'}
                  </button>
                </div>
              </div>

              {/* Column 2: Bulk virtual email broadcasting */}
              <div className="border border-slate-150 dark:border-slate-200 rounded-2xl p-5 bg-slate-50 dark:bg-[#11141D] space-y-4">
                <h4 className="text-xs font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-200 pb-2 flex items-center justify-between">
                  <span>{isRtl ? 'إرسال رسالة جماعية لصناديق البريد 📩' : 'Virtual Bulk Email Broadcasting Hub 📩'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const allCusts = registeredUsers.filter(u => u.role !== 'admin').map(u => u.email);
                      setSelectedGroupEmails(allCusts);
                    }}
                    className="text-[9px] font-black uppercase text-amber-500 hover:underline"
                  >
                    {isRtl ? 'تحديد كل العملاء' : 'Select All Customers'}
                  </button>
                </h4>

                <div className="space-y-3">
                  
                  {/* Recipient Checklist */}
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400">{isRtl ? 'تحديد المستلمين بالنقرة:' : 'Recipients Checklist Selection:'}</label>
                    <div className="max-h-24 overflow-y-auto border border-slate-205 dark:border-slate-200 bg-white dark:bg-[#0A0C10] p-2.5 rounded-xl space-y-1.5">
                      {registeredUsers.filter(u => u.role !== 'admin').map(u => {
                        const isChecked = selectedGroupEmails.includes(u.email);
                        return (
                          <label key={u.email} className="flex items-center gap-2 cursor-pointer text-[10.5px]">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleGroupEmailSelection(u.email)}
                              className="rounded bg-slate-50 border-slate-200 text-[var(--primary-color, #38bdf8)] focus:ring-[var(--primary-color, #38bdf8)]"
                            />
                            <span className="truncate text-slate-800 dark:text-white font-sans">{u.name} ({u.email})</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1 font-sans">
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400">{isRtl ? 'عنوان بريد الرسالة الجماعية:' : 'Email Slogan Subject line:'}</label>
                    <input
                      type="text"
                      value={groupSubjects}
                      onChange={(e) => setGroupSubjects(e.target.value)}
                      placeholder={isRtl ? 'مثال: أسعار مخفضة وهدايا حصرية لك' : 'e.g. Mega Discount & Gift Store Campaign'}
                      className="w-full text-xs p-3 rounded-xl border bg-white dark:bg-[#0A0C10] text-slate-800 dark:text-white border-slate-200 dark:border-slate-200 outline-none"
                    />
                  </div>

                  <div className="space-y-1 font-sans">
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400">{isRtl ? 'محتوى الرسالة الجماعية:' : 'Detailed Message Body:'}</label>
                    <textarea
                      value={groupBody}
                      onChange={(e) => setGroupBody(e.target.value)}
                      placeholder={isRtl ? 'مرحباً، يسعدنا إبلاغك...' : 'Dear Customer, we are proud to launch...'}
                      rows={3}
                      className="w-full text-xs p-3 rounded-xl border bg-white dark:bg-[#0A0C10] text-slate-800 dark:text-white border-slate-200 dark:border-slate-200 outline-none font-sans"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={sendGroupEmail}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl cursor-pointer transition-all shadow-md uppercase"
                  >
                    {isRtl ? 'بث وإرسال لبريد المختارين 📨' : 'Broadcast to Recipients Inboxes 📨'}
                  </button>

                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* NOTIFY CUSTOMER MODAL */}
      {notifyingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#11141D] text-slate-800 dark:text-gray-100 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative border border-slate-205 dark:border-slate-800 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 text-left">
            
            {/* Header Action Row */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-105 dark:border-slate-805">
              <span className="text-xs font-black uppercase text-[var(--primary-color)] tracking-wider flex items-center gap-2">
                <Mail className="w-4 h-4 text-[var(--primary-color)]" />
                <span>{isRtl ? 'إصدار إشعار بريدي للعميل' : 'Notify Customer via Email'}</span>
              </span>
              <button 
                type="button"
                onClick={() => setNotifyingOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all text-xs"
              >
                ✕
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 py-4 flex-1 overflow-y-auto" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  {isRtl ? 'بريد المستلم' : 'Recipient Email'}
                </label>
                <input
                  type="text"
                  disabled
                  value={notifyingOrder.user_email}
                  className="w-full p-3 bg-slate-50 dark:bg-[#0A0C10] border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl text-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  {isRtl ? 'عنوان الرسالة' : 'Email Subject'}
                </label>
                <input
                  type="text"
                  value={notificationSubject}
                  onChange={(e) => setNotificationSubject(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-[#0A0C10] border border-slate-200 dark:border-slate-800 focus:border-[var(--primary-color)] text-xs font-bold rounded-xl text-slate-800 dark:text-gray-100 outline-none transition-all"
                  placeholder={isRtl ? 'أدخل عنوان الرسالة' : 'Enter email subject...'}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  {isRtl ? 'محتوى ومضمون الرسالة' : 'Notification Body'}
                </label>
                <textarea
                  rows={8}
                  value={notificationBody}
                  onChange={(e) => setNotificationBody(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-[#0A0C10] border border-slate-200 dark:border-slate-800 focus:border-[var(--primary-color)] text-xs font-semibold rounded-xl text-slate-800 dark:text-gray-100 outline-none transition-all leading-relaxed"
                  placeholder={isRtl ? 'أدخل تفاصيل التحديث هنا...' : 'Enter notification body details...'}
                />
              </div>

              {/* Pro tips badge */}
              <div className="p-3 bg-[var(--primary-color)]/5 border border-[var(--primary-color)]/10 rounded-xl">
                <p className="text-[10px] text-[var(--primary-color)] leading-relaxed font-semibold">
                  ℹ️ {isRtl 
                    ? 'هذا الإجراء سيقوم بحفظ وإرسال الرسالة إلى صندوق بريد العميل الافتراضي لمحاكاة التنبيه بالوسائل لضمان التحديث اللحظي!' 
                    : 'This action initiates and stores a simulated email to the customer\'s virtual inbox to ensure instant communication updates.'}
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 pt-3 border-t border-slate-105 dark:border-slate-800 justify-end" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
              <button
                type="button"
                onClick={() => setNotifyingOrder(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-gray-300 rounded-xl transition-all text-xs font-bold cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSendNotification}
                className="px-5 py-2.5 bg-[var(--primary-color)] hover:opacity-90 text-[#0A0C10] rounded-xl transition-all text-xs font-black cursor-pointer flex items-center gap-1.5 hover:shadow-[0_0_15px_rgba(var(--primary-color-rgb),0.3)] shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isRtl ? 'إرسال الإشعار' : 'Send Notification'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PRINT RECEIPT OVERLAY MODAL */}
      {printingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-xl p-3 shadow-2xl relative border border-slate-100 flex flex-col max-h-[90vh]">
            
            {/* Header Action Row */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 print:hidden">
              <span className="text-xs font-black uppercase text-amber-600 tracking-wider flex items-center gap-1.5">
                <span>🖨️</span>
                <span>{isRtl ? 'فاتورة الشراء الرسمية لعملاء رايفو' : 'Official Ryvo Customer Receipt'}</span>
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black rounded-xl cursor-pointer flex items-center gap-1 transition-all"
                >
                  <span>🖨️</span>
                  <span>{isRtl ? 'بدء الطباعة' : 'Print Invoice'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintingOrder(null)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-black rounded-xl cursor-pointer transition-all"
                >
                  {isRtl ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>

            {/* Printable Body */}
            <div id="printable-receipt-card" className="flex-1 overflow-y-auto py-6 font-sans space-y-6 text-left" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
              
              {/* Brand Logo & Shop info */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  {shopLogo.startsWith('data:image') || shopLogo.includes('http') || shopLogo.includes('/') ? (
                    <img src={shopLogo} alt="Logo" className="h-10 object-contain rounded-lg" referrerPolicy="no-referrer" />
                  ) : (
                    <h2 className="text-2xl font-black tracking-tight">{shopLogo}</h2>
                  )}
                  <p className="text-[10px] text-slate-400 font-bold">{isRtl ? 'علامة رايفو الفاخرة المعتمدة' : 'Official Verified Ryvo Outlet Service'}</p>
                </div>
                <div className="text-right text-[10px] text-slate-500 font-bold space-y-1" style={{ textAlign: isRtl ? 'left' : 'right' }}>
                  <div>{isRtl ? 'تاريخ الفاتورة:' : 'Receipt Date:'} {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  <div className="font-mono">{isRtl ? 'الرقم المرجعي للطلب:' : 'Order Code:'} #{printingOrder.id}</div>
                </div>
              </div>

              {/* Billing details / Customer profiling */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">{isRtl ? 'تفاصيل فوترة العميل والبريد الإلكتروني' : 'Customer Account & Billing Details'}</h4>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-700">
                  <div><strong>{isRtl ? 'اسم العميل الكامل:' : 'Customer Name:'}</strong> {printingOrder.customer_name}</div>
                  <div className="truncate"><strong>{isRtl ? 'البريد الإلكتروني:' : 'Billing Email:'}</strong> {printingOrder.user_email}</div>
                  <div><strong>{isRtl ? 'الهاتف المحمول:' : 'Phone Contact:'}</strong> {printingOrder.phone}</div>
                  <div><strong>{isRtl ? 'العنوان وتفاصيل الشحن:' : 'Shipping Address:'}</strong> {printingOrder.address}</div>
                </div>
              </div>

              {/* Items loop */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">{isRtl ? 'المنتجات المطلوبة وكمياتها' : 'Delivered Items Summary'}</h4>
                <div className="border border-slate-100 rounded-2xl overflow-hidden text-[11px]">
                  <table className="w-full">
                    <thead className="bg-[#11141D] text-white font-black text-[10px] uppercase">
                      <tr>
                        <th className="p-3 text-left" style={{ textAlign: isRtl ? 'right' : 'left' }}>{isRtl ? 'المنتج الفاخر واللون' : 'Product name & selected color'}</th>
                        <th className="p-3 text-center">{isRtl ? 'الكمية' : 'Qty'}</th>
                        <th className="p-3 text-right" style={{ textAlign: isRtl ? 'left' : 'right' }}>{isRtl ? 'المجموع الفرعي' : 'Line Total'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white font-semibold text-slate-700">
                      {printingOrder.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{it.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold block">{isRtl ? 'اللون المحدد:' : 'Color:'} {it.color || 'أسود'}</span>
                            <span className="text-[10px] text-slate-400 font-bold block">{isRtl ? 'سعر المفرد:' : 'Unit price:'} {it.price} {t.currency}</span>
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-slate-900">{it.quantity}</td>
                          <td className="p-3 text-right text-slate-900 font-black font-mono" style={{ textAlign: isRtl ? 'left' : 'right' }}>{it.price * it.quantity} {t.currency}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-between items-center border-t border-slate-100 pt-5">
                <span className="text-xs font-black uppercase text-slate-500">{isRtl ? 'المجموع النهائي الكلي شامل الضريبة:' : 'Fully Paid Total Sum (VAT Inclusive):'}</span>
                <div className="text-right">
                  <span className="text-xl font-black text-rose-500 font-mono">{printingOrder.total} {t.currency}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-200 pt-4 text-center">
                <p className="text-[10px] text-slate-400 font-black tracking-wide uppercase">{isRtl ? 'شكرًا لتسوقك من متجر رايفو الفاخر! نأمل رؤيتك مجددًا ✨' : 'Thank you for shopping at premium Ryvo store outlets! ✨'}</p>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
