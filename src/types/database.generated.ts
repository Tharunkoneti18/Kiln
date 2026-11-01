
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "applications": {
                  Row: {
                    "applied_at": string | null,"company": string,"created_at": string | null,"id": string,"location": string | null,"notes": string | null,"outcome": string | null,"response_date": string | null,"role_snapshot": Json | null,"role_title": string,"source_url": string | null,"stage": string,"updated_at": string | null,"user_id": string,"version": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "applied_at"?: string | null,"company": string,"created_at"?: string | null,"id"?: string,"location"?: string | null,"notes"?: string | null,"outcome"?: string | null,"response_date"?: string | null,"role_snapshot"?: Json | null,"role_title": string,"source_url"?: string | null,"stage"?: string,"updated_at"?: string | null,"user_id": string,"version"?: number | null
                  }
                  Update: {
                    "applied_at"?: string | null,"company"?: string,"created_at"?: string | null,"id"?: string,"location"?: string | null,"notes"?: string | null,"outcome"?: string | null,"response_date"?: string | null,"role_snapshot"?: Json | null,"role_title"?: string,"source_url"?: string | null,"stage"?: string,"updated_at"?: string | null,"user_id"?: string,"version"?: number | null
                  }
                  Relationships: [
                    
                  ]
                },"career_profiles": {
                  Row: {
                    "created_at": string | null,"id": string,"source_status": string | null,"summary": string | null,"updated_at": string | null,"user_id": string,"version": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"id"?: string,"source_status"?: string | null,"summary"?: string | null,"updated_at"?: string | null,"user_id": string,"version"?: number | null
                  }
                  Update: {
                    "created_at"?: string | null,"id"?: string,"source_status"?: string | null,"summary"?: string | null,"updated_at"?: string | null,"user_id"?: string,"version"?: number | null
                  }
                  Relationships: [
                    
                  ]
                },"interview_sessions": {
                  Row: {
                    "created_at": string | null,"id": string,"questions": Json | null,"responses": Json | null,"role_id": string | null,"rubric_version": string | null,"score_summary": Json | null,"status": string | null,"updated_at": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"id"?: string,"questions"?: Json | null,"responses"?: Json | null,"role_id"?: string | null,"rubric_version"?: string | null,"score_summary"?: Json | null,"status"?: string | null,"updated_at"?: string | null,"user_id": string
                  }
                  Update: {
                    "created_at"?: string | null,"id"?: string,"questions"?: Json | null,"responses"?: Json | null,"role_id"?: string | null,"rubric_version"?: string | null,"score_summary"?: Json | null,"status"?: string | null,"updated_at"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "interview_sessions_role_id_fkey"
      columns: ["role_id"]
isOneToOne: false
      referencedRelation: "target_roles"
      referencedColumns: ["id"]
    }
                  ]
                },"learning_events": {
                  Row: {
                    "aggregate_id": string,"created_at": string | null,"event_id": string,"event_type": string,"id": string,"idempotency_key": string,"lesson_id": string | null,"occurred_at": string,"payload": NonNullable<Json>,"schema_version": number,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "aggregate_id": string,"created_at"?: string | null,"event_id": string,"event_type": string,"id"?: string,"idempotency_key": string,"lesson_id"?: string | null,"occurred_at": string,"payload"?: NonNullable<Json>,"schema_version"?: number,"user_id": string
                  }
                  Update: {
                    "aggregate_id"?: string,"created_at"?: string | null,"event_id"?: string,"event_type"?: string,"id"?: string,"idempotency_key"?: string,"lesson_id"?: string | null,"occurred_at"?: string,"payload"?: NonNullable<Json>,"schema_version"?: number,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"learning_plans": {
                  Row: {
                    "approved_at": string | null,"created_at": string | null,"horizon_weeks": number | null,"id": string,"rationale": string | null,"role_id": string,"status": string,"updated_at": string | null,"user_id": string,"version": number
                  }
                  ComputedFields: never
                  Insert: {
                    "approved_at"?: string | null,"created_at"?: string | null,"horizon_weeks"?: number | null,"id"?: string,"rationale"?: string | null,"role_id": string,"status"?: string,"updated_at"?: string | null,"user_id": string,"version"?: number
                  }
                  Update: {
                    "approved_at"?: string | null,"created_at"?: string | null,"horizon_weeks"?: number | null,"id"?: string,"rationale"?: string | null,"role_id"?: string,"status"?: string,"updated_at"?: string | null,"user_id"?: string,"version"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "learning_plans_role_id_fkey"
      columns: ["role_id"]
isOneToOne: false
      referencedRelation: "target_roles"
      referencedColumns: ["id"]
    }
                  ]
                },"lesson_progress": {
                  Row: {
                    "board_snapshot": Json | null,"event_cursor": number | null,"id": string,"lesson_id": string,"lesson_version": number,"position_ms": number | null,"quiz_state": Json | null,"saved_at": string | null,"segment_id": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "board_snapshot"?: Json | null,"event_cursor"?: number | null,"id"?: string,"lesson_id": string,"lesson_version"?: number,"position_ms"?: number | null,"quiz_state"?: Json | null,"saved_at"?: string | null,"segment_id"?: string | null,"user_id": string
                  }
                  Update: {
                    "board_snapshot"?: Json | null,"event_cursor"?: number | null,"id"?: string,"lesson_id"?: string,"lesson_version"?: number,"position_ms"?: number | null,"quiz_state"?: Json | null,"saved_at"?: string | null,"segment_id"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "lesson_progress_lesson_id_fkey"
      columns: ["lesson_id"]
isOneToOne: false
      referencedRelation: "lessons"
      referencedColumns: ["id"]
    }
                  ]
                },"lessons": {
                  Row: {
                    "created_at": string | null,"duration_minutes": number | null,"estimated_seconds": number | null,"id": string,"manifest_json": Json | null,"manifest_uri": string | null,"objective": string | null,"skill_ids": (string)[] | null,"slug": string,"status": string | null,"title": string,"version": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"duration_minutes"?: number | null,"estimated_seconds"?: number | null,"id": string,"manifest_json"?: Json | null,"manifest_uri"?: string | null,"objective"?: string | null,"skill_ids"?: (string)[] | null,"slug": string,"status"?: string | null,"title": string,"version"?: number
                  }
                  Update: {
                    "created_at"?: string | null,"duration_minutes"?: number | null,"estimated_seconds"?: number | null,"id"?: string,"manifest_json"?: Json | null,"manifest_uri"?: string | null,"objective"?: string | null,"skill_ids"?: (string)[] | null,"slug"?: string,"status"?: string | null,"title"?: string,"version"?: number
                  }
                  Relationships: [
                    
                  ]
                },"outcome_summaries": {
                  Row: {
                    "calculated_at": string | null,"caveats": (string)[] | null,"id": string,"metrics": NonNullable<Json>,"proposed_actions": Json | null,"sample_size": number,"user_id": string,"window": string
                  }
                  ComputedFields: never
                  Insert: {
                    "calculated_at"?: string | null,"caveats"?: (string)[] | null,"id"?: string,"metrics"?: NonNullable<Json>,"proposed_actions"?: Json | null,"sample_size"?: number,"user_id": string,"window"?: string
                  }
                  Update: {
                    "calculated_at"?: string | null,"caveats"?: (string)[] | null,"id"?: string,"metrics"?: NonNullable<Json>,"proposed_actions"?: Json | null,"sample_size"?: number,"user_id"?: string,"window"?: string
                  }
                  Relationships: [
                    
                  ]
                },"plan_items": {
                  Row: {
                    "completion_criteria": Json | null,"created_at": string | null,"estimated_minutes": number,"evidence_required": string | null,"id": string,"lesson_id": string | null,"objective": string,"order_index": number | null,"plan_id": string,"rationale": string | null,"skill_ids": (string)[],"status": string,"title": string,"updated_at": string | null,"week": number
                  }
                  ComputedFields: never
                  Insert: {
                    "completion_criteria"?: Json | null,"created_at"?: string | null,"estimated_minutes"?: number,"evidence_required"?: string | null,"id"?: string,"lesson_id"?: string | null,"objective": string,"order_index"?: number | null,"plan_id": string,"rationale"?: string | null,"skill_ids"?: (string)[],"status"?: string,"title": string,"updated_at"?: string | null,"week": number
                  }
                  Update: {
                    "completion_criteria"?: Json | null,"created_at"?: string | null,"estimated_minutes"?: number,"evidence_required"?: string | null,"id"?: string,"lesson_id"?: string | null,"objective"?: string,"order_index"?: number | null,"plan_id"?: string,"rationale"?: string | null,"skill_ids"?: (string)[],"status"?: string,"title"?: string,"updated_at"?: string | null,"week"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "plan_items_plan_id_fkey"
      columns: ["plan_id"]
isOneToOne: false
      referencedRelation: "learning_plans"
      referencedColumns: ["id"]
    }
                  ]
                },"portfolio_artifacts": {
                  Row: {
                    "created_at": string | null,"description": string | null,"id": string,"rubric": Json | null,"skill_ids": (string)[] | null,"title": string,"updated_at": string | null,"uri": string,"user_id": string,"verified_state": string | null,"visibility": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"description"?: string | null,"id"?: string,"rubric"?: Json | null,"skill_ids"?: (string)[] | null,"title": string,"updated_at"?: string | null,"uri": string,"user_id": string,"verified_state"?: string | null,"visibility"?: string | null
                  }
                  Update: {
                    "created_at"?: string | null,"description"?: string | null,"id"?: string,"rubric"?: Json | null,"skill_ids"?: (string)[] | null,"title"?: string,"updated_at"?: string | null,"uri"?: string,"user_id"?: string,"verified_state"?: string | null,"visibility"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"profile_evidence": {
                  Row: {
                    "confidence": number | null,"created_at": string | null,"excerpt": string,"id": string,"kind": string,"source_file_id": string | null,"source_locator": Json | null,"updated_at": string | null,"user_id": string,"verified_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "confidence"?: number | null,"created_at"?: string | null,"excerpt": string,"id"?: string,"kind": string,"source_file_id"?: string | null,"source_locator"?: Json | null,"updated_at"?: string | null,"user_id": string,"verified_at"?: string | null
                  }
                  Update: {
                    "confidence"?: number | null,"created_at"?: string | null,"excerpt"?: string,"id"?: string,"kind"?: string,"source_file_id"?: string | null,"source_locator"?: Json | null,"updated_at"?: string | null,"user_id"?: string,"verified_at"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"profiles": {
                  Row: {
                    "accessibility_prefs": Json | null,"created_at": string | null,"id": string,"language": string | null,"region": string | null,"updated_at": string | null,"weekly_minutes": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "accessibility_prefs"?: Json | null,"created_at"?: string | null,"id": string,"language"?: string | null,"region"?: string | null,"updated_at"?: string | null,"weekly_minutes"?: number | null
                  }
                  Update: {
                    "accessibility_prefs"?: Json | null,"created_at"?: string | null,"id"?: string,"language"?: string | null,"region"?: string | null,"updated_at"?: string | null,"weekly_minutes"?: number | null
                  }
                  Relationships: [
                    
                  ]
                },"role_skills": {
                  Row: {
                    "confidence": number | null,"created_at": string | null,"id": string,"importance": number | null,"role_id": string,"skill_id": string,"source_ref": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "confidence"?: number | null,"created_at"?: string | null,"id"?: string,"importance"?: number | null,"role_id": string,"skill_id": string,"source_ref"?: string | null
                  }
                  Update: {
                    "confidence"?: number | null,"created_at"?: string | null,"id"?: string,"importance"?: number | null,"role_id"?: string,"skill_id"?: string,"source_ref"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "role_skills_role_id_fkey"
      columns: ["role_id"]
isOneToOne: false
      referencedRelation: "target_roles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "role_skills_skill_id_fkey"
      columns: ["skill_id"]
isOneToOne: false
      referencedRelation: "skills"
      referencedColumns: ["id"]
    }
                  ]
                },"skills": {
                  Row: {
                    "aliases": (string)[] | null,"canonical_name": string,"created_at": string | null,"id": string,"taxonomy": string | null,"taxonomy_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "aliases"?: (string)[] | null,"canonical_name": string,"created_at"?: string | null,"id": string,"taxonomy"?: string | null,"taxonomy_id"?: string | null
                  }
                  Update: {
                    "aliases"?: (string)[] | null,"canonical_name"?: string,"created_at"?: string | null,"id"?: string,"taxonomy"?: string | null,"taxonomy_id"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"target_roles": {
                  Row: {
                    "created_at": string | null,"id": string,"jd_text": string | null,"level": string | null,"region": string | null,"source_date": string | null,"source_uri": string | null,"title": string,"updated_at": string | null,"user_id": string,"version": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"id"?: string,"jd_text"?: string | null,"level"?: string | null,"region"?: string | null,"source_date"?: string | null,"source_uri"?: string | null,"title": string,"updated_at"?: string | null,"user_id": string,"version"?: number | null
                  }
                  Update: {
                    "created_at"?: string | null,"id"?: string,"jd_text"?: string | null,"level"?: string | null,"region"?: string | null,"source_date"?: string | null,"source_uri"?: string | null,"title"?: string,"updated_at"?: string | null,"user_id"?: string,"version"?: number | null
                  }
                  Relationships: [
                    
                  ]
                },"user_skill_evidence": {
                  Row: {
                    "assessed_at": string | null,"confidence": number | null,"created_at": string | null,"evidence_ids": (string)[] | null,"id": string,"level": string | null,"skill_id": string,"state": string,"updated_at": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "assessed_at"?: string | null,"confidence"?: number | null,"created_at"?: string | null,"evidence_ids"?: (string)[] | null,"id"?: string,"level"?: string | null,"skill_id": string,"state"?: string,"updated_at"?: string | null,"user_id": string
                  }
                  Update: {
                    "assessed_at"?: string | null,"confidence"?: number | null,"created_at"?: string | null,"evidence_ids"?: (string)[] | null,"id"?: string,"level"?: string | null,"skill_id"?: string,"state"?: string,"updated_at"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "user_skill_evidence_skill_id_fkey"
      columns: ["skill_id"]
isOneToOne: false
      referencedRelation: "skills"
      referencedColumns: ["id"]
    }
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            
          }
        }
} as const
