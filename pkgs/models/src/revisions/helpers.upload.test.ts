import type { Projects } from '@specfy/db';
import { describe, expect, it } from 'vitest';

import { DocumentsParser } from '../prosemirror/index.js';

import { uploadedDocumentsToDB } from './helpers.upload.js';
import type { PostUploadRevision } from './types.api.js';

describe('uploadedDocumentsToDB', () => {
  const payload: PostUploadRevision['Body'] = {
    source: 'github',
    orgId: 'a',
    projectId: 'b',
    blobs: [],
    description: { type: 'doc', content: [] },
    name: 'Foobar',
    stack: null,
  };

  it('should output nothing', () => {
    const parser = new DocumentsParser([], {} as Projects);
    const res = uploadedDocumentsToDB(parser.parse(), [], payload);

    expect(res).toStrictEqual({
      blobs: [],
      deleted: [],
    });
  });

  it('should output a readme', () => {
    const parser = new DocumentsParser(
      [{ content: '# My Title', path: '/README.md' }],
      {} as Projects
    );
    const res = uploadedDocumentsToDB(parser.parse(), [], payload);

    expect(res).toStrictEqual({
      deleted: [],
      blobs: [
        {
          created: true,
          deleted: false,
          parentId: null,
          type: 'document',
          typeId: expect.any(String),
          current: {
            blobId: null,
            content: JSON.stringify({ type: 'doc', content: [] }),
            format: 'pm',
            hash: 'e725106e8694ce174f209dd90839e682c1219c1f77c4c451ca8093de5f8d9950',
            id: expect.any(String),
            locked: false,
            name: 'Readme',
            orgId: 'a',
            parentId: null,
            projectId: 'b',
            slug: 'README',
            source: 'github',
            sourcePath: '/README.md',
            tldr: '',
            type: 'doc',
            typeId: null,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        },
      ],
    });
  });

  it('should handle nested doc', () => {
    const parser = new DocumentsParser(
      [
        { content: '# My Title', path: '/README.md' },
        { content: '# My Foobar', path: '/very/nested/folder/foobar.md' },
      ],
      {} as Projects
    );
    const res = uploadedDocumentsToDB(parser.parse(), [], payload);

    expect(res.blobs).toHaveLength(5);
    expect(res.blobs[0].current.parentId).toBeNull();
    expect(res.blobs[1].current.parentId).toBeNull();
    expect(res.blobs[2].current.parentId).toBe(res.blobs[1].current.id);
    expect(res.blobs[3].current.parentId).toBe(res.blobs[2].current.id);
    expect(res.blobs[4].current.parentId).toBe(res.blobs[3].current.id);
  });

  it('should handle unordered files', () => {
    const parser = new DocumentsParser(
      [
        { content: '# My Foobar', path: '/folder/foobar.md' },
        { content: '# My Title', path: '/folder' },
      ],
      {} as Projects
    );
    const res = uploadedDocumentsToDB(parser.parse(), [], payload);

    expect(res.blobs).toHaveLength(2);
  });
});
