export type Language = 'ar' | 'en' | 'fr';
export type Theme = 'light' | 'dark';

export interface Product {
  id: string;
  name_ar: string;
  name_en: string;
  name_fr: string;

  description_ar: string;
  description_en: string;
  description_fr: string;

  features_ar: string; // Comma-separated or serialized
  features_en: string;
  features_fr: string;

  tag_ar: string;
  tag_en: string;
  tag_fr: string;

  image: string; // Primary image URL
  additional_images?: string[]; // Extra product images for gallery
  price: number;
  stock: number;
  category: string;
  rating_sum: number;
  rating_count: number;
  is_featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  color?: string; // Selected color: أحمر | أبيض | أسود
}

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  color?: string; // Selected color
}

export interface Order {
  id: string;
  user_email: string;
  customer_name: string;
  address: string;
  phone: string;
  payment_method: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  csrf_token_verified: boolean;
  status_history?: {
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    timestamp: string;
  }[];
}

export interface User {
  email: string;
  name: string;
  role: 'customer' | 'admin';
  favorites: string[]; // List of product IDs
  token?: string;
  password?: string; // Opt customer password storage
  allowedPanels?: {
    products: boolean;
    orders: boolean;
    customers: boolean;
    emails: boolean;
    storeCustomization: boolean;
  };
}

export interface HeroSlide {
  category: string;
  title_ar: string;
  title_en: string;
  title_fr: string;
  desc_ar: string;
  desc_en: string;
  desc_fr: string;
  bg: string;
  image: string;
}

export interface SimulatedEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  time: string;
  read: boolean;
}

export interface Review {
  id: string;
  product_id: string;
  product_name: string;
  name: string;
  rating: number;
  text: string;
  date: string;
}
