import { QueryClient } from '@tanstack/react-query';

import { original } from './store';

export const qcli = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 0,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      staleTime: 60 * 1000 * 5,
      retry: 3,
      retryDelay: (attemptIndex) => {
        return Math.min(2000 * 2 ** attemptIndex, 30000);
      },
    },
  },
});

export async function refreshProject(
  orgId: string,
  projectId: string,
  force: boolean = false
) {
  original.cleanProject(projectId);
  const queries = [
    ['listRevisions', orgId, projectId],
    ['getRevision', orgId, projectId],
    ['getRevisionChecks', orgId, projectId],
    ['getProject', orgId],
    ['listProjects', orgId],
    ['listComponents', orgId, projectId],
    ['listDocuments', orgId, projectId],
    ['getDocument', orgId, projectId],
    ['getFlow', orgId],
    ['listActivities', orgId, projectId],
  ];
  if (force) {
    await Promise.all(queries.map((query) => qcli.refetchQueries(query)));
  } else {
    await Promise.all(queries.map((query) => qcli.invalidateQueries(query)));
  }
}
