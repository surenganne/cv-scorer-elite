export type CvUploadsTable = {
  Row: {
    content_type: string
    file_name: string
    file_path: string
    file_size: number
    id: string
    upload_date: string | null
  }
  Insert: {
    content_type: string
    file_name: string
    file_path: string
    file_size: number
    id?: string
    upload_date?: string | null
  }
  Update: {
    content_type?: string
    file_name?: string
    file_path?: string
    file_size?: number
    id?: string
    upload_date?: string | null
  }
  Relationships: []
}