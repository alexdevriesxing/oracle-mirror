export const SYNODIC_MONTH = 29.53058867;
const KNOWN_NEW_MOON_UTC_MS = Date.UTC(2000, 0, 6, 18, 14, 0);
const DAY_MS = 86400000;

export const MOON_PHASES = [
  { slug:"new-moon", name:"New Moon", glyph:"🌑", min:0, max:1.84566 },
  { slug:"waxing-crescent", name:"Waxing Crescent", glyph:"🌒", min:1.84566, max:5.53699 },
  { slug:"first-quarter", name:"First Quarter", glyph:"🌓", min:5.53699, max:9.22831 },
  { slug:"waxing-gibbous", name:"Waxing Gibbous", glyph:"🌔", min:9.22831, max:12.91963 },
  { slug:"full-moon", name:"Full Moon", glyph:"🌕", min:12.91963, max:16.61096 },
  { slug:"waning-gibbous", name:"Waning Gibbous", glyph:"🌖", min:16.61096, max:20.30228 },
  { slug:"last-quarter", name:"Last Quarter", glyph:"🌗", min:20.30228, max:23.99361 },
  { slug:"waning-crescent", name:"Waning Crescent", glyph:"🌘", min:23.99361, max:SYNODIC_MONTH },
];

function validDateParts(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return { year, month, day, date };
}

export function moonAgeForDate(value) {
  const parts = validDateParts(value);
  if (!parts) return null;
  const days = (parts.date.getTime() - KNOWN_NEW_MOON_UTC_MS) / DAY_MS;
  return ((days % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
}

export function moonPhaseForDate(value) {
  const age = moonAgeForDate(value);
  if (age === null) return null;
  const phase = MOON_PHASES.find((item) => age >= item.min && age < item.max) || MOON_PHASES[0];
  const angle = (age / SYNODIC_MONTH) * Math.PI * 2;
  const illuminated = (1 - Math.cos(angle)) / 2;
  return { ...phase, ageDays: Number(age.toFixed(2)), illuminatedPercent: Math.round(illuminated * 100) };
}

export function sunSignForDate(value) {
  const parts = validDateParts(value);
  if (!parts) return null;
  const md = parts.month * 100 + parts.day;
  const ranges = [
    [120,218,"aquarius"],[219,320,"pisces"],[321,419,"aries"],[420,520,"taurus"],[521,620,"gemini"],[621,722,"cancer"],[723,822,"leo"],[823,922,"virgo"],[923,1022,"libra"],[1023,1121,"scorpio"],[1122,1221,"sagittarius"]
  ];
  for (const [start,end,slug] of ranges) if (md >= start && md <= end) return slug;
  return "capricorn";
}

export function buildMoonWindow(centerDate, span = 15) {
  const parts = validDateParts(centerDate);
  if (!parts) return [];
  const half = Math.floor(span / 2);
  return Array.from({ length: span }, (_, index) => {
    const date = new Date(parts.date.getTime() + (index - half) * DAY_MS);
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,"0")}-${String(date.getUTCDate()).padStart(2,"0")}`;
    return { date:key, phase:moonPhaseForDate(key) };
  });
}
