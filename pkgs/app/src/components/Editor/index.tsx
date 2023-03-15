import { Blockquote } from '@tiptap/extension-blockquote';
import { Bold } from '@tiptap/extension-bold';
import { BulletList } from '@tiptap/extension-bullet-list';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Code } from '@tiptap/extension-code';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Heading } from '@tiptap/extension-heading';
import { History } from '@tiptap/extension-history';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Image } from '@tiptap/extension-image';
import { Italic } from '@tiptap/extension-italic';
import { Link } from '@tiptap/extension-link';
import { ListItem } from '@tiptap/extension-list-item';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import { TaskItem } from '@tiptap/extension-task-item';
import { TaskList } from '@tiptap/extension-task-list';
import { Text } from '@tiptap/extension-text';
import { useEditor, EditorContent } from '@tiptap/react';
import type { BlockLevelZero } from 'api/src/types/api';
import { lowlight } from 'lowlight/lib/core';
import { useEffect } from 'react';

import { BubbleMenu } from './BubbleMenu';
import { FloatingMenu } from './FloatingMenu';
import { Banner } from './extensions/Banner';
import { CustomFloatingMenu } from './extensions/CustomFloatingMenu';
import { Vote } from './extensions/Vote';
import { VoteItem } from './extensions/VoteItem';
import { removeEmptyContent } from './helpers';
import cls from './index.module.scss';

export const Editor: React.FC<{
  content: BlockLevelZero;
  minHeight?: string;
  limit?: number;
  onUpdate: (content: BlockLevelZero) => void;
}> = ({ content, limit, minHeight, onUpdate }) => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      HardBreak,
      Heading.configure({
        levels: [1, 2, 3, 4],
      }),
      BulletList,
      ListItem,
      Blockquote,
      CustomFloatingMenu,
      HorizontalRule,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
        lastColumnResizable: false,
        cellMinWidth: 50,
      }),
      TableCell,
      TableHeader,
      TableRow,
      Code.configure({
        HTMLAttributes: { spellcheck: 'false' },
      }),
      Link.configure({
        linkOnPaste: true,
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return `Title ${node.attrs.level}`;
          }

          return 'Write something …';
        },
      }),
      Image,
      VoteItem,
      Vote,
      Banner,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      History.configure({
        depth: 100,
      }),
      CharacterCount.configure({
        limit,
      }),
    ],
    onUpdate: (e) => {
      onUpdate(removeEmptyContent(e.editor.getJSON() as any));
    },
    content:
      content.content.length === 0
        ? {
            type: 'doc',
            content: [{ type: 'paragraph' }],
          }
        : content,
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    editor.commands.setContent(content);
  }, [content]);

  return (
    <div>
      {editor && <BubbleMenu editor={editor} />}
      {editor && <FloatingMenu editor={editor} />}
      <EditorContent
        editor={editor}
        className={cls.editor}
        style={{ minHeight }}
      />
    </div>
  );
};
