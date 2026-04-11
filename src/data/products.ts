// ─── TYPES ───────────────────────────────────────────────────────────────────
//
// ProductImage mirrors Medusa's ProductImage entity:
//   { id: string; url: string; created_at: string; updated_at: string }
// We keep only the fields needed in the frontend.
//
export interface ProductImage {
  id: string;
  url: string;
}

export interface Product {
  id: string | number;
  name: string;
  price: string;
  /** Primary thumbnail — maps to Medusa product.thumbnail */
  image: string;
  /** Full image gallery — maps to Medusa product.images[].url */
  images: ProductImage[];
  category: string;
  sizes: string[];
  description: string;
  features: string[];
}

export interface Review {
  id: string | number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

// ─── SEED DATA ───────────────────────────────────────────────────────────────
//
// NOTE: Until the Medusa backend is connected, each product has a "images" array
// populated with the main image repeated (+ different crops) as placeholders.
// When Medusa is live, these will be replaced by the API response:
//
//   const product = await medusa.products.retrieve(id)
//   product.images  →  ProductImage[]
//   product.thumbnail  →  string
//
export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Silk Evening Dress",
    price: "$299.00",
    image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=800&auto=format&fit=crop",
    images: [
      { id: "img-1-1", url: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1200&auto=format&fit=crop" },
      { id: "img-1-2", url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop" },
      { id: "img-1-3", url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop" },
      { id: "img-1-4", url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop" },
    ],
    category: "Dresses",
    sizes: ["XS", "S", "M", "L"],
    description: "A timeless silhouette crafted from Grade 6A mulberry silk. This dress features a delicate bias cut that drapes elegantly over the figure, offering both comfort and unmatched sophistication for your most special evenings.",
    features: ["100% Mulberry Silk", "Adjustable straps", "Hand-finished seams", "Includes silk storage bag"]
  },
  {
    id: 2,
    name: "Cashmere Blend Coat",
    price: "$450.00",
    image: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?q=80&w=800&auto=format&fit=crop",
    images: [
      { id: "img-2-1", url: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?q=80&w=1200&auto=format&fit=crop" },
      { id: "img-2-2", url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1200&auto=format&fit=crop" },
      { id: "img-2-3", url: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1200&auto=format&fit=crop" },
    ],
    category: "Outerwear",
    sizes: ["S", "M", "L"],
    description: "Experience the ultimate warmth without the weight. Our signature cashmere blend coat is designed with a modern oversized fit, featuring hand-stitched lapels and deep welt pockets for a refined yet functional winter staple.",
    features: ["70% Wool, 30% Cashmere", "Water-resistant finish", "Interior satin lining", "Sustainable horn buttons"]
  },
  {
    id: 3,
    name: "Minimalist Blazer",
    price: "$180.00",
    image: "https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?q=80&w=800&auto=format&fit=crop",
    images: [
      { id: "img-3-1", url: "https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?q=80&w=1200&auto=format&fit=crop" },
      { id: "img-3-2", url: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1200&auto=format&fit=crop" },
      { id: "img-3-3", url: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=1200&auto=format&fit=crop" },
    ],
    category: "Jackets",
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "The cornerstone of a curated wardrobe. Our Minimalist Blazer is structured yet flexible, featuring a single-button closure and clean lines that transition seamlessly from professional settings to evening social events.",
    features: ["Italian crepe fabric", "Padded shoulders", "Functional sleeve buttons", "Moisture-wicking lining"]
  },
  {
    id: 4,
    name: "Pleated Midi Skirt",
    price: "$120.00",
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=800&auto=format&fit=crop",
    images: [
      { id: "img-4-1", url: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=1200&auto=format&fit=crop" },
      { id: "img-4-2", url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop" },
      { id: "img-4-3", url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1200&auto=format&fit=crop" },
    ],
    category: "Skirts",
    sizes: ["S", "M", "L"],
    description: "Dynamic movement meets architectural precision. This pleated midi skirt utilizes a precision-heat technique to ensure pleats remain sharp through years of wear, finished with a subtle metallic sheen for added depth.",
    features: ["Sunray pleat design", "Elasticated waistband", "Soft-touch polyester", "Mid-weight drape"]
  }
];

export const REVIEWS: Review[] = [
  { id: 1, user: "Elena S.", rating: 5, comment: "The quality of the silk is exceptional. Fits perfectly and looks even better in person.", date: "2 days ago" },
  { id: 2, user: "Marcus V.", rating: 4, comment: "Beautiful design, though it runs slightly large. I recommend sizing down.", date: "1 week ago" },
  { id: 3, user: "Sophia L.", rating: 5, comment: "Absolutely stunning! I've received so many compliments. Worth every penny.", date: "2 weeks ago" }
];
