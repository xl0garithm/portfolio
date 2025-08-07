import type { FileOrFolder, FileSystemTree, FolderNode, Path } from './types.ts';

export const resolvePath = (cwd: Path, target: string): Path => {
  if (target.startsWith('/')) {
    return ['/', ...target.split('/').filter(Boolean)];
  }
  const parts = [...cwd];
  const tokens = target.split('/').filter(Boolean);
  for (const tok of tokens) {
    if (tok === '.') continue;
    if (tok === '..') {
      if (parts.length > 1) parts.pop();
      continue;
    }
    parts.push(tok);
  }
  return parts;
};

export const upOneLevel = (cwd: Path): Path => {
  if (cwd.length <= 1) return cwd;
  return cwd.slice(0, -1);
};

const pathEquals = (a: Path, b: Path) => a.join('\u0000') === b.join('\u0000');

export const findNodeByPath = (root: FileSystemTree, path: Path): FileOrFolder | undefined => {
  const normalized = path[0] === '/' ? path : ['/', ...path];
  if (normalized.length === 1) return root;
  let cursor: FileOrFolder = root;
  for (let i = 1; i < normalized.length; i += 1) {
    if (cursor.type !== 'folder') return undefined;
    const nextName = normalized[i];
    const nextChild: FileOrFolder | undefined = cursor.children.find((c: FileOrFolder) => c.name === nextName);
    if (!nextChild) return undefined;
    cursor = nextChild;
  }
  return cursor;
};

export const listChildrenAtPath = (root: FileSystemTree, path: Path): FileOrFolder[] | undefined => {
  const node = findNodeByPath(root, path);
  if (!node || node.type !== 'folder') return undefined;
  return node.children;
};

export const replaceNodeAtPath = (root: FileSystemTree, path: Path, replacement: FileOrFolder): FileSystemTree => {
  const normalized = path[0] === '/' ? path : ['/', ...path];
  if (pathEquals(normalized, ['/'])) return replacement as FileSystemTree;
  const clonedRoot: FileSystemTree = JSON.parse(JSON.stringify(root)) as FileSystemTree;
  let cursor: FolderNode = clonedRoot;
  for (let i = 1; i < normalized.length - 1; i += 1) {
    const segment = normalized[i];
    const child = cursor.children.find(c => c.name === segment);
    if (!child || child.type !== 'folder') throw new Error('Invalid path');
    cursor = child;
  }
  const leafName = normalized[normalized.length - 1];
  const idx = cursor.children.findIndex(c => c.name === leafName);
  if (idx === -1) cursor.children.push(replacement);
  else cursor.children[idx] = replacement;
  return clonedRoot;
};

