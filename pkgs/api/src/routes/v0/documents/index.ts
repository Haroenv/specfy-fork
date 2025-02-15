import type { FastifyPluginAsync } from 'fastify';

import bySlug from './bySlug.js';
import get from './get.js';
import list from './list.js';

const fn: FastifyPluginAsync = async (f) => {
  await f.register(list, { prefix: '/documents' });
  await f.register(bySlug, { prefix: '/documents/by_slug' });
  await f.register(get, { prefix: '/documents/' });
};

export default fn;
