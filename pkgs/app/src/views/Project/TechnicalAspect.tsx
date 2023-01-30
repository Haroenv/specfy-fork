import type { ApiComponent } from 'api/src/types/api/components';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import cls from './index.module.scss';

export const TechnicalAspects: React.FC<{
  components: ApiComponent[];
  orgId: string;
  slug: string;
}> = ({ components, orgId, slug }) => {
  const [hosts, setHosts] = useState<ApiComponent[]>([]);
  const [techs, setTechs] = useState<Array<[string, string]>>([]);

  useEffect(() => {
    const _techs = new Map<string, string>();
    const _hosts = [];

    for (const comp of components) {
      if (comp.type === 'hosting') {
        _hosts.push(comp);
      }
      if (comp.tech) {
        for (const t of comp.tech) {
          _techs.set(t, t.toLocaleLowerCase());
        }
      }
    }

    setTechs(Array.from(_techs.entries()));
    setHosts(_hosts);
  }, [components]);

  return (
    <>
      <div className={cls.line}>
        <div>Stack</div>
        <div>
          {hosts.map((comp) => {
            return (
              <span key={comp.id} className={cls.comp}>
                <Link to={`/org/${orgId}/${slug}/c/${comp.slug}`}>
                  {comp.name}
                </Link>
              </span>
            );
          })}
          {techs.map((tech) => {
            return (
              <span key={tech[1]} className={cls.comp}>
                <Link to={`/org/${orgId}/t/${tech[1]}`}>{tech[0]}</Link>
              </span>
            );
          })}
        </div>
      </div>
      <div className={cls.line}>
        <div>Components</div>
        <div>
          {components.map((comp) => {
            if (comp.type !== 'component') {
              return null;
            }
            return (
              <span key={comp.id} className={cls.comp}>
                <Link key={comp.id} to={`/org/${orgId}/${slug}/c/${comp.slug}`}>
                  {comp.name}
                </Link>
              </span>
            );
          })}
        </div>
      </div>
      <div className={cls.line}>
        <div>Third Parties</div>
        <div>
          {components.map((comp) => {
            if (comp.type !== 'thirdparty') {
              return null;
            }
            return (
              <span key={comp.id} className={cls.comp}>
                <Link key={comp.id} to={`/org/${orgId}/${slug}/c/${comp.slug}`}>
                  {comp.name}
                </Link>
              </span>
            );
          })}
        </div>
      </div>
      <div className={cls.line}>
        <div>Link to Project</div>
        <div>
          {components.map((comp) => {
            if (comp.type !== 'project') return null;
            return (
              <span key={comp.id} className={cls.comp}>
                <Link to={`/org/${orgId}/${slug}/c/${comp.slug}`}>
                  {comp.name}
                </Link>
              </span>
            );
          })}
        </div>
      </div>
    </>
  );
};
