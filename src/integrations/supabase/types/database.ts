import { CvUploadsTable } from './cv-uploads'
import { CvRankingTable } from './cv-ranking'
import { JobDescriptionsTable } from './job-descriptions'

export type Database = {
  public: {
    Tables: {
      cv_uploads: CvUploadsTable
      "edb-cv-ranking": CvRankingTable
      job_descriptions: JobDescriptionsTable
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]