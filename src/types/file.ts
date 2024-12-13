export interface FileWithPreview extends File {
  preview?: string;
  progress?: number;
  processed?: boolean;
}