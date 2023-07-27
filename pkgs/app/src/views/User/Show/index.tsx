import { Github } from '@icons-pack/react-simple-icons';
import { Divider, Skeleton } from 'antd';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { useGetUser } from '../../../api';
import { titleSuffix } from '../../../common/string';
import { AvatarAuto, AvatarGroup } from '../../../components/AvatarAuto';
import { Card } from '../../../components/Card';
import { Container } from '../../../components/Container';
import { Flex } from '../../../components/Flex';
import { NotFound } from '../../../components/NotFound';
import type { RouteUser } from '../../../types/routes';

import cls from './index.module.scss';

export const UserShow: React.FC = () => {
  const tmpParams = useParams<Partial<RouteUser>>();
  const params = tmpParams as RouteUser;

  // Data fetch
  const get = useGetUser({ user_id: params.user_id });

  if (get.isFetching) {
    return (
      <div>
        <div></div>
        <div>
          <Container>
            <Container.Left>
              <Card padded large seamless>
                <Skeleton active paragraph={{ rows: 3 }}></Skeleton>
                <Divider />
                <AvatarGroup>
                  <Skeleton.Avatar active />
                  <Skeleton.Avatar active />
                  <Skeleton.Avatar active />
                </AvatarGroup>
              </Card>
            </Container.Left>
          </Container>
        </div>
      </div>
    );
  }

  if (!get.data) {
    return <NotFound />;
  }

  const user = get.data.data;
  return (
    <Container>
      <Helmet title={`${user.name} ${titleSuffix}`} />
      <div className={cls.main}>
        <Flex gap="l">
          <AvatarAuto
            name={user.name}
            src={user.avatarUrl}
            single={true}
            size="xl"
            colored={false}
          />
          <h4>{user.name}</h4>
        </Flex>
        <div className={cls.info}>
          {user.githubLogin && (
            <a href="">
              <Flex gap="l">
                <Github />@{user.githubLogin}
              </Flex>
            </a>
          )}
        </div>
      </div>
    </Container>
  );
};
