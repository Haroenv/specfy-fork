import type { FastifyPluginCallback } from 'fastify';

import get from './get.js';

const fn: FastifyPluginCallback = async (f, _, done) => {
  f.register(get, { prefix: '/' });

  done();
};

export default fn;
