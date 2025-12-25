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
      appointment_confirmations: {
        Row: {
          appointment_id: string
          created_at: string
          expires_at: string
          id: string
          responded_at: string | null
          response: string | null
          token: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          expires_at: string
          id?: string
          responded_at?: string | null
          response?: string | null
          token: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          responded_at?: string | null
          response?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_confirmations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          clinic_id: string | null
          color: string | null
          created_at: string
          end_time: string
          id: string
          is_recurring: boolean | null
          notes: string | null
          parent_appointment_id: string | null
          patient_id: string | null
          recurrence_end_date: string | null
          recurrence_rule: string | null
          room_id: string | null
          start_time: string
          status: string
          therapist_id: string
          title: string
          updated_at: string
        }
        Insert: {
          clinic_id?: string | null
          color?: string | null
          created_at?: string
          end_time: string
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          parent_appointment_id?: string | null
          patient_id?: string | null
          recurrence_end_date?: string | null
          recurrence_rule?: string | null
          room_id?: string | null
          start_time: string
          status?: string
          therapist_id: string
          title: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string | null
          color?: string | null
          created_at?: string
          end_time?: string
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          parent_appointment_id?: string | null
          patient_id?: string | null
          recurrence_end_date?: string | null
          recurrence_rule?: string | null
          room_id?: string | null
          start_time?: string
          status?: string
          therapist_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_parent_appointment_id_fkey"
            columns: ["parent_appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
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
      clinic_staff: {
        Row: {
          clinic_id: string
          created_at: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["clinic_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["clinic_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["clinic_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_staff_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          owner_id: string
          phone: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          owner_id: string
          phone?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          owner_id?: string
          phone?: string | null
          timezone?: string | null
          updated_at?: string
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
      knowledge_chunks: {
        Row: {
          answer: string | null
          chunk_index: number
          content: string
          content_type: string | null
          created_at: string
          document_id: string
          id: string
          metadata: Json | null
          question: string | null
        }
        Insert: {
          answer?: string | null
          chunk_index: number
          content: string
          content_type?: string | null
          created_at?: string
          document_id: string
          id?: string
          metadata?: Json | null
          question?: string | null
        }
        Update: {
          answer?: string | null
          chunk_index?: number
          content?: string
          content_type?: string | null
          created_at?: string
          document_id?: string
          id?: string
          metadata?: Json | null
          question?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "knowledge_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_documents: {
        Row: {
          category: string | null
          created_at: string
          file_hash: string
          file_name: string
          file_size: number | null
          id: string
          indexed_at: string | null
          language: string | null
          mime_type: string | null
          original_name: string
          row_count: number | null
          status: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          file_hash: string
          file_name: string
          file_size?: number | null
          id?: string
          indexed_at?: string | null
          language?: string | null
          mime_type?: string | null
          original_name: string
          row_count?: number | null
          status?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          file_hash?: string
          file_name?: string
          file_size?: number | null
          id?: string
          indexed_at?: string | null
          language?: string | null
          mime_type?: string | null
          original_name?: string
          row_count?: number | null
          status?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      page_feedback: {
        Row: {
          created_at: string
          feedback_text: string
          id: string
          page_name: string | null
          page_url: string
          rating: number | null
          visitor_email: string | null
          visitor_name: string | null
        }
        Insert: {
          created_at?: string
          feedback_text: string
          id?: string
          page_name?: string | null
          page_url: string
          rating?: number | null
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Update: {
          created_at?: string
          feedback_text?: string
          id?: string
          page_name?: string | null
          page_url?: string
          rating?: number | null
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Relationships: []
      }
      patient_consents: {
        Row: {
          answers: Json | null
          clinic_id: string | null
          consent_type: string
          created_at: string
          form_version: string | null
          id: string
          ip_address: string | null
          patient_id: string
          signature: string | null
          signed_at: string
        }
        Insert: {
          answers?: Json | null
          clinic_id?: string | null
          consent_type: string
          created_at?: string
          form_version?: string | null
          id?: string
          ip_address?: string | null
          patient_id: string
          signature?: string | null
          signed_at?: string
        }
        Update: {
          answers?: Json | null
          clinic_id?: string | null
          consent_type?: string
          created_at?: string
          form_version?: string | null
          id?: string
          ip_address?: string | null
          patient_id?: string
          signature?: string | null
          signed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_consents_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_consents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          age_group: string | null
          allergies: string | null
          chief_complaint: string | null
          clinic_id: string | null
          consent_signature: string | null
          consent_signed: boolean | null
          consent_signed_at: string | null
          constitution_type: string | null
          created_at: string
          date_of_birth: string | null
          diet_notes: string | null
          due_date: string | null
          email: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          exercise_frequency: string | null
          full_name: string
          gender: string | null
          id: string
          id_number: string | null
          is_pregnant: boolean | null
          lifestyle_notes: string | null
          medical_history: string | null
          medications: string | null
          notes: string | null
          obstetric_history: string | null
          occupation: string | null
          phone: string | null
          pregnancy_notes: string | null
          pregnancy_weeks: number | null
          pulse_notes: string | null
          sleep_quality: string | null
          stress_level: string | null
          therapist_id: string
          tongue_notes: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          age_group?: string | null
          allergies?: string | null
          chief_complaint?: string | null
          clinic_id?: string | null
          consent_signature?: string | null
          consent_signed?: boolean | null
          consent_signed_at?: string | null
          constitution_type?: string | null
          created_at?: string
          date_of_birth?: string | null
          diet_notes?: string | null
          due_date?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          exercise_frequency?: string | null
          full_name: string
          gender?: string | null
          id?: string
          id_number?: string | null
          is_pregnant?: boolean | null
          lifestyle_notes?: string | null
          medical_history?: string | null
          medications?: string | null
          notes?: string | null
          obstetric_history?: string | null
          occupation?: string | null
          phone?: string | null
          pregnancy_notes?: string | null
          pregnancy_weeks?: number | null
          pulse_notes?: string | null
          sleep_quality?: string | null
          stress_level?: string | null
          therapist_id: string
          tongue_notes?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          age_group?: string | null
          allergies?: string | null
          chief_complaint?: string | null
          clinic_id?: string | null
          consent_signature?: string | null
          consent_signed?: boolean | null
          consent_signed_at?: string | null
          constitution_type?: string | null
          created_at?: string
          date_of_birth?: string | null
          diet_notes?: string | null
          due_date?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          exercise_frequency?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          id_number?: string | null
          is_pregnant?: boolean | null
          lifestyle_notes?: string | null
          medical_history?: string | null
          medications?: string | null
          notes?: string | null
          obstetric_history?: string | null
          occupation?: string | null
          phone?: string | null
          pregnancy_notes?: string | null
          pregnancy_weeks?: number | null
          pulse_notes?: string | null
          sleep_quality?: string | null
          stress_level?: string | null
          therapist_id?: string
          tongue_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          capacity: number | null
          clinic_id: string
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          clinic_id: string
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          clinic_id?: string
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_registrations: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          id_number: string | null
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
          id_number?: string | null
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
          id_number?: string | null
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
      video_sessions: {
        Row: {
          anxiety_qa_responses: Json | null
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          notes: string | null
          patient_id: string | null
          started_at: string
          therapist_id: string
          updated_at: string
        }
        Insert: {
          anxiety_qa_responses?: Json | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          started_at: string
          therapist_id: string
          updated_at?: string
        }
        Update: {
          anxiety_qa_responses?: Json | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          started_at?: string
          therapist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
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
      voice_recordings: {
        Row: {
          audio_url: string
          created_at: string
          duration_seconds: number | null
          id: string
          patient_id: string | null
          recording_type: string
          therapist_id: string
          transcription: string | null
          video_session_id: string | null
          visit_id: string | null
        }
        Insert: {
          audio_url: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          patient_id?: string | null
          recording_type?: string
          therapist_id: string
          transcription?: string | null
          video_session_id?: string | null
          visit_id?: string | null
        }
        Update: {
          audio_url?: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          patient_id?: string | null
          recording_type?: string
          therapist_id?: string
          transcription?: string | null
          video_session_id?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_recordings_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_recordings_video_session_id_fkey"
            columns: ["video_session_id"]
            isOneToOne: false
            referencedRelation: "video_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_recordings_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
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
      is_clinic_admin: {
        Args: { _clinic_id: string; _user_id: string }
        Returns: boolean
      }
      is_clinic_member: {
        Args: { _clinic_id: string; _user_id: string }
        Returns: boolean
      }
      validate_access_password: {
        Args: { password_input: string }
        Returns: {
          expires_at: string
          tier: Database["public"]["Enums"]["subscription_tier"]
          valid: boolean
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "therapist" | "patient"
      clinic_role: "owner" | "admin" | "therapist" | "receptionist"
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
      clinic_role: ["owner", "admin", "therapist", "receptionist"],
      registration_status: ["pending", "trial", "active", "expired"],
      subscription_tier: ["trial", "standard", "premium"],
    },
  },
} as const
