// Calendar calculation utilities

function isValenLeapYear(year) {
  return (year - VALEN_LEAP_REFERENCE) % VALEN_LEAP_CYCLE === 0;
}

function getValenDaysPerYear(year) {
  return isValenLeapYear(year) ? VALEN_BASE_DAYS_PER_YEAR + 2 : VALEN_BASE_DAYS_PER_YEAR;
}

function getValenMonthsForYear(year) {
  const isLeap = isValenLeapYear(year);
  const months = [];
  let currentStart = 1;
  
  for (let i = 0; i < VALEN_MONTH_TEMPLATE.length; i++) {
    const template = VALEN_MONTH_TEMPLATE[i];
    let days = template.baseDays;
    
    // Inter Two gets +2 days in leap years
    if (template.name === "Inter Two" && isLeap) {
      days += 2;
    }
    
    months.push({
      name: template.name,
      days: days,
      startDay: currentStart,
      type: template.type
    });
    
    currentStart += days;
  }
  
  return months;
}

function getValenTotalDaysBeforeYear(year) {
  let days = 0;
  for (let y = 1; y < year; y++) {
    days += getValenDaysPerYear(y);
  }
  return days;
}

function getValenMonthFromDay(year, dayOfYear) {
  const months = getValenMonthsForYear(year);
  for (let i = 0; i < months.length; i++) {
    const m = months[i];
    if (dayOfYear >= m.startDay && dayOfYear < m.startDay + m.days) {
      return {
        index: i,
        name: m.name,
        days: m.days,
        startDay: m.startDay,
        type: m.type,
        dayInMonth: dayOfYear - m.startDay + 1
      };
    }
  }
  return null;
}

function isEarthLeapYear(year) {
  if (year % 400 === 0) return true;
  if (year % 100 === 0) return false;
  return year % 4 === 0;
}

function getEarthDaysInMonth(year, month) {
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 1 && isEarthLeapYear(year)) return 29;
  return days[month];
}

function earthDaysFromDate(y, m, d) {
  return (new Date(Date.UTC(y, m, d)) - EPOCH_EARTH) / MS_PER_EARTH_DAY;
}

function earthDaysToValenTotal(earthDays, anchorEarthDays, anchorValenTotal, valenDayEarthDays) {
  return anchorValenTotal + (earthDays - anchorEarthDays) / valenDayEarthDays;
}

function valenTotalToEarthDays(valenTotal, anchorEarthDays, anchorValenTotal, valenDayEarthDays) {
  return anchorEarthDays + (valenTotal - anchorValenTotal) * valenDayEarthDays;
}

function valenTotalToYearDay(valenTotal) {
  let remaining = Math.floor(valenTotal);
  let year = 1;
  while (true) {
    const daysInYear = getValenDaysPerYear(year);
    if (remaining < daysInYear) {
      return { year, day: remaining + 1 };
    }
    remaining -= daysInYear;
    year++;
  }
}

function earthToValen(y, m, d, anchorEarthDays, anchorValenTotal, valenDayEarthDays) {
  const earthDays = earthDaysFromDate(y, m, d);
  const total = earthDaysToValenTotal(earthDays, anchorEarthDays, anchorValenTotal, valenDayEarthDays);
  return valenTotalToYearDay(total);
}

function valenToEarth(valenYear, valenDayOfYear, anchorEarthDays, anchorValenTotal, valenDayEarthDays) {
  const total = getValenTotalDaysBeforeYear(valenYear) + (valenDayOfYear - 1);
  const earthDays = valenTotalToEarthDays(total, anchorEarthDays, anchorValenTotal, valenDayEarthDays);
  const date = new Date(EPOCH_EARTH.getTime() + earthDays * MS_PER_EARTH_DAY);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate()
  };
}
