import { LoadingOutlined } from '@ant-design/icons';
import { App, Button, Card, Form, Input, Typography } from 'antd';
import type { ApiProject, BlockLevelZero } from 'api/src/types/api';
import type { ReqPostRevision } from 'api/src/types/api/revisions';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createRevision } from '../../../../api/revisions';
import { diffTwoBlob } from '../../../../common/diff';
import type { ComputedForDiff } from '../../../../components/DiffRow';
import { DiffRow } from '../../../../components/DiffRow';
import { Editor } from '../../../../components/Editor';
import type { EditContextInterface } from '../../../../hooks/useEdit';
import { useEdit } from '../../../../hooks/useEdit';
import type { RouteProject } from '../../../../types/routes';

import cls from './index.module.scss';

function proposeTitle(computed: ComputedForDiff[]): string {
  if (computed.length === 0) {
    return '';
  }

  console.log('hello', computed);
  if (computed.length === 1) {
    const item = computed[0];
    const type = item.type === 'project' ? 'project' : item.original.name;
    return `fix(${type}): update ${item.key}`;
  }

  return '';
}

export const ProjectRevisionCreate: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  // Global
  const { message } = App.useApp();
  const navigate = useNavigate();

  // Edition
  const edit = useEdit();
  const changes = useMemo(() => {
    return edit.changes;
  }, [edit.changes]);

  // Local
  const [lastComputed, setLastComputed] = useState<number>();
  const [computed, setComputed] = useState<ComputedForDiff[]>([]);
  const [to] = useState(() => `/org/${params.org_id}/${params.project_slug}`);

  // Form
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  // TODO: keep those values in Edit Mode
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<BlockLevelZero>({
    type: 'doc',
    content: [{ type: 'paragraph' }],
  });

  // Compute changes
  useEffect(() => {
    if (!changes || !edit.lastUpdate) {
      return;
    }
    if (lastComputed && edit.lastUpdate.getTime() <= lastComputed) {
      return;
    }

    const cleaned: EditContextInterface['changes'] = [];
    const tmps: ComputedForDiff[] = [];

    // Remove non modified fields
    for (const change of changes) {
      const res = diffTwoBlob(change, change.original);
      tmps.push(...res.computed);
      cleaned.push(res.clean);
    }

    const now = Date.now();
    setComputed(tmps);
    setLastComputed(now);
    setTimeout(() => {
      edit.setChanges(cleaned);
    }, 1);
    setTitle(proposeTitle(tmps));
  }, [changes]);

  // Can submit form?
  useEffect(() => {
    let enoughContent = description.content.length > 0;
    if (
      description.content.length === 1 &&
      description.content[0].type === 'paragraph' &&
      !description.content[0].content
    ) {
      // Placeholder
      enoughContent = false;
    }

    setCanSubmit(title !== '' && enoughContent);
  }, [title, description]);

  const handleRevert = (type: string, typeId: string, key: string) => {
    // TODO: possibility to undo revert
    edit.revert(type as any, typeId, key as any);
  };

  const onSubmit = async () => {
    const blobs: ReqPostRevision['blobs'] = [];
    for (const change of changes) {
      blobs.push({
        type: change.type,
        typeId: change.typeId,
        parentId: change.original.blobId,
        blob: { ...change.original, ...change.blob } as any,
        deleted: false,
      });
    }

    const { id } = await createRevision({
      orgId: params.org_id,
      projectId: proj.id,
      title,
      description,
      blobs,
    });

    // Discard local changes
    edit.setChanges([]);

    message.success('Revision created');
    navigate(`/org/${params.org_id}/${params.project_slug}/revisions/${id}`);
  };

  if (!computed) {
    return <LoadingOutlined />;
  }

  if (!edit.lastUpdate || edit.changes.length === 0 || computed.length === 0) {
    return <>No changes to commit...</>;
  }
  console.log('on render once');

  return (
    <div className={cls.container}>
      <div className={cls.left}>
        <Card>
          <Form onFinish={onSubmit}>
            <Form.Item required name="title" initialValue={title}>
              <Input
                size="large"
                placeholder="Title"
                onChange={(e) => setTitle(e.target.value)}
              />
            </Form.Item>

            <Typography>
              <Editor
                content={description}
                onUpdate={setDescription}
                minHeight="100px"
                inputLike={true}
              />
            </Typography>
            <div className={cls.action}>
              <Button type="primary" disabled={!canSubmit} htmlType="submit">
                Propose changes
              </Button>
            </div>
          </Form>
        </Card>
      </div>
      <div className={cls.right}></div>
      <div className={cls.staged}>
        {computed.map((c) => {
          return (
            <DiffRow key={c.typeId} comp={c} url={to} onRevert={handleRevert} />
          );
        })}
      </div>
    </div>
  );
};
