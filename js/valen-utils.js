// valen-utils.js — depends on constants.js

function isValenLeap(year) {
  return (year - VALEN_LEAP_REF) % VALEN_LEAP_CYCLE === 0;
}

function getValenDaysInYear(year) {
  return isValenLeap(year) ? 488 : 486;
}

function getValenMonths(year) {
  const isLeap = isValenLeap(year);
  return [
    { name: "First Len'tar", days: 150, start: 1, type: 'lentar' },
    { name: "Inter One", days: 12, start: 151, type: 'inter' },
    { name: "Second Len'tar", days: 150, start: 163, type: 'lentar' },
    { name: "Inter Two", days: isLeap ? 14 : 12, start: 313, type: 'inter' },
    { name: "Third Len'tar", days: 150, start: isLeap ? 327 : 325, type: 'lentar' },
    { name: "Inter Three", days: 12, start: isLeap ? 477 : 475, type: 'inter' }
  ];
}

function getValenTotalBeforeYear(year) {
  let days = 0;
  for (let y = 1; y < year; y++) days += getValenDaysInYear(y);
  return days;
}

function getValenMonthInfo(year, dayOfYear) {
  const months = getValenMonths(year);
  for (let i = 0; i < months.length; i++) {
    const m = months[i];
    if (dayOfYear >= m.start && dayOfYear < m.start + m.days) {
      return {
        index: i,
        name: m.name,
        days: m.days,
        start: m.start,
        type: m.type,
        dayInMonth: dayOfYear - m.start + 1
      };
    }
  }
  return null;
}

function getValenSeasonEvents(year) {
  const isLeap = isValenLeap(year);

  return [
    {
      name: "Cold",
      startDay: 163 + 59,
      endDay: isLeap ? 327 + 105 : 325 + 105,
      color: "#b8d4e8",
      hover: `❄️ Cold Season (${isLeap ? 209 : 209} days)`
    },
    {
      name: "Mini Hot",
      startDay: isLeap ? 327 + 106 : 325 + 106,
      endDay: isLeap ? 327 + 149 : 325 + 149,
      color: "#f5a878",
      hover: `🔥 Mini Hot Season (44 days)`
    },
    {
      name: "Second Cold",
      startDay: isLeap ? 477 : 475,
      endDay: 1 + 42,
      color: "#a8c0d8",
      hover: `❄️ Second Cold Season (55 days)`
    },
    {
      name: "Warm",
      startDay: 1 + 43,
      endDay: 1 + 130,
      color: "#d8c878",
      hover: `🌤️ Warm Season (88 days)`
    },
    {
      name: "Rainy",
      startDay: 1 + 131,
      endDay: 163 + 12,
      color: "#78b8d8",
      hover: `🌧️ Rainy Season (44 days)`
    },
    {
      name: "Second Warm",
      startDay: 163 + 13,
      endDay: 163 + 58,
      color: "#c8d878",
      hover: `☀️ Second Warm Season (46 days)`
    }
  ];
}

function getValenSeasonForDate(year, dayOfYear) {
  const events = getValenSeasonEvents(year);

  for (const season of events) {
    if (season.startDay <= season.endDay) {
      if (dayOfYear >= season.startDay && dayOfYear <= season.endDay) {
        return season;
      }
    } else {
      if (dayOfYear >= season.startDay || dayOfYear <= season.endDay) {
        return season;
      }
    }
  }
  return null;
}
