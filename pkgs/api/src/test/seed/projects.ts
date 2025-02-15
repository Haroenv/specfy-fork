import { nanoid, slugify } from '@specfy/core';
import type { Orgs, Projects, Users } from '@specfy/db';
import { prisma } from '@specfy/db';
import {
  recomputeOrgGraph,
  createProject,
  getDefaultConfig,
} from '@specfy/models';
import type { DBProject } from '@specfy/models';

interface ResSeedProjects {
  pDash: Projects;
  pAnalytics: Projects;
  pFront: Projects;
  pAPI: Projects;
  pBilling: Projects;
}
/**
 * Seed projects
 */
export async function seedProjects(
  { o1 }: { o1: Orgs },
  users: Users[]
): Promise<ResSeedProjects> {
  const res: ResSeedProjects = await prisma.$transaction(
    async (tx) => {
      const pDash = await createProject({
        data: {
          id: 'b01tMzwd5A',
          name: 'Dashboard',
          orgId: o1.id,
          links: [],
          description: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                attrs: { uid: nanoid() },
                content: [
                  {
                    type: 'text',
                    text: `Donec mollis pretium nisl at dignissim. Duis dui magna, tempus a scelerisque id, semper eu metus.`,
                  },
                ],
              },
            ],
          },
          config: getDefaultConfig(),
        },
        user: users[0],
        tx,
      });

      const pFront = await createProject({
        data: {
          id: 'b02tMzwd5A',
          name: 'Frontend',
          orgId: o1.id,
          links: [],
          description: { type: 'doc', content: [] },
          config: getDefaultConfig(),
        },
        user: users[0],
        tx,
      });

      const pAnalytics = await createProject({
        data: {
          id: 'b03tMzwd5A',
          name: 'Analytics',
          orgId: o1.id,
          description: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                attrs: { uid: 'UidC3Ls190' },
                content: [
                  {
                    type: 'text',
                    text: 'The Analytics project collects data from various sources, processes it, and presents it in dashboards and reports. These outputs show key indicators and trends for the business.',
                  },
                  { type: 'hardBreak' },
                  {
                    type: 'text',
                    text: `The project also employs machine learning and statistical methods to analyze data. This analysis helps in predicting trends and making recommendations based on past data. This project assists businesses in making data-based decisions.`,
                  },
                ],
              },
            ],
          },
          links: [
            { title: 'Github', url: 'https://github.com/specfy' },
            { title: 'Discord', url: 'https://discord.gg/96cDXvT8NV' },
          ],
          config: getDefaultConfig(),
        },
        user: users[0],
        tx,
      });

      const pAPI = await createProject({
        data: {
          id: 'b04tMzwd5A',
          name: 'API',
          orgId: o1.id,
          links: [],
          description: { type: 'doc', content: [] },
          config: getDefaultConfig(),
        },
        user: users[0],
        tx,
      });

      const pBilling = await createProject({
        data: {
          id: 'b05tMzwd5A',
          name: 'Billing',
          orgId: o1.id,
          links: [],
          description: { type: 'doc', content: [] },
          config: getDefaultConfig(),
        },
        user: users[0],
        tx,
      });

      // ---- Permissions
      await Promise.all([
        // Add one viewer
        tx.perms.create({
          data: {
            id: nanoid(),
            orgId: o1.id,
            projectId: pAnalytics.id,
            userId: users[1].id,
            role: 'viewer',
          },
        }),

        ...[users[3], users[4], users[5], users[6]].map((u) => {
          return tx.perms.create({
            data: {
              id: nanoid(),
              orgId: o1.id,
              projectId: pAnalytics.id,
              userId: u.id,
              role: 'contributor',
            },
          });
        }),
      ]);

      await recomputeOrgGraph({
        orgId: o1.id,
        updates: {
          edges: {},
          nodes: {
            b01tMzwd5A: {
              display: {
                pos: { x: 20, y: 10 },
                size: { width: 130, height: 40 },
              },
            },
            b02tMzwd5A: {
              display: {
                pos: { x: 220, y: -20 },
                size: { width: 130, height: 40 },
              },
            },
            b03tMzwd5A: {
              display: {
                pos: { x: 200, y: 70 },
                size: { width: 130, height: 40 },
              },
            },
            b04tMzwd5A: {
              display: {
                pos: { x: -150, y: 40 },
                size: { width: 130, height: 40 },
              },
            },
            b05tMzwd5A: {
              display: {
                pos: { x: 0, y: 120 },
                size: { width: 130, height: 40 },
              },
            },
          },
        },
        tx,
      });

      return { pDash, pAnalytics, /*p2,*/ pFront, pAPI, pBilling };
    },
    { timeout: 20000 }
  );

  return res;
}

export async function seedProject(user: Users, org: Orgs) {
  const id = nanoid();
  const project = await createProject({
    data: {
      id,
      name: `Project ${id}`,
      orgId: org.id,
      links: [],
      description: { type: 'doc', content: [] },
      config: getDefaultConfig(),
    },
    tx: prisma,
    user,
  });

  return project;
}

export function getBlobProject(org: Orgs): DBProject {
  const id = nanoid();
  const name = `test ${id}`;
  return {
    id,
    name,
    slug: slugify(name),
    blobId: null,
    orgId: org.id,
    links: [],
    description: { type: 'doc', content: [] },
    githubRepository: null,
    config: getDefaultConfig(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
