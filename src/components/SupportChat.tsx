import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants/translations';
import { Send, User, MessageSquare, ShieldAlert, BadgeCheck, Sparkles } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'support';
  text: string;
  time: string;
}

interface SupportChatProps {
  currentLanguage: Language;
}

export default function SupportChat({ currentLanguage }: SupportChatProps) {
  const t = TRANSLATIONS[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('ryvo_support_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'welcome',
        sender: 'support',
        text: currentLanguage === 'ar' 
          ? 'مرحباً بك في مركز دعم متجر رايفو! كيف يمكنني مساعدتك اليوم بخصوص طلباتك أو منتجاتنا الفاخرة؟ 👋'
          : currentLanguage === 'fr'
          ? 'Bienvenue au centre de support Ryvo Store ! Comment puis-je vous aider aujourd\'hui ? 👋'
          : 'Welcome to Ryvo Store Support Center! How can I assist you with your orders or premium catalog today? 👋',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('ryvo_support_messages', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate smart support responses after 2 seconds
    setTimeout(() => {
      const lower = userMsg.text.toLowerCase();
      let responseText = '';

      if (currentLanguage === 'ar') {
        if (lower.includes('طلب') || lower.includes('تتبع') || lower.includes('رقم')) {
          responseText = 'بالتأكيد يا عزيزي! لتتبع طلبك، يرجى الانتقال إلى صفحة "تتبع طلبك" في الأعلى وادخال رقم الطلب الخاص بك لمشاهدة حالته مباشرة وحية 🚚';
        } else if (lower.includes('سعر') || lower.includes('بكم') || lower.includes('قيمة')) {
          responseText = 'جميع أسعارنا المعروضة تشمل الضريبة وبأفضل مستويات التوفير والمصداقية! يمكنك تصفح المنتجات في الرئيسية والضغط على أي منتج لمشاهدة تفاصيل سعره الحالية 💰';
        } else if (lower.includes('شحن') || lower.includes('شحنت') || lower.includes('توصيل')) {
          responseText = 'متجر رايفو يوفر لك شحناً آمناً وسريعاً ومجانياً بالكامل لجميع مدن المملكة! تستغرق عملية التجهيز والشحن العادي من 2 إلى 4 أيام عمل كأقصى تقدير ⚡';
        } else if (lower.includes('خصم') || lower.includes('كوبون') || lower.includes('عرض')) {
          responseText = 'يسعدنا تزويدك بكود الخصم الحصري [ RYVO2026 ] ليمنحك خصماً فورياً بقيمة 10% إضافية على سلة مشترياتك الفاخرة اليوم! 🎉';
        } else {
          responseText = 'شكراً لتواصلك مع دعم متجر رايفو! استفسارك يقع ضمن اهتمامنا وسيتم مراجعته والإجابة عليه بواسطة أحد ممثلينا خلال دقائق معدودة. طاب يومك بكل خير! ✨';
        }
      } else {
        // English/French general fallback rules
        if (lower.includes('order') || lower.includes('track') || lower.includes('number')) {
          responseText = 'Absolutely! To track your purchase, please type in or paste your custom Order ID inside our dedicated "Track Order" page at the top navigation bar 🚚';
        } else if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
          responseText = 'All listed prices on Ryvo Store are fully inclusive of taxes. Tap on any item in catalog to discover its full specifications & elite unit price 🛍️';
        } else if (lower.includes('shipping') || lower.includes('deliver') || lower.includes('ship')) {
          responseText = 'We provide 100% Free Shipping and fast delivery to your door within 2-4 business days securely! 📦';
        } else if (lower.includes('discount') || lower.includes('promo') || lower.includes('coupon')) {
          responseText = 'Certainly! Use custom promo coupon code [ RYVO2026 ] at your checkout to unlock an extra 10% discount on all active purchases today! 🎉';
        } else {
          responseText = 'Thank you for reaching out! Your valuable inquiry is being queued. A support expert from Ryvo Store team will inspect details shortly. Have a grand day! ✨';
        }
      }

      const supportMsg: ChatMessage = {
        id: `msg-support-${Date.now()}`,
        sender: 'support',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, supportMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const clearChat = () => {
    if (confirm(currentLanguage === 'ar' ? 'هل تود حذف جميع رسائل الدردشة والبدء من جديد؟' : 'Clear all chat messages and start fresh?')) {
      const defaultStart: ChatMessage[] = [
        {
          id: 'welcome',
          sender: 'support',
          text: currentLanguage === 'ar' 
            ? 'مرحباً بك في مركز دعم متجر رايفو! كيف يمكنني مساعدتك اليوم بخصوص طلباتك أو منتجاتنا الفاخرة؟ 👋'
            : 'Welcome to Ryvo Store Support Center! How can I assist you with your orders today? 👋',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(defaultStart);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-3">
      
      {/* Title Header area */}
      <div className="bg-[#1E293B] rounded-t-3xl p-6 text-white text-center sm:text-right relative overflow-hidden shadow-md">
        <div className="absolute right-0 top-0 w-60 h-60 bg-[var(--primary-color, #38bdf8)]/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className={`relative flex flex-col sm:flex-row items-center justify-between gap-4 ${isRtl ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
          <div className={`space-y-1.5 ${isRtl ? 'sm:text-right' : 'sm:text-left'}`}>
            <h2 className="text-xl font-black font-sans bg-gradient-to-r from-[var(--primary-color, #38bdf8)] to-rose-400 bg-clip-text text-transparent flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="w-5 h-5 text-[var(--primary-color, #38bdf8)] animate-pulse" />
              <span>{t.support_agent || 'مدير الدعم الفني الذكي'}</span>
            </h2>
            <p className="text-xs text-slate-800 leading-relaxed font-semibold">
              {t.support_chat_desc || 'تواصل مباشرة مع خدمة عملاء متجر رايفو الذكية للمساعدة الفورية'}
            </p>
          </div>
          <button 
            type="button" 
            onClick={clearChat}
            className="px-4 py-2 bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
          >
            {isRtl ? 'بدأ دردشة جديدة 🔄' : 'New Chat 🔄'}
          </button>
        </div>
      </div>

      {/* Chat Messages Workspace */}
      <div className="bg-white dark:bg-[#131b2e] border-x border-b border-slate-100 dark:border-slate-200/80 rounded-3xl p-4 sm:p-6 shadow-md flex flex-col h-[480px]">
        
        {/* Messages list container */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {messages.map((msg) => {
            const isSupport = msg.sender === 'support';
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[85%] ${
                  isSupport 
                    ? isRtl ? 'mr-0 ml-auto flex-row' : 'mr-auto ml-0 flex-row-reverse' 
                    : isRtl ? 'mr-auto ml-0 flex-row-reverse' : 'mr-0 ml-auto flex-row'
                }`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border shadow-sm ${
                  isSupport 
                    ? 'bg-[var(--primary-color)]/10 dark:bg-[var(--primary-color)]/10 border-[var(--primary-color)]/25 text-[var(--primary-color)]' 
                    : 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-850 text-emerald-505'
                }`}>
                  {isSupport ? <BadgeCheck className="w-4 h-4 fill-[var(--primary-color)]/10" /> : <User className="w-4 h-4" />}
                </div>

                {/* Msg text body container */}
                <div className="space-y-1">
                  <div className={`p-4 rounded-3xl text-xs font-semibold leading-relaxed shadow-sm ${
                    isSupport 
                      ? 'bg-slate-50 dark:bg-[#0A0C10] text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-200/60' 
                      : 'bg-[var(--primary-color, #38bdf8)] text-slate-900 rounded-tr-none'
                  }`}>
                    <p className="font-sans whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold block px-2 text-right">
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing visual status placeholder */}
          {isTyping && (
            <div className={`flex gap-3 max-w-[50%] mr-0 ml-auto ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex-shrink-0 flex items-center justify-center border text-slate-400">
                <MessageSquare className="w-4 h-4 text-[var(--primary-color)] animate-bounce" />
              </div>
              <div className="bg-slate-50 dark:bg-[#0A0C10] p-4 rounded-3xl rounded-tl-none border border-slate-100 dark:border-slate-200/60 text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-slate-850 dark:bg-slate-600 rounded-full animate-bounce duration-300" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce duration-300" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-450 dark:bg-slate-400 rounded-full animate-bounce duration-300" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Controls form */}
        <form onSubmit={handleSend} className="flex gap-2 items-center pt-2 border-t border-slate-100 dark:border-slate-200">
          <input
            id="chat-input-text-field"
            type="text"
            required
            placeholder={t.chat_placeholder || 'اكتب رسالتك لمدير الدعم هنا...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping}
            className={`flex-1 p-3.5 bg-slate-50 dark:bg-[#0A0C10] border border-slate-200 dark:border-slate-200 focus:border-[var(--primary-color, #38bdf8)] text-xs font-semibold rounded-2xl text-slate-800 dark:text-gray-100 outline-none transition-all ${
              isRtl ? 'text-right' : 'text-left'
            }`}
          />
          <button
            id="chat-submit-btn"
            type="submit"
            disabled={isTyping || !inputText.trim()}
            className="p-3.5 bg-[var(--primary-color, #38bdf8)] disabled:bg-slate-200 dark:disabled:bg-slate-900 text-slate-900 disabled:text-slate-400 rounded-2xl cursor-pointer hover:scale-103 active:scale-97 transition-all shadow-md focus:outline-none"
          >
            <Send className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        </form>

      </div>

    </div>
  );
}
