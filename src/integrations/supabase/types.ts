export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      aspirantes: {
        Row: {
          cedula: string | null
          created_at: string | null
          id: string
          nombre: string | null
          plaza_asignada_id: string | null
          puesto: number | null
          puntaje: number | null
        }
        Insert: {
          cedula?: string | null
          created_at?: string | null
          id?: string
          nombre?: string | null
          plaza_asignada_id?: string | null
          puesto?: number | null
          puntaje?: number | null
        }
        Update: {
          cedula?: string | null
          created_at?: string | null
          id?: string
          nombre?: string | null
          plaza_asignada_id?: string | null
          puesto?: number | null
          puntaje?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Aspirantes_plaza_asignada_id_fkey"
            columns: ["plaza_asignada_id"]
            isOneToOne: false
            referencedRelation: "plazas"
            referencedColumns: ["id"]
          },
        ]
      }
      plazas: {
        Row: {
          created_at: string | null
          departamento: string | null
          id: string
          municipio: string | null
          vacantes: number | null
        }
        Insert: {
          created_at?: string | null
          departamento?: string | null
          id?: string
          municipio?: string | null
          vacantes?: number | null
        }
        Update: {
          created_at?: string | null
          departamento?: string | null
          id?: string
          municipio?: string | null
          vacantes?: number | null
        }
        Relationships: []
      }
      prioridades: {
        Row: {
          aspirante_id: string | null
          created_at: string | null
          id: string
          plaza_id: string | null
          prioridad: number | null
        }
        Insert: {
          aspirante_id?: string | null
          created_at?: string | null
          id?: string
          plaza_id?: string | null
          prioridad?: number | null
        }
        Update: {
          aspirante_id?: string | null
          created_at?: string | null
          id?: string
          plaza_id?: string | null
          prioridad?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prioridades_aspirante_id_fkey"
            columns: ["aspirante_id"]
            isOneToOne: false
            referencedRelation: "aspirantes"
            referencedColumns: ["cedula"]
          },
          {
            foreignKeyName: "prioridades_plaza_id_fkey"
            columns: ["plaza_id"]
            isOneToOne: false
            referencedRelation: "plazas"
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
