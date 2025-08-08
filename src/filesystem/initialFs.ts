import type { FileNode, FileOrFolder, FileSystemTree } from './types.ts';

const txt = (name: string, content: string): FileNode => ({ type: 'file', name, content, meta: { kind: 'text', source: 'static' } });
const link = (name: string, url: string): FileNode => ({ type: 'file', name, meta: { kind: 'link', src: url, source: 'static' } });

export const initialFileSystem = (ownerName: string): FileSystemTree => ({
  type: 'folder',
  name: '/',
  children: [
    {
      type: 'folder',
      name: 'about',
      children: [
        txt('README.txt', [
          `${ownerName}`,
          'Software Engineer — building reliable web apps, delightful UIs, and scalable systems.',
          '',
          'Type `cd about` then `ls` and `open resume.txt` to view a short resume.',
        ].join('\n')),
        txt('resume.txt', [
          'Role: Full-stack Developer',
          'Languages: TypeScript, Go, Python',
          'Frameworks: React, Node, Next.js, Express',
          'Cloud: AWS, Docker, CI/CD',
          '',
          'Strengths: DX focus, testing, accessibility, performance, observability',
        ].join('\n')),
      ],
    },
    {
      type: 'folder',
      name: 'contact',
      children: [
        txt('README.txt', [
          'Email: logan@yourdomain.example',
          'LinkedIn: https://www.linkedin.com/in/logancarlson',
          'GitHub: https://github.com/<your-github-username>',
          '',
          'Use `set github <username>` to enable `sync projects`. Then run `sync projects`.',
        ].join('\n')),
        link('email.eml', 'mailto:logan@yourdomain.example'),
        link('linkedin.url', 'https://www.linkedin.com/in/logancarlson'),
        link('github.url', 'https://github.com'),
      ],
    },
    {
      type: 'folder',
      name: 'gallery',
      children: [
        txt('README.txt', 'Sample gallery of images and videos.'),
        { type: 'file', name: 'headshot.jpg', meta: { kind: 'image', src: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=1200&q=80', source: 'static' } },
        { type: 'file', name: 'demo.mp4', meta: { kind: 'video', src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', source: 'static' } },
        { type: 'file', name: 'unsplash-1.jpg', meta: { kind: 'image', src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80', source: 'static' } },
        { type: 'file', name: 'unsplash-2.jpg', meta: { kind: 'image', src: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80', source: 'static' } },
        { type: 'file', name: 'unsplash-3.jpg', meta: { kind: 'image', src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80', source: 'static' } },
        { type: 'file', name: 'unsplash-4.jpg', meta: { kind: 'image', src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', source: 'static' } },
      ],
    },
    {
      type: 'folder',
      name: 'projects',
      children: [
        txt('README.txt', 'Portfolio projects fetched from GitHub will appear here as files. Run `sync projects`.') as FileNode,
      ],
    },
  ] as FileOrFolder[],
});

