import { marked } from 'marked';

// Configure marked with GitHub flavored markdown and clean line breaks
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Custom renderer to enhance code blocks, tables, and external links
const renderer = new marked.Renderer();

renderer.code = function (this: any, token: any): string {
  const text = token.text || '';
  const language = (token.lang || 'code').trim();
  const safeCode = escapeHtml(text);
  const codeId = `code_${Math.random().toString(36).substring(2, 9)}`;

  return `
    <div class="my-4 rounded-xl border border-neutral-700/60 bg-neutral-900/90 overflow-hidden shadow-sm">
      <div class="flex items-center justify-between px-4 py-2 border-b border-neutral-800 bg-neutral-950/60 text-xs font-mono text-neutral-400">
        <span class="font-semibold text-neutral-300 uppercase tracking-wider">${escapeHtml(language)}</span>
        <button 
          type="button" 
          class="copy-code-btn inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-sans text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 active:scale-95 transition-all cursor-pointer"
          data-code="${escapeAttribute(text)}"
        >
          <svg class="copy-icon w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
          <span class="copy-label">Copy Code</span>
        </button>
      </div>
      <div class="p-4 overflow-x-auto text-sm leading-relaxed text-neutral-100 font-mono scrollbar-thin">
        <pre><code id="${codeId}" class="language-${escapeHtml(language)}">${safeCode}</code></pre>
      </div>
    </div>
  `;
};

renderer.table = function (this: any, token: any): string {
  const headerCells = (token.header || []).map((cell: any) => {
    const content = cell.tokens && this.parser ? this.parser.parseInline(cell.tokens) : escapeHtml(cell.text || '');
    return `<th class="px-3.5 py-2.5 font-semibold text-neutral-200 border-b border-neutral-700/60">${content}</th>`;
  }).join('');

  const rowCells = (token.rows || []).map((row: any[]) => {
    const cells = row.map((cell: any) => {
      const content = cell.tokens && this.parser ? this.parser.parseInline(cell.tokens) : escapeHtml(cell.text || '');
      return `<td class="px-3.5 py-2.5 text-neutral-300">${content}</td>`;
    }).join('');
    return `<tr class="hover:bg-neutral-800/30 transition-colors">${cells}</tr>`;
  }).join('');

  return `
    <div class="my-4 overflow-x-auto rounded-xl border border-neutral-700/60 bg-neutral-900/40">
      <table class="w-full text-left border-collapse text-sm">
        <thead class="bg-neutral-800/70 border-b border-neutral-700/60">
          <tr>${headerCells}</tr>
        </thead>
        <tbody class="divide-y divide-neutral-800/80">
          ${rowCells}
        </tbody>
      </table>
    </div>
  `;
};

renderer.link = function (this: any, token: any): string {
  const href = token.href || '#';
  const titleAttr = token.title ? ` title="${escapeAttribute(token.title)}"` : '';
  const text = token.tokens && this.parser ? this.parser.parseInline(token.tokens) : (token.text || href);
  return `<a href="${escapeAttribute(href)}"${titleAttr} target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors">${text}</a>`;
};

marked.use({ renderer });

export function renderMarkdown(content: string): string {
  if (!content) return '';
  try {
    return marked.parse(content) as string;
  } catch (err) {
    console.error('Markdown rendering error:', err);
    return escapeHtml(content);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
