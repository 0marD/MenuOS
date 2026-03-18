export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          banner_url: string | null;
          primary_color: string | null;
          secondary_color: string | null;
          template_id: string | null;
          plan: 'starter' | 'pro' | 'business';
          subscription_status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive';
          subscription_id: string | null;
          trial_ends_at: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          stripe_price_id: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          banner_url?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          template_id?: string | null;
          plan?: 'starter' | 'pro' | 'business';
          subscription_status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive';
          subscription_id?: string | null;
          trial_ends_at?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
        Relationships: [];
      };
      branches: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          address: string | null;
          phone: string | null;
          latitude: number | null;
          longitude: number | null;
          timezone: string;
          is_active: boolean;
          is_temporarily_closed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          address?: string | null;
          phone?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          timezone?: string;
          is_active?: boolean;
          is_temporarily_closed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['branches']['Insert']>;
        Relationships: [];
      };
      branch_schedules: {
        Row: {
          id: string;
          branch_id: string;
          day_of_week: number;
          opens_at: string | null;
          closes_at: string | null;
          is_closed: boolean;
        };
        Insert: {
          id?: string;
          branch_id: string;
          day_of_week: number;
          opens_at?: string | null;
          closes_at?: string | null;
          is_closed?: boolean;
        };
        Update: Partial<Database['public']['Tables']['branch_schedules']['Insert']>;
        Relationships: [];
      };
      staff_users: {
        Row: {
          id: string;
          auth_id: string | null;
          organization_id: string;
          branch_ids: string[];
          name: string;
          email: string | null;
          role: 'super_admin' | 'manager' | 'waiter' | 'kitchen';
          pin_hash: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_id?: string | null;
          organization_id: string;
          branch_ids?: string[];
          name: string;
          email?: string | null;
          role: 'super_admin' | 'manager' | 'waiter' | 'kitchen';
          pin_hash?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['staff_users']['Insert']>;
        Relationships: [];
      };
      design_templates: {
        Row: {
          id: string;
          name: string;
          preview_url: string | null;
          config: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          preview_url?: string | null;
          config?: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['design_templates']['Insert']>;
        Relationships: [];
      };
      org_settings: {
        Row: {
          id: string;
          organization_id: string;
          key: string;
          value: Json | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          key: string;
          value?: Json | null;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['org_settings']['Insert']>;
        Relationships: [];
      };
      org_texts: {
        Row: {
          id: string;
          organization_id: string;
          key: string;
          value: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          key: string;
          value?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['org_texts']['Insert']>;
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          old_value: Json | null;
          new_value: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id?: string | null;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          old_value?: Json | null;
          new_value?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      menu_categories: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          icon: string | null;
          color: string | null;
          sort_order: number;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          icon?: string | null;
          color?: string | null;
          sort_order?: number;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['menu_categories']['Insert']>;
        Relationships: [];
      };
      menu_items: {
        Row: {
          id: string;
          organization_id: string;
          category_id: string;
          name: string;
          description: string | null;
          base_price: number;
          photo_url: string | null;
          is_available: boolean;
          is_sold_out_today: boolean;
          is_special: boolean;
          is_vegetarian: boolean;
          is_gluten_free: boolean;
          is_spicy: boolean;
          sort_order: number;
          preparation_time_minutes: number | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          category_id: string;
          name: string;
          description?: string | null;
          base_price: number;
          photo_url?: string | null;
          is_available?: boolean;
          is_sold_out_today?: boolean;
          is_special?: boolean;
          is_vegetarian?: boolean;
          is_gluten_free?: boolean;
          is_spicy?: boolean;
          sort_order?: number;
          preparation_time_minutes?: number | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['menu_items']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'menu_items_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'menu_categories';
            referencedColumns: ['id'];
          },
        ];
      };
      customers: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          whatsapp_number: string;
          phone_hash: string | null;
          segment: 'new' | 'frequent' | 'dormant';
          first_visit_at: string;
          last_visit_at: string | null;
          visit_count: number;
          birthday: string | null;
          opt_in_marketing: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          whatsapp_number: string;
          phone_hash?: string | null;
          segment?: 'new' | 'frequent' | 'dormant';
          first_visit_at?: string;
          last_visit_at?: string | null;
          visit_count?: number;
          birthday?: string | null;
          opt_in_marketing?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['customers']['Insert']>;
        Relationships: [];
      };
      customer_visits: {
        Row: {
          id: string;
          customer_id: string;
          organization_id: string;
          branch_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          organization_id: string;
          branch_id?: string | null;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      customer_consents: {
        Row: {
          id: string;
          customer_id: string;
          organization_id: string;
          consent_type: string;
          granted: boolean;
          granted_at: string | null;
          revoked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          organization_id: string;
          consent_type: string;
          granted?: boolean;
          granted_at?: string | null;
          revoked_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['customer_consents']['Insert']>;
        Relationships: [];
      };
      campaigns: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          template_name: string;
          message_body: string | null;
          segment: string;
          status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
          scheduled_at: string | null;
          sent_at: string | null;
          total_recipients: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          template_name: string;
          message_body?: string | null;
          segment?: string;
          status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
          scheduled_at?: string | null;
          sent_at?: string | null;
          total_recipients?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['campaigns']['Insert']>;
        Relationships: [];
      };
      campaign_analytics: {
        Row: {
          id: string;
          campaign_id: string;
          total_sent: number;
          total_delivered: number;
          total_read: number;
          total_failed: number;
          total_clicks: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          total_sent?: number;
          total_delivered?: number;
          total_read?: number;
          total_failed?: number;
          total_clicks?: number;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['campaign_analytics']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'campaign_analytics_campaign_id_fkey';
            columns: ['campaign_id'];
            isOneToOne: true;
            referencedRelation: 'campaigns';
            referencedColumns: ['id'];
          },
        ];
      };
      loyalty_programs: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          stamps_required: number;
          reward_description: string;
          reward_type: string;
          is_active: boolean;
          stamps_expiry_days: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          stamps_required?: number;
          reward_description: string;
          reward_type?: string;
          is_active?: boolean;
          stamps_expiry_days?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['loyalty_programs']['Insert']>;
        Relationships: [];
      };
      stamp_cards: {
        Row: {
          id: string;
          program_id: string;
          customer_id: string;
          organization_id: string;
          stamps_count: number;
          is_complete: boolean;
          completed_at: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          program_id: string;
          customer_id: string;
          organization_id: string;
          stamps_count?: number;
          is_complete?: boolean;
          completed_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['stamp_cards']['Insert']>;
        Relationships: [];
      };
      stamps: {
        Row: {
          id: string;
          stamp_card_id: string;
          customer_id: string;
          organization_id: string;
          branch_id: string | null;
          table_id: string | null;
          granted_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          stamp_card_id: string;
          customer_id: string;
          organization_id: string;
          branch_id?: string | null;
          table_id?: string | null;
          granted_by?: string | null;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      rewards: {
        Row: {
          id: string;
          stamp_card_id: string;
          customer_id: string;
          program_id: string;
          organization_id: string;
          code: string;
          is_redeemed: boolean;
          redeemed_at: string | null;
          redeemed_by: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          stamp_card_id: string;
          customer_id: string;
          program_id: string;
          organization_id: string;
          code: string;
          is_redeemed?: boolean;
          redeemed_at?: string | null;
          redeemed_by?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['rewards']['Insert']>;
        Relationships: [];
      };
      restaurant_tables: {
        Row: {
          id: string;
          branch_id: string;
          organization_id: string;
          name: string;
          zone: string | null;
          qr_token: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          branch_id: string;
          organization_id: string;
          name: string;
          zone?: string | null;
          qr_token: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['restaurant_tables']['Insert']>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          branch_id: string;
          organization_id: string;
          table_id: string | null;
          customer_id: string | null;
          status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
          total_amount: number;
          notes: string | null;
          created_at: string;
          confirmed_at: string | null;
          ready_at: string | null;
          delivered_at: string | null;
          cancelled_at: string | null;
          payment_method: 'cash' | 'card' | 'transfer' | 'pending' | null;
          paid_at: string | null;
        };
        Insert: {
          id?: string;
          branch_id: string;
          organization_id: string;
          table_id?: string | null;
          customer_id?: string | null;
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
          total_amount: number;
          notes?: string | null;
          created_at?: string;
          confirmed_at?: string | null;
          ready_at?: string | null;
          delivered_at?: string | null;
          cancelled_at?: string | null;
          payment_method?: 'cash' | 'card' | 'transfer' | 'pending' | null;
          paid_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          menu_item_id: string;
          name: string;
          price: number;
          quantity: number;
          notes: string | null;
          is_ready: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          menu_item_id: string;
          name: string;
          price: number;
          quantity: number;
          notes?: string | null;
          is_ready?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
        ];
      };
      order_status_history: {
        Row: {
          id: string;
          order_id: string;
          status: string;
          changed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          status: string;
          changed_by?: string | null;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          id: string;
          staff_user_id: string;
          organization_id: string;
          branch_id: string | null;
          role: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          staff_user_id: string;
          organization_id: string;
          branch_id?: string | null;
          role: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['push_subscriptions']['Insert']>;
        Relationships: [];
      };
      otp_codes: {
        Row: {
          id: string;
          phone_hash: string;
          organization_id: string;
          code: string;
          expires_at: string;
          attempts: number;
          verified_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          phone_hash: string;
          organization_id: string;
          code: string;
          expires_at?: string;
          attempts?: number;
          verified_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['otp_codes']['Insert']>;
        Relationships: [];
      };
      wa_message_templates: {
        Row: {
          id: string;
          organization_id: string | null;
          template_key: string;
          display_name: string;
          message_body: string;
          variables: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          template_key: string;
          display_name: string;
          message_body: string;
          variables?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['wa_message_templates']['Insert']>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    CompositeTypes: {};
    Enums: {
      plan_type: 'starter' | 'pro' | 'business';
      subscription_status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive';
      user_role: 'super_admin' | 'manager' | 'waiter' | 'kitchen';
      order_status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
      customer_segment: 'new' | 'frequent' | 'dormant';
      campaign_status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
    };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];
