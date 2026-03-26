export function capitalize(str) {
  if (!str) return '';
  return str[0].toUpperCase() + str.slice(1);
}

export function camelCase(str) {
  return str
    .split(/[-_\s]+/)
    .map((word, i) => i === 0 ? word.toLowerCase() : capitalize(word))
    .join('');
}

export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function truncate(str, maxLen) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}
