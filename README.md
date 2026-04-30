# Minbar ⇄ Earth Calendar Converter

A side-by-side calendar converter between Earth's Gregorian calendar and the fictional Valen calendar of Minbar.

## Overview

- **Earth**: Standard Gregorian calendar with leap years, seasons (N/S hemisphere), and 7-day weeks
- **Valen**: Fictional calendar with 3 Len'tars (150 days each), 3 Intervals (12 days, one gets +2 on leap years), 9-day weeks, and 6 seasons
- **Anchor**: 23 September 2264 (Earth) = Year 754 Day 2 (Valen)
- **Day lengths**: Earth = 24h, Valen = 20.783h

## Project Structure
├── home.html — HTML structure, no inline JS or CSS
├── css/
│ └── styles.css — all styles (earthy, paper-like theme)
└── js/
├── constants.js — all constants, anchor dates, labels
├── earth-utils.js — Earth leap year, days in month, date math, Earth seasons
├── valen-utils.js — Valen leap year, months, seasons, day counting
├── converter.js — conversion functions: Earth ⇄ Valen
└── ui.js — state, DOM rendering, event listeners


### Dependency chain
constants.js
├── earth-utils.js ──┐
└── valen-utils.js ──┤
├── converter.js ── ui.js
└─────────────────── ui.js


All scripts loaded from `home.html` in order. `ui.js` calls `initUI()` and `updateUI()` on `DOMContentLoaded`.

## Key Functions by File

### constants.js
- `VALEN_DAY_HOURS`, `MS_PER_VALEN_DAY`, `EARTH_MONTHS`, etc.
- Anchor: `ANCHOR_EARTH` = 2264-09-23 UTC, `ANCHOR_VALEN_YEAR` = 754, `ANCHOR_VALEN_DAY` = 2

### earth-utils.js
- `isEarthLeap(year)` — Gregorian leap year rules
- `getEarthDaysInMonth(year, month)` — returns 28-31
- `earthToMs(y, m, d)` / `msToEarth(ms)` — UTC conversions
- `getEarthSeasonEvents(year)` — equinox/solstice dates
- `getEarthSeasonForDate(year, month, day, hemisphere)` — returns season object with name, color, tooltip

### valen-utils.js
- `isValenLeap(year)` — every 11 years from reference 748
- `getValenDaysInYear(year)` — 486 (normal) or 488 (leap)
- `getValenMonths(year)` — array of 6 month objects with `start`, `days`, `type`
- `getValenMonthInfo(year, dayOfYear)` — returns month index, name, day-in-month
- `getValenSeasonEvents(year)` / `getValenSeasonForDate(year, dayOfYear)` — 6 Valen seasons

### converter.js
- `earthToValen(y, m, d)` — Earth date → { year, day, timeOfDay }
- `valenToEarth(year, day)` — Valen absolute day → { year, month, day }
- `formatTimeOfDay(timeOfDay)` — decimal → HH:MM in Valen hours

### ui.js
- **State**: `state` object holds current Earth date, Valen date, hemisphere
- `initUI()` — grabs DOM elements, builds Earth month select, hemisphere toggle buttons, wires all event listeners
- `renderEarth()` — renders month grid with season colors, current day highlighted
- `renderValen()` — renders Len'tar (9-column grid) or Inter (simple grid) with season colors
- `updateFromEarth()` / `updateFromValen()` — converts and syncs state
- `updateUI()` — refreshes inputs, grids, and result display

## Features

- Click any day cell to select it
- Month navigation with ← → buttons
- Hemisphere toggle (N/S) affects Earth season colors
- Season tooltips on hover
- Valen month dropdown mirrors Earth's format
- Leap years handled for both calendars



