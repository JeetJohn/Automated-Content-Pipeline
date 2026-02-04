import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ProjectService } from '../../modules/projects/project.service';

const createProjectSchema = z.object({
  title: z.string().min(1).max(255),
  contentType: z.enum(['blog', 'article', 'report', 'summary']),
  tonePreference: z.enum(['formal', 'casual', 'technical', 'persuasive']),
  targetLength: z.number().int().min(100).max(10000),
});

const updateProjectSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  contentType: z.enum(['blog', 'article', 'report', 'summary']).optional(),
  tonePreference: z.enum(['formal', 'casual', 'technical', 'persuasive']).optional(),
  targetLength: z.number().int().min(100).max(10000).optional(),
  status: z.enum(['draft', 'distilling', 'generating', 'refining', 'completed', 'archived']).optional(),
});

export async function projectRoutes(fastify: FastifyInstance): Promise<void> {
  const projectService = new ProjectService();

  // GET /projects
  fastify.get('/projects', async (request, reply) => {
    // TODO: Get userId from authenticated session
    const userId = 'temp-user-id';
    const projects = await projectService.list(userId);
    return { success: true, data: projects, meta: { timestamp: new Date().toISOString(), requestId: request.id } };
  });

  // POST /projects
  fastify.post('/projects', async (request, reply) => {
    const body = createProjectSchema.parse(request.body);
    const userId = 'temp-user-id';
    const project = await projectService.create(userId, body);
    reply.status(201);
    return { success: true, data: project, meta: { timestamp: new Date().toISOString(), requestId: request.id } };
  });

  // GET /projects/:id
  fastify.get('/projects/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = 'temp-user-id';
    const project = await projectService.getById(id, userId);
    return { success: true, data: project, meta: { timestamp: new Date().toISOString(), requestId: request.id } };
  });

  // PUT /projects/:id
  fastify.put('/projects/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = updateProjectSchema.parse(request.body);
    const userId = 'temp-user-id';
    const project = await projectService.update(id, userId, body);
    return { success: true, data: project, meta: { timestamp: new Date().toISOString(), requestId: request.id } };
  });

  // DELETE /projects/:id
  fastify.delete('/projects/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = 'temp-user-id';
    await projectService.delete(id, userId);
    reply.status(204);
    return { success: true, data: null, meta: { timestamp: new Date().toISOString(), requestId: request.id } };
  });
}
