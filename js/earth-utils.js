// 29/04/2026 - Veronika Seneca
// earth-utils.js — depends on constants.js

function isEarthLeap(year) {
  if (year % 400 === 0) return true;
  if (year % 100 === 0) return false;
  return year % 4 === 0;
}

function getEarthDaysInMonth(year, month) {
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 1 && isEarthLeap(year)) return 29;
  return days[month];
}

function earthToMs(y, m, d) {
  return new Date(Date.UTC(y, m, d, 0, 0, 0)).getTime();
}

function msToEarth(ms) {
  const date = new Date(ms);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes()
  };
}

function getEarthSeasonEvents(year) {
  const marEquinox = 20;
  const junSolstice = 21;
  const sepEquinox = (year % 4 === 0) ? 22 : 23;
  const decSolstice = 21;

  // Season definitions by northern hemisphere order
  const seasons = [
    { n: "Winter", s: "Summer", m1: 11, d1: decSolstice, m2: 2, d2: marEquinox - 1, cn: "#a8c8e8", cs: "#a8d8a8", en: "❄️", es: "☀️" },
    { n: "Spring", s: "Autumn", m1: 2,  d1: marEquinox,  m2: 5, d2: junSolstice - 1, cn: "#f0c0d0", cs: "#f0b860", en: "🌸", es: "🍂" },
    { n: "Summer", s: "Winter",  m1: 5,  d1: junSolstice, m2: 8, d2: sepEquinox - 1, cn: "#a8d8a8", cs: "#a8c8e8", en: "☀️", es: "❄️" },
    { n: "Autumn", s: "Spring", m1: 8,  d1: sepEquinox, m2: 11, d2: decSolstice - 1, cn: "#f0b860", cs: "#f0c0d0", en: "🍂", es: "🌸" }
  ];

  const createSeason = (name, startMonth, startDay, endMonth, endDay, color, emoji) => ({
    name,
    start: { month: startMonth, day: startDay },
    end: { month: endMonth, day: endDay },
    color,
    hover: `${emoji} ${name}`
  });

  return {
    northern: seasons.map(s => createSeason(s.n, s.m1, s.d1, s.m2, s.d2, s.cn, s.en)),
    southern: seasons.map(s => createSeason(s.s, s.m1, s.d1, s.m2, s.d2, s.cs, s.es))
  };
}

function getMonthAbbr(month) {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  return months[month - 1]; 
}

function getEarthSeasonForDate(year, month, day, hemisphere = 'northern') {
  const events = getEarthSeasonEvents(year)[hemisphere];
  const dateValue = month * 100 + day;

  for (const season of events) {
    const startVal = season.start.month * 100 + season.start.day;
    const endVal = season.end.month * 100 + season.end.day;

    if (startVal <= endVal) {
      if (dateValue >= startVal && dateValue <= endVal) return season;
    } else {
      if (dateValue >= startVal || dateValue <= endVal) return season;
    }
  }
  return null;
}
