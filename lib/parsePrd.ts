import type { TaskDraft } from './types';

export const MAX_TASKS = 20;
export const MAX_PRD_CHARS = 100_000;

const TITLE_ONLY_HEADINGS = new Set([
  'overview',
  'introduction',
  'background',
  'goals',
  'non-goals',
  'audience',
  'problem',
  'summary',
  'requirements',
  'acceptance criteria',
  'risks',
  'success metrics',
]);

function cleanMarkdown(value: string): string {
  return value
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*|__|\*|_|~~/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function makeTask(text: string, index: number): TaskDraft {
  const title = text.length > 88 ? `${text.slice(0, 85).trimEnd()}…` : text;
  return { id: `task-${index + 1}`, title, description: text };
}

export interface ParseResult {
  tasks: TaskDraft[];
  truncated: boolean;
}

/** Extract task-like Markdown list items locally; no source text leaves the browser here. */
export function parsePrd(markdown: string): ParseResult {
  const candidates: string[] = [];
  const lines = markdown.slice(0, MAX_PRD_CHARS).split(/\r?\n/);
  let foundListItems = false;

  for (const line of lines) {
    const bullet = line.match(/^\s{0,8}(?:[-*+]\s+|\d+[.)]\s+)(?:\[[ xX]\]\s*)?(.+?)\s*$/);
    if (bullet) {
      foundListItems = true;
      const value = cleanMarkdown(bullet[1]);
      if (value.length >= 4 && !/^[-—–]+$/.test(value)) candidates.push(value);
    }
  }

  // A heading-only PRD is still usable: turn non-generic section headings into tasks.
  if (!foundListItems) {
    for (const line of lines) {
      const heading = line.match(/^\s{0,3}#{2,6}\s+(.+?)\s*#*\s*$/);
      if (!heading) continue;
      const value = cleanMarkdown(heading[1]);
      if (value.length >= 4 && !TITLE_ONLY_HEADINGS.has(value.toLowerCase())) candidates.push(value);
    }
  }

  const unique = Array.from(new Set(candidates));
  return {
    tasks: unique.slice(0, MAX_TASKS).map(makeTask),
    truncated: unique.length > MAX_TASKS,
  };
}
