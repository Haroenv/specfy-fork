import type { FastifyInstance } from 'fastify';
import { fastify } from 'fastify';
import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import buildApp from '../../../app';
import { ApiClient, isSuccess } from '../../../test/fetch';
import { shouldBeProtected } from '../../../test/helpers';
import { seedSimpleUser } from '../../../test/seed/seed';

let app: FastifyInstance;
let client: ApiClient;

beforeAll(async () => {
  app = fastify();
  await buildApp(app, {});
  await app.listen();

  client = new ApiClient((app.server.address() as any)?.port);
});

afterAll(async () => {
  await app.close();
  await client.close();
});

describe('POST /orgs', () => {
  it('should be protected', async () => {
    await shouldBeProtected(client, '/0/orgs', 'POST');
  });

  // it.only('should not allow query params', async () => {
  //   await shouldNotAllowQueryParams(client, '/0/orgs', 'POST');
  // });

  it('should create one org', async () => {
    const { token } = await seedSimpleUser();
    const id = 'abd-ef';
    const res = await client.post('/0/orgs', {
      token,
      body: { id: id, name: `test ${id}` },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json).toStrictEqual({ id: id, name: `test ${id}` });
  });
});
