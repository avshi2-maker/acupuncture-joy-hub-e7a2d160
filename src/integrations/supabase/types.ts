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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      access_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      access_passwords: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_used: boolean
          password_hash: string
          plain_password: string
          therapist_registration_id: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_used?: boolean
          password_hash: string
          plain_password: string
          therapist_registration_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_used?: boolean
          password_hash?: string
          plain_password?: string
          therapist_registration_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
        }
        Relationships: [
          {
            foreignKeyName: "access_passwords_therapist_registration_id_fkey"
            columns: ["therapist_registration_id"]
            isOneToOne: false
            referencedRelation: "therapist_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      acupuncture_points: {
        Row: {
          actions: string[] | null
          code: string
          contraindications: string[] | null
          created_at: string
          depth: string | null
          id: string
          indications: string[] | null
          location: string
          meridian: string
          name_chinese: string
          name_english: string
          name_pinyin: string
          notes: string | null
        }
        Insert: {
          actions?: string[] | null
          code: string
          contraindications?: string[] | null
          created_at?: string
          depth?: string | null
          id?: string
          indications?: string[] | null
          location: string
          meridian: string
          name_chinese: string
          name_english: string
          name_pinyin: string
          notes?: string | null
        }
        Update: {
          actions?: string[] | null
          code?: string
          contraindications?: string[] | null
          created_at?: string
          depth?: string | null
          id?: string
          indications?: string[] | null
          location?: string
          meridian?: string
          name_chinese?: string
          name_english?: string
          name_pinyin?: string
          notes?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          created_at: string
          end_time: string
          id: string
          notes: string | null
          patient_id: string | null
          start_time: string
          status: string
          therapist_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          start_time: string
          status?: string
          therapist_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          start_time?: string
          status?: string
          therapist_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_feedback: {
        Row: {
          created_at: string
          id: string
          message_content: string
          rating: string
          response_content: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_content: string
          rating: string
          response_content: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_content?: string
          rating?: string
          response_content?: string
          user_id?: string
        }
        Relationships: []
      }
      conditions: {
        Row: {
          created_at: string
          id: string
          lifestyle_advice: string[] | null
          name_chinese: string | null
          name_english: string
          notes: string | null
          recommended_herbs: string[] | null
          recommended_points: string[] | null
          symptoms: string[] | null
          tcm_patterns: string[] | null
          treatment_principles: string[] | null
        }
        Insert: {
          created_at?: string
          id?: string
          lifestyle_advice?: string[] | null
          name_chinese?: string | null
          name_english: string
          notes?: string | null
          recommended_herbs?: string[] | null
          recommended_points?: string[] | null
          symptoms?: string[] | null
          tcm_patterns?: string[] | null
          treatment_principles?: string[] | null
        }
        Update: {
          created_at?: string
          id?: string
          lifestyle_advice?: string[] | null
          name_chinese?: string | null
          name_english?: string
          notes?: string | null
          recommended_herbs?: string[] | null
          recommended_points?: string[] | null
          symptoms?: string[] | null
          tcm_patterns?: string[] | null
          treatment_principles?: string[] | null
        }
        Relationships: []
      }
      follow_ups: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          reason: string | null
          scheduled_date: string
          status: string
          therapist_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          reason?: string | null
          scheduled_date: string
          status?: string
          therapist_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          reason?: string | null
          scheduled_date?: string
          status?: string
          therapist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      herbs: {
        Row: {
          actions: string[] | null
          category: string
          contraindications: string[] | null
          created_at: string
          dosage: string | null
          flavor: string[] | null
          id: string
          indications: string[] | null
          meridians: string[] | null
          name_chinese: string
          name_english: string
          name_pinyin: string
          nature: string | null
          notes: string | null
        }
        Insert: {
          actions?: string[] | null
          category: string
          contraindications?: string[] | null
          created_at?: string
          dosage?: string | null
          flavor?: string[] | null
          id?: string
          indications?: string[] | null
          meridians?: string[] | null
          name_chinese: string
          name_english: string
          name_pinyin: string
          nature?: string | null
          notes?: string | null
        }
        Update: {
          actions?: string[] | null
          category?: string
          contraindications?: string[] | null
          created_at?: string
          dosage?: string | null
          flavor?: string[] | null
          id?: string
          indications?: string[] | null
          meridians?: string[] | null
          name_chinese?: string
          name_english?: string
          name_pinyin?: string
          nature?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          allergies: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          full_name: string
          gender: string | null
          id: string
          medical_history: string | null
          medications: string | null
          notes: string | null
          phone: string | null
          therapist_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          allergies?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name: string
          gender?: string | null
          id?: string
          medical_history?: string | null
          medications?: string | null
          notes?: string | null
          phone?: string | null
          therapist_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          allergies?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          medical_history?: string | null
          medications?: string | null
          notes?: string | null
          phone?: string | null
          therapist_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      therapist_registrations: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
          requested_tier: Database["public"]["Enums"]["subscription_tier"]
          status: Database["public"]["Enums"]["registration_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone: string
          requested_tier?: Database["public"]["Enums"]["subscription_tier"]
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string
          requested_tier?: Database["public"]["Enums"]["subscription_tier"]
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
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
      visits: {
        Row: {
          chief_complaint: string | null
          created_at: string
          cupping: boolean | null
          follow_up_recommended: string | null
          herbs_prescribed: string | null
          id: string
          moxa: boolean | null
          notes: string | null
          other_techniques: string | null
          patient_id: string
          points_used: string[] | null
          pulse_diagnosis: string | null
          tcm_pattern: string | null
          therapist_id: string
          tongue_diagnosis: string | null
          treatment_principle: string | null
          updated_at: string
          visit_date: string
        }
        Insert: {
          chief_complaint?: string | null
          created_at?: string
          cupping?: boolean | null
          follow_up_recommended?: string | null
          herbs_prescribed?: string | null
          id?: string
          moxa?: boolean | null
          notes?: string | null
          other_techniques?: string | null
          patient_id: string
          points_used?: string[] | null
          pulse_diagnosis?: string | null
          tcm_pattern?: string | null
          therapist_id: string
          tongue_diagnosis?: string | null
          treatment_principle?: string | null
          updated_at?: string
          visit_date?: string
        }
        Update: {
          chief_complaint?: string | null
          created_at?: string
          cupping?: boolean | null
          follow_up_recommended?: string | null
          herbs_prescribed?: string | null
          id?: string
          moxa?: boolean | null
          notes?: string | null
          other_techniques?: string | null
          patient_id?: string
          points_used?: string[] | null
          pulse_diagnosis?: string | null
          tcm_pattern?: string | null
          therapist_id?: string
          tongue_diagnosis?: string | null
          treatment_principle?: string | null
          updated_at?: string
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Enums: {
      app_role: "admin" | "therapist" | "patient"
      registration_status: "pending" | "trial" | "active" | "expired"
      subscription_tier: "trial" | "standard" | "premium"
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
      app_role: ["admin", "therapist", "patient"],
      registration_status: ["pending", "trial", "active", "expired"],
      subscription_tier: ["trial", "standard", "premium"],
    },
  },
} as const
