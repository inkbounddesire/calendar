// Main application controller
(function() {
  "use strict";

  // Calculate anchor values
  const anchorEarthDays = (ANCHOR_EARTH - EPOCH_EARTH) / MS_PER_EARTH_DAY;
  const anchorValenTotal = getValenTotalDaysBeforeYear(ANCHOR_VALEN_YEAR) + (ANCHOR_VALEN_DAY - 1);
  const VALEN_DAY_EARTH_DAYS = VALEN_DAY_HOURS / EARTH_DAY_HOURS;

  // Application state
  const state = {
    earthYear: 2264,
    earthMonth: 8,
    earthDay: 23,
    valenYear: 754,
    valenDayOfYear: 2,
    valenMonthIndex: 0
  };

  // DOM Elements
  const elements = {
    earthYear: document.getElementById('earthYear'),
    earthMonth: document.getElementById('earthMonth'),
    earthDay: document.getElementById('earthDay'),
    earthMonthDisplay: document.getElementById('earthMonthDisplay'),
    earthCalendarGrid: document.getElementById('earthCalendarGrid'),
    earthPrev: document.getElementById('earthPrevMonth'),
    earthNext: document.getElementById('earthNextMonth'),
    
    valenYear: document.getElementById('valenYear'),
    valenDay: document.getElementById('valenDay'),
    valenMonthDisplay: document.getElementById('valenMonthDisplay'),
    valenDayRange: document.getElementById('valenDayRange'),
    valenCalendarContainer: document.getElementById('valenCalendarContainer'),
    valenPrev: document.getElementById('valenPrevMonth'),
    valenNext: document.getElementById('valenNextMonth'),
    
    resultMain: document.getElementById('resultMainText'),
    resultDetails: document.getElementById('resultDetails')
  };

  // Initialize month select
  populateEarthMonthSelect(elements.earthMonth, state.earthMonth);

  // Update functions
  function updateFromEarth() {
    const conv = earthToValen(
      state.earthYear, state.earthMonth, state.earthDay,
      anchorEarthDays, anchorValenTotal, VALEN_DAY_EARTH_DAYS
    );
    state.valenYear = conv.year;
    state.valenDayOfYear = conv.day;
    const info = getValenMonthFromDay(state.valenYear, state.valenDayOfYear);
    if (info) state.valenMonthIndex = info.index;
    updateUI();
  }

  function updateFromValen() {
    const earth = valenToEarth(
      state.valenYear, state.valenDayOfYear,
      anchorEarthDays, anchorValenTotal, VALEN_DAY_EARTH_DAYS
    );
    state.earthYear = earth.year;
    state.earthMonth = earth.month;
    state.earthDay = earth.day;
    updateUI();
  }

  function updateUI() {
    // Update input values
    elements.earthYear.value = state.earthYear;
    elements.earthMonth.value = state.earthMonth;
    elements.earthDay.value = state.earthDay;
    elements.valenYear.value = state.valenYear;
    elements.valenDay.value = state.valenDayOfYear;
    
    // Render calendars
    renderEarthCalendar(state, elements);
    renderValenCalendar(state, elements);
    
    // Update result display
    updateResultDisplay(state, elements);
    
    // Re-attach earth calendar listeners
    document.querySelectorAll('#earthCalendarGrid .cal-cell[data-day]').forEach(cell => {
      cell.addEventListener('click', () => {
        state.earthDay = parseInt(cell.dataset.day);
        updateFromEarth();
      });
    });
    
    // Re-attach valen calendar listeners
    document.querySelectorAll('[data-vday]').forEach(cell => {
      cell.addEventListener('click', () => {
        state.valenDayOfYear = parseInt(cell.dataset.vday);
        updateFromValen();
      });
    });
  }

  // Event listeners
  elements.earthPrev.addEventListener('click', () => {
    if (state.earthMonth === 0) {
      state.earthMonth = 11;
      state.earthYear--;
    } else {
      state.earthMonth--;
    }
    const maxDays = getEarthDaysInMonth(state.earthYear, state.earthMonth);
    if (state.earthDay > maxDays) state.earthDay = maxDays;
    updateFromEarth();
  });

  elements.earthNext.addEventListener('click', () => {
    if (state.earthMonth === 11) {
      state.earthMonth = 0;
      state.earthYear++;
    } else {
      state.earthMonth++;
    }
    const maxDays = getEarthDaysInMonth(state.earthYear, state.earthMonth);
    if (state.earthDay > maxDays) state.earthDay = maxDays;
    updateFromEarth();
  });

  elements.earthYear.addEventListener('change', () => {
    state.earthYear = parseInt(elements.earthYear.value) || 2264;
    const maxDays = getEarthDaysInMonth(state.earthYear, state.earthMonth);
    if (state.earthDay > maxDays) state.earthDay = maxDays;
    updateFromEarth();
  });

  elements.earthMonth.addEventListener('change', () => {
    state.earthMonth = parseInt(elements.earthMonth.value);
    const maxDays = getEarthDaysInMonth(state.earthYear, state.earthMonth);
    if (state.earthDay > maxDays) state.earthDay = maxDays;
    updateFromEarth();
  });

  elements.earthDay.addEventListener('change', () => {
    state.earthDay = parseInt(elements.earthDay.value) || 1;
    const maxDays = getEarthDaysInMonth(state.earthYear, state.earthMonth);
    if (state.earthDay > maxDays) state.earthDay = maxDays;
    updateFromEarth();
  });

  elements.valenPrev.addEventListener('click', () => {
    const months = getValenMonthsForYear(state.valenYear);
    if (state.valenMonthIndex > 0) {
      state.valenMonthIndex--;
    } else {
      state.valenYear--;
      state.valenMonthIndex = getValenMonthsForYear(state.valenYear).length - 1;
    }
    const month = getValenMonthsForYear(state.valenYear)[state.valenMonthIndex];
    state.valenDayOfYear = month.startDay;
    updateFromValen();
  });

  elements.valenNext.addEventListener('click', () => {
    const months = getValenMonthsForYear(state.valenYear);
    if (state.valenMonthIndex < months.length - 1) {
      state.valenMonthIndex++;
    } else {
      state.valenYear++;
      state.valenMonthIndex = 0;
    }
    const month = getValenMonthsForYear(state.valenYear)[state.valenMonthIndex];
    state.valenDayOfYear = month.startDay;
    updateFromValen();
  });

  elements.valenYear.addEventListener('change', () => {
    state.valenYear = parseInt(elements.valenYear.value) || 754;
    const maxDay = getValenDaysPerYear(state.valenYear);
    if (state.valenDayOfYear > maxDay) state.valenDayOfYear = maxDay;
    const info = getValenMonthFromDay(state.valenYear, state.valenDayOfYear);
    if (info) state.valenMonthIndex = info.index;
    updateFromValen();
  });

  elements.valenDay.addEventListener('change', () => {
    state.valenDayOfYear = parseInt(elements.valenDay.value) || 1;
    const maxDay = getValenDaysPerYear(state.valenYear);
    if (state.valenDayOfYear > maxDay) state.valenDayOfYear = maxDay;
    const info = getValenMonthFromDay(state.valenYear, state.valenDayOfYear);
    if (info) state.valenMonthIndex = info.index;
    updateFromValen();
  });

  // Initialize
  updateUI();
})();
