export type JobDescriptionsTable = {
  Row: {
    certifications_weight: number
    created_at: string | null
    description: string
    education_weight: number
    experience_weight: number
    id: string
    minimum_experience: number
    preferred_qualifications: string | null
    required_skills: string
    skills_weight: number
    status: string
    title: string
    updated_at: string | null
  }
  Insert: {
    certifications_weight?: number
    created_at?: string | null
    description: string
    education_weight?: number
    experience_weight?: number
    id?: string
    minimum_experience: number
    preferred_qualifications?: string | null
    required_skills: string
    skills_weight?: number
    status?: string
    title: string
    updated_at?: string | null
  }
  Update: {
    certifications_weight?: number
    created_at?: string | null
    description?: string
    education_weight?: number
    experience_weight?: number
    id?: string
    minimum_experience?: number
    preferred_qualifications?: string | null
    required_skills?: string
    skills_weight?: number
    status?: string
    title?: string
    updated_at?: string | null
  }
  Relationships: []
}