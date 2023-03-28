import slugifyOrigin from 'slugify';
import stringHash from 'string-hash';

export const slugify = (str: string) =>
  slugifyOrigin(str, { lower: true, trim: true, strict: true });

export function acronymize(name: string): string {
  const clean = name
    // remove all tag-like sequences: [Shared][Prod]
    .replace(/\[[^\]]*\]/g, '')
    // remove noisy chars with spaces
    .replace(/[/._&:-]/g, ' ')
    // remove ad-hoc key words
    .replace(/(https?|www|test|dev|(pre)?prod(uction| |$)|demo|poc|wip)/gi, '');

  const firstLetters = clean.match(/\b(\w)/g)?.join('');
  if (firstLetters && firstLetters.length > 1) {
    return firstLetters!.slice(0, 2).toUpperCase();
  }

  // Rollback to something generic if nothing is left
  return name
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 2)
    .toUpperCase();
}

// https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
export function stringToColorRandom(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  return `hsl(${hash % 250}, 85%, 80%)`;
}

const paletteBg = [
  '#fca5a5',
  '#fdba74',
  '#fde047',
  '#bef264',
  '#86efac',
  '#6ee7b7',
  '#5eead4',
  '#67e8f9',
  '#7dd3fc',
  '#93c5fd',
  '#a5b4fc',
  '#d8b4fe',
  '#f0abfc',
  '#f9a8d4',
  '#fda4af',
];
const paletteColor = [
  '#dc2626',
  '#ea580c',
  '#ca8a04',
  '#65a30d',
  '#16a34a',
  '#059669',
  '#0d9488',
  '#0891b2',
  '#0284c7',
  '#2563eb',
  '#4f46e5',
  '#9333ea',
  '#c026d3',
  '#db2777',
  '#e11d48',
];
export function stringToColor(str: string): {
  backgroundColor: string;
  color: string;
} {
  const hashedText = stringHash(str);
  const colorIndex = hashedText % paletteColor.length;

  return {
    backgroundColor: paletteBg[colorIndex],
    color: paletteColor[colorIndex],
  };
}
