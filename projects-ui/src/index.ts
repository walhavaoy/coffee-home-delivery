import express from 'express';
import path from 'path';
import pino from 'pino';
import {
  getAllProjects, getProjectById, createProject, updateProjectUrls, seedProjects,
} from './store';
import type { CreateProjectInput, UpdateProjectUrlsInput } from './store';

const logger = pino({ name: 'projects-ui' });

function isValidUrl(value: string): boolean {
  if (value === '') return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function createApp(): express.Application {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // GET /api/projects — list all projects
  app.get('/api/projects', (_req, res) => {
    const projects = getAllProjects();
    res.json({ projects });
  });

  // GET /api/projects/:id — single project
  app.get('/api/projects/:id', (req, res) => {
    const project = getProjectById(req.params['id']);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json({ project });
  });

  // POST /api/projects — create a new project
  app.post('/api/projects', (req, res) => {
    const body = req.body as Record<string, unknown>;
    const name = body['name'];

    if (typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Missing or empty "name"' });
      return;
    }

    const allFields = ['domain', 'portal_url', 'shell_url', 'repo_url'] as const;
    const urlOnlyFields = new Set(['portal_url', 'shell_url', 'repo_url']);
    for (const field of allFields) {
      const val = body[field];
      if (val !== undefined && typeof val !== 'string') {
        res.status(400).json({ error: `"${field}" must be a string` });
        return;
      }
      if (typeof val === 'string' && val !== '' && urlOnlyFields.has(field) && !isValidUrl(val)) {
        res.status(400).json({ error: `"${field}" is not a valid URL` });
        return;
      }
    }

    const input: CreateProjectInput = {
      name: name.trim(),
      description: typeof body['description'] === 'string' ? body['description'].trim() : undefined,
      domain: typeof body['domain'] === 'string' ? body['domain'].trim() : undefined,
      portal_url: typeof body['portal_url'] === 'string' ? body['portal_url'].trim() : undefined,
      shell_url: typeof body['shell_url'] === 'string' ? body['shell_url'].trim() : undefined,
      repo_url: typeof body['repo_url'] === 'string' ? body['repo_url'].trim() : undefined,
    };

    const project = createProject(input);
    logger.info({ projectId: project.id, name: project.name }, 'Project created');
    res.status(201).json({ project });
  });

  // PATCH /api/projects/:id — update project URL fields
  app.patch('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    const body = req.body as Record<string, unknown>;

    const existing = getProjectById(id);
    if (!existing) {
      res.status(404).json({ error: `Project not found: ${id}` });
      return;
    }

    const allFields = ['domain', 'portal_url', 'shell_url', 'repo_url'] as const;
    const urlOnlyFields = new Set(['portal_url', 'shell_url', 'repo_url']);
    const update: UpdateProjectUrlsInput = {};

    for (const field of allFields) {
      const val = body[field];
      if (val === undefined) continue;
      if (typeof val !== 'string') {
        res.status(400).json({ error: `"${field}" must be a string` });
        return;
      }
      if (val !== '' && urlOnlyFields.has(field) && !isValidUrl(val)) {
        res.status(400).json({ error: `"${field}" is not a valid URL` });
        return;
      }
      update[field] = val.trim();
    }

    const updated = updateProjectUrls(id, update);
    logger.info({ projectId: id }, 'Project URLs updated');
    res.json({ project: updated });
  });

  return app;
}

if (require.main === module) {
  const port = parseInt(process.env['PORT'] ?? '3000', 10);
  seedProjects();
  const app = createApp();
  app.listen(port, () => {
    logger.info({ port }, 'Projects UI service started');
  });
}
