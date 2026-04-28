// Constants
const VALEN_BASE_DAYS = 486;
const VALEN_DAY_HOURS = 20 + 47/60;  // 20.78333... hours
const EARTH_DAY_HOURS = 24;
const VALEN_LEAP_CYCLE = 11;
const VALEN_LEAP_REF = 748;

// Anchor: Earth 2264-09-23 00:00 UTC = Valen 754 day 2 00:00
const ANCHOR_EARTH = new Date(Date.UTC(2264, 8, 23, 0, 0, 0));
const ANCHOR_VALEN_YEAR = 754;
const ANCHOR_VALEN_DAY = 2;

const EPOCH = new Date(Date.UTC(1970, 0, 1));
const MS_PER_HOUR = 3600000;
const MS_PER_EARTH_DAY = EARTH_DAY_HOURS * MS_PER_HOUR;
const MS_PER_VALEN_DAY = VALEN_DAY_HOURS * MS_PER_HOUR;

const EARTH_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// Earth season definitions
const EARTH_SEASON_NAMES = {
  northern: ["Winter", "Spring", "Summer", "Autumn"],
  southern: ["Summer", "Autumn", "Winter", "Spring"]
};

const EARTH_SEASON_COLORS = {
  northern: ["#a8c8e8", "#f0c0d0", "#a8d8a8", "#f0b860"],
  southern: ["#a8d8a8", "#f0b860", "#a8c8e8", "#f0c0d0"]
};

const EARTH_SEASON_EMOJI = ["❄️", "🌸", "☀️", "🍂"];

function getEarthSeasonEvents(year) {
  const marEq = 20;
  const junSol = 21;
  const sepEq = (year % 4 === 0) ? 22 : 23;
  const decSol = 21;

  const boundaries = [
    { start: { m: 11, d: decSol }, end: { m: 2, d: marEq - 1 } },  // Dec 21 – Mar 19
    { start: { m: 2, d: marEq }, end: { m: 5, d: junSol - 1 } },    // Mar 20 – Jun 20
    { start: { m: 5, d: junSol }, end: { m: 8, d: sepEq - 1 } },    // Jun 21 – Sep 21/22
    { start: { m: 8, d: sepEq }, end: { m: 11, d: decSol - 1 } }    // Sep 22/23 – Dec 20
  ];

  function build(hemi, idxMap) {
    return boundaries.map((b, i) => ({
      name: EARTH_SEASON_NAMES[hemi][i],
      start: { month: b.start.m, day: b.start.d },
      end: { month: b.end.m, day: b.end.d },
      color: EARTH_SEASON_COLORS[hemi][i],
      hover: `${EARTH_SEASON_EMOJI[i]} ${EARTH_SEASON_NAMES[hemi][i]} (${EARTH_MONTHS[b.start.m].slice(0,3)} ${b.start.d} – ${EARTH_MONTHS[b.end.m].slice(0,3)} ${b.end.d})`
    }));
  }

  return {
    northern: build("northern"),
    southern: build("southern")
  };
}

function getEarthSeasonForDate(year, month, day, hemisphere = 'northern') {
  const seasons = getEarthSeasonEvents(year)[hemisphere];
  const dateVal = month * 100 + day;

  for (const s of seasons) {
    const startVal = s.start.month * 100 + s.start.day;
    const endVal = s.end.month * 100 + s.end.day;
    if (startVal <= endVal ? (dateVal >= startVal && dateVal <= endVal)
                            : (dateVal >= startVal || dateVal <= endVal)) {
      return s;
    }
  }
  return null;
}
