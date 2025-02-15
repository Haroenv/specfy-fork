import type { AiOperationType } from '@specfy/models';
import type { Table } from 'dexie';
import Dexie from 'dexie';

export interface AICompletion {
  id?: number;
  orgId: string;
  projectId: string;
  title: string;
  content: string;
  type: AiOperationType;
  createdAt: string;
  startedAt: string | null;
}

export class MySubClassedDexie extends Dexie {
  aiCompletion!: Table<AICompletion>;

  constructor() {
    super('specfy');

    this.version(1).stores({
      aiCompletion: '++id, [orgId+projectId]',
    });
  }
}

export const db = new MySubClassedDexie();
