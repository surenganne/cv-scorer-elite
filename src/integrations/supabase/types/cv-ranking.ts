import { Json } from './json'

export type CvRankingTable = {
  Row: {
    id: number
    job_id: string
    ranked_resumes: Json | null
  }
  Insert: {
    id?: number
    job_id: string
    ranked_resumes?: Json | null
  }
  Update: {
    id?: number
    job_id?: string
    ranked_resumes?: Json | null
  }
  Relationships: []
}