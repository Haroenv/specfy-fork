import { EditOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Col, Divider, Row, Skeleton, Space } from 'antd';
import Title from 'antd/es/typography/Title';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMount } from 'react-use';

import { AvatarAuto } from '../../components/AvatarAuto';
import { ListRFCs } from '../../components/ListRFCs';
import { ListUpdates } from '../../components/ListUpdates';
import imgUrl from '../../static/infra.png';

import cls from './index.module.scss';

const tmp = {
  id: 'crawler',
  name: 'Crawler',
  description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pharetra eros vel felis scelerisque pretium. Maecenas ac feugiat orci, a sodales lacus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Praesent urna libero, convallis eu commodo id, iaculis aliquam arcu.<br>
  Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; In interdum egestas massa, sit amet auctor ipsum maximus in. Phasellus diam nulla, condimentum et ultrices sit amet, venenatis eget arcu. In hac habitasse platea dictumst. Donec a viverra mi.`,
  author: '1',
  owners: ['1'],
  approvers: ['1'],
  contributors: ['2', '3', '4'],
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

export const Project: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<typeof tmp>();

  useMount(() => {
    setTimeout(() => {
      setLoading(false);
      setItem(tmp);
    }, 1000);
  });

  if (loading || !item) {
    return (
      <div className={cls.container}>
        <Row gutter={[16, 16]}>
          <Col span={18}>
            <Skeleton active paragraph={false} className={cls.skeletonTitle} />
          </Col>
          <Col span={18}>
            <Card>
              <Skeleton active paragraph={{ rows: 3 }}></Skeleton>
              <Divider />
              <Avatar.Group>
                <Skeleton.Avatar active />
                <Skeleton.Avatar active />
                <Skeleton.Avatar active />
              </Avatar.Group>
            </Card>
          </Col>

          <Col span={12}>
            <Card>
              <Skeleton active title={false} paragraph={{ rows: 3 }}></Skeleton>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Skeleton active title={false} paragraph={{ rows: 3 }}></Skeleton>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div className={cls.container}>
      <Row gutter={[16, 16]}>
        <Col span={18}>
          <Space>
            <AvatarAuto
              name={item.name}
              size="large"
              className={cls.mainAvatar}
            />
            <div>
              <Title level={2} className={cls.title}>
                {item.name}
              </Title>
              <Space>
                <div className={cls.lastUpdate}>Last update 5 hours ago</div>
              </Space>
            </div>
          </Space>
        </Col>
        <Col span={6}>
          <Button type="primary" icon={<EditOutlined></EditOutlined>}>
            Edit
          </Button>
        </Col>
        <Col span={18}>
          <Card>
            <div dangerouslySetInnerHTML={{ __html: item.description }}></div>
            <Divider plain />
            <Title level={5}>Technical Aspect</Title>
            <Row className={cls.technical}>
              <Col span={3}>Stack</Col>
              <Col>
                <Link to="/t/">GCP</Link>, <Link to="/t/">NodeJS</Link>,{' '}
                <Link to="/t/">Postgres</Link>, <Link to="/t/">RabbitMQ</Link>,{' '}
                <Link to="/t/">Algolia</Link>, <Link to="/t/">Redis</Link>
              </Col>
            </Row>
            <Row className={cls.technical}>
              <Col span={3}>Components</Col>
              <Col>
                <Link to="/p//c/">Public API</Link>,{' '}
                <Link to="/p//c/">Private API</Link>,{' '}
                <Link to="/p//c/">Frontend</Link>,{' '}
                <Link to="/p//c/">Email Cron</Link>,{' '}
                <Link to="/p//c/">Message Consumer</Link>,{' '}
                <Link to="/p//c/">Fetcher</Link>,{' '}
                <Link to="/p//c/">Job Processor</Link>,{' '}
                <Link to="/p//c/">Indexer</Link>
              </Col>
            </Row>
            <Row className={cls.technical}>
              <Col span={3}>Link to Project</Col>
              <Col>
                <Link to="/p/">Dashboard</Link>,{' '}
                <Link to="/p/">Analytics API</Link>
              </Col>
            </Row>

            <Divider plain />
            <Title level={5}>Contributors</Title>
            <div className={cls.contributors}>
              <Avatar.Group>
                {item.owners.map((user) => {
                  return <AvatarAuto key={user} name="samuel bodin" />;
                })}
              </Avatar.Group>
              {item.approvers.length > 0 && (
                <Avatar.Group>
                  {item.approvers.map((user) => {
                    return <AvatarAuto key={user} name="raphael daguenet" />;
                  })}
                </Avatar.Group>
              )}
              {item.contributors.length > 0 && (
                <Avatar.Group>
                  {item.contributors.map((user) => {
                    return <AvatarAuto key={user} name="nicolas torres" />;
                  })}
                </Avatar.Group>
              )}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className={cls.infraPng}>
              <img src={imgUrl} alt="" />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <ListRFCs></ListRFCs>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <ListUpdates></ListUpdates>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
