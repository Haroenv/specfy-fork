import type { FieldsErrors } from '@specfy/core';
import type { ApiProject } from '@specfy/models';
import { useEffect, useState } from 'react';

import { Flex } from '../../Flex';
import { Checkbox } from '../../Form/Checkbox';
import { Field, FieldCheckbox } from '../../Form/Field';
import { Input } from '../../Form/Input';

import cls from './index.module.scss';

export const SyncConfiguration: React.FC<{
  errors: FieldsErrors;
  config?: ApiProject['config'];
  onChange: (config: ApiProject['config']) => void;
}> = ({ errors, config, onChange }) => {
  const [branch, setBranch] = useState(config?.branch || 'main');
  const [stackEnabled, setStackEnabled] = useState<boolean>(
    typeof config?.stack?.enabled === 'boolean' ? config!.stack.enabled : true
  );
  const [stackPath, setStackpath] = useState(config?.stack?.path || '/');
  const [docEnabled, setDocEnabled] = useState<boolean>(
    typeof config?.documentation?.enabled === 'boolean'
      ? config!.documentation.enabled
      : true
  );
  const [docPath, setDocPath] = useState(
    config?.documentation?.path || '/docs'
  );

  useEffect(() => {
    onChange({
      branch,
      documentation: {
        enabled: docEnabled,
        path: docPath,
      },
      stack: {
        enabled: stackEnabled,
        path: stackPath,
      },
    });
  }, [branch, stackEnabled, stackPath, docEnabled, docPath]);

  return (
    <Flex className={cls.inner} column gap="2xl" align="flex-start" grow>
      <Flex align="flex-start" gap="xl" grow>
        <Flex column align="flex-start">
          <strong>Branch</strong>
          <p className={cls.desc}>Deploy when pushing to this branch</p>
        </Flex>
        <Flex column align="flex-start" gap="l" grow className={cls.inputs}>
          <Field name="branch" error={errors.branch?.message}>
            <Input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
            />
          </Field>
        </Flex>
      </Flex>

      <Flex align="flex-start" gap="xl" grow>
        <Flex column align="flex-start">
          <strong>Stack</strong>
          <p className={cls.desc}>
            Automatically analyze and upload your stack
          </p>
        </Flex>
        <Flex column align="flex-start" gap="l" grow className={cls.inputs}>
          <Flex gap="l">
            <FieldCheckbox name="checkStackEnabled" label="Enabled">
              <Checkbox
                checked={stackEnabled}
                onCheckedChange={() => setStackEnabled(!stackEnabled)}
              />
            </FieldCheckbox>
          </Flex>

          <Field
            name="stackPath"
            label="Path"
            error={errors.stackPath?.message}
          >
            <Input
              type="text"
              value={stackPath}
              onChange={(e) => setStackpath(e.target.value)}
              disabled={!stackEnabled}
              placeholder="Path to analyze, e.g: '/'"
            />
          </Field>
        </Flex>
      </Flex>

      <Flex align="flex-start" gap="xl" grow>
        <Flex column align="flex-start">
          <strong>Documentation</strong>
          <p className={cls.desc}>Upload your markdown files</p>
        </Flex>
        <Flex column align="flex-start" gap="l" grow className={cls.inputs}>
          <FieldCheckbox name="checkDocEnabled" label="Enabled">
            <Checkbox
              checked={docEnabled}
              onCheckedChange={() => setDocEnabled(!docEnabled)}
            />
          </FieldCheckbox>
          <Field name="docPath" label="Path" error={errors.docPath?.message}>
            <Input
              type="text"
              value={docPath}
              onChange={(e) => setDocPath(e.target.value)}
              disabled={!docEnabled}
              placeholder="Path to analyze, e.g: '/'"
            />
          </Field>
        </Flex>
      </Flex>
    </Flex>
  );
};
