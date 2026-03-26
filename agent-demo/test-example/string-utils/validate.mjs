export function isEmail(str) {
  return str.includes('@');
}

export function isURL(str) {
  return str.startsWith('http://') || str.startsWith('https://');
}

export function isEmpty(str) {
  return str.length === 0;
}
