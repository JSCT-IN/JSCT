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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      appeals: {
        Row: {
          closed_at: string | null
          code: string
          collected_amount: number
          created_at: string
          description: string
          event_date: string
          id: string
          inspector_name: string
          inspector_notes: string | null
          inspector_phone: string
          member_id: string
          nominee_snapshot: Json
          status: Database["public"]["Enums"]["appeal_status"]
          supporting_docs: Json | null
          target_amount: number
          title: string
          type: Database["public"]["Enums"]["appeal_type"]
        }
        Insert: {
          closed_at?: string | null
          code: string
          collected_amount?: number
          created_at?: string
          description: string
          event_date?: string
          id?: string
          inspector_name: string
          inspector_notes?: string | null
          inspector_phone?: string
          member_id: string
          nominee_snapshot: Json
          status?: Database["public"]["Enums"]["appeal_status"]
          supporting_docs?: Json | null
          target_amount?: number
          title: string
          type: Database["public"]["Enums"]["appeal_type"]
        }
        Update: {
          closed_at?: string | null
          code?: string
          collected_amount?: number
          created_at?: string
          description?: string
          event_date?: string
          id?: string
          inspector_name?: string
          inspector_notes?: string | null
          inspector_phone?: string
          member_id?: string
          nominee_snapshot?: Json
          status?: Database["public"]["Enums"]["appeal_status"]
          supporting_docs?: Json | null
          target_amount?: number
          title?: string
          type?: Database["public"]["Enums"]["appeal_type"]
        }
        Relationships: [
          {
            foreignKeyName: "appeals_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_records: {
        Row: {
          amount: number
          appeal_id: string
          created_at: string
          donor_id: string
          id: string
          inspector_notes: string | null
          slip_url: string
          status: Database["public"]["Enums"]["donation_status"]
          utr_number: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount?: number
          appeal_id: string
          created_at?: string
          donor_id: string
          id?: string
          inspector_notes?: string | null
          slip_url: string
          status?: Database["public"]["Enums"]["donation_status"]
          utr_number: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          appeal_id?: string
          created_at?: string
          donor_id?: string
          id?: string
          inspector_notes?: string | null
          slip_url?: string
          status?: Database["public"]["Enums"]["donation_status"]
          utr_number?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donation_records_appeal_id_fkey"
            columns: ["appeal_id"]
            isOneToOne: false
            referencedRelation: "appeals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_records_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_records_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          aadhaar_hash: string
          aadhaar_last4: string
          address_full: string | null
          avatar_url: string | null
          block_name: string | null
          created_at: string
          department: string
          district: string
          dob: string | null
          email: string | null
          father_name: string | null
          fee_expires_at: string
          full_name: string
          gender: string | null
          id: string
          is_active: boolean
          marital_status: string | null
          membership_id: string
          occupation: string | null
          phone: string
          registration_slip_url: string | null
          registration_utr: string | null
          role: Database["public"]["Enums"]["member_role"]
          state: string
          updated_at: string
        }
        Insert: {
          aadhaar_hash?: string
          aadhaar_last4: string
          address_full?: string | null
          avatar_url?: string | null
          block_name?: string | null
          created_at?: string
          department: string
          district: string
          dob?: string | null
          email?: string | null
          father_name?: string | null
          fee_expires_at?: string
          full_name: string
          gender?: string | null
          id?: string
          is_active?: boolean
          marital_status?: string | null
          membership_id: string
          occupation?: string | null
          phone: string
          registration_slip_url?: string | null
          registration_utr?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          state?: string
          updated_at?: string
        }
        Update: {
          aadhaar_hash?: string
          aadhaar_last4?: string
          address_full?: string | null
          avatar_url?: string | null
          block_name?: string | null
          created_at?: string
          department?: string
          district?: string
          dob?: string | null
          email?: string | null
          father_name?: string | null
          fee_expires_at?: string
          full_name?: string
          gender?: string | null
          id?: string
          is_active?: boolean
          marital_status?: string | null
          membership_id?: string
          occupation?: string | null
          phone?: string
          registration_slip_url?: string | null
          registration_utr?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      nominees: {
        Row: {
          account_number: string
          bank_name: string
          created_at: string
          full_name: string
          id: string
          ifsc_code: string
          is_primary: boolean
          member_id: string
          nominee_age: number | null
          nominee_phone: string | null
          relationship: string
          updated_at: string
          upi_id: string
        }
        Insert: {
          account_number: string
          bank_name: string
          created_at?: string
          full_name: string
          id?: string
          ifsc_code: string
          is_primary?: boolean
          member_id: string
          nominee_age?: number | null
          nominee_phone?: string | null
          relationship: string
          updated_at?: string
          upi_id: string
        }
        Update: {
          account_number?: string
          bank_name?: string
          created_at?: string
          full_name?: string
          id?: string
          ifsc_code?: string
          is_primary?: boolean
          member_id?: string
          nominee_age?: number | null
          nominee_phone?: string | null
          relationship?: string
          updated_at?: string
          upi_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nominees_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      appeal_status: "SUBMITTED" | "ACTIVE" | "CLOSED"
      appeal_type: "BEREAVEMENT" | "DAUGHTER_MARRIAGE"
      donation_status: "SUBMITTED" | "VERIFIED" | "REJECTED"
      member_role: "MEMBER" | "INSPECTOR" | "ADMIN"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      appeal_status: ["SUBMITTED", "ACTIVE", "CLOSED"],
      appeal_type: ["BEREAVEMENT", "DAUGHTER_MARRIAGE"],
      donation_status: ["SUBMITTED", "VERIFIED", "REJECTED"],
      member_role: ["MEMBER", "INSPECTOR", "ADMIN"],
    },
  },
} as const
