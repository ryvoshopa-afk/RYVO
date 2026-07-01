import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Path to persist settings
const SETTINGS_FILE_PATH = path.join(process.cwd(), "global_settings.json");

// Default initial state
interface GlobalSettings {
  brandColor: string;
  shopLogo: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
    snapchat: string;
    tiktok: string;
  };
  heroSlides: Array<{
    category: string;
    title_ar: string;
    title_en: string;
    title_fr: string;
    desc_ar: string;
    desc_en: string;
    desc_fr: string;
    bg: string;
    image: string;
  }> | null;
  customAdmins: Array<{
    email: string;
    name: string;
    password?: string;
    allowedPanels: {
      products: boolean;
      orders: boolean;
      customers: boolean;
      emails: boolean;
      storeCustomization: boolean;
    };
  }>;
}

const defaultSettings: GlobalSettings = {
  brandColor: "#38bdf8",
  shopLogo: "RYVO STORE",
  socialLinks: {
    facebook: "https://facebook.com",
    twitter: "https://twitter.com",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    snapchat: "",
    tiktok: "",
  },
  heroSlides: null,
  customAdmins: [],
};

// Helper to read settings
function getSettings(): GlobalSettings {
  if (fs.existsSync(SETTINGS_FILE_PATH)) {
    try {
      const content = fs.readFileSync(SETTINGS_FILE_PATH, "utf8");
      return JSON.parse(content);
    } catch (e) {
      console.error("Error reading global settings file, using default:", e);
    }
  }
  return defaultSettings;
}

// Helper to save settings
function saveSettings(settings: GlobalSettings) {
  try {
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2), "utf8");
  } catch (e) {
    console.error("Error writing global settings file:", e);
  }
}

// ========================================================
// 🛠️ إعدادات وتكامل CJ Dropshipping API لمتجر ريفو
// ========================================================
const CJ_API_URL = 'https://api.cjdropshipping.com/api2.0/v1';
let cjAccessToken = '';

// دالة جلب وتحديث توكن الأمان من سيرفرات CJ تلقائياً
async function getCJAccessToken() {
  try {
    const response = await fetch(`${CJ_API_URL}/authentication/getAccessToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appId: process.env.CJ_APP_ID,
        appSecret: process.env.CJ_SECRET_KEY
      })
    });
    
    const result = await response.json() as any;

    if (result && result.data && result.data.accessToken) {
      cjAccessToken = result.data.accessToken;
      console.log('✔ تم الاتصال وتحديث توكن الأمان لـ CJ Dropshipping بنجاح.');
      return cjAccessToken;
    } else {
      console.error('❌ فشل استخراج التوكن من رد سيرفر CJ:', result);
    }
  } catch (error) {
    console.error('❌ خطأ أثناء الاتصال بـ CJ Dropshipping Auth:', error);
  }
  return null;
}

// ========================================================
// 🗺️ روابط واجهة برمجة التطبيقات (API Endpoints)
// ========================================================

app.get("/api/global-settings", (req, res) => {
  res.json(getSettings());
});

app.post("/api/global-settings", (req, res) => {
  const newSettings = req.body;
  const current = getSettings();
  
  const updated: GlobalSettings = {
    brandColor: newSettings.brandColor || current.brandColor,
    shopLogo: newSettings.shopLogo || current.shopLogo,
    socialLinks: {
      ...current.socialLinks,
      ...(newSettings.socialLinks || {}),
    },
    heroSlides: newSettings.heroSlides !== undefined ? newSettings.heroSlides : current.heroSlides,
    customAdmins: Array.isArray(newSettings.customAdmins) ? newSettings.customAdmins : current.customAdmins,
  };

  saveSettings(updated);
  res.json({ success: true, settings: updated });
});

// رابط جلب المنتجات من CJ للمتجر مع دعم البحث والصفحات ديناميكياً
app.get("/api/cj/products", async (req, res) => {
  try {
    if (!cjAccessToken) {
      await getCJAccessToken();
    }

    const search = (req.query.search as string) || '';
    const pageNumber = (req.query.pageNumber as string) || '1';
    const pageSize = (req.query.pageSize as string) || '20';

    const fetchUrl = new URL(`${CJ_API_URL}/product/list`);
    fetchUrl.searchParams.append('pageNumber', pageNumber);
    fetchUrl.searchParams.append('pageSize', pageSize);
    if (search) {
      fetchUrl.searchParams.append('searchName', search);
    }

    const response = await fetch(fetchUrl.toString(), {
      method: 'GET',
      headers: { 'CJ-Access-Token': cjAccessToken }
    });

    const data = await response.json() as any;

    // معالجة انتهاء صلاحية التوكن المفاجئ لتحديثه تلقائياً دون تعطل العميل
    if (data && (data.code === 401 || data.code === 2003)) {
      await getCJAccessToken();
      return res.status(401).json({ message: "جاري تحديث الجلسة مع المورد، يرجى المحاولة مرة أخرى خلال ثوانٍ." });
    }

    res.json(data);
  } catch (error) {
    console.error('❌ خطأ في جلب البيانات من CJ Dropshipping:', error);
    res.status(500).json({ error: 'فشل جلب المنتجات من المورد الرئيسي' });
  }
});

// ========================================================
// 🚀 إعداد تشغيل سيرفر وموجهات Vite
// ========================================================
async function setupViteRouter() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started on http://localhost:${PORT}`);
  });
}

setupViteRouter().catch((err) => {
  console.error("Fatal error during server startup:", err);
});

