export enum SourceType {
  FILE = 'FILE',
  URL = 'URL',
  NOTE = 'NOTE',
  TRANSCRIPT = 'TRANSCRIPT',
}

export enum ProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface SourceMetadata {
  title?: string;
  author?: string;
  date?: string;
  url?: string;
  fileType?: string;
  fileSize?: number;
}

export interface Source {
  id: string;
  projectId: string;
  sourceType: SourceType;
  originalPath: string;
  extractedText: string;
  metadata: SourceMetadata;
  processingStatus: ProcessingStatus;
  createdAt: Date;
}

export interface CreateSourceInput {
  projectId: string;
  sourceType: SourceType;
  originalPath: string;
  extractedText?: string;
  metadata?: SourceMetadata;
}

export interface Insight {
  id: string;
  sourceId: string;
  content: string;
  insightType: 'fact' | 'quote' | 'theme' | 'statistic' | 'claim';
  confidenceScore: number;
  relatedInsights: string[];
  extractedAt: Date;
}
