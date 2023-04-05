import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import { prisma } from '../../../db';
import { createComponentBlob } from '../../../models/component';
import type { TestSetup } from '../../../test/each';
import { setupBeforeAll, setupAfterAll } from '../../../test/each';
import { isSuccess } from '../../../test/fetch';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers';
import { getBlobComponent, seedComponent } from '../../../test/seed/components';
import { seedRevision } from '../../../test/seed/revisions';
import { seedSimpleUser, seedWithProject } from '../../../test/seed/seed';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('GET /revisions/:revision_id/checks', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/revisions/foo/checks');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/revisions/foo/checks', {
      token,
      // @ts-expect-error
      qp: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should get default checks', async () => {
    const { token, org, project, user } = await seedWithProject();
    const revision = await seedRevision(user, org, project);

    const res = await t.fetch.get(`/0/revisions/${revision.id}/checks`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual({
      canMerge: false,
      outdatedBlobs: [],
      reviews: [],
    });
  });

  it('should get mergeable checks', async () => {
    const { token, org, project, user } = await seedWithProject();
    const revision = await seedRevision(user, org, project);

    const comment = await t.fetch.post(`/0/revisions/${revision.id}/comment`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
      body: { approval: true, content: { content: [], type: 'doc' } },
    });
    isSuccess(comment);

    const res = await t.fetch.get(`/0/revisions/${revision.id}/checks`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual({
      canMerge: true,
      outdatedBlobs: [],
      reviews: [
        {
          commentId: comment.json.data.id,
          id: expect.any(String),
          user: {
            email: user.email,
            id: user.id,
            name: user.name,
          },
        },
      ],
    });
  });

  it('should get checks with non-approved comment', async () => {
    const { token, org, project, user } = await seedWithProject();
    const revision = await seedRevision(user, org, project);

    const comment = await t.fetch.post(`/0/revisions/${revision.id}/comment`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
      body: { approval: false, content: { content: [], type: 'doc' } },
    });
    isSuccess(comment);

    const res = await t.fetch.get(`/0/revisions/${revision.id}/checks`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual({
      canMerge: false,
      outdatedBlobs: [],
      reviews: [],
    });
  });

  it('should get checks with outdated blobs', async () => {
    const { token, org, project, user } = await seedWithProject();

    // Create a component
    const component = await seedComponent(user, org, project);
    const blob = { ...getBlobComponent(org, project), id: component.id };

    // Modifies it in a revision
    const revision = await seedRevision(user, org, project, undefined, [
      {
        parentId: component.blobId,
        type: 'component',
        typeId: component.id,
        created: false,
        deleted: false,
        blob,
      },
    ]);

    // Modifies the component in the main channel
    const blob2 = { ...getBlobComponent(org, project), id: component.id };
    const newBlob = await createComponentBlob({
      blob: blob2 as any,
      tx: prisma,
    });
    await prisma.components.update({
      data: { ...(blob2 as any), blobId: newBlob.id },
      where: { id: component.id },
    });

    // Checks
    const res = await t.fetch.get(`/0/revisions/${revision.id}/checks`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual({
      canMerge: false,
      outdatedBlobs: revision.blobs,
      reviews: [],
    });
  });

  it('should get checks with deleted blobs', async () => {
    const { token, org, project, user } = await seedWithProject();

    // Create a component
    const component = await seedComponent(user, org, project);
    const blob = { ...getBlobComponent(org, project), id: component.id };

    // Modifies it in a revision
    const revision = await seedRevision(user, org, project, undefined, [
      {
        parentId: component.blobId,
        type: 'component',
        typeId: component.id,
        created: false,
        deleted: false,
        blob,
      },
    ]);

    // Delete the component in the main channel
    const blob2 = { ...getBlobComponent(org, project), id: component.id };
    await createComponentBlob({
      blob: blob2 as any,
      data: { deleted: true },
      tx: prisma,
    });
    await prisma.components.delete({
      where: { id: component.id },
    });

    // Checks
    const res = await t.fetch.get(`/0/revisions/${revision.id}/checks`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual({
      canMerge: false,
      outdatedBlobs: revision.blobs,
      reviews: [],
    });
  });
});
