import { MessageAttachment } from '../types';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

const COMMON_TEXT_EXTENSIONS = new Set([
  'txt', 'md', 'markdown', 'csv', 'tsv', 'json', 'js', 'jsx', 'ts', 'tsx',
  'py', 'html', 'css', 'scss', 'sql', 'sh', 'bash', 'yaml', 'yml', 'xml',
  'env', 'log', 'c', 'cpp', 'h', 'hpp', 'rs', 'go', 'java', 'kt', 'php', 'rb',
  'r', 'swift', 'dart', 'vue', 'svelte', 'prisma', 'graphql', 'ini', 'toml',
  'conf', 'cfg', 'properties', 'rst', 'tex', 'bat', 'cmd', 'ps1', 'diff', 'patch'
]);

export async function parseUploadedFile(file: File): Promise<MessageAttachment> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File "${file.name}" is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 15MB.`);
  }

  const extension = (file.name.split('.').pop() || '').toLowerCase();
  const rawMime = file.type || '';

  const attachment: MessageAttachment = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    name: file.name,
    size: file.size,
    mimeType: rawMime || 'application/octet-stream',
  };

  // Case 1: PDF Document
  if (extension === 'pdf' || rawMime === 'application/pdf') {
    const base64Data = await readAsBase64(file);
    attachment.mimeType = 'application/pdf';
    attachment.base64Data = base64Data;
    return attachment;
  }

  // Case 2: Images (PNG, JPG, WEBP, GIF, SVG, etc.)
  if (rawMime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(extension)) {
    const base64Data = await readAsBase64(file);
    attachment.mimeType = rawMime || `image/${extension === 'jpg' ? 'jpeg' : extension}`;
    attachment.base64Data = base64Data;
    attachment.previewUrl = URL.createObjectURL(file);
    return attachment;
  }

  // Case 3: Known Text/Code format
  if (
    rawMime.startsWith('text/') ||
    rawMime === 'application/json' ||
    rawMime === 'application/javascript' ||
    rawMime === 'application/xml' ||
    rawMime === 'application/x-yaml' ||
    COMMON_TEXT_EXTENSIONS.has(extension)
  ) {
    const textContent = await readAsText(file);
    attachment.textContent = textContent;
    return attachment;
  }

  // Case 4: Universal Fallback for any text-like or unstructured file
  try {
    const textContent = await readAsText(file);
    // If the content is readable text (no null bytes / binary markers)
    if (!textContent.includes('\0')) {
      attachment.textContent = textContent;
      return attachment;
    }
  } catch (err) {
    // Binary read failed
  }

  // If binary file cannot be processed as text or PDF
  throw new Error(
    `Cannot extract readable text from "${file.name}". Supported formats include PDF, images (.png, .jpg, .webp), and text/code documents (.txt, .md, .csv, .json, source code).`
  );
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file as text.'));
    reader.readAsText(file);
  });
}

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read binary file.'));
    reader.readAsDataURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
