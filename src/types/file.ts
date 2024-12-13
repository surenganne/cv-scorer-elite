export interface FileWithPreview {
  file: File;
  preview?: string;
  progress?: number;
  processed?: boolean;
  score?: number;
  matchPercentage?: number;
  webkitRelativePath?: string;
}