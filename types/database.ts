// Supabase database types — generated from the schema in supabase/migrations/.
// Use these with createClient<Database>() for fully type-safe queries.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      artworks: {
        Row: {
          id: string
          slug: string
          title: string
          year: number
          tagline: string | null
          description: string | null
          original_dims: string | null
          hi_res_file_url: string | null
          thumbnail_url: string | null
          gallery_images: string[]
          gallery_image_urls: string[]
          is_published: boolean
          sort_order: number
          aspect_ratio: number | null
          blur_color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          year: number
          tagline?: string | null
          description?: string | null
          original_dims?: string | null
          hi_res_file_url?: string | null
          thumbnail_url?: string | null
          gallery_images?: string[]
          gallery_image_urls?: string[]
          is_published?: boolean
          sort_order?: number
          aspect_ratio?: number | null
          blur_color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          year?: number
          tagline?: string | null
          description?: string | null
          original_dims?: string | null
          hi_res_file_url?: string | null
          thumbnail_url?: string | null
          gallery_images?: string[]
          gallery_image_urls?: string[]
          is_published?: boolean
          sort_order?: number
          aspect_ratio?: number | null
          blur_color?: string | null
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          stripe_session_id: string | null
          stripe_payment_intent: string | null
          status: 'pending' | 'paid' | 'sent_to_printer' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          customer_email: string
          customer_name: string
          shipping_address: Json
          subtotal_aud: number
          shipping_aud: number
          total_aud: number
          notes: string | null
          sent_to_printer_at: string | null
          shipped_at: string | null
          delivered_at: string | null
          cancelled_at: string | null
          refunded_at: string | null
          tracking_number: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_number: string
          stripe_session_id?: string | null
          stripe_payment_intent?: string | null
          status?: 'pending' | 'paid' | 'sent_to_printer' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          customer_email: string
          customer_name: string
          shipping_address: Json
          subtotal_aud: number
          shipping_aud: number
          total_aud: number
          notes?: string | null
          sent_to_printer_at?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          cancelled_at?: string | null
          refunded_at?: string | null
          tracking_number?: string | null
          created_at?: string
        }
        Update: {
          order_number?: string
          stripe_session_id?: string | null
          stripe_payment_intent?: string | null
          status?: 'pending' | 'paid' | 'sent_to_printer' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          customer_email?: string
          customer_name?: string
          shipping_address?: Json
          subtotal_aud?: number
          shipping_aud?: number
          total_aud?: number
          notes?: string | null
          sent_to_printer_at?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          cancelled_at?: string | null
          refunded_at?: string | null
          tracking_number?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          artwork_id: string
          artwork_title_snapshot: string
          material: 'cotton_rag_smooth' | 'cotton_rag_textured' | 'canvas_satin' | 'canvas_lustre'
          size: string
          framing: 'unframed' | 'standard_flooded_gum' | 'standard_american_ash' | 'premium_white' | 'premium_mahogany' | 'premium_walnut' | 'premium_black'
          quantity: number
          unit_price_aud: number
          line_total_aud: number
        }
        Insert: {
          id?: string
          order_id: string
          artwork_id: string
          artwork_title_snapshot: string
          material: 'cotton_rag_smooth' | 'cotton_rag_textured' | 'canvas_satin' | 'canvas_lustre'
          size: string
          framing: 'unframed' | 'standard_flooded_gum' | 'standard_american_ash' | 'premium_white' | 'premium_mahogany' | 'premium_walnut' | 'premium_black'
          quantity?: number
          unit_price_aud: number
          line_total_aud: number
        }
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>
      }
      order_activity: {
        Row: {
          id: string
          order_id: string
          activity: string
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          activity: string
          created_at?: string
        }
        Update: {
          activity?: string
        }
      }
      admins: {
        Row: {
          id: string
          email: string
          is_active: boolean
        }
        Insert: {
          id: string
          email: string
          is_active?: boolean
        }
        Update: {
          email?: string
          is_active?: boolean
        }
      }
      settings: {
        Row: {
          id: 1
          markup_multiplier: number
          admin_email: string
          printer_email: string
          studio_name: string
          contact_email: string
          instagram_url: string | null
          updated_at: string
        }
        Insert: {
          id?: 1
          markup_multiplier?: number
          admin_email?: string
          printer_email?: string
          studio_name?: string
          contact_email?: string
          instagram_url?: string | null
          updated_at?: string
        }
        Update: {
          markup_multiplier?: number
          admin_email?: string
          printer_email?: string
          studio_name?: string
          contact_email?: string
          instagram_url?: string | null
          updated_at?: string
        }
      }
    }
    Functions: {
      generate_order_number: {
        Args: Record<string, never>
        Returns: string
      }
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
  }
}

// Convenience row types (shorter to use in query return types)
export type ArtworkRow = Database['public']['Tables']['artworks']['Row']
export type ArtworkInsert = Database['public']['Tables']['artworks']['Insert']
export type OrderRow = Database['public']['Tables']['orders']['Row']
export type OrderItemRow = Database['public']['Tables']['order_items']['Row']
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert']
export type OrderActivityRow = Database['public']['Tables']['order_activity']['Row']
export type AdminRow = Database['public']['Tables']['admins']['Row']
export type SettingsRow = Database['public']['Tables']['settings']['Row']
