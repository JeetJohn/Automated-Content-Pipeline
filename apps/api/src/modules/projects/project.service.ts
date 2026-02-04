import {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectStatus,
} from '@contentpipe/types';
import { prisma } from '../../infrastructure/database/prisma';
import { NotFoundError } from '../../shared/errors/error-handler';

export class ProjectService {
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
        contentType: input.contentType,
        tonePreference: input.tonePreference,
        targetLength: input.targetLength,
        status: ProjectStatus.DRAFT,
        versionCount: 0,
      },
    });

    return this.mapToDomain(project);
  }

  async update(
    id: string,
    userId: string,
    input: UpdateProjectInput
  ): Promise<Project> {
    await this.getById(id, userId);

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.contentType && { contentType: input.contentType }),
        ...(input.tonePreference && { tonePreference: input.tonePreference }),
        ...(input.targetLength && { targetLength: input.targetLength }),
        ...(input.status && { status: input.status }),
        updatedAt: new Date(),
      },
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
      contentType: project.contentType,
      tonePreference: project.tonePreference,
      targetLength: project.targetLength,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      versionCount: project.versionCount,
      currentVersionId: project.currentVersionId,
    };
  }
}
