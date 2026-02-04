import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config/env';
import { logger } from './config/logger';
import { errorHandler } from './shared/errors/error-handler';
import { healthRoutes } from './api/routes/health.routes';
import { projectRoutes } from './api/routes/project.routes';
import { sourceRoutes } from './api/routes/source.routes';
import { draftRoutes } from './api/routes/draft.routes';

const app = Fastify({
  logger: logger,
});

async function build() {
  // Register plugins
  await app.register(helmet);
  await app.register(cors, {
    origin: config.NODE_ENV === 'production' ? false : ['http://localhost:3001'],
    credentials: true,
  });
  await app.register(multipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    },
  });
  await app.register(jwt, {
    secret: config.JWT_SECRET,
  });

  // Register Swagger
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'ContentPipe API',
        description: 'Automated Content Creation System API',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${config.PORT}`,
        },
      ],
    },
  });
  await app.register(swaggerUi, {
    routePrefix: '/documentation',
  });

  // Set error handler
  app.setErrorHandler(errorHandler);

  // Register routes
  await app.register(healthRoutes, { prefix: '/api/v1' });
  await app.register(projectRoutes, { prefix: '/api/v1' });
  await app.register(sourceRoutes, { prefix: '/api/v1' });
  await app.register(draftRoutes, { prefix: '/api/v1' });

  return app;
}

async function start() {
  try {
    const server = await build();
    await server.listen({ port: config.PORT, host: '0.0.0.0' });
    logger.info(`Server running on port ${config.PORT}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

export { build };
