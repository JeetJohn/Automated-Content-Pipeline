import { FastifyInstance } from 'fastify';
import { SourceService } from '../../modules/sources/source.service';

export async function sourceRoutes(fastify: FastifyInstance): Promise<void> {
  const sourceService = new SourceService();

  // GET /projects/:id/sources
  fastify.get('/projects/:id/sources', async (request) => {
    const { id } = request.params as { id: string };
    const userId = 'temp-user-id';
    const sources = await sourceService.listByProject(id, userId);
    return {
      success: true,
      data: sources,
      meta: { timestamp: new Date().toISOString(), requestId: request.id },
    };
  });

  // POST /projects/:id/sources
  fastify.post('/projects/:id/sources', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = 'temp-user-id';

    // Check if request is JSON or multipart
    const contentType = request.headers['content-type'] || '';

    if (contentType.includes('application/json')) {
      // Handle JSON body (for URL and note sources)
      const body = request.body as { url?: string; note?: string };

      if (body.url) {
        await sourceService.createFromUrl(id, userId, body.url);
      } else if (body.note) {
        await sourceService.createFromNote(id, userId, body.note);
      } else {
        reply.status(400);
        return {
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Must provide url or note' },
          meta: { timestamp: new Date().toISOString(), requestId: request.id },
        };
      }
    } else {
      // Handle multipart/form-data (for file uploads)
      const parts = request.parts();

      for await (const part of parts) {
        if (part.type === 'file') {
          // Handle file upload
          const buffer = await part.toBuffer();
          await sourceService.createFromFile(id, userId, part.filename, buffer);
        } else {
          // Handle form fields (URL, note, etc.)
          const value = await part.value;
          if (part.fieldname === 'url') {
            await sourceService.createFromUrl(id, userId, value as string);
          } else if (part.fieldname === 'note') {
            await sourceService.createFromNote(id, userId, value as string);
          }
        }
      }
    }

    reply.status(201);
    return {
      success: true,
      data: { message: 'Source created' },
      meta: { timestamp: new Date().toISOString(), requestId: request.id },
    };
  });

  // DELETE /sources/:sourceId
  fastify.delete('/sources/:sourceId', async (request, reply) => {
    const { sourceId } = request.params as { sourceId: string };
    const userId = 'temp-user-id';
    await sourceService.delete(sourceId, userId);
    reply.status(204);
    return {
      success: true,
      data: null,
      meta: { timestamp: new Date().toISOString(), requestId: request.id },
    };
  });
}
