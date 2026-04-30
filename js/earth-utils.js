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

  const createSeason = (name, startMonth, startDay, endMonth, endDay, color, emoji) => ({
    name,
    start: { month: startMonth, day: startDay },
    end: { month: endMonth, day: endDay },
    color,
    hover: `${emoji} ${name} (${getMonthAbbr(startMonth)} ${startDay} - ${getMonthAbbr(endMonth)} ${endDay})`
  });

  const northern = [
    createSeason("Winter", 11, decSolstice, 2, marEquinox - 1, "#a8c8e8", "❄️"),
    createSeason("Spring", 2, marEquinox, 5, junSolstice - 1, "#f0c0d0", "🌸"),
    createSeason("Summer", 5, junSolstice, 8, sepEquinox - 1, "#a8d8a8", "☀️"),
    createSeason("Autumn", 8, sepEquinox, 11, decSolstice - 1, "#f0b860", "🍂")
  ];

  const southern = [
    createSeason("Summer", 11, decSolstice, 2, marEquinox - 1, "#a8d8a8", "☀️"),
    createSeason("Autumn", 2, marEquinox, 5, junSolstice - 1, "#f0b860", "🍂"),
    createSeason("Winter", 5, junSolstice, 8, sepEquinox - 1, "#a8c8e8", "❄️"),
    createSeason("Spring", 8, sepEquinox, 11, decSolstice - 1, "#f0c0d0", "🌸")
  ];

  return { northern, southern };
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
