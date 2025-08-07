export type Path = string[]; // e.g., ['/', 'about'] or ['/', 'projects', 'foo.txt']

export type FileMeta = {
  kind: 'text' | 'image' | 'video' | 'link';
  src?: string;
  source?: 'static' | 'github';
};

export type FileNode = {
  type: 'file';
  name: string;
  content?: string;
  meta?: FileMeta;
};

export type FolderNode = {
  type: 'folder';
  name: string;
  children: FileOrFolder[];
};

export type FileOrFolder = FileNode | FolderNode;

export type FileSystemTree = FolderNode; // root folder

