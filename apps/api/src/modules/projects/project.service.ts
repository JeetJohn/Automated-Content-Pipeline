import {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectStatus,
  ContentType,
  TonePreference,
} from '@contentpipe/types';
import { prisma } from '../../infrastructure/database/prisma';
import { NotFoundError } from '../../shared/errors/error-handler';

export class ProjectService {
  private toContentTypeEnum(value: string): string {
    const mapping: Record<string, string> = {
      blog: 'BLOG',
      article: 'ARTICLE',
      report: 'REPORT',
      summary: 'SUMMARY',
    };
    return mapping[value.toLowerCase()] || value;
  }

  private toTonePreferenceEnum(value: string): string {
    const mapping: Record<string, string> = {
      formal: 'FORMAL',
      casual: 'CASUAL',
      technical: 'TECHNICAL',
      persuasive: 'PERSUASIVE',
    };
    return mapping[value.toLowerCase()] || value;
  }

  private toProjectStatusEnum(value: string): string {
    const mapping: Record<string, string> = {
      draft: 'DRAFT',
      distilling: 'DISTILLING',
      generating: 'GENERATING',
      refining: 'REFINING',
      completed: 'COMPLETED',
      archived: 'ARCHIVED',
    };
    return mapping[value.toLowerCase()] || value;
  }

  async list(userId: string): Promise<Project[]> {
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return projects.map(this.mapToDomain);
  }

  async getById(id: string, userId: string): Promise<Project> {
    const project = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!project) {
      throw new NotFoundError('Project', id);
    }

    return this.mapToDomain(project);
  }

  async create(userId: string, input: CreateProjectInput): Promise<Project> {
    const project = await prisma.project.create({
      data: {
        userId,
        title: input.title,
        contentType: this.toContentTypeEnum(input.contentType as string) as any,
        tonePreference: this.toTonePreferenceEnum(input.tonePreference as string) as any,
        targetLength: input.targetLength,
        status: 'DRAFT' as any,
        versionCount: 0,
      },
    });

    return this.mapToDomain(project);
  }

  async update(id: string, userId: string, input: UpdateProjectInput): Promise<Project> {
    await this.getById(id, userId);

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (input.title) updateData.title = input.title;
    if (input.contentType)
      updateData.contentType = this.toContentTypeEnum(input.contentType as string) as any;
    if (input.tonePreference)
      updateData.tonePreference = this.toTonePreferenceEnum(input.tonePreference as string) as any;
    if (input.targetLength) updateData.targetLength = input.targetLength;
    if (input.status) updateData.status = this.toProjectStatusEnum(input.status) as any;

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    return this.mapToDomain(project);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.getById(id, userId);
    await prisma.project.delete({ where: { id } });
  }

  private mapToDomain(project: any): Project {
    return {
      id: project.id,
      userId: project.userId,
      title: project.title,
      status: project.status as ProjectStatus,
      contentType: project.contentType as ContentType,
      tonePreference: project.tonePreference as TonePreference,
      targetLength: project.targetLength,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      versionCount: project.versionCount,
      currentVersionId: project.currentVersionId,
    };
  }
}
