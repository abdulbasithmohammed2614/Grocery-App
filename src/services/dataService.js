import { supabase } from "../supabaseClient";

// Local fallback image imports so images always display properly
import product1 from "../images/category-baby-care.jpg";
import product2 from "../images/category-atta-rice-dal.jpg";
import product3 from "../images/category-bakery-biscuits.jpg";
import product4 from "../images/category-chicken-meat-fish.jpg";
import product5 from "../images/category-cleaning-essentials.jpg";
import product6 from "../images/category-dairy-bread-eggs.jpg";
import product7 from "../images/category-instant-food.jpg";
import product8 from "../images/category-pet-care.jpg";
import product9 from "../images/category-snack-munchies.jpg";
import product10 from "../images/category-tea-coffee-drinks.jpg";

import storelogo1 from "../images/stores-logo-1.svg";
import storelogo2 from "../images/stores-logo-2.svg";
import storelogo3 from "../images/stores-logo-3.svg";
import storelogo4 from "../images/stores-logo-4.svg";
import storelogo5 from "../images/stores-logo-5.svg";
import storelogo6 from "../images/stores-logo-6.svg";

// Fallback dummy products
export const INITIAL_PRODUCTS = [
  {
    id: "p1",
    name: "Haldiram's Sev Bhujia",
    category: "Snacks & Munchies",
    price: 45,
    old_price: 55,
    image: product1,
    rating: 4.5,
    reviews: 148,
    badge: "Sale",
    unit: "200 g",
    is_popular: true,
    is_best_seller: false,
  },
  {
    id: "p2",
    name: "NutriChoice Digestive High Fibre",
    category: "Bakery & Biscuits",
    price: 35,
    old_price: 40,
    image: product2,
    rating: 4.6,
    reviews: 95,
    badge: "Hot",
    unit: "1 kg",
    is_popular: true,
    is_best_seller: true,
  },
  {
    id: "p3",
    name: "Cadbury Dairy Milk Silk",
    category: "Bakery & Biscuits",
    price: 80,
    old_price: 90,
    image: product3,
    rating: 4.9,
    reviews: 420,
    badge: "15%",
    unit: "150 g",
    is_popular: true,
    is_best_seller: true,
  },
  {
    id: "p4",
    name: "Farm Fresh Desi Eggs (Pack of 6)",
    category: "Dairy, Bread & Eggs",
    price: 65,
    old_price: 75,
    image: product4,
    rating: 4.8,
    reviews: 312,
    badge: "Fresh",
    unit: "6 pcs",
    is_popular: true,
    is_best_seller: true,
  },
  {
    id: "p5",
    name: "Amul Taaza Homogenised Toned Milk",
    category: "Dairy, Bread & Eggs",
    price: 27,
    old_price: 30,
    image: product5,
    rating: 4.9,
    reviews: 890,
    badge: "Bestseller",
    unit: "500 ml",
    is_popular: true,
    is_best_seller: true,
  },
  {
    id: "p6",
    name: "Fresh Hybrid Tomato",
    category: "Fruits & Vegetables",
    price: 38,
    old_price: 48,
    image: product6,
    rating: 4.4,
    reviews: 210,
    badge: "Fresh",
    unit: "1 kg",
    is_popular: true,
    is_best_seller: false,
  },
  {
    id: "p7",
    name: "Robusta Banana Organic",
    category: "Fruits & Vegetables",
    price: 42,
    old_price: 50,
    image: product7,
    rating: 4.7,
    reviews: 165,
    badge: "Organic",
    unit: "1 kg (approx 6-8 pcs)",
    is_popular: true,
    is_best_seller: true,
  },
  {
    id: "p8",
    name: "Maggi 2-Minute Masala Noodles",
    category: "Instant Food",
    price: 56,
    old_price: 60,
    image: product8,
    rating: 4.8,
    reviews: 734,
    badge: "Popular",
    unit: "Pack of 4 (280 g)",
    is_popular: true,
    is_best_seller: true,
  },
  {
    id: "p9",
    name: "Lays India's Magic Masala Chips",
    category: "Snacks & Munchies",
    price: 20,
    old_price: 20,
    image: product9,
    rating: 4.6,
    reviews: 580,
    badge: "Quick",
    unit: "52 g",
    is_popular: true,
    is_best_seller: false,
  },
  {
    id: "p10",
    name: "Coca-Cola Zero Sugar Can",
    category: "Cold Drinks & Juices",
    price: 40,
    old_price: 45,
    image: product10,
    rating: 4.7,
    reviews: 340,
    badge: "Chilled",
    unit: "300 ml",
    is_popular: true,
    is_best_seller: false,
  },
  {
    id: "p11",
    name: "Aashirvaad Superior MP Sharbati Atta",
    category: "Atta, Rice & Dal",
    price: 260,
    old_price: 295,
    image: product2,
    rating: 4.9,
    reviews: 1120,
    badge: "Essential",
    unit: "5 kg",
    is_popular: false,
    is_best_seller: true,
  },
  {
    id: "p12",
    name: "Tata Sampann Unpolished Toor Dal",
    category: "Atta, Rice & Dal",
    price: 165,
    old_price: 185,
    image: product2,
    rating: 4.7,
    reviews: 430,
    badge: "Protein",
    unit: "1 kg",
    is_popular: false,
    is_best_seller: true,
  },
];

// Fallback dummy stores
export const INITIAL_STORES = [
  {
    id: "st1",
    name: "FreshCart Express Darkstore - Indiranagar",
    type: "Express Quick Delivery",
    location: "100ft Road, Indiranagar, Bangalore",
    delivery_time: "10-15 mins",
    min_order: 99,
    rating: 4.9,
    status: "Open Now",
    distance: "1.2 km",
    logo: storelogo1,
    tags: ["Vegetables", "Dairy", "Snacks", "Quick 10m"],
  },
  {
    id: "st2",
    name: "FreshCart Daily Supermarket",
    type: "Supermarket & Groceries",
    location: "4th Block, Koramangala, Bangalore",
    delivery_time: "15-20 mins",
    min_order: 149,
    rating: 4.8,
    status: "Open Now",
    distance: "2.5 km",
    logo: storelogo2,
    tags: ["Organic", "Bakery", "Household", "Groceries"],
  },
  {
    id: "st3",
    name: "Nature's Basket Organic Express",
    type: "Gourmet & Organic",
    location: "CMH Road, Indiranagar, Bangalore",
    delivery_time: "15-25 mins",
    min_order: 199,
    rating: 4.9,
    status: "Open Now",
    distance: "3.1 km",
    logo: storelogo3,
    tags: ["Exotic Fruits", "Artisanal Cheese", "Organic"],
  },
  {
    id: "st4",
    name: "Daily Fresh Meat & Fish Market",
    type: "Fresh Cuts & Protein",
    location: "Sector 2, HSR Layout, Bangalore",
    delivery_time: "20-30 mins",
    min_order: 199,
    rating: 4.7,
    status: "Open Now",
    distance: "4.0 km",
    logo: storelogo4,
    tags: ["Fresh Chicken", "Mutton", "Fish & Seafood"],
  },
  {
    id: "st5",
    name: "Heritage Milk & Dairy Mart",
    type: "Dairy & Breakfast",
    location: "Old Airport Road, Bangalore",
    delivery_time: "10-15 mins",
    min_order: 49,
    rating: 4.8,
    status: "Open Now",
    distance: "1.8 km",
    logo: storelogo5,
    tags: ["Milk", "Paneer", "Butter", "Eggs", "Bread"],
  },
  {
    id: "st6",
    name: "Green Valley Farm Produce",
    type: "Farmer's Direct Produce",
    location: "Sarjapur Main Road, Bangalore",
    delivery_time: "20-25 mins",
    min_order: 99,
    rating: 4.6,
    status: "Open Now",
    distance: "3.8 km",
    logo: storelogo6,
    tags: ["Farm Vegetables", "Fresh Greens", "Cold Pressed Oils"],
  },
];

// Dynamic category count calculator from an array of products (removes all hardcoded counts)
export const computeCategoryCounts = (productsList = []) => {
  const counts = {};
  if (Array.isArray(productsList)) {
    productsList.forEach((p) => {
      if (p && p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
  }
  return counts;
};

export const BASE_CATEGORIES = [
  { id: "c1", name: "All", icon: "🛒" },
  { id: "c2", name: "Dairy, Bread & Eggs", icon: "🥛" },
  { id: "c3", name: "Snacks & Munchies", icon: "🍿" },
  { id: "c4", name: "Fruits & Vegetables", icon: "🥦" },
  { id: "c5", name: "Bakery & Biscuits", icon: "🍞" },
  { id: "c6", name: "Instant Food", icon: "🍜" },
  { id: "c7", name: "Cold Drinks & Juices", icon: "🥤" },
  { id: "c8", name: "Atta, Rice & Dal", icon: "🌾" },
];

// Dynamically compute category counts without any hardcoded numbers
export const getDynamicCategories = (productsList = INITIAL_PRODUCTS) => {
  const counts = computeCategoryCounts(productsList);
  return BASE_CATEGORIES.map((cat) => ({
    ...cat,
    count: cat.name === "All" ? productsList.length : (counts[cat.name] || 0),
  }));
};

// Fallback categories dynamically computed from initial products
export const INITIAL_CATEGORIES = getDynamicCategories(INITIAL_PRODUCTS);

// Data service helpers to fetch from Supabase (or fallback)
export const fetchProductsFromDb = async (category = "All") => {
  try {
    let query = supabase.from("products").select("*");
    if (category && category !== "All") {
      query = query.eq("category", category);
    }
    const { data, error } = await query;
    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (e) {
    // Supabase query failed or table not found
  }

  // Fallback to initial products
  if (category && category !== "All") {
    return INITIAL_PRODUCTS.filter((p) => p.category === category);
  }
  return INITIAL_PRODUCTS;
};

export const fetchStoresFromDb = async () => {
  try {
    const { data, error } = await supabase.from("stores").select("*");
    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (e) {
    // fallback
  }
  return INITIAL_STORES;
};

export const fetchCategoriesFromDb = async () => {
  try {
    // 1. Fetch real products from Supabase to count actual items per category in database
    const { data: dbProducts, error: prodErr } = await supabase
      .from("products")
      .select("id, category");

    const products =
      !prodErr && Array.isArray(dbProducts) && dbProducts.length > 0
        ? dbProducts
        : INITIAL_PRODUCTS;

    const counts = computeCategoryCounts(products);

    // 2. Fetch category list
    const { data: dbCategories, error: catErr } = await supabase
      .from("categories")
      .select("id, name, icon");

    const rawCategories =
      !catErr && Array.isArray(dbCategories) && dbCategories.length > 0
        ? dbCategories
        : BASE_CATEGORIES.filter((c) => c.name !== "All");

    // 3. Return dynamic categories with live counts directly from DB
    return [
      {
        id: "cat-all",
        name: "All",
        count: products.length,
        icon: "🛒",
      },
      ...rawCategories
        .filter((c) => c.name !== "All")
        .map((cat) => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon || "📦",
          count: counts[cat.name] || 0,
        })),
    ];
  } catch (e) {
    console.error("Error computing dynamic category counts from DB:", e);
    return getDynamicCategories(INITIAL_PRODUCTS);
  }
};
