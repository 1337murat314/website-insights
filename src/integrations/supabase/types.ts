export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      branch_menu_items: {
        Row: {
          branch_id: string
          created_at: string
          id: string
          is_available: boolean | null
          menu_item_id: string
          price_override: number | null
          updated_at: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          id?: string
          is_available?: boolean | null
          menu_item_id: string
          price_override?: number | null
          updated_at?: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          id?: string
          is_available?: boolean | null
          menu_item_id?: string
          price_override?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_menu_items_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_menu_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          created_at: string
          hours: string | null
          id: string
          is_active: boolean | null
          map_url: string | null
          name: string
          name_tr: string | null
          phone: string | null
          slug: string | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          hours?: string | null
          id?: string
          is_active?: boolean | null
          map_url?: string | null
          name: string
          name_tr?: string | null
          phone?: string | null
          slug?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          hours?: string | null
          id?: string
          is_active?: boolean | null
          map_url?: string | null
          name?: string
          name_tr?: string | null
          phone?: string | null
          slug?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      catering_products: {
        Row: {
          category: string
          category_tr: string | null
          created_at: string
          description: string | null
          description_tr: string | null
          id: string
          is_available: boolean | null
          max_quantity: number | null
          min_quantity: number
          name: string
          name_tr: string | null
          price_per_unit: number
          sort_order: number | null
          unit: string
          unit_tr: string | null
          updated_at: string
        }
        Insert: {
          category: string
          category_tr?: string | null
          created_at?: string
          description?: string | null
          description_tr?: string | null
          id?: string
          is_available?: boolean | null
          max_quantity?: number | null
          min_quantity?: number
          name: string
          name_tr?: string | null
          price_per_unit?: number
          sort_order?: number | null
          unit?: string
          unit_tr?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          category_tr?: string | null
          created_at?: string
          description?: string | null
          description_tr?: string | null
          id?: string
          is_available?: boolean | null
          max_quantity?: number | null
          min_quantity?: number
          name?: string
          name_tr?: string | null
          price_per_unit?: number
          sort_order?: number | null
          unit?: string
          unit_tr?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      guests: {
        Row: {
          anniversary: string | null
          birthday: string | null
          created_at: string
          dietary_restrictions: string[] | null
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          preferences: Json | null
          seating_preference: string | null
          tags: string[] | null
          total_spent: number | null
          total_visits: number | null
          updated_at: string
          vip_status: boolean | null
        }
        Insert: {
          anniversary?: string | null
          birthday?: string | null
          created_at?: string
          dietary_restrictions?: string[] | null
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          preferences?: Json | null
          seating_preference?: string | null
          tags?: string[] | null
          total_spent?: number | null
          total_visits?: number | null
          updated_at?: string
          vip_status?: boolean | null
        }
        Update: {
          anniversary?: string | null
          birthday?: string | null
          created_at?: string
          dietary_restrictions?: string[] | null
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          preferences?: Json | null
          seating_preference?: string | null
          tags?: string[] | null
          total_spent?: number | null
          total_visits?: number | null
          updated_at?: string
          vip_status?: boolean | null
        }
        Relationships: []
      }
      menu_categories: {
        Row: {
          created_at: string
          description: string | null
          description_tr: string | null
          id: string
          is_active: boolean | null
          name: string
          name_tr: string | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_tr?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_tr?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_tr?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_tr?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      menu_item_sizes: {
        Row: {
          created_at: string
          id: string
          is_default: boolean | null
          menu_item_id: string
          name: string
          name_tr: string | null
          price_adjustment: number | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          menu_item_id: string
          name: string
          name_tr?: string | null
          price_adjustment?: number | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          menu_item_id?: string
          name?: string
          name_tr?: string | null
          price_adjustment?: number | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_sizes_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          description_tr: string | null
          has_sizes: boolean | null
          id: string
          image_url: string | null
          is_available: boolean | null
          is_featured: boolean | null
          is_gluten_free: boolean | null
          is_spicy: boolean | null
          is_vegan: boolean | null
          is_vegetarian: boolean | null
          name: string
          name_tr: string | null
          price: number
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          description_tr?: string | null
          has_sizes?: boolean | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_featured?: boolean | null
          is_gluten_free?: boolean | null
          is_spicy?: boolean | null
          is_vegan?: boolean | null
          is_vegetarian?: boolean | null
          name: string
          name_tr?: string | null
          price: number
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          description_tr?: string | null
          has_sizes?: boolean | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_featured?: boolean | null
          is_gluten_free?: boolean | null
          is_spicy?: boolean | null
          is_vegan?: boolean | null
          is_vegetarian?: boolean | null
          name?: string
          name_tr?: string | null
          price?: number
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      modifier_groups: {
        Row: {
          created_at: string
          id: string
          is_required: boolean | null
          max_selections: number | null
          menu_item_id: string | null
          min_selections: number | null
          name: string
          name_tr: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_required?: boolean | null
          max_selections?: number | null
          menu_item_id?: string | null
          min_selections?: number | null
          name: string
          name_tr?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_required?: boolean | null
          max_selections?: number | null
          menu_item_id?: string | null
          min_selections?: number | null
          name?: string
          name_tr?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modifier_groups_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      modifiers: {
        Row: {
          created_at: string
          id: string
          is_available: boolean | null
          modifier_group_id: string
          name: string
          name_tr: string | null
          price_adjustment: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_available?: boolean | null
          modifier_group_id: string
          name: string
          name_tr?: string | null
          price_adjustment?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_available?: boolean | null
          modifier_group_id?: string
          name?: string
          name_tr?: string | null
          price_adjustment?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "modifiers_modifier_group_id_fkey"
            columns: ["modifier_group_id"]
            isOneToOne: false
            referencedRelation: "modifier_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          item_name: string
          item_name_tr: string | null
          menu_item_id: string | null
          modifiers: Json | null
          order_id: string
          quantity: number
          special_instructions: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_name: string
          item_name_tr?: string | null
          menu_item_id?: string | null
          modifiers?: Json | null
          order_id: string
          quantity?: number
          special_instructions?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          item_name?: string
          item_name_tr?: string | null
          menu_item_id?: string | null
          modifiers?: Json | null
          order_id?: string
          quantity?: number
          special_instructions?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          branch_id: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string | null
          delivery_notes: string | null
          estimated_prep_time: number | null
          id: string
          notes: string | null
          order_number: number
          order_type: string
          payment_method: string
          pickup_time: string | null
          status: string
          subtotal: number
          table_number: string | null
          tax: number
          total: number
          updated_at: string
          verification_code: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          delivery_address?: string | null
          delivery_notes?: string | null
          estimated_prep_time?: number | null
          id?: string
          notes?: string | null
          order_number?: number
          order_type: string
          payment_method: string
          pickup_time?: string | null
          status?: string
          subtotal?: number
          table_number?: string | null
          tax?: number
          total?: number
          updated_at?: string
          verification_code: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_address?: string | null
          delivery_notes?: string | null
          estimated_prep_time?: number | null
          id?: string
          notes?: string | null
          order_number?: number
          order_type?: string
          payment_method?: string
          pickup_time?: string | null
          status?: string
          subtotal?: number
          table_number?: string | null
          tax?: number
          total?: number
          updated_at?: string
          verification_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          current_uses: number | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_spend: number | null
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_spend?: number | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_spend?: number | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      reservations: {
        Row: {
          branch_id: string | null
          created_at: string
          guest_email: string
          guest_id: string | null
          guest_name: string
          guest_phone: string | null
          id: string
          notes: string | null
          party_size: number
          reservation_date: string
          reservation_time: string
          special_requests: string | null
          status: Database["public"]["Enums"]["reservation_status"]
          table_id: string | null
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          guest_email: string
          guest_id?: string | null
          guest_name: string
          guest_phone?: string | null
          id?: string
          notes?: string | null
          party_size?: number
          reservation_date: string
          reservation_time: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          table_id?: string | null
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          guest_email?: string
          guest_id?: string | null
          guest_name?: string
          guest_phone?: string | null
          id?: string
          notes?: string | null
          party_size?: number
          reservation_date?: string
          reservation_time?: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          table_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      restaurant_tables: {
        Row: {
          branch_id: string | null
          capacity: number
          created_at: string
          id: string
          is_available: boolean | null
          location: string | null
          pos_x: number | null
          pos_y: number | null
          table_number: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          capacity?: number
          created_at?: string
          id?: string
          is_available?: boolean | null
          location?: string | null
          pos_x?: number | null
          pos_y?: number | null
          table_number: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          capacity?: number
          created_at?: string
          id?: string
          is_available?: boolean | null
          location?: string | null
          pos_x?: number | null
          pos_y?: number | null
          table_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_tables_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          branch_id: string | null
          created_at: string
          id: string
          order_id: string | null
          request_type: string
          status: string
          table_number: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          request_type: string
          status?: string
          table_number: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          request_type?: string
          status?: string
          table_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      special_events: {
        Row: {
          capacity: number | null
          created_at: string
          description: string | null
          description_tr: string | null
          end_time: string | null
          event_date: string
          id: string
          image_url: string | null
          is_active: boolean | null
          price: number | null
          start_time: string
          title: string
          title_tr: string | null
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          description_tr?: string | null
          end_time?: string | null
          event_date: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          price?: number | null
          start_time: string
          title: string
          title_tr?: string | null
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          description_tr?: string | null
          end_time?: string | null
          event_date?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          price?: number | null
          start_time?: string
          title?: string
          title_tr?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      staff_logins: {
        Row: {
          branch_id: string | null
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          role: string
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          role: string
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_logins_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_manager: { Args: { _user_id: string }; Returns: boolean }
      is_waiter_or_above: { Args: { _user_id: string }; Returns: boolean }
      verify_staff_login:
        | {
            Args: { staff_code: string; staff_name: string; staff_role: string }
            Returns: string
          }
        | {
            Args: {
              staff_branch_id?: string
              staff_code: string
              staff_name: string
              staff_role: string
            }
            Returns: Json
          }
      verify_staff_login_by_slug: {
        Args: {
          staff_branch_slug?: string
          staff_code: string
          staff_name: string
          staff_role: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "staff" | "waiter"
      reservation_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "no_show"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "manager", "staff", "waiter"],
      reservation_status: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "no_show",
      ],
    },
  },
} as const
