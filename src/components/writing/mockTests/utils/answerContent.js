export const DRAFT_KEY = 'aptis-writing-draft';

export function getDraftKey(mockId) {
  return mockId ? `${DRAFT_KEY}:${mockId}` : DRAFT_KEY;
}

export const EMPTY_ANSWERS = {
  1: Array(5).fill(''),
  2: '',
  3: Array(3).fill(''),
  4: Array(2).fill('')
};

const ALLOWED_TAGS = new Set([
  'B',
  'BR',
  'DIV',
  'EM',
  'I',
  'P',
  'S',
  'STRIKE',
  'STRONG',
  'U'
]);

export function stripHtmlToText(html = '') {
  if (typeof document === 'undefined') {
    return String(html).replace(/<[^>]*>/g, ' ');
  }

  const div = document.createElement('div');
  div.innerHTML = html;
  return div.innerText || div.textContent || '';
}

export function countWords(text = '') {
  const matches = text.trim().match(/\S+/g);
  return matches ? matches.length : 0;
}

export function sanitizeRichTextHtml(html = '') {
  if (!html) {
    return '';
  }

  if (typeof document === 'undefined') {
    return html;
  }

  const source = document.createElement('div');
  const target = document.createElement('div');
  source.innerHTML = html;

  const sanitizeNode = (node, parent) => {
    if (node.nodeType === Node.TEXT_NODE) {
      parent.appendChild(document.createTextNode(node.textContent || ''));
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const tagName = node.nodeName.toUpperCase();

    if (!ALLOWED_TAGS.has(tagName)) {
      Array.from(node.childNodes).forEach((child) => sanitizeNode(child, parent));
      return;
    }

    const element = document.createElement(tagName.toLowerCase());
    Array.from(node.childNodes).forEach((child) => sanitizeNode(child, element));
    parent.appendChild(element);
  };

  Array.from(source.childNodes).forEach((child) => sanitizeNode(child, target));
  return target.innerHTML;
}
