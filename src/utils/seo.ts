import { Product, Language } from '../types';
import { TRANSLATIONS } from '../constants/translations';

export function updateSEO({
  product,
  category,
  language,
  pageName
}: {
  product?: Product;
  category?: string;
  language: Language;
  pageName?: string;
}) {
  const t = TRANSLATIONS[language];
  
  // Set accurate titles
  let title = t.store_name;
  if (product) {
    const pName = language === 'ar' ? product.name_ar : language === 'fr' ? product.name_fr : product.name_en;
    title = `${pName} | ${t.store_name}`;
  } else if (pageName) {
    title = `${pageName} | ${t.store_name}`;
  } else if (category && category !== 'all') {
    title = `${t[category] || category} | ${t.store_name}`;
  }

  document.title = title;

  // Update meta tags dynamically
  updateMeta('description', product ? (language === 'ar' ? product.description_ar : language === 'fr' ? product.description_fr : product.description_en) : t.meta_desc);
  updateMeta('keywords', t.meta_keywords);
  
  // OpenGraph tags
  updateMeta('og:title', title, 'property');
  updateMeta('og:description', product ? (language === 'ar' ? product.description_ar : language === 'fr' ? product.description_fr : product.description_en) : t.meta_desc, 'property');
  updateMeta('og:image', product ? product.image : 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80', 'property');
  updateMeta('og:type', product ? 'product' : 'website', 'property');
  updateMeta('og:url', window.location.href, 'property');

  // Inject Structured Data for Google Rich Snippets
  let jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    'name': t.store_name,
    'description': t.meta_desc,
    'url': window.location.href,
    'telephone': '+966555555555',
    'priceRange': '$$',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Olaya King Fahd Rd',
      'addressLocality': 'Riyadh',
      'addressCountry': 'SA'
    }
  };

  if (product) {
    const pName = language === 'ar' ? product.name_ar : language === 'fr' ? product.name_fr : product.name_en;
    const pDesc = language === 'ar' ? product.description_ar : language === 'fr' ? product.description_fr : product.description_en;
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': pName,
      'image': [product.image, ...(product.additional_images || [])],
      'description': pDesc,
      'sku': product.id,
      'offers': {
        '@type': 'Offer',
        'url': window.location.href,
        'priceCurrency': 'SAR',
        'price': product.price,
        'itemCondition': 'https://schema.org/NewCondition',
        'availability': product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': product.rating_count > 0 ? (product.rating_sum / product.rating_count).toFixed(1) : '5.0',
        'reviewCount': product.rating_count > 0 ? product.rating_count : '1'
      }
    };
  }

  // Inject into index.html
  let scriptElement = document.getElementById('ryvo-structured-seo') as HTMLScriptElement;
  if (!scriptElement) {
    scriptElement = document.createElement('script');
    scriptElement.id = 'ryvo-structured-seo';
    scriptElement.type = 'application/ld+json';
    document.head.appendChild(scriptElement);
  }
  scriptElement.text = JSON.stringify(jsonLd);
}

function updateMeta(name: string, content: string, type: 'name' | 'property' = 'name') {
  let element = document.querySelector(`meta[${type}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(type, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

// Generate an XML sitemap of the applet dynamically as a string for users to save or bots to inspect
export function generateSitemapXML(products: Product[]): string {
  const baseUrl = window.location.origin;
  const currentDate = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Main pages
  xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

  // Product pages
  products.forEach(p => {
    xml += `  <url>\n    <loc>${baseUrl}/product/${p.id}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  });

  xml += `</urlset>`;
  return xml;
}

// Generate robots.txt
export function generateRobotsTXT(): string {
  const baseUrl = window.location.origin;
  return `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /checkout/success\n\nSitemap: ${baseUrl}/sitemap.xml`;
}
