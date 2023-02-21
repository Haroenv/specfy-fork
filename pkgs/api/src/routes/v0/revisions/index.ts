import type { FastifyPluginCallback } from 'fastify';

import blobsList from './blobs/list';
import create from './create';
import get from './get';
import list from './list';
import merge from './merge';

const fn: FastifyPluginCallback = async (f, _, done) => {
  f.register(create, { prefix: '/revisions' });
  f.register(list, { prefix: '/revisions' });
  f.register(get, { prefix: '/revisions/:revision_id' });
  f.register(blobsList, { prefix: '/revisions/:revision_id/blobs' });
  f.register(merge, { prefix: '/revisions/:revision_id/merge' });

  done();
};

export default fn;
