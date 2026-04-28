/**
 * ============================================
 * Minbar ⇄ Earth Calendar Converter
 * A bidirectional calendar converter between 
 * Earth (Gregorian) and Minbar (Valen) calendars
 * ============================================
 */

// ============================================
// Module Pattern with Strict Mode
// ============================================
const CalendarConverter = (() => {
  'use strict';

  // ============================================
  // Private Constants
  // ============================================
  const CONSTANTS = Object.freeze({
    VALEN_DAY_HOURS: 20 + 47/60,  // 20.78333... hours
    EARTH_DAY_HOURS: 24,
    VALEN_LEAP_CYCLE: 11,
    VALEN_LEAP_REF: 748,
    ANCHOR_EARTH_YEAR: 2264,
    ANCHOR_EARTH_MONTH: 8, // September (0-indexed)
    ANCHOR_EARTH_DAY: 23,
    ANCHOR_VALEN_YEAR: 754,
    ANCHOR_VALEN_DAY: 2,
    MS_PER_HOUR: 3600000,
    MAX_YEAR: 9999,
    MIN_YEAR: 1,
    DEFAULT_VALEN_MONTH_IDX: 0,
    VALEN_LENTAR_WEEKS: 16,
    VALEN_LENTAR_WEEKDAYS: 9,
    VALEN_FREE_DAYS: 3
  });

  // Derived constants
  const MS_PER_EARTH_DAY = CONSTANTS.EARTH_DAY_HOURS * CONSTANTS.MS_PER_HOUR;
  const MS_PER_VALEN_DAY = CONSTANTS.VALEN_DAY_HOURS * CONSTANTS.MS_PER_HOUR;
  
  const ANCHOR_EARTH_DATE = new Date(Date.UTC(
    CONSTANTS.ANCHOR_EARTH_YEAR,
    CONSTANTS.ANCHOR_EARTH_MONTH,
    CONSTANTS.ANCHOR_EARTH_DAY
  ));
  
  const ANCHOR_EARTH_MS = ANCHOR_EARTH_DATE.getTime();

  // ============================================
  // Private Data
  // ============================================
  const EARTH_MONTHS = Object.freeze([
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]);

  const EARTH_MONTH_DAYS = Object.freeze([31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]);

  const WEEKDAY_ABBREV = Object.freeze(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

  // ============================================
  // Private State Management
  // ============================================
  class CalendarState {
    constructor() {
      this.earthYear = CONSTANTS.ANCHOR_EARTH_YEAR;
      this.earthMonth = CONSTANTS.ANCHOR_EARTH_MONTH;
      this.earthDay = CONSTANTS.ANCHOR_EARTH_DAY;
      this.valenYear = CONSTANTS.ANCHOR_VALEN_YEAR;
      this.valenDay = CONSTANTS.ANCHOR_VALEN_DAY;
      this.valenMonthIdx = CONSTANTS.DEFAULT_VALEN_MONTH_IDX;
      this.valenTimeOfDay = 0;
      this.hemisphere = 'northern';
    }

    reset() {
      this.earthYear = CONSTANTS.ANCHOR_EARTH_YEAR;
      this.earthMonth = CONSTANTS.ANCHOR_EARTH_MONTH;
      this.earthDay = CONSTANTS.ANCHOR_EARTH_DAY;
      this.valenYear = CONSTANTS.ANCHOR_VALEN_YEAR;
      this.valenDay = CONSTANTS.ANCHOR_VALEN_DAY;
      this.valenMonthIdx = CONSTANTS.DEFAULT_VALEN_MONTH_IDX;
      this.valenTimeOfDay = 0;
    }

    setEarthDate(year, month, day) {
      this.earthYear = this._clamp(year, CONSTANTS.MIN_YEAR, CONSTANTS.MAX_YEAR);
      this.earthMonth = this._clamp(month, 0, 11);
      const maxDay = getEarthDaysInMonth(this.earthYear, this.earthMonth);
      this.earthDay = this._clamp(day, 1, maxDay);
    }

    setValenDate(year, day) {
      this.valenYear = Math.max(CONSTANTS.MIN_YEAR, year);
      const maxDay = getValenDaysInYear(this.valenYear);
      this.valenDay = this._clamp(day, 1, maxDay);
      this.valenTimeOfDay = 0;
    }

    toggleHemisphere() {
      this.hemisphere = this.hemisphere === 'northern' ? 'southern' : 'northern';
    }

    _clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }
  }

  // ============================================
  // Private Season Definitions
  // ============================================
  class SeasonManager {
    static getEarthSeasons(year) {
      const marEquinox = 20;
      const junSolstice = 21;
      const sepEquinox = (year % 4 === 0) ? 22 : 23;
      const decSolstice = 21;

      const baseSeasons = [
        {
          name: 'Winter',
          start: { month: 11, day: decSolstice },
          end: { month: 2, day: marEquinox - 1 },
          color: '#a8c8e8',
          emoji: '❄️',
          label: 'Winter'
        },
        {
          name: 'Spring',
          start: { month: 2, day: marEquinox },
          end: { month: 5, day: junSolstice - 1 },
          color: '#f0c0d0',
          emoji: '🌸',
          label: 'Spring'
        },
        {
          name: 'Summer',
          start: { month: 5, day: junSolstice },
          end: { month: 8, day: sepEquinox - 1 },
          color: '#a8d8a8',
          emoji: '☀️',
          label: 'Summer'
        },
        {
          name: 'Autumn',
          start: { month: 8, day: sepEquinox },
          end: { month: 11, day: decSolstice - 1 },
          color: '#f0b860',
          emoji: '🍂',
          label: 'Autumn'
        }
      ];

      return {
        northern: baseSeasons.map(s => ({ ...s, hover: `${s.emoji} ${s.label} (Dec ${decSolstice} - Mar ${marEquinox - 1})` })),
        // Fix hover text for each season properly
        southern: [
          { ...baseSeasons[2], hover: `☀️ Summer (Dec ${decSolstice} - Mar ${marEquinox - 1})` },
          { ...baseSeasons[3], hover: `🍂 Autumn (Mar ${marEquinox} - Jun ${junSolstice - 1})` },
          { ...baseSeasons[0], hover: `❄️ Winter (Jun ${junSolstice} - Sep ${sepEquinox - 1})` },
          { ...baseSeasons[1], hover: `🌸 Spring (Sep ${sepEquinox} - Dec ${decSolstice - 1})` }
        ]
      };
    }

    static getValenSeasons(year) {
      const isLeap = isValenLeap(year);
      const baseDay = isLeap ? 327 : 325;
      const interThreeStart = isLeap ? 477 : 475;

      return Object.freeze([
        {
          name: 'Cold',
          startDay: 222, // 163 + 59
          endDay: baseDay + 105,
          color: '#b8d4e8',
          emoji: '❄️',
          hover: `❄️ Cold Season (${baseDay + 105 - 222 + 1} days)`
        },
        {
          name: 'Mini Hot',
          startDay: baseDay + 106,
          endDay: baseDay + 149,
          color: '#f5a878',
          emoji: '🔥',
          hover: '🔥 Mini Hot Season (44 days)'
        },
        {
          name: 'Second Cold',
          startDay: interThreeStart,
          endDay: 43,
          color: '#a8c0d8',
          emoji: '❄️',
          hover: '❄️ Second Cold Season (55 days)'
        },
        {
          name: 'Warm',
          startDay: 44,
          endDay: 131,
          color: '#d8c878',
          emoji: '🌤️',
          hover: '🌤️ Warm Season (88 days)'
        },
        {
          name: 'Rainy',
          startDay: 132,
          endDay: 175,
          color: '#78b8d8',
          emoji: '🌧️',
          hover: '🌧️ Rainy Season (44 days)'
        },
        {
          name: 'Second Warm',
          startDay: 176,
          endDay: 221,
          color: '#c8d878',
          emoji: '☀️',
          hover: '☀️ Second Warm Season (46 days)'
        }
      ]);
    }

    static getEarthSeasonForDate(year, month, day, hemisphere) {
      const events = SeasonManager.getEarthSeasons(year)[hemisphere];
      const dateValue = month * 100 + day;

      for (const season of events) {
        const startVal = season.start.month * 100 + season.start.day;
        const endVal = season.end.month * 100 + season.end.day;

        if (SeasonManager._isDateInRange(dateValue, startVal, endVal)) {
          return season;
        }
      }
      return null;
    }

    static getValenSeasonForDate(year, dayOfYear) {
      const events = SeasonManager.getValenSeasons(year);

      for (const season of events) {
        if (SeasonManager._isDateInRange(dayOfYear, season.startDay, season.endDay)) {
          return season;
        }
      }
      return null;
    }

    static _isDateInRange(value, start, end) {
      if (start <= end) {
        return value >= start && value <= end;
      }
      // Wraps around (e.g., Second Cold wraps from end of year to beginning)
      return value >= start || value <= end;
    }
  }

  // ============================================
  // Private Utility Functions
  // ============================================
  function isEarthLeap(year) {
    return (year % 400 === 0) || (year % 100 !== 0 && year % 4 === 0);
  }

  function isValenLeap(year) {
    return (year - CONSTANTS.VALEN_LEAP_REF) % CONSTANTS.VALEN_LEAP_CYCLE === 0;
  }

  function getEarthDaysInMonth(year, month) {
    if (month === 1 && isEarthLeap(year)) return 29; // February in leap year
    return EARTH_MONTH_DAYS[month];
  }

  function getValenDaysInYear(year) {
    return isValenLeap(year) ? 488 : 486;
  }

  function getValenMonths(year) {
    const isLeap = isValenLeap(year);
    return Object.freeze([
      { name: "First Len'tar", days: 150, start: 1, type: 'lentar' },
      { name: 'Inter One', days: 12, start: 151, type: 'inter' },
      { name: "Second Len'tar", days: 150, start: 163, type: 'lentar' },
      { name: 'Inter Two', days: isLeap ? 14 : 12, start: 313, type: 'inter' },
      { name: "Third Len'tar", days: 150, start: isLeap ? 327 : 325, type: 'lentar' },
      { name: 'Inter Three', days: 12, start: isLeap ? 477 : 475, type: 'inter' }
    ]);
  }

  function getValenTotalBeforeYear(year) {
    let total = 0;
    for (let y = CONSTANTS.MIN_YEAR; y < year; y++) {
      total += getValenDaysInYear(y);
    }
    return total;
  }

  function getValenMonthInfo(year, dayOfYear) {
    const months = getValenMonths(year);
    for (let i = 0; i < months.length; i++) {
      const month = months[i];
      if (dayOfYear >= month.start && dayOfYear < month.start + month.days) {
        return {
          index: i,
          name: month.name,
          days: month.days,
          start: month.start,
          type: month.type,
          dayInMonth: dayOfYear - month.start + 1
        };
      }
    }
    throw new Error(`Invalid day of year: ${dayOfYear} for year ${year}`);
  }

  function formatTimeOfDay(timeOfDay) {
    const totalMinutes = timeOfDay * CONSTANTS.VALEN_DAY_HOURS * 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  /**
   * Memoization helper for expensive calculations
   */
  function memoize(fn) {
    const cache = new Map();
    return function(...args) {
      const key = JSON.stringify(args);
      if (cache.has(key)) return cache.get(key);
      const result = fn.apply(this, args);
      cache.set(key, result);
      // Limit cache size to prevent memory issues
      if (cache.size > 1000) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      return result;
    };
  }

  // Memoized versions of frequently called functions
  const memoizedGetValenDaysInYear = memoize(getValenDaysInYear);
  const memoizedGetValenMonths = memoize(getValenMonths);
  const memoizedGetValenTotalBeforeYear = memoize(getValenTotalBeforeYear);

  // ============================================
  // Private Conversion Functions
  // ============================================
  function earthToValen(year, month, day) {
    try {
      const earthMs = new Date(Date.UTC(year, month, day)).getTime();
      const msDiff = earthMs - ANCHOR_EARTH_MS;
      const valenDaysDiff = msDiff / MS_PER_VALEN_DAY;
      
      let valenTotal = (getValenTotalBeforeYear(CONSTANTS.ANCHOR_VALEN_YEAR) + 
                       (CONSTANTS.ANCHOR_VALEN_DAY - 1)) + valenDaysDiff;

      if (valenTotal < 0) {
        throw new Error('Date is before the beginning of the Valen calendar');
      }

      let remaining = valenTotal;
      let year = CONSTANTS.MIN_YEAR;
      const MAX_ITERATIONS = 10000; // Safety limit

      for (let i = 0; i < MAX_ITERATIONS; i++) {
        const daysInYear = getValenDaysInYear(year);
        if (remaining < daysInYear) {
          const day = Math.floor(remaining) + 1;
          const timeOfDay = remaining - Math.floor(remaining);
          return { year, day, timeOfDay };
        }
        remaining -= daysInYear;
        year++;
      }

      throw new Error('Year calculation exceeded maximum iterations');
    } catch (error) {
      console.error('Earth to Valen conversion error:', error);
      return {
        year: CONSTANTS.ANCHOR_VALEN_YEAR,
        day: CONSTANTS.ANCHOR_VALEN_DAY,
        timeOfDay: 0,
        error: true
      };
    }
  }

  function valenToEarth(year, day) {
    try {
      const valenTotal = getValenTotalBeforeYear(year) + (day - 1);
      const anchorValenTotal = getValenTotalBeforeYear(CONSTANTS.ANCHOR_VALEN_YEAR) + 
                               (CONSTANTS.ANCHOR_VALEN_DAY - 1);
      const valenDiff = valenTotal - anchorValenTotal;
      const msDiff = valenDiff * MS_PER_VALEN_DAY;
      const earthMs = ANCHOR_EARTH_MS + msDiff;
      
      // Round to nearest Earth day
      const roundedMs = Math.round(earthMs / MS_PER_EARTH_DAY) * MS_PER_EARTH_DAY;
      const earthDate = new Date(roundedMs);

      return {
        year: earthDate.getUTCFullYear(),
        month: earthDate.getUTCMonth(),
        day: earthDate.getUTCDate(),
        hour: earthDate.getUTCHours(),
        minute: earthDate.getUTCMinutes()
      };
    } catch (error) {
      console.error('Valen to Earth conversion error:', error);
      return {
        year: CONSTANTS.ANCHOR_EARTH_YEAR,
        month: CONSTANTS.ANCHOR_EARTH_MONTH,
        day: CONSTANTS.ANCHOR_EARTH_DAY,
        error: true
      };
    }
  }

  // ============================================
  // Private DOM Management
  // ============================================
  class DOMManager {
    constructor() {
      this.elements = this._cacheElements();
      this._setupDebounce();
    }

    _cacheElements() {
      const get = (id) => {
        const element = document.getElementById(id);
        if (!element) {
          console.warn(`Element with id '${id}' not found`);
        }
        return element;
      };

      return {
        earthYear: get('earthYear'),
        earthMonth: get('earthMonth'),
        earthDay: get('earthDay'),
        earthMonthDisp: get('earthMonthDisplay'),
        earthGrid: get('earthCalendarGrid'),
        earthPrevMonth: get('earthPrevMonth'),
        earthNextMonth: get('earthNextMonth'),
        valenYear: get('valenYear'),
        valenDay: get('valenDay'),
        valenMonthDisp: get('valenMonthDisplay'),
        valenDayRange: get('valenDayRange'),
        valenPrevMonth: get('valenPrevMonth'),
        valenNextMonth: get('valenNextMonth'),
        valenContainer: get('valenCalendarContainer'),
        resultMain: get('resultMainText'),
        resultDetails: get('resultDetails'),
        earthPanel: document.querySelector('.panel:first-child h2')
      };
    }

    _setupDebounce() {
      // Debounce for better performance with rapid input changes
      this._debounceTimer = null;
      this._debounceDelay = 300; // ms
    }

    debounce(callback, delay = this._debounceDelay) {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(callback, delay);
    }

    populateEarthMonths() {
      if (!this.elements.earthMonth) return;
      
      const fragment = document.createDocumentFragment();
      EARTH_MONTHS.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = month;
        fragment.appendChild(option);
      });
      
      this.elements.earthMonth.appendChild(fragment);
      this.elements.earthMonth.value = CONSTANTS.ANCHOR_EARTH_MONTH;
    }
  }

  // ============================================
  // Private Renderer
  // ============================================
  class CalendarRenderer {
    constructor(domManager, state) {
      this.dom = domManager;
      this.state = state;
      this._eventListeners = new Map();
    }

    _addEventListenerWithCleanup(element, event, handler) {
      if (!element) return;
      
      // Remove old listener if exists
      const key = `${event}_${handler.toString()}`;
      if (this._eventListeners.has(key)) {
        element.removeEventListener(event, this._eventListeners.get(key));
      }
      
      element.addEventListener(event, handler);
      this._eventListeners.set(key, handler);
    }

    renderEarthCalendar() {
      const { earthYear, earthMonth, earthDay, hemisphere } = this.state;
      const firstDay = new Date(Date.UTC(earthYear, earthMonth, 1));
      const startOffset = (firstDay.getUTCDay() + 6) % 7; // Monday start
      const daysInMonth = getEarthDaysInMonth(earthYear, earthMonth);
      
      // Update month display
      const isLeap = isEarthLeap(earthYear);
      const leapText = (earthMonth === 1 && isLeap) ? ' (leap)' : '';
      this.dom.elements.earthMonthDisp.textContent = 
        `${EARTH_MONTHS[earthMonth]} ${earthYear}${leapText}`;
      
      // Build calendar HTML
      const fragment = document.createDocumentFragment();
      const calendarDiv = document.createElement('div');
      
      let html = '';
      
      // Empty cells for offset
      for (let i = 0; i < startOffset; i++) {
        html += '<div class="cal-cell other-month"></div>';
      }
      
      // Day cells
      for (let day = 1; day <= daysInMonth; day++) {
        const isSelected = day === earthDay;
        const season = SeasonManager.getEarthSeasonForDate(
          earthYear, earthMonth, day, hemisphere
        );
        
        const classes = ['cal-cell'];
        if (isSelected) classes.push('highlight');
        
        const style = season ? `background: ${season.color};` : '';
        const tooltip = season ? `title="${season.hover}"` : '';
        
        html += `<div class="${classes.join(' ')}" data-day="${day}" style="${style}" ${tooltip}>${day}</div>`;
      }
      
      // Fill remaining cells
      const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
      for (let i = startOffset + daysInMonth; i < totalCells; i++) {
        html += '<div class="cal-cell other-month"></div>';
      }
      
      calendarDiv.innerHTML = html;
      
      // Update grid (preserve weekday headers)
      const existingGrid = this.dom.elements.earthGrid;
      const weekdayHeaders = existingGrid.querySelectorAll('.weekday-header');
      
      existingGrid.innerHTML = '';
      weekdayHeaders.forEach(header => existingGrid.appendChild(header.cloneNode(true)));
      
      // Append new calendar cells
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      while (tempDiv.firstChild) {
        existingGrid.appendChild(tempDiv.firstChild);
      }
      
      // Attach click handlers
      this._attachEarthCellHandlers();
    }

    _attachEarthCellHandlers() {
      const cells = this.dom.elements.earthGrid.querySelectorAll('.cal-cell[data-day]');
      
      cells.forEach(cell => {
        const handler = () => {
          const day = parseInt(cell.dataset.day);
          if (!isNaN(day)) {
            this.state.earthDay = day;
            this._handleEarthUpdate();
          }
        };
        
        this._addEventListenerWithCleanup(cell, 'click', handler);
      });
    }

    renderValenCalendar() {
      const { valenYear, valenDay, valenTimeOfDay } = this.state;
      const months = getValenMonths(valenYear);
      const info = getValenMonthInfo(valenYear, valenDay);
      const month = months[info.index];
      
      this.state.valenMonthIdx = info.index;
      
      // Update month display
      const isLeap = isValenLeap(valenYear);
      const leapNote = (month.name === 'Inter Two' && isLeap) ? ' (leap +2)' : '';
      this.dom.elements.valenMonthDisp.textContent = month.name + leapNote;
      
      // Update day range display
      const season = SeasonManager.getValenSeasonForDate(valenYear, valenDay);
      const seasonName = season ? ` · ${season.name}` : '';
      const timeStr = formatTimeOfDay(valenTimeOfDay);
      this.dom.elements.valenDayRange.textContent = 
        `Day ${info.dayInMonth} of ${month.days}${seasonName} · ${timeStr}`;
      
      // Render calendar
      let calendarHTML;
      if (month.type === 'lentar') {
        calendarHTML = this._renderLentarMonth(month, info.dayInMonth, valenYear);
      } else {
        calendarHTML = this._renderInterMonth(month, info.dayInMonth, valenYear, isLeap);
      }
      
      this.dom.elements.valenContainer.innerHTML = calendarHTML;
      this._attachValenCellHandlers();
    }

    _renderLentarMonth(month, selectedDay, year) {
      let html = '<div class="valen-grid lentar-grid">';
      
      // Header row
      html += '<div class="grid-label"></div>';
      for (let i = 1; i <= CONSTANTS.VALEN_LENTAR_WEEKDAYS; i++) {
        html += `<div class="weekday-header valen">${i}</div>`;
      }
      
      // Free days row (top)
      html += this._renderFreeDaysRow(month, 1, selectedDay, year);
      
      // Week rows
      for (let week = 1; week <= CONSTANTS.VALEN_LENTAR_WEEKS; week++) {
        html += `<div class="grid-label">Week ${week}</div>`;
        for (let wd = 1; wd <= CONSTANTS.VALEN_LENTAR_WEEKDAYS; wd++) {
          const day = CONSTANTS.VALEN_FREE_DAYS + (week - 1) * CONSTANTS.VALEN_LENTAR_WEEKDAYS + wd;
          html += this._renderDayCell(month, day, selectedDay, year);
        }
      }
      
      // Free days row (bottom)
      html += this._renderFreeDaysRow(month, 148, selectedDay, year);
      
      html += '</div>';
      return html;
    }

    _renderFreeDaysRow(month, startDay, selectedDay, year) {
      let html = '<div class="grid-label">Free</div>';
      for (let i = 1; i <= CONSTANTS.VALEN_LENTAR_WEEKDAYS; i++) {
        if (i <= CONSTANTS.VALEN_FREE_DAYS) {
          const day = startDay + i - 1;
          html += this._renderDayCell(month, day, selectedDay, year, true);
        } else {
          html += '<div class="cal-cell empty-cell"></div>';
        }
      }
      return html;
    }

    _renderDayCell(month, day, selectedDay, year, isFree = false) {
      const dayOfYear = month.start + day - 1;
      const season = SeasonManager.getValenSeasonForDate(year, dayOfYear);
      
      const classes = ['cal-cell'];
      if (day === selectedDay) classes.push('highlight');
      if (isFree) classes.push('free-day');
      
      const style = season ? `background: ${season.color};` : '';
      const tooltip = season ? `title="${season.hover}"` : '';
      
      return `<div class="${classes.join(' ')}" data-vday="${dayOfYear}" style="${style}" ${tooltip}>${day}</div>`;
    }

    _renderInterMonth(month, selectedDay, year, isLeap) {
      let html = '<div class="inter-grid">';
      
      for (let day = 1; day <= month.days; day++) {
        const dayOfYear = month.start + day - 1;
        const season = SeasonManager.getValenSeasonForDate(year, dayOfYear);
        
        const classes = ['cal-cell'];
        if (day === selectedDay) classes.push('highlight');
        if (month.name === 'Inter Two' && isLeap && day > 12) classes.push('leap-day');
        
        const style = season ? `background: ${season.color};` : '';
        const tooltip = season ? `title="${season.hover}"` : '';
        
        html += `<div class="${classes.join(' ')}" data-vday="${dayOfYear}" style="${style}" ${tooltip}>${day}</div>`;
      }
      
      html += '</div>';
      return html;
    }

    _attachValenCellHandlers() {
      const cells = document.querySelectorAll('[data-vday]');
      
      cells.forEach(cell => {
        const handler = () => {
          const day = parseInt(cell.dataset.vday);
          if (!isNaN(day)) {
            this.state.valenDay = day;
            this.state.valenTimeOfDay = 0;
            this._handleValenUpdate();
          }
        };
        
        this._addEventListenerWithCleanup(cell, 'click', handler);
      });
    }

    updateResult() {
      const { earthYear, earthMonth, earthDay, valenYear, valenDay, valenTimeOfDay, hemisphere } = this.state;
      
      const info = getValenMonthInfo(valenYear, valenDay);
      const timeStr = formatTimeOfDay(valenTimeOfDay);
      const earthSeason = SeasonManager.getEarthSeasonForDate(earthYear, earthMonth, earthDay, hemisphere);
      const valenSeason = SeasonManager.getValenSeasonForDate(valenYear, valenDay);
      
      const earthSeasonName = earthSeason ? ` (${earthSeason.emoji} ${earthSeason.name})` : '';
      const valenSeasonName = valenSeason ? ` (${valenSeason.emoji} ${valenSeason.name})` : '';
      
      this.dom.elements.resultMain.innerHTML = 
        `📌 ${earthDay} ${EARTH_MONTHS[earthMonth]} ${earthYear}${earthSeasonName} ⇢ ` +
        `Valen ${valenYear} · ${info.name} day ${info.dayInMonth}${valenSeasonName} ${timeStr}`;
      
      const hourOffset = (valenTimeOfDay * CONSTANTS.VALEN_DAY_HOURS).toFixed(1);
      const hemisphereText = hemisphere === 'northern' ? 'N. Hemisphere' : 'S. Hemisphere';
      this.dom.elements.resultDetails.innerHTML = 
        `📐 1 Valen day = ${CONSTANTS.VALEN_DAY_HOURS.toFixed(3)}h · ${hemisphereText} · Offset: +${hourOffset}h`;
    }

    _handleEarthUpdate() {
      try {
        const conv = earthToValen(this.state.earthYear, this.state.earthMonth, this.state.earthDay);
        if (!conv.error) {
          this.state.valenYear = conv.year;
          this.state.valenDay = conv.day;
          this.state.valenTimeOfDay = conv.timeOfDay;
        }
        this.updateAll();
      } catch (error) {
        console.error('Earth update error:', error);
      }
    }

    _handleValenUpdate() {
      try {
        const earth = valenToEarth(this.state.valenYear, this.state.valenDay);
        if (!earth.error) {
          this.state.earthYear = earth.year;
          this.state.earthMonth = earth.month;
          this.state.earthDay = earth.day;
        }
        this.updateAll();
      } catch (error) {
        console.error('Valen update error:', error);
      }
    }

    updateAll() {
      this._updateInputs();
      this.renderEarthCalendar();
      this.renderValenCalendar();
      this.updateResult();
    }

    _updateInputs() {
      const { earthYear, earthMonth, earthDay, valenYear, valenDay } = this.state;
      
      if (this.dom.elements.earthYear) this.dom.elements.earthYear.value = earthYear;
      if (this.dom.elements.earthMonth) this.dom.elements.earthMonth.value = earthMonth;
      if (this.dom.elements.earthDay) this.dom.elements.earthDay.value = earthDay;
      if (this.dom.elements.valenYear) this.dom.elements.valenYear.value = valenYear;
      if (this.dom.elements.valenDay) this.dom.elements.valenDay.value = valenDay;
    }
  }

  // ============================================
  // Private Event Handler Setup
  // ============================================
  class EventHandler {
    constructor(domManager, renderer, state) {
      this.dom = domManager;
      this.renderer = renderer;
      this.state = state;
    }

    setupAll() {
      this._setupEarthNavigation();
      this._setupValenNavigation();
      this._setupEarthInputs();
      this._setupValenInputs();
      this._setupHemisphereToggle();
      this._setupKeyboardNavigation();
      this._setupResetOnDoubleClick();
    }

    _setupEarthNavigation() {
      const { earthPrevMonth, earthNextMonth } = this.dom.elements;
      
      if (earthPrevMonth) {
        earthPrevMonth.addEventListener('click', () => {
          this._navigateEarthMonth(-1);
        });
      }
      
      if (earthNextMonth) {
        earthNextMonth.addEventListener('click', () => {
          this._navigateEarthMonth(1);
        });
      }
    }

    _navigateEarthMonth(delta) {
      let newMonth = this.state.earthMonth + delta;
      let newYear = this.state.earthYear;
      
      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }
      
      // Clamp year
      newYear = Math.max(CONSTANTS.MIN_YEAR, Math.min(CONSTANTS.MAX_YEAR, newYear));
      
      this.state.earthYear = newYear;
      this.state.earthMonth = newMonth;
      
      // Adjust day if necessary
      const maxDay = getEarthDaysInMonth(newYear, newMonth);
      if (this.state.earthDay > maxDay) {
        this.state.earthDay = maxDay;
      }
      
      this.renderer._handleEarthUpdate();
    }

    _setupValenNavigation() {
      const { valenPrevMonth, valenNextMonth } = this.dom.elements;
      
      if (valenPrevMonth) {
        valenPrevMonth.addEventListener('click', () => {
          this._navigateValenMonth(-1);
        });
      }
      
      if (valenNextMonth) {
        valenNextMonth.addEventListener('click', () => {
          this._navigateValenMonth(1);
        });
      }
    }

    _navigateValenMonth(delta) {
      const months = getValenMonths(this.state.valenYear);
      let newMonthIdx = this.state.valenMonthIdx + delta;
      
      if (newMonthIdx < 0) {
        this.state.valenYear--;
        const prevYearMonths = getValenMonths(this.state.valenYear);
        newMonthIdx = prevYearMonths.length - 1;
      } else if (newMonthIdx >= months.length) {
        this.state.valenYear++;
        newMonthIdx = 0;
      }
      
      this.state.valenYear = Math.max(CONSTANTS.MIN_YEAR, this.state.valenYear);
      const newMonths = getValenMonths(this.state.valenYear);
      this.state.valenDay = newMonths[newMonthIdx].start;
      this.state.valenTimeOfDay = 0;
      
      this.renderer._handleValenUpdate();
    }

    _setupEarthInputs() {
      const { earthYear, earthMonth, earthDay } = this.dom.elements;
      
      const updateEarth = () => {
        const year = parseInt(earthYear?.value) || CONSTANTS.ANCHOR_EARTH_YEAR;
        const month = parseInt(earthMonth?.value) || 0;
        const day = parseInt(earthDay?.value) || 1;
        
        this.state.setEarthDate(year, month, day);
        this.renderer._handleEarthUpdate();
      };
      
      [earthYear, earthMonth, earthDay].forEach(input => {
        if (input) {
          input.addEventListener('change', updateEarth);
          input.addEventListener('input', () => this.dom.debounce(updateEarth, 500));
        }
      });
    }

    _setupValenInputs() {
      const { valenYear, valenDay } = this.dom.elements;
      
      const updateValen = () => {
        const year = parseInt(valenYear?.value) || CONSTANTS.ANCHOR_VALEN_YEAR;
        const day = parseInt(valenDay?.value) || 1;
        
        this.state.setValenDate(year, day);
        this.renderer._handleValenUpdate();
      };
      
      [valenYear, valenDay].forEach(input => {
        if (input) {
          input.addEventListener('change', updateValen);
          input.addEventListener('input', () => this.dom.debounce(updateValen, 500));
        }
      });
    }

    _setupHemisphereToggle() {
      const { earthPanel } = this.dom.elements;
      if (!earthPanel) return;
      
      const button = document.createElement('button');
      button.textContent = '🌍 S. Hemisphere';
      button.title = 'Toggle between Northern and Southern Hemisphere';
      button.setAttribute('aria-label', 'Toggle hemisphere');
      button.style.cssText = `
        font-size: 0.8rem;
        padding: 4px 12px;
        margin-left: 10px;
        background: #d4cbb8;
        border: 1px solid #b7aa8f;
        border-bottom-width: 2px;
        border-radius: 30px;
        cursor: pointer;
        transition: background 0.2s ease;
      `;
      
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.state.toggleHemisphere();
        button.textContent = this.state.hemisphere === 'northern' ? 
          '🌍 S. Hemisphere' : '🌏 N. Hemisphere';
        this.renderer.renderEarthCalendar();
        this.renderer.updateResult();
      });
      
      button.addEventListener('mouseenter', () => {
        button.style.background = '#dbcfb2';
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.background = '#d4cbb8';
      });
      
      earthPanel.appendChild(button);
    }

    _setupKeyboardNavigation() {
      document.addEventListener('keydown', (e) => {
        // Only handle if not in an input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        
        switch(e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            this._navigateEarthMonth(-1);
            break;
          case 'ArrowRight':
            e.preventDefault();
            this._navigateEarthMonth(1);
            break;
          case 'ArrowUp':
            e.preventDefault();
            this._navigateValenMonth(-1);
            break;
          case 'ArrowDown':
            e.preventDefault();
            this._navigateValenMonth(1);
            break;
          case 'h':
            if (!e.ctrlKey && !e.metaKey) {
              e.preventDefault();
              this.state.toggleHemisphere();
              this.renderer.renderEarthCalendar();
              this.renderer.updateResult();
            }
            break;
          case 'r':
            if (!e.ctrlKey && !e.metaKey) {
              e.preventDefault();
              this._resetToAnchor();
            }
            break;
        }
      });
    }

    _setupResetOnDoubleClick() {
      const title = document.querySelector('h1');
      if (title) {
        title.addEventListener('dblclick', () => this._resetToAnchor());
        title.style.cursor = 'pointer';
        title.title = 'Double-click to reset to anchor date';
      }
    }

    _resetToAnchor() {
      this.state.reset();
      this.renderer.updateAll();
      
      // Visual feedback
      const card = document.querySelector('.converter-card');
      if (card) {
        card.style.transition = 'transform 0.3s ease';
        card.style.transform = 'scale(1.02)';
        setTimeout(() => {
          card.style.transform = 'scale(1)';
        }, 300);
      }
    }
  }

  // ============================================
  // Private Performance Monitoring
  // ============================================
  class PerformanceMonitor {
    constructor() {
      this.metrics = {};
      this.enabled = false; // Set to true for development
    }

    start(label) {
      if (!this.enabled) return;
      this.metrics[label] = performance.now();
    }

    end(label) {
      if (!this.enabled) return;
      if (this.metrics[label]) {
        const duration = performance.now() - this.metrics[label];
        console.debug(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
        delete this.metrics[label];
      }
    }
  }

  // ============================================
  // Public API
  // ============================================
  class CalendarApp {
    constructor() {
      this.perf = new PerformanceMonitor();
      this.state = new CalendarState();
      this.dom = new DOMManager();
      this.renderer = new CalendarRenderer(this.dom, this.state);
      this.eventHandler = new EventHandler(this.dom, this.renderer, this.state);
      this.initialized = false;
    }

    init() {
      if (this.initialized) {
        console.warn('CalendarConverter already initialized');
        return;
      }

      try {
        this.perf.start('Initialization');
        
        // Populate select elements
        this.dom.populateEarthMonths();
        
        // Setup event handlers
        this.eventHandler.setupAll();
        
        // Initial render
        this.renderer.updateAll();
        
        this.initialized = true;
        this.perf.end('Initialization');
        
        console.log('✅ Minbar ⇄ Earth Calendar Converter initialized');
        console.log('💡 Tips:');
        console.log('  - Use arrow keys to navigate months');
        console.log('  - Press "H" to toggle hemisphere');
        console.log('  - Press "R" or double-click title to reset');
        console.log('  - Double-click title to reset to anchor date');
      } catch (error) {
        console.error('Failed to initialize CalendarConverter:', error);
        this._showError('Failed to initialize the calendar converter. Please refresh the page.');
      }
    }

    reset() {
      this.state.reset();
      this.renderer.updateAll();
    }

    getState() {
      return { ...this.state };
    }

    convertDate(year, month, day) {
      return earthToValen(year, month, day);
    }

    _showError(message) {
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ff4444;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      `;
      errorDiv.textContent = message;
      document.body.appendChild(errorDiv);
      
      setTimeout(() => {
        errorDiv.style.opacity = '0';
        errorDiv.style.transition = 'opacity 0.5s ease';
        setTimeout(() => errorDiv.remove(), 500);
      }, 3000);
    }
  }

  // Return the app constructor
  return CalendarApp;
})();

// ============================================
// Initialize Application
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const app = new CalendarConverter();
  app.init();
  
  // Expose to global scope for debugging (remove in production)
  if (typeof window !== 'undefined' && process?.env?.NODE_ENV === 'development') {
    window.calendarApp = app;
  }
});

// Handle hot module replacement in development
if (module?.hot) {
  module.hot.accept();
}
