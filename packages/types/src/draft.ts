export interface Draft {
  id: string;
  projectId: string;
  versionNumber: number;
  content: string;
  outline: Outline;
  citations: Citation[];
  qualityScore: number;
  generationTime: number;
  createdAt: Date;
  parentDraftId: string | null;
}

export interface Outline {
  sections: Section[];
}

export interface Section {
  id: string;
  title: string;
  content?: string;
  order: number;
  subsections?: Section[];
}

export interface Citation {
  id: string;
  sourceId: string;
  text: string;
  location?: string;
}

export interface CreateDraftInput {
  projectId: string;
  content: string;
  outline: Outline;
  parentDraftId?: string;
}

export interface Revision {
  id: string;
  draftId: string;
  feedback: string;
  feedbackType: 'inline' | 'general' | 'structural' | 'tone';
  changeSummary: string;
  alternativesGenerated: number;
  alternativeSelected: number;
  intentPreserved: boolean;
  changesApplied: Change[];
  createdAt: Date;
}

export interface Change {
  id: string;
  revisionId: string;
  changeType: 'add' | 'remove' | 'modify' | 'reorder';
  location: Location;
  beforeState: string;
  afterState: string;
  rationale: string;
  userApproved: boolean;
  createdAt: Date;
}

export interface Location {
  startLine: number;
  endLine: number;
  section?: string;
}
