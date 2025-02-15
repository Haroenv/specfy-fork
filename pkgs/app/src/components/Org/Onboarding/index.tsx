import type { ApiOrg } from '@specfy/models';
import { IconArrowNarrowRight, IconCheck } from '@tabler/icons-react';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocalStorage } from 'react-use';

import { useListPerms, useListProjects } from '../../../api';
import { Flex } from '../../Flex';
import { Button } from '../../Form/Button';

import cls from './index.module.scss';

export const OrgOnboarding: React.FC<{ org: ApiOrg }> = ({ org }) => {
  const projects = useListProjects({ org_id: org.id });
  const perms = useListPerms({ org_id: org.id });
  const [done, setDone] = useLocalStorage(`orgOnboarding-${org.id}`, false);

  const [link] = useState(org.githubInstallationId);
  const [project, setProject] = useState(false);
  const [team, setTeam] = useState(false);

  useEffect(() => {
    if (!projects.data) {
      return;
    }

    setProject(projects.data.data.length > 0);
  }, [projects.isFetching]);
  useEffect(() => {
    if (!perms.data) {
      return;
    }

    setTeam(perms.data.data.length > 1);
  }, [perms.isFetching]);

  useEffect(() => {
    if (link && project && team) {
      setDone(true);
    }
  }, [link, project, team]);

  if ((link && project && team) || done) {
    return null;
  }

  return (
    <div className={cls.onboarding}>
      <Flex className={cls.header} justify="space-between">
        <div>
          <h2>Welcome</h2>
          <div className={cls.sub}>
            Follow the steps to get ready to use Specfy
          </div>
        </div>
        <div>
          <Button onClick={() => setDone(true)} size="s" display="ghost">
            skip
          </Button>
        </div>
      </Flex>

      <div className={cls.item}>
        <div className={cls.line}></div>
        <div className={classNames(cls.check, !link && cls.pending)}>
          {!link ? <div className={cls.donut}></div> : <IconCheck />}
        </div>
        <div className={cls.desc}>
          <div>Link your Github organization</div>
          <div className={cls.sub}>
            Sync your projects, avatar, team members
          </div>
        </div>
        <div>
          <Link to={`/${org.id}/_/settings`}>
            <Button>
              Settings <IconArrowNarrowRight />
            </Button>
          </Link>
        </div>
      </div>

      <div className={cls.item}>
        <div className={cls.line}></div>
        <div className={classNames(cls.check, !project && cls.pending)}>
          {!project ? <div className={cls.donut}></div> : <IconCheck />}
        </div>
        <div className={cls.desc}>
          <div>Create your first project</div>
          <div className={cls.sub}>
            Deploy documentation and track the stack of a Github repository
          </div>
        </div>
        <div>
          <Link to={`/${org.id}/_/project/new`}>
            <Button>
              Create <IconArrowNarrowRight />
            </Button>
          </Link>
        </div>
      </div>

      <div className={cls.item}>
        <div className={classNames(cls.check, !team && cls.pending)}>
          {!team ? <div className={cls.donut}></div> : <IconCheck />}
        </div>
        <div className={cls.desc}>
          <div>Invite team members</div>
          <div className={cls.sub}>Let them know you are using Specfy</div>
        </div>
        <div>
          <Link to={`/${org.id}/_/settings/team`}>
            <Button>
              Invite <IconArrowNarrowRight />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
