// constants.js — pure data, no dependencies

// Day lengths
const VALEN_BASE_DAYS = 486;
const VALEN_DAY_HOURS = 20 + 47/60;  // 20.78333... hours
const EARTH_DAY_HOURS = 24;

// Leap cycle
const VALEN_LEAP_CYCLE = 11;
const VALEN_LEAP_REF = 748;

// Anchor: Earth 2264-09-23 00:00 UTC = Valen 754 day 2 00:00
const ANCHOR_EARTH = new Date(Date.UTC(2264, 8, 23, 0, 0, 0));
const ANCHOR_VALEN_YEAR = 754;
const ANCHOR_VALEN_DAY = 2;

// Derived
const EPOCH = new Date(Date.UTC(1970, 0, 1));
const MS_PER_HOUR = 3600000;
const MS_PER_EARTH_DAY = EARTH_DAY_HOURS * MS_PER_HOUR;
const MS_PER_VALEN_DAY = VALEN_DAY_HOURS * MS_PER_HOUR;

// Labels
const EARTH_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
