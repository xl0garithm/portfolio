import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './terminal.css';
import type { FileNode, FileOrFolder, FileSystemTree, Path } from '../filesystem/types.ts';
import { resolvePath, findNodeByPath, listChildrenAtPath, upOneLevel } from '../filesystem/utils.ts';
import { initialFileSystem } from '../filesystem/initialFs.ts';
import { FileViewer } from './FileViewer.tsx';
import { searchPortfolioRepos, listUserPublicRepos } from '../services/github.ts';
import MatrixRain from './MatrixRain.tsx';

type TerminalProps = {
  ownerName: string;
  onSwitchMode?: (mode: 'terminal' | 'website') => void;
};

type OutputLine = {
  id: string;
  text: string;
  type?: 'info' | 'error' | 'success';
};

type ViewerContent = {
  kind: 'image' | 'video' | 'text' | 'link';
  title: string;
  src?: string;
  text?: string;
};

const LS_FS_KEY = 'portfolio.fs.v4';
const LS_GH_KEY = 'portfolio.github.username.v1';
const DEFAULT_PROMPT_USER = 'guest';

export const Terminal: React.FC<TerminalProps> = ({ ownerName, onSwitchMode }) => {
  const [fileSystem, setFileSystem] = useState<FileSystemTree>(() => {
    const raw = localStorage.getItem(LS_FS_KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as FileSystemTree;
      } catch {}
    }
    return initialFileSystem(ownerName);
  });

  const [cwd, setCwd] = useState<Path>(['/']);
  const [output, setOutput] = useState<OutputLine[]>(() => [
    { id: crypto.randomUUID(), text: `Welcome, ${DEFAULT_PROMPT_USER}. Type 'help' to get started.`, type: 'info' },
  ]);
  const [input, setInput] = useState('');
  const [viewer, setViewer] = useState<ViewerContent | null>(null);
  const [isMatrixMode, setIsMatrixMode] = useState(false);
  const [promptUser, setPromptUser] = useState<string>(() => localStorage.getItem(LS_GH_KEY) ? `${localStorage.getItem(LS_GH_KEY)}` : DEFAULT_PROMPT_USER);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const prompt = useMemo(() => `${promptUser}@portfolio:${cwd.join('/')}$`, [promptUser, cwd]);

  useEffect(() => {
    localStorage.setItem(LS_FS_KEY, JSON.stringify(fileSystem));
  }, [fileSystem]);

  useEffect(() => {
    const onFocus = () => inputRef.current?.focus();
    window.addEventListener('click', onFocus);
    return () => window.removeEventListener('click', onFocus);
  }, []);

  const appendOutput = useCallback((text: string, type: OutputLine['type'] = 'info') => {
    setOutput(prev => [...prev, { id: crypto.randomUUID(), text, type }]);
  }, []);

  useEffect(() => {
    if (!isMatrixMode) return;
    const stop = (e: KeyboardEvent) => {
      e.preventDefault();
      setIsMatrixMode(false);
      appendOutput('Matrix rain stopped.');
      window.removeEventListener('keydown', stop);
    };
    window.addEventListener('keydown', stop);
    return () => window.removeEventListener('keydown', stop);
  }, [isMatrixMode, appendOutput]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [output]);

  

  const setGithubUsername = useCallback((username: string) => {
    localStorage.setItem(LS_GH_KEY, username);
    setPromptUser(username || DEFAULT_PROMPT_USER);
  }, []);

  const handleOpenFile = useCallback((node: FileNode) => {
    if (node.meta?.kind === 'image' && node.meta.src) {
      setViewer({ kind: 'image', title: node.name, src: node.meta.src });
      return;
    }
    if (node.meta?.kind === 'video' && node.meta.src) {
      setViewer({ kind: 'video', title: node.name, src: node.meta.src });
      return;
    }
    if (node.meta?.kind === 'link' && node.meta.src) {
      setViewer({ kind: 'link', title: node.name, src: node.meta.src });
      return;
    }
    setViewer({ kind: 'text', title: node.name, text: node.content ?? '' });
  }, []);

  const runCommand = useCallback(async (raw: string) => {
    const line = raw.trim();
    if (line.length === 0) return;
    appendOutput(`${prompt} ${line}`);

    const [command, ...args] = line.split(/\s+/);

    const iconFor = (node: FileOrFolder): string => {
      if (node.type === 'folder') return '📁';
      const kind = node.type === 'file' ? node.meta?.kind : undefined;
      switch (kind) {
        case 'text': return '📄';
        case 'image': return '🖼️';
        case 'video': return '🎞️';
        case 'link': return '🔗';
        default: return '📄';
      }
    };

    try {
      switch (command) {
        case 'help': {
          appendOutput([
            'Available commands:',
            "- ls: list directory",
            "- cd <dir|..|/>: change directory",
            "- tree: show directory tree",
            "- cat <file>: print file contents",
            "- open <file>: open file in viewer",
            "- projects: list cached GitHub portfolio projects",
            "- sync projects: fetch GitHub projects (requires 'set github <username>')",
            "- set github <username>: set and persist GitHub username",
            "- whoami: print owner",
            "- contact: quick contact info",
            "- clear: clear the terminal",
            "- matrix: start matrix rain (press any key to stop)",
            "- switch: toggle website/terminal modes",
          ].join('\n'));
          break;
        }
        case 'clear':
          setOutput([]);
          break;
        case 'whoami':
          appendOutput(ownerName);
          break;
        case 'contact': {
          const node = findNodeByPath(fileSystem, ['/','contact','README.txt']);
          if (node && node.type === 'file') {
            appendOutput(node.content ?? '');
          } else {
            appendOutput('Contact information not found.', 'error');
          }
          break;
        }
        case 'ls': {
          const children = listChildrenAtPath(fileSystem, cwd);
          if (!children) { appendOutput('Not found', 'error'); break; }
          const names = children.map((n: FileOrFolder) => {
            const suffix = n.type === 'folder' ? '/' : '';
            return `${iconFor(n)} ${n.name}${suffix}`;
          });
          appendOutput(names.join('  '));
          break;
        }
        case 'tree': {
          const renderTree = (nodes: FileOrFolder[], depth: number): string => {
            return nodes.map((n: FileOrFolder) => {
              const prefix = '  '.repeat(depth) + (depth > 0 ? '└─ ' : '');
              if (n.type === 'folder') {
                return [
                  `${prefix}${iconFor(n)} ${n.name}/`,
                  renderTree(n.children, depth + 1),
                ].join('\n');
              }
              return `${prefix}${iconFor(n)} ${n.name}`;
            }).join('\n');
          };
          const children = listChildrenAtPath(fileSystem, cwd) || [];
          appendOutput(renderTree(children, 0));
          break;
        }
        case 'cd': {
          const target = args[0];
          if (!target) { appendOutput('Usage: cd <dir|..|/>', 'error'); break; }
          if (target === '/') { setCwd(['/']); break; }
          if (target === '..') { setCwd(prev => upOneLevel(prev)); break; }
          const newPath = resolvePath(cwd, target);
          const node = findNodeByPath(fileSystem, newPath);
          if (!node || node.type !== 'folder') { appendOutput('Directory not found', 'error'); break; }
          setCwd(newPath);
          break;
        }
        case 'cat': {
          const name = args.join(' ');
          if (!name) { appendOutput('Usage: cat <file>', 'error'); break; }
          const path = resolvePath(cwd, name);
          const node = findNodeByPath(fileSystem, path);
          if (!node || node.type !== 'file') { appendOutput('File not found', 'error'); break; }
          if (node.meta && node.meta.kind !== 'text') {
            appendOutput('Binary file. Use: open <file>');
          } else {
            appendOutput(node.content ?? '');
          }
          break;
        }
        case 'open': {
          const name = args.join(' ');
          if (!name) { appendOutput('Usage: open <file>', 'error'); break; }
          const path = resolvePath(cwd, name);
          const node = findNodeByPath(fileSystem, path);
          if (!node || node.type !== 'file') { appendOutput('File not found', 'error'); break; }
          handleOpenFile(node);
          break;
        }
        case 'projects': {
          const projectsFolder = findNodeByPath(fileSystem, ['/','projects']);
          if (!projectsFolder || projectsFolder.type !== 'folder') { appendOutput('No projects folder', 'error'); break; }
          const files = projectsFolder.children.filter((c: FileOrFolder) => c.type === 'file');
          if (files.length === 0) {
            appendOutput('No cached projects. Run: sync projects');
          } else {
            appendOutput(files.map((f: FileOrFolder) => f.name).join('\n'));
          }
          break;
        }
        case 'sync': {
          if (args[0] !== 'projects') { appendOutput('Usage: sync projects', 'error'); break; }
          const username = localStorage.getItem(LS_GH_KEY) || '';
          if (!username) { appendOutput("Set GitHub username first: set github <username>", 'error'); break; }
          appendOutput(`Fetching public repos with topic 'portfolio' for ${username} ...`);
          const repos = await searchPortfolioRepos(username);
          if (!repos) { appendOutput('Failed to fetch from GitHub', 'error'); break; }
          const allRepos = await listUserPublicRepos(username);
          if (allRepos) {
            const lines = allRepos.map(r => `- ${r.name} ${r.archived ? '(archived) ' : ''}${r.fork ? '(fork) ' : ''}-> ${r.html_url}`);
            appendOutput(['All public repos found:', ...lines].join('\n'));
          }
          setFileSystem(prev => {
            const next = structuredClone(prev) as FileSystemTree;
            const folder = findNodeByPath(next, ['/','projects']);
            if (!folder || folder.type !== 'folder') return prev;
            // Replace children with static + fetched files
            const staticChildren = folder.children.filter((c: FileOrFolder) => c.type !== 'file' || !c.meta?.source || c.meta.source !== 'github');
            const fetched: FileNode[] = repos.map((r) => ({
              type: 'file',
              name: r.name,
              content: [
                `Name: ${r.name}`,
                r.description ? `Description: ${r.description}` : undefined,
                `Language: ${r.language ?? 'n/a'}`,
                `Stars: ${r.stargazers_count}`,
                `Updated: ${new Date(r.updated_at).toLocaleString()}`,
                `URL: ${r.html_url}`,
                r.homepage ? `Homepage: ${r.homepage}` : undefined,
              ].filter(Boolean).join('\n'),
              meta: { kind: 'text', source: 'github' },
            }));
            folder.children = [...staticChildren, ...fetched].sort((a: FileOrFolder, b: FileOrFolder) => a.name.localeCompare(b.name));
            return next;
          });
          appendOutput(`Fetched ${repos.length} project(s).`, 'success');
          break;
        }
        case 'switch': {
          onSwitchMode?.('website');
          break;
        }
        case 'matrix': {
          setIsMatrixMode(true);
          appendOutput('Matrix rain started. Press any key to stop.');
          break;
        }
        case 'set': {
          const key = args[0];
          if (key === 'github') {
            const username = args[1] || '';
            setGithubUsername(username);
            appendOutput(`GitHub username set to '${username || DEFAULT_PROMPT_USER}'.`);
          } else {
            appendOutput('Usage: set github <username>', 'error');
          }
          break;
        }
        default:
          appendOutput(`Command not found: ${command}`, 'error');
      }
    } catch (err) {
      appendOutput(`Error: ${(err as Error).message}`, 'error');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appendOutput, cwd, fileSystem, handleOpenFile, ownerName, prompt]);

  const onSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const value = input;
    setInput('');
    void runCommand(value);
  }, [input, runCommand]);

  const cwdDisplay = useMemo(() => cwd.join('/').replace('//','/'), [cwd]);

  return (
    <div className="terminal-container">
      <div className="terminal-window">
        <div className="terminal-header">
          <div className="term-dots"><span/><span/><span/></div>
          <div className="term-title">{ownerName} — Matrix Terminal</div>
          <button className="term-switch-btn" onClick={() => onSwitchMode?.('website')} aria-label="Switch to website">Site ↗</button>
        </div>
        <div className="terminal-body" ref={scrollRef}>
          <div className="terminal-line muted">Current path: {cwdDisplay}</div>
          {output.map(line => (
            <div key={line.id} className={`terminal-line ${line.type ?? ''}`}>{line.text}</div>
          ))}
          <form className="terminal-input-row" onSubmit={onSubmit} autoComplete="off">
            <span className="prompt">{prompt}</span>
            <input
              ref={inputRef}
              className="terminal-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              aria-label="terminal-input"
            />
          </form>
        </div>
      </div>

      {viewer && (
        <FileViewer
          content={viewer}
          onClose={() => setViewer(null)}
        />
      )}

      {isMatrixMode && (
        <div className="matrix-overlay" aria-label="Matrix rain (press any key to close)">
          <MatrixRain className="matrix-canvas" />
        </div>
      )}
    </div>
  );
};

export default Terminal;

