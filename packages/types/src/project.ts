export enum ProjectStatus {
  DRAFT = 'draft',
  DISTILLING = 'distilling',
  GENERATING = 'generating',
  REFINING = 'refining',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum ContentType {
  BLOG = 'blog',
  ARTICLE = 'article',
  REPORT = 'report',
  SUMMARY = 'summary',
}

export enum TonePreference {
  FORMAL = 'formal',
  CASUAL = 'casual',
  TECHNICAL = 'technical',
  PERSUASIVE = 'persuasive',
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  status: ProjectStatus;
  contentType: ContentType;
  tonePreference: TonePreference;
  targetLength: number;
  createdAt: Date;
  updatedAt: Date;
  versionCount: number;
  currentVersionId: string | null;
}

export interface CreateProjectInput {
  title: string;
  contentType: ContentType;
  tonePreference: TonePreference;
  targetLength: number;
}

export interface UpdateProjectInput {
  title?: string;
  contentType?: ContentType;
  tonePreference?: TonePreference;
  targetLength?: number;
  status?: ProjectStatus;
}
