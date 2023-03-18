import { nanoid } from '../common/id';
import {
  Component,
  User,
  Document,
  Org,
  Project,
  Perm,
  TypeHasUser,
  Revision,
  RevisionBlob,
  Policy,
} from '../models';

import './';
import { seedPlaybook, seedRFC } from './seed/documents';
import { seedPolicies } from './seed/policies';
import { seedProjects } from './seed/projects';
import { seedRevisions } from './seed/revisions';

export async function clean() {
  await Promise.all([
    User.truncate(),
    Org.truncate(),
    Project.truncate(),
    Document.truncate(),
    Component.truncate(),
    Perm.truncate(),
    Revision.truncate(),
    RevisionBlob.truncate(),
    TypeHasUser.truncate(),
    Policy.truncate(),
  ]);
}

export async function seed() {
  // Users
  const [u1, u2, u3, u4, u5, u6, u7, u8] = await Promise.all([
    await User.create({
      name: 'Samuel Bodin',
      email: 'bodin.samuel@gmail.com',
    }),
    await User.create({
      name: 'Raphael Daguenet',
      email: 'raphdag@gmail.com',
    }),
    await User.create({
      name: 'Nicolas Torres',
      email: 'nicote@gmail.com',
    }),
    await User.create({
      name: 'John Doe',
      email: 'john.doe@gmail.com',
    }),
    await User.create({
      name: 'Alice Wong',
      email: 'alice.wong@gmail.com',
    }),
    await User.create({
      name: 'Walther Phillips',
      email: 'WalterLPhillips@gmail.com',
    }),
    await User.create({
      name: 'Clementine Dandonneau',
      email: 'ClementineDandonneau@gmail.com',
    }),
    await User.create({
      name: 'Lisha A. James',
      email: 'LishaAJames@gmail.com',
    }),
  ]);
  const users = [u1, u2, u3, u4, u5, u6, u7, u8];

  // Org
  await Org.create({
    id: 'company',
    name: 'My Company',
  });
  await Org.create({
    id: 'samuelbodin',
    name: "Samuel Bodin's org",
  });

  const { p1, p3 } = await seedProjects(users);

  const rfcs = await seedRFC(p1, [u1, u2]);
  await seedPlaybook(p1, [u1]);

  // Components
  const gcp = await Component.create({
    id: 'jZDC3Lsc01',
    name: 'GCP',
    type: 'hosting',
    orgId: 'company',
    projectId: p1.id,
    techId: 'gcp',
    description: { type: 'doc', content: [] },
    display: {
      zIndex: 1,
      pos: { x: -80, y: 20, width: 490, height: 370 },
    },
    inComponent: null,
    edges: [],
  });
  const compute = await Component.create({
    id: 'jZDC3Lsc02',
    name: 'GCE',
    type: 'hosting',
    orgId: 'company',
    projectId: p1.id,
    techId: 'gce',
    description: { type: 'doc', content: [] },
    display: {
      zIndex: 2,
      pos: { x: -60, y: 320, width: 150, height: 55 },
    },
    inComponent: gcp.id,
    edges: [],
  });
  const kube = await Component.create({
    id: 'jZDC3Lsc03',
    name: 'Kubernetes',
    type: 'hosting',
    orgId: 'company',
    projectId: p1.id,
    techId: 'kubernetes',
    description: { type: 'doc', content: [] },
    display: {
      zIndex: 2,
      pos: { x: 150, y: 50, width: 240, height: 300 },
    },
    inComponent: gcp.id,
    edges: [],
  });
  const pg = await Component.create({
    id: 'jZDC3Lsc04',
    name: 'Postgresql',
    type: 'component',
    orgId: 'company',
    projectId: p1.id,
    techId: 'postgresql',
    description: { type: 'doc', content: [] },
    display: { zIndex: 3, pos: { x: -10, y: 190, width: 100, height: 32 } },
    inComponent: gcp.id,
    edges: [],
  });
  const dd = await Component.create({
    id: 'jZDC3Lsc05',
    name: 'Datadog',
    type: 'thirdparty',
    orgId: 'company',
    projectId: p1.id,
    techId: 'datadog',
    description: { type: 'doc', content: [] },
    display: { zIndex: 3, pos: { x: 450, y: 190, width: 100, height: 32 } },
    inComponent: null,
    edges: [],
  });
  const sentry = await Component.create({
    id: 'jZDC3Lsc06',
    name: 'Sentry',
    type: 'thirdparty',
    orgId: 'company',
    projectId: p1.id,
    techId: 'sentry',
    description: { type: 'doc', content: [] },
    display: { zIndex: 3, pos: { x: 450, y: 250, width: 100, height: 32 } },
    inComponent: null,
    edges: [],
  });
  const algolia = await Component.create({
    id: 'jZDC3Lsc07',
    name: 'Algolia',
    type: 'thirdparty',
    orgId: 'company',
    projectId: p1.id,
    techId: 'algolia',
    description: { type: 'doc', content: [] },
    display: { zIndex: 3, pos: { x: 450, y: 310, width: 100, height: 32 } },
    inComponent: null,
    edges: [],
  });
  const redis = await Component.create({
    id: 'jZDC3Lsc08',
    name: 'Redis',
    type: 'component',
    orgId: 'company',
    projectId: p1.id,
    techId: 'redis',
    description: { type: 'doc', content: [] },
    display: { zIndex: 3, pos: { x: -10, y: 120, width: 100, height: 32 } },
    inComponent: gcp.id,
    edges: [],
  });
  const es = await Component.create({
    id: 'jZDC3Lsc09',
    name: 'Elasticsearch',
    type: 'component',
    orgId: 'company',
    projectId: p1.id,
    techId: 'elasticsearch',
    description: { type: 'doc', content: [] },
    display: { zIndex: 3, pos: { x: -40, y: 330, width: 100, height: 32 } },
    inComponent: compute.id,
    edges: [],
  });
  const rabbit = await Component.create({
    id: 'jZDC3Lsc10',
    name: 'RabbitMQ',
    type: 'component',
    orgId: 'company',
    projectId: p1.id,
    techId: 'rabbitmq',
    description: { type: 'doc', content: [] },
    display: { zIndex: 3, pos: { x: 210, y: 240, width: 100, height: 32 } },
    inComponent: kube.id,
    edges: [],
  });
  const analytics = await Component.create({
    id: 'jZDC3Lsc11',
    name: 'Dashboard',
    type: 'project',
    typeId: p3.id,
    orgId: 'company',
    projectId: p1.id,
    description: { type: 'doc', content: [] },
    display: { zIndex: 3, pos: { x: 450, y: 90, width: 100, height: 32 } },
    inComponent: null,
    edges: [],
  });
  const api = await Component.create({
    id: 'jZDC3Lsc12',
    name: 'API',
    type: 'component',
    orgId: 'company',
    projectId: p1.id,
    description: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { uid: nanoid() },
          content: [
            {
              type: 'text',
              text: 'Morbi sit amet porttitor justo, quis sagittis nulla. Donec et ullamcorper dolor. Maecenas pharetra imperdiet nulla nec commodo.',
            },
          ],
        },
      ],
    },
    display: { zIndex: 3, pos: { x: 210, y: 120, width: 100, height: 32 } },
    inComponent: kube.id,
    edges: [
      {
        to: redis.id,
        read: true,
        write: true,
        vertices: [],
        portSource: 'left',
        portTarget: 'right',
      },
      {
        to: pg.id,
        read: true,
        write: true,
        vertices: [],
        portSource: 'left',
        portTarget: 'right',
      },
      {
        to: analytics.id,
        read: true,
        write: false,
        vertices: [],
        portSource: 'right',
        portTarget: 'left',
      },
      {
        to: es.id,
        read: true,
        write: true,
        vertices: [
          { x: 160, y: 180 },
          { x: 110, y: 300 },
        ],
        portSource: 'left',
        portTarget: 'right',
      },
      {
        to: dd.id,
        read: false,
        write: true,
        vertices: [],
        portSource: 'right',
        portTarget: 'left',
      },
      {
        to: sentry.id,
        read: false,
        write: true,
        vertices: [],
        portSource: 'right',
        portTarget: 'left',
      },
      {
        to: algolia.id,
        read: true,
        write: true,
        vertices: [{ x: 400, y: 280 }],
        portSource: 'right',
        portTarget: 'left',
      },
    ],
    tech: ['nodejs', 'typescript', 'bash', 'AtlasDB'],
  });
  await Component.create({
    id: 'jZDC3Lsc13',
    name: 'Frontend',
    type: 'component',
    orgId: 'company',
    projectId: p1.id,
    description: { type: 'doc', content: [] },
    display: { zIndex: 4, pos: { x: 210, y: 60, width: 100, height: 32 } },
    inComponent: kube.id,
    edges: [
      {
        to: api.id,
        read: true,
        write: true,
        vertices: [],
        portSource: 'bottom',
        portTarget: 'top',
      },
      {
        to: algolia.id,
        read: true,
        write: false,
        vertices: [{ x: 390, y: 270 }],
        portSource: 'right',
        portTarget: 'left',
      },
      {
        to: sentry.id,
        read: false,
        write: true,
        vertices: [{ x: 400, y: 230 }],
        portSource: 'right',
        portTarget: 'left',
      },
    ],
    tech: ['react', 'typescript', 'webpack'],
  });
  await Component.create({
    id: 'jZDC3Lsc14',
    name: 'Manager',
    type: 'component',
    orgId: 'company',
    projectId: p1.id,
    description: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { uid: nanoid() },
          content: [
            {
              type: 'text',
              text: 'Donec et ullamcorper dolor. Maecenas pharetra imperdiet nulla nec commodo.',
            },
          ],
        },
      ],
    },
    display: { zIndex: 3, pos: { x: 210, y: 180, width: 100, height: 32 } },
    inComponent: kube.id,
    edges: [
      {
        to: pg.id,
        read: true,
        write: true,
        vertices: [],
        portSource: 'left',
        portTarget: 'right',
      },
      {
        to: rabbit.id,
        read: true,
        write: true,
        vertices: [],
        portSource: 'bottom',
        portTarget: 'top',
      },
      {
        to: es.id,
        read: true,
        write: true,
        vertices: [],
        portSource: 'left',
        portTarget: 'right',
      },
      {
        to: algolia.id,
        read: true,
        write: true,
        vertices: [],
        portSource: 'right',
        portTarget: 'left',
      },
      {
        to: dd.id,
        read: false,
        write: true,
        vertices: [],
        portSource: 'right',
        portTarget: 'left',
      },
      {
        to: sentry.id,
        read: false,
        write: true,
        vertices: [],
        portSource: 'right',
        portTarget: 'left',
      },
    ],
    tech: ['nodejs', 'typescript'],
  });
  await Component.create({
    id: 'jZDC3Lsc15',
    name: 'Worker',
    type: 'component',
    orgId: 'company',
    projectId: p1.id,
    description: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { uid: nanoid() },
          content: [
            {
              type: 'text',
              text: 'Maecenas pharetra imperdiet nulla nec commodo.',
            },
          ],
        },
      ],
    },
    display: { zIndex: 3, pos: { x: 210, y: 300, width: 100, height: 32 } },
    inComponent: kube.id,
    edges: [
      {
        to: pg.id,
        read: true,
        write: false,
        vertices: [],
        portSource: 'left',
        portTarget: 'right',
      },
      {
        to: rabbit.id,
        read: true,
        write: true,
        vertices: [],
        portSource: 'top',
        portTarget: 'bottom',
      },
      {
        to: es.id,
        read: true,
        write: false,
        vertices: [],
        portSource: 'left',
        portTarget: 'right',
      },
      {
        to: dd.id,
        read: false,
        write: true,
        vertices: [],
        portSource: 'right',
        portTarget: 'left',
      },
      {
        to: sentry.id,
        read: false,
        write: true,
        vertices: [],
        portSource: 'right',
        portTarget: 'left',
      },
    ],
    tech: ['nodejs', 'typescript'],
  });
  await seedRevisions(p1, users, rfcs, { api });

  await seedPolicies([u1]);
}

(async () => {
  console.log('Cleaning');
  await clean();
  console.log('Seeding');
  await seed();
  console.log('Seeding done');
})();
