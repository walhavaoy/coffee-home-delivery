import { v4 as uuidv4 } from 'uuid';

export interface Project {
  id: string;
  name: string;
  description: string;
  domain: string;
  portal_url: string;
  shell_url: string;
  repo_url: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'active' | 'archived' | 'draft';

export interface CreateProjectInput {
  name: string;
  description?: string;
  domain?: string;
  portal_url?: string;
  shell_url?: string;
  repo_url?: string;
}

export interface UpdateProjectUrlsInput {
  domain?: string;
  portal_url?: string;
  shell_url?: string;
  repo_url?: string;
}

const projects: Map<string, Project> = new Map();

export function createProject(input: CreateProjectInput): Project {
  const id = uuidv4();
  const now = new Date().toISOString();
  const project: Project = {
    id,
    name: input.name,
    description: input.description ?? '',
    domain: input.domain ?? '',
    portal_url: input.portal_url ?? '',
    shell_url: input.shell_url ?? '',
    repo_url: input.repo_url ?? '',
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
  projects.set(id, project);
  return project;
}

export function getAllProjects(): Project[] {
  return Array.from(projects.values());
}

export function getProjectById(id: string): Project | undefined {
  return projects.get(id);
}

export function updateProjectUrls(id: string, input: UpdateProjectUrlsInput): Project | undefined {
  const project = projects.get(id);
  if (!project) return undefined;

  if (input.domain !== undefined) project.domain = input.domain;
  if (input.portal_url !== undefined) project.portal_url = input.portal_url;
  if (input.shell_url !== undefined) project.shell_url = input.shell_url;
  if (input.repo_url !== undefined) project.repo_url = input.repo_url;
  project.updatedAt = new Date().toISOString();
  return project;
}

export function seedProjects(): void {
  const samples: Array<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>> = [
    {
      name: 'Frontend Portal',
      description: 'Main customer-facing web application',
      domain: 'portal.example.com',
      portal_url: 'https://portal.example.com',
      shell_url: 'https://shell.portal.example.com',
      repo_url: 'https://github.com/example/frontend-portal',
      status: 'active',
    },
    {
      name: 'Backend API',
      description: 'Core REST API service',
      domain: 'api.example.com',
      portal_url: 'https://api.example.com/docs',
      shell_url: '',
      repo_url: 'https://github.com/example/backend-api',
      status: 'active',
    },
    {
      name: 'Data Pipeline',
      description: 'ETL and analytics pipeline',
      domain: '',
      portal_url: '',
      shell_url: '',
      repo_url: 'https://github.com/example/data-pipeline',
      status: 'draft',
    },
  ];

  const now = new Date().toISOString();
  for (const s of samples) {
    const id = uuidv4();
    projects.set(id, { id, ...s, createdAt: now, updatedAt: now });
  }
}
