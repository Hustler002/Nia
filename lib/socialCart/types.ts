// lib/socialCart/types.ts
// Type definitions for the Social Cart collaborative ordering feature

export interface SocialCart {
  id: string;
  code: string;         // short shareable code like "MVNT7K"
  name: string;         // e.g. "Movie Night 🎬"
  host_id: string;
  host_name: string;
  created_at: string;
  expires_at: string;
}

export interface SocialCartMember {
  id: string;
  cart_code: string;
  user_id: string;
  name: string;
  avatar_color: string; // hex color
  joined_at: string;
}

export interface SocialCartItem {
  id: string;
  cart_code: string;
  product_id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  added_by_id: string;
  added_by_name: string;
  flagged_by_nia: boolean;
  nia_flag_reason: string | null;
  created_at: string;
}

export interface SocialCartSession {
  cart: SocialCart | null;
  members: SocialCartMember[];
  items: SocialCartItem[];
  myMember: SocialCartMember | null;
}
