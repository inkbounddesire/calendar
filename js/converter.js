
// converter.js — depends on constants.js, earth-utils.js, valen-utils.js

const anchorEarthMs = earthToMs(2264, 8, 23);

function earthToValen(y, m, d) {
  const earthMs = earthToMs(y, m, d);
  const msDiff = earthMs - anchorEarthMs;
  const valenDaysDiff = msDiff / MS_PER_VALEN_DAY;
  let valenTotal = (getValenTotalBeforeYear(ANCHOR_VALEN_YEAR) + (ANCHOR_VALEN_DAY - 1)) + valenDaysDiff;

  let remaining = valenTotal;
  let year = 1;
  while (true) {
    const daysInYear = getValenDaysInYear(year);
    if (remaining < daysInYear) {
      const day = Math.floor(remaining) + 1;
      const timeOfDay = remaining - Math.floor(remaining);
      return { year, day, timeOfDay };
    }
    remaining -= daysInYear;
    year++;
  }
}

function valenToEarth(year, day) {
  const valenTotal = getValenTotalBeforeYear(year) + (day - 1);
  const valenDiff = valenTotal - (getValenTotalBeforeYear(ANCHOR_VALEN_YEAR) + (ANCHOR_VALEN_DAY - 1));
  const msDiff = valenDiff * MS_PER_VALEN_DAY;
  const earthMs = anchorEarthMs + msDiff;
  const roundedMs = Math.round(earthMs / MS_PER_EARTH_DAY) * MS_PER_EARTH_DAY;
  const earth = msToEarth(roundedMs);
  return { year: earth.year, month: earth.month, day: earth.day };
}

function formatTimeOfDay(timeOfDay) {
  const totalMinutes = timeOfDay * VALEN_DAY_HOURS * 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}
