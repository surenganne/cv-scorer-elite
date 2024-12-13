export interface FileWithPreview {
  file: File;
  preview?: string;
  progress?: number;
  processed?: boolean;
  webkitRelativePath?: string;
}