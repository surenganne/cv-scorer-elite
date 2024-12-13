export const formatFileSize = (bytes: number): string => {
  if (!bytes || isNaN(bytes)) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const isValidFileType = (filename: string): boolean => {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? ['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension) : false;
};