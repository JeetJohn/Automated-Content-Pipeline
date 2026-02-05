import { Source, ProcessingStatus, SourceType } from '@contentpipe/types';
import { prisma } from '../../infrastructure/database/prisma';
import { NotFoundError } from '../../shared/errors/error-handler';
import { ProjectService } from '../projects/project.service';

export class SourceService {
  private projectService = new ProjectService();

  async listByProject(projectId: string, userId: string): Promise<Source[]> {
    // Verify project ownership
    await this.projectService.getById(projectId, userId);

    const sources = await prisma.source.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    return sources.map(this.mapToDomain);
  }

  async createFromFile(
    projectId: string,
    userId: string,
    filename: string,
    buffer: Buffer
  ): Promise<Source> {
    await this.projectService.getById(projectId, userId);

    // TODO: Implement file upload to MinIO
    // TODO: Extract text from file based on type

    const source = await prisma.source.create({
      data: {
        projectId,
        sourceType: this.detectFileType(filename) as any,
        originalPath: filename,
        extractedText: '', // Will be populated by extraction service
        metadata: {
          fileType: filename.split('.').pop(),
          fileSize: buffer.length,
        },
        processingStatus: 'PENDING' as any,
      },
    });

    // TODO: Queue for processing

    return this.mapToDomain(source);
  }

  async createFromUrl(projectId: string, userId: string, url: string): Promise<Source> {
    await this.projectService.getById(projectId, userId);

    const source = await prisma.source.create({
      data: {
        projectId,
        sourceType: 'URL' as any,
        originalPath: url,
        extractedText: '',
        metadata: { url },
        processingStatus: 'PENDING' as any,
      },
    });

    // TODO: Queue for scraping

    return this.mapToDomain(source);
  }

  async createFromNote(projectId: string, userId: string, note: string): Promise<Source> {
    await this.projectService.getById(projectId, userId);

    const source = await prisma.source.create({
      data: {
        projectId,
        sourceType: 'NOTE' as any,
        originalPath: 'note',
        extractedText: note,
        metadata: {},
        processingStatus: 'COMPLETED' as any,
      },
    });

    return this.mapToDomain(source);
  }

  async delete(sourceId: string, userId: string): Promise<void> {
    const source = await prisma.source.findFirst({
      where: { id: sourceId },
      include: { project: true },
    });

    if (!source || source.project.userId !== userId) {
      throw new NotFoundError('Source', sourceId);
    }

    await prisma.source.delete({ where: { id: sourceId } });
  }

  private detectFileType(filename: string): SourceType {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['pdf', 'docx', 'txt', 'md', 'html'].includes(ext || '')) {
      return SourceType.FILE;
    }
    return SourceType.FILE;
  }

  private mapToDomain(source: any): Source {
    return {
      id: source.id,
      projectId: source.projectId,
      sourceType: source.sourceType as SourceType,
      originalPath: source.originalPath,
      extractedText: source.extractedText,
      metadata: source.metadata,
      processingStatus: source.processingStatus as ProcessingStatus,
      createdAt: source.createdAt,
    };
  }
}
