export interface FileWithPreview extends File {
  preview?: string;
  progress?: number;
  processed?: boolean;
  score?: number;
  matchPercentage?: number;
  slice: File['slice'];
  stream: File['stream'];
  text: File['text'];
  arrayBuffer: File['arrayBuffer'];
}