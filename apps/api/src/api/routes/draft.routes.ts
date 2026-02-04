import { FastifyInstance } from 'fastify';
import { DraftService } from '../../modules/drafts/draft.service';

export async function draftRoutes(fastify: FastifyInstance): Promise<void> {
  const draftService = new DraftService();

  // POST /projects/:id/drafts - Generate initial draft
  fastify.post('/projects/:id/drafts', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = 'temp-user-id';
    const draft = await draftService.generate(id, userId);
    reply.status(201);
    return { success: true, data: draft, meta: { timestamp: new Date().toISOString(), requestId: request.id } };
  });

  // GET /projects/:id/drafts
  fastify.get('/projects/:id/drafts', async (request) => {
    const { id } = request.params as { id: string };
    const userId = 'temp-user-id';
    const drafts = await draftService.listByProject(id, userId);
    return { success: true, data: drafts, meta: { timestamp: new Date().toISOString(), requestId: request.id } };
  });

  // GET /drafts/:draftId
  fastify.get('/drafts/:draftId', async (request) => {
    const { draftId } = request.params as { draftId: string };
    const userId = 'temp-user-id';
    const draft = await draftService.getById(draftId, userId);
    return { success: true, data: draft, meta: { timestamp: new Date().toISOString(), requestId: request.id } };
  });

  // POST /drafts/:draftId/refine
  fastify.post('/drafts/:draftId/refine', async (request, reply) => {
    const { draftId } = request.params as { draftId: string };
    const { feedback, feedbackType } = request.body as { feedback: string; feedbackType: string };
    const userId = 'temp-user-id';
    const revision = await draftService.refine(draftId, userId, feedback, feedbackType);
    reply.status(201);
    return { success: true, data: revision, meta: { timestamp: new Date().toISOString(), requestId: request.id } };
  });

  // POST /projects/:id/export
  fastify.post('/projects/:id/export', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { format, includeCitations } = request.body as { format: string; includeCitations?: boolean };
    const userId = 'temp-user-id';
    const exported = await draftService.export(id, userId, format, includeCitations);
    reply.status(200);
    return { success: true, data: exported, meta: { timestamp: new Date().toISOString(), requestId: request.id } };
  });
}
