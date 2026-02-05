import { Draft, Revision } from '@contentpipe/types';
import { prisma } from '../../infrastructure/database/prisma';
import { NotFoundError, ValidationError } from '../../shared/errors/error-handler';
import { ProjectService } from '../projects/project.service';
import { aiService } from '../ai';
import { logger } from '../../config/logger';

export class DraftService {
  private projectService = new ProjectService();

  async listByProject(projectId: string, userId: string): Promise<Draft[]> {
    await this.projectService.getById(projectId, userId);

    const drafts = await prisma.draft.findMany({
      where: { projectId },
      orderBy: { versionNumber: 'desc' },
    });

    return drafts.map(this.mapDraftToDomain);
  }

  async getById(draftId: string, userId: string): Promise<Draft> {
    const draft = await prisma.draft.findFirst({
      where: { id: draftId },
      include: { project: true },
    });

    if (!draft || draft.project.userId !== userId) {
      throw new NotFoundError('Draft', draftId);
    }

    return this.mapDraftToDomain(draft);
  }

  async generate(projectId: string, userId: string): Promise<Draft> {
    const project = await this.projectService.getById(projectId, userId);

    // Get all sources for this project
    const sources = await prisma.source.findMany({
      where: { projectId },
    });

    if (sources.length === 0) {
      throw new ValidationError('No sources found. Please add sources before generating content.');
    }

    logger.info({ projectId, sourceCount: sources.length }, 'Generating draft with AI');

    // Generate content using AI
    const generatedContent = await aiService.generateContent({
      sources: sources.map((s) => ({
        id: s.id,
        sourceType: s.sourceType,
        originalPath: s.originalPath,
        extractedText: s.extractedText,
      })),
      project: {
        title: project.title,
        contentType: project.contentType,
        tonePreference: project.tonePreference,
        targetLength: project.targetLength,
      },
    });

    const versionNumber = project.versionCount + 1;

    const draft = await prisma.draft.create({
      data: {
        projectId,
        versionNumber,
        content: generatedContent.content,
        outline: generatedContent.outline,
        citations: generatedContent.citations,
        qualityScore: generatedContent.qualityScore,
        generationTime: generatedContent.generationTime,
        parentDraftId: project.currentVersionId,
      },
    });

    // Update project
    await prisma.project.update({
      where: { id: projectId },
      data: {
        versionCount: versionNumber,
        currentVersionId: draft.id,
        status: 'DRAFT' as any,
      },
    });

    logger.info({ draftId: draft.id, projectId }, 'Draft generated successfully');

    return this.mapDraftToDomain(draft);
  }

  async refine(
    draftId: string,
    userId: string,
    feedback: string,
    feedbackType: string
  ): Promise<Revision> {
    await this.getById(draftId, userId);

    // TODO: Call refinement engine
    // TODO: Generate alternatives
    // TODO: Apply changes

    const revision = await prisma.revision.create({
      data: {
        draftId,
        feedback,
        feedbackType,
        changeSummary: 'Refinement applied',
        alternativesGenerated: 1,
        alternativeSelected: 0,
        intentPreserved: true,
      },
    });

    return this.mapRevisionToDomain(revision);
  }

  async export(
    projectId: string,
    userId: string,
    format: string,
    _includeCitations?: boolean
  ): Promise<{ content: string; format: string }> {
    const project = await this.projectService.getById(projectId, userId);

    if (!project.currentVersionId) {
      throw new ValidationError('No draft available for export');
    }

    const draft = await this.getById(project.currentVersionId, userId);

    // TODO: Format based on requested format (markdown, docx, html, pdf)

    return {
      content: draft.content,
      format,
    };
  }

  private mapDraftToDomain(draft: any): Draft {
    return {
      id: draft.id,
      projectId: draft.projectId,
      versionNumber: draft.versionNumber,
      content: draft.content,
      outline: draft.outline,
      citations: draft.citations,
      qualityScore: draft.qualityScore,
      generationTime: draft.generationTime,
      createdAt: draft.createdAt,
      parentDraftId: draft.parentDraftId,
    };
  }

  private mapRevisionToDomain(revision: any): Revision {
    return {
      id: revision.id,
      draftId: revision.draftId,
      feedback: revision.feedback,
      feedbackType: revision.feedbackType,
      changeSummary: revision.changeSummary,
      alternativesGenerated: revision.alternativesGenerated,
      alternativeSelected: revision.alternativeSelected,
      intentPreserved: revision.intentPreserved,
      changesApplied: [],
      createdAt: revision.createdAt,
    };
  }
}
