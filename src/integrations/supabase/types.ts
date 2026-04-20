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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      branches: {
        Row: {
          address: string
          created_at: string
          id: string
          is_main: boolean
          name: string
          phone: string
          updated_at: string
        }
        Insert: {
          address?: string
          created_at?: string
          id?: string
          is_main?: boolean
          name: string
          phone?: string
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          is_main?: boolean
          name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          active: boolean
          branch_id: string | null
          created_at: string
          id: string
          name: string
          phone: string
          role: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          branch_id?: string | null
          created_at?: string
          id?: string
          name: string
          phone?: string
          role?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          branch_id?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          buy_price: number
          category: string
          created_at: string
          id: string
          min_stock: number
          name: string
          price: number
          stock: number
          updated_at: string
        }
        Insert: {
          buy_price?: number
          category?: string
          created_at?: string
          id?: string
          min_stock?: number
          name: string
          price?: number
          stock?: number
          updated_at?: string
        }
        Update: {
          buy_price?: number
          category?: string
          created_at?: string
          id?: string
          min_stock?: number
          name?: string
          price?: number
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          complaint: string
          created_at: string
          customer_name: string
          device_brand: string
          device_model: string | null
          dp_amount: number
          id: string
          invoice: string
          notes: string | null
          phone: string | null
          status: string
          technician_id: string | null
          total_cost: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          complaint: string
          created_at?: string
          customer_name: string
          device_brand: string
          device_model?: string | null
          dp_amount?: number
          id?: string
          invoice: string
          notes?: string | null
          phone?: string | null
          status?: string
          technician_id?: string | null
          total_cost?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          complaint?: string
          created_at?: string
          customer_name?: string
          device_brand?: string
          device_model?: string | null
          dp_amount?: number
          id?: string
          invoice?: string
          notes?: string | null
          phone?: string | null
          status?: string
          technician_id?: string | null
          total_cost?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_settings: {
        Row: {
          address: string
          created_at: string
          footer: string
          id: string
          logo: string | null
          name: string
          phone: string
          updated_at: string
        }
        Insert: {
          address?: string
          created_at?: string
          footer?: string
          id?: string
          logo?: string | null
          name?: string
          phone?: string
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          footer?: string
          id?: string
          logo?: string | null
          name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      transaction_items: {
        Row: {
          category: string
          id: string
          name: string
          price: number
          qty: number
          transaction_id: string
        }
        Insert: {
          category?: string
          id?: string
          name: string
          price?: number
          qty?: number
          transaction_id: string
        }
        Update: {
          category?: string
          id?: string
          name?: string
          price?: number
          qty?: number
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          bayar: number
          created_at: string
          id: string
          invoice: string
          kembalian: number
          total: number
          user_id: string
        }
        Insert: {
          bayar?: number
          created_at?: string
          id?: string
          invoice: string
          kembalian?: number
          total?: number
          user_id: string
        }
        Update: {
          bayar?: number
          created_at?: string
          id?: string
          invoice?: string
          kembalian?: number
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wa_templates: {
        Row: {
          created_at: string
          icon: string
          id: string
          key: string
          message: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          key: string
          message: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          key?: string
          message?: string
          title?: string
          updated_at?: string
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
      lookup_service_status: {
        Args: { _invoice: string; _phone: string }
        Returns: {
          created_at: string
          customer_name: string
          device_brand: string
          device_model: string
          dp_amount: number
          invoice: string
          status: string
          total_cost: number
          updated_at: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "teknisi" | "kasir"
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
      app_role: ["admin", "teknisi", "kasir"],
    },
  },
} as const
