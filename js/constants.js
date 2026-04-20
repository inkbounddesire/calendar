// Calendar constants and configuration
const VALEN_BASE_DAYS_PER_YEAR = 486;
const VALEN_DAY_HOURS = 20 + 47/60;
const EARTH_DAY_HOURS = 24;

// Valen leap year: every 11 years, starting from 748
const VALEN_LEAP_CYCLE = 11;
const VALEN_LEAP_REFERENCE = 748;

// Anchor point
const ANCHOR_EARTH = new Date(Date.UTC(2264, 8, 23));
const ANCHOR_VALEN_YEAR = 754;
const ANCHOR_VALEN_DAY = 2;

// Earth epoch
const EPOCH_EARTH = new Date(Date.UTC(1970, 0, 1));
const MS_PER_EARTH_DAY = EARTH_DAY_HOURS * 3600 * 1000;

// Month names
const EARTH_MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Base Valen month structure (days adjusted per year for leap)
const VALEN_MONTH_TEMPLATE = [
  { name: "First Len'tar", baseDays: 150, type: 'lentar' },
  { name: "Inter One", baseDays: 12, type: 'inter' },
  { name: "Second Len'tar", baseDays: 150, type: 'lentar' },
  { name: "Inter Two", baseDays: 12, type: 'inter' },
  { name: "Third Len'tar", baseDays: 150, type: 'lentar' },
  { name: "Inter Three", baseDays: 12, type: 'inter' }
];
