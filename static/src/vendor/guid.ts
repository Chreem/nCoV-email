const cache = {};

export default function guid(s?: string): string {
  if (s && cache[s]) return cache[s];
  const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  if (s) cache[s] = id;
  return id;
}