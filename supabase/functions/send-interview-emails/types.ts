export interface Candidate {
  name: string;
  file_path: string;
  file_name?: string;
}

export interface ProcessedAttachment {
  filename: string;
  content: string;
  type: string;
}

export interface FailedAttachment {
  name: string;
  path: string;
  error: string;
}