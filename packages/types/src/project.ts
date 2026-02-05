export enum ProjectStatus {
  DRAFT = 'DRAFT',
  DISTILLING = 'DISTILLING',
  GENERATING = 'GENERATING',
  REFINING = 'REFINING',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum ContentType {
  BLOG = 'BLOG',
  ARTICLE = 'ARTICLE',
  REPORT = 'REPORT',
  SUMMARY = 'SUMMARY',
}

export enum TonePreference {
  FORMAL = 'FORMAL',
  CASUAL = 'CASUAL',
  TECHNICAL = 'TECHNICAL',
  PERSUASIVE = 'PERSUASIVE',
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
