export enum SourceType {
  FILE = 'file',
  URL = 'url',
  NOTE = 'note',
  TRANSCRIPT = 'transcript',
}

export enum ProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
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
