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

// API Endpoints
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

// Vite frontend routing middleware setup
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
