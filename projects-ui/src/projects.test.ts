import request from 'supertest';
import { createApp } from './index';
import { seedProjects } from './store';

describe('Projects API', () => {
  beforeAll(() => {
    seedProjects();
  });

  const app = createApp();

  it('GET /api/projects returns project list', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(200);
    expect(res.body.projects).toBeDefined();
    expect(Array.isArray(res.body.projects)).toBe(true);
    expect(res.body.projects.length).toBeGreaterThan(0);
  });

  it('GET /api/projects/:id returns single project', async () => {
    const listRes = await request(app).get('/api/projects');
    const projectId = listRes.body.projects[0].id;

    const res = await request(app).get(`/api/projects/${projectId}`);
    expect(res.status).toBe(200);
    expect(res.body.project.id).toBe(projectId);
    expect(res.body.project).toHaveProperty('domain');
    expect(res.body.project).toHaveProperty('portal_url');
    expect(res.body.project).toHaveProperty('shell_url');
    expect(res.body.project).toHaveProperty('repo_url');
  });

  it('GET /api/projects/:id returns 404 for missing project', async () => {
    const res = await request(app).get('/api/projects/nonexistent');
    expect(res.status).toBe(404);
  });

  it('PATCH /api/projects/:id updates URL fields', async () => {
    const listRes = await request(app).get('/api/projects');
    const projectId = listRes.body.projects[0].id;

    const res = await request(app)
      .patch(`/api/projects/${projectId}`)
      .send({
        domain: 'new.example.com',
        portal_url: 'https://new.example.com/portal',
        shell_url: 'https://new.example.com/shell',
        repo_url: 'https://github.com/new/repo',
      });

    expect(res.status).toBe(200);
    expect(res.body.project.domain).toBe('new.example.com');
    expect(res.body.project.portal_url).toBe('https://new.example.com/portal');
    expect(res.body.project.shell_url).toBe('https://new.example.com/shell');
    expect(res.body.project.repo_url).toBe('https://github.com/new/repo');
  });

  it('PATCH /api/projects/:id rejects invalid URLs', async () => {
    const listRes = await request(app).get('/api/projects');
    const projectId = listRes.body.projects[0].id;

    const res = await request(app)
      .patch(`/api/projects/${projectId}`)
      .send({
        portal_url: 'not-a-valid-url',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('not a valid URL');
  });

  it('PATCH /api/projects/:id allows clearing URL fields with empty string', async () => {
    const listRes = await request(app).get('/api/projects');
    const projectId = listRes.body.projects[0].id;

    const res = await request(app)
      .patch(`/api/projects/${projectId}`)
      .send({
        shell_url: '',
      });

    expect(res.status).toBe(200);
    expect(res.body.project.shell_url).toBe('');
  });

  it('POST /api/projects creates a new project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({
        name: 'Test Project',
        description: 'A test project',
        domain: 'test.example.com',
        portal_url: 'https://test.example.com',
      });

    expect(res.status).toBe(201);
    expect(res.body.project.name).toBe('Test Project');
    expect(res.body.project.domain).toBe('test.example.com');
  });

  it('POST /api/projects rejects missing name', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({});

    expect(res.status).toBe(400);
  });
});
