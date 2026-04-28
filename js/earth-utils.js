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

  return {
    northern: [
      { name: "Winter", start: { month: 11, day: decSolstice }, end: { month: 2, day: marEquinox - 1 }, color: "#a8c8e8", hover: `❄️ Winter (Dec ${decSolstice} - Mar ${marEquinox - 1})` },
      { name: "Spring", start: { month: 2, day: marEquinox }, end: { month: 5, day: junSolstice - 1 }, color: "#f0c0d0", hover: `🌸 Spring (Mar ${marEquinox} - Jun ${junSolstice - 1})` },
      { name: "Summer", start: { month: 5, day: junSolstice }, end: { month: 8, day: sepEquinox - 1 }, color: "#a8d8a8", hover: `☀️ Summer (Jun ${junSolstice} - Sep ${sepEquinox - 1})` },
      { name: "Autumn", start: { month: 8, day: sepEquinox }, end: { month: 11, day: decSolstice - 1 }, color: "#f0b860", hover: `🍂 Autumn (Sep ${sepEquinox} - Dec ${decSolstice - 1})` }
    ],
    southern: [
      { name: "Summer", start: { month: 11, day: decSolstice }, end: { month: 2, day: marEquinox - 1 }, color: "#a8d8a8", hover: `☀️ Summer (Dec ${decSolstice} - Mar ${marEquinox - 1})` },
      { name: "Autumn", start: { month: 2, day: marEquinox }, end: { month: 5, day: junSolstice - 1 }, color: "#f0b860", hover: `🍂 Autumn (Mar ${marEquinox} - Jun ${junSolstice - 1})` },
      { name: "Winter", start: { month: 5, day: junSolstice }, end: { month: 8, day: sepEquinox - 1 }, color: "#a8c8e8", hover: `❄️ Winter (Jun ${junSolstice} - Sep ${sepEquinox - 1})` },
      { name: "Spring", start: { month: 8, day: sepEquinox }, end: { month: 11, day: decSolstice - 1 }, color: "#f0c0d0", hover: `🌸 Spring (Sep ${sepEquinox} - Dec ${decSolstice - 1})` }
    ]
  };
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
