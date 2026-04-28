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

// Earth season definitions
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
