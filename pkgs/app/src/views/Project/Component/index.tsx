import { Typography } from 'antd';
import type { ApiComponent, ApiProject } from 'api/src/types/api';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { TechInfo } from '../../../common/component';
import { supported } from '../../../common/component';
import { Card } from '../../../components/Card';
import { Container } from '../../../components/Container';
import { ContentDoc } from '../../../components/Content';
import { EditorMini } from '../../../components/Editor/Mini';
import { Graph } from '../../../components/Graph';
import { ListRFCs } from '../../../components/ListRFCs';
import { useEdit } from '../../../hooks/useEdit';
import { useGraph } from '../../../hooks/useGraph';
import type { RouteComponent, RouteProject } from '../../../types/routes';

import { Line } from './Line';
import cls from './index.module.scss';

function getAllChilds(list: ApiComponent[], id: string): ApiComponent[] {
  const tmp = [];
  for (const c of list) {
    if (c.inComponent === id) {
      tmp.push(c);
      tmp.push(...getAllChilds(list, c.id));
    }
  }
  return tmp;
}

export const ComponentView: React.FC<{
  proj: ApiProject;
  comps: ApiComponent[];
  params: RouteProject;
}> = ({ proj, comps, params }) => {
  const gref = useGraph();

  // TODO: filter RFC
  const [comp, setComp] = useState<ApiComponent>();
  const [info, setInfo] = useState<TechInfo>();
  const [Icon, setIcon] = useState<TechInfo['Icon']>();
  const route = useParams<Partial<RouteComponent>>();

  // Components
  const [inComp, setInComp] = useState<ApiComponent>();
  const [hosts, setHosts] = useState<ApiComponent[]>([]);
  const [contains, setContains] = useState<ApiComponent[]>([]);
  const [read, setRead] = useState<ApiComponent[]>([]);
  const [write, setWrite] = useState<ApiComponent[]>([]);
  const [readwrite, setReadWrite] = useState<ApiComponent[]>([]);
  const [receive, setReceive] = useState<ApiComponent[]>([]);
  const [send, setSend] = useState<ApiComponent[]>([]);
  const [receiveSend, setReceiveSend] = useState<ApiComponent[]>([]);

  // Edition
  const edit = useEdit();
  const curr = useMemo(() => {
    if (!comp) return null;
    return edit.get<ApiComponent>('component', comp.id, comp);
  }, [comp]);
  const desc = useMemo(() => {
    if (!comp) return undefined;
    return curr?.changes?.description || comp?.description;
  }, [comp, curr]);

  useEffect(() => {
    setComp(
      comps.find((c) => {
        return c.slug === route.component_slug!;
      })
    );
  }, [route.component_slug]);

  useEffect(() => {
    if (!comp) {
      return;
    }

    const name = comp.name.toLocaleLowerCase();
    if (name in supported) {
      setInfo(supported[name]);
      setIcon(supported[name].Icon);
    } else {
      setInfo(undefined);
      setIcon(undefined);
    }

    const list = new Map<string, ApiComponent>();
    for (const c of comps) {
      list.set(c.id, c);
    }

    const _in = comp.inComponent && list.get(comp.inComponent);

    const _hosts: ApiComponent[] = [];
    const _read = new Map<string, ApiComponent>();
    const _write = new Map<string, ApiComponent>();
    const _readwrite = new Map<string, ApiComponent>();
    const _receive = new Map<string, ApiComponent>();
    const _send = new Map<string, ApiComponent>();
    const _receivesend = new Map<string, ApiComponent>();

    // Recursive find hosts
    if (_in) {
      let l = _in;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (l.type === 'hosting') _hosts.push(l);
        if (!l.inComponent) {
          break;
        }
        l = list.get(l.inComponent)!;
      }

      if (_in.type !== 'hosting') {
        setInComp(_in);
      }
    }

    // Find contains
    // First find direct ascendant then register all childs
    setContains(getAllChilds(comps, comp.id));

    for (const edge of comp.edges) {
      if (edge.read && edge.write) {
        _readwrite.set(edge.to, list.get(edge.to)!);
      } else if (edge.write) {
        _write.set(edge.to, list.get(edge.to)!);
      } else {
        _read.set(edge.to, list.get(edge.to)!);
      }
    }

    for (const other of comps) {
      if (other.id === comp.id) {
        continue;
      }

      for (const edge of other.edges) {
        if (edge.to !== comp.id) {
          continue;
        }

        if (edge.read && edge.write) {
          _receivesend.set(other.id, list.get(other.id)!);
        } else if (edge.write) {
          _receive.set(other.id, list.get(other.id)!);
        } else {
          _send.set(other.id, list.get(other.id)!);
        }
      }
    }

    setHosts(_hosts);
    setRead(Array.from(_read.values()));
    setWrite(Array.from(_write.values()));
    setReadWrite(Array.from(_readwrite.values()));
    setReceive(Array.from(_receive.values()));
    setSend(Array.from(_send.values()));
    setReceiveSend(Array.from(_receivesend.values()));
  }, [comp]);

  useEffect(() => {
    if (!gref || !comp) {
      return;
    }

    setTimeout(() => {
      gref.recenter();
      gref.unsetHighlight();
      gref.setHighlight(comp!.id);
    }, 500);
  }, [comp]);

  if (!comp) {
    return <div>not found</div>;
  }

  return (
    <>
      <Container.Left>
        <Card padded>
          <Typography.Title level={2}>
            {Icon && (
              <div className={cls.icon}>
                <Icon size="1em" />
              </div>
            )}
            {comp.name}
          </Typography.Title>
          {!edit.isEnabled() && desc && <ContentDoc doc={desc} />}
          {!desc?.content.length && !edit.isEnabled() && (
            <Typography.Text type="secondary">
              Write something...
            </Typography.Text>
          )}
          {edit.isEnabled() && (
            <Typography>
              <EditorMini
                key={comp.name}
                curr={curr!}
                field="description"
                originalContent={comp.description}
              />
            </Typography>
          )}

          {(comp.tech || hosts.length > 0 || inComp || contains.length > 0) && (
            <div className={cls.block}>
              <Typography.Title level={5}>Stack</Typography.Title>
              {comp.tech && (
                <Line title="Build with" techs={comp.tech} params={params} />
              )}

              {hosts.length > 0 && (
                <Line title="Hosted on" comps={hosts} params={params} />
              )}

              {contains.length > 0 && (
                <Line title="Contains" comps={contains} params={params} />
              )}

              {inComp && (
                <Line title="Run inside" comps={[inComp]} params={params} />
              )}
            </div>
          )}

          {(readwrite.length > 0 ||
            read.length > 0 ||
            write.length > 0 ||
            receive.length > 0 ||
            send.length > 0 ||
            receiveSend.length > 0) && (
            <div className={cls.block}>
              <Typography.Title level={5}>Data</Typography.Title>

              {readwrite.length > 0 && (
                <Line
                  title="Read and Write to"
                  comps={readwrite}
                  params={params}
                />
              )}

              {read.length > 0 && (
                <Line title="Read from" comps={read} params={params} />
              )}

              {receiveSend.length > 0 && (
                <Line
                  title="Receive and Send to"
                  comps={receiveSend}
                  params={params}
                />
              )}
              {receive.length > 0 && (
                <Line title="Receive from" comps={receive} params={params} />
              )}
              {send.length > 0 && (
                <Line title="Send to" comps={send} params={params} />
              )}

              {write.length > 0 && (
                <Line title="Write to" comps={write} params={params} />
              )}
            </div>
          )}
        </Card>
        <Card padded>
          <ListRFCs project={proj}></ListRFCs>
        </Card>
      </Container.Left>
      <Container.Right>
        <Card>
          <Graph components={comps} readonly={true} />
        </Card>
      </Container.Right>
    </>
  );
};
