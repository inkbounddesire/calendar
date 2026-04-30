// 29/04/2026 - Veronika Seneca
// ui.js — depends on all previous files + DOM elements

// State
let state = {
  earthYear: 2264, earthMonth: 8, earthDay: 23,
  valenYear: 754, valenDay: 2, valenMonthIdx: 0,
  valenTimeOfDay: 0,
  hemisphere: 'northern'
};

// DOM references
const el = {};

function initUI() {
  el.earthYear = document.getElementById('earthYear');
  el.earthMonth = document.getElementById('earthMonth');
  el.earthDay = document.getElementById('earthDay');
  el.earthMonthDisp = document.getElementById('earthMonthDisplay');
  el.earthGrid = document.getElementById('earthCalendarGrid');
  el.valenYear = document.getElementById('valenYear');
  el.valenDay = document.getElementById('valenDay');
  el.valenMonthDisp = document.getElementById('valenMonthDisplay');
  el.valenDayRange = document.getElementById('valenDayRange');
  el.valenContainer = document.getElementById('valenCalendarContainer');
  el.resultMain = document.getElementById('resultMainText');
  el.resultDetails = document.getElementById('resultDetails');
  el.valenMonth = document.getElementById('valenMonth');

  function rebuildValenMonthSelect() {
  const months = getValenMonths(state.valenYear);
  el.valenMonth.innerHTML = '';
  months.forEach((m, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = m.name;
    el.valenMonth.appendChild(opt);
  });
  el.valenMonth.value = state.valenMonthIdx;
}

  // Populate month select
  EARTH_MONTHS.forEach((m, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = m;
    el.earthMonth.appendChild(opt);
  });
  el.earthMonth.value = 8;

  rebuildValenMonthSelect();

  // Add hemisphere toggle button
  const earthPanel = document.querySelector('.panel:first-child h2');
  const hemisphereBtn = document.createElement('button');
  hemisphereBtn.textContent = '🌍 S. Hemisphere';
  hemisphereBtn.style.cssText = 'font-size: 0.8rem; padding: 4px 12px; margin-left: 10px; background: #d4cbb8; border-bottom-width: 2px;';
  hemisphereBtn.addEventListener('click', (e) => {
    e.preventDefault();
    state.hemisphere = state.hemisphere === 'northern' ? 'southern' : 'northern';
    hemisphereBtn.textContent = state.hemisphere === 'northern' ? '🌍 S. Hemisphere' : '🌏 N. Hemisphere';
    renderEarth();
    updateUI();
  });
  earthPanel.appendChild(hemisphereBtn);

  // Event listeners
  document.getElementById('earthPrevMonth').addEventListener('click', () => {
    if (state.earthMonth === 0) { state.earthMonth = 11; state.earthYear--; }
    else state.earthMonth--;
    const max = getEarthDaysInMonth(state.earthYear, state.earthMonth);
    if (state.earthDay > max) state.earthDay = max;
    updateFromEarth();
  });

  document.getElementById('earthNextMonth').addEventListener('click', () => {
    if (state.earthMonth === 11) { state.earthMonth = 0; state.earthYear++; }
    else state.earthMonth++;
    const max = getEarthDaysInMonth(state.earthYear, state.earthMonth);
    if (state.earthDay > max) state.earthDay = max;
    updateFromEarth();
  });

  el.earthYear.addEventListener('change', () => {
    state.earthYear = parseInt(el.earthYear.value) || 2264;
    const max = getEarthDaysInMonth(state.earthYear, state.earthMonth);
    if (state.earthDay > max) state.earthDay = max;
    updateFromEarth();
  });

  el.earthMonth.addEventListener('change', () => {
    state.earthMonth = parseInt(el.earthMonth.value);
    const max = getEarthDaysInMonth(state.earthYear, state.earthMonth);
    if (state.earthDay > max) state.earthDay = max;
    updateFromEarth();
  });

  el.earthDay.addEventListener('change', () => {
    state.earthDay = parseInt(el.earthDay.value) || 1;
    const max = getEarthDaysInMonth(state.earthYear, state.earthMonth);
    if (state.earthDay > max) state.earthDay = max;
    updateFromEarth();
  });

  document.getElementById('valenPrevMonth').addEventListener('click', () => {
    const months = getValenMonths(state.valenYear);
    if (state.valenMonthIdx > 0) state.valenMonthIdx--;
    else { state.valenYear--; state.valenMonthIdx = getValenMonths(state.valenYear).length - 1; }
    state.valenDay = getValenMonths(state.valenYear)[state.valenMonthIdx].start;
    state.valenTimeOfDay = 0;
    updateFromValen();
  });

  document.getElementById('valenNextMonth').addEventListener('click', () => {
    const months = getValenMonths(state.valenYear);
    if (state.valenMonthIdx < months.length - 1) state.valenMonthIdx++;
    else { state.valenYear++; state.valenMonthIdx = 0; }
    state.valenDay = getValenMonths(state.valenYear)[state.valenMonthIdx].start;
    state.valenTimeOfDay = 0;
    updateFromValen();
  });

  el.valenYear.addEventListener('change', () => {
    state.valenYear = parseInt(el.valenYear.value) || 754;
    const max = getValenDaysInYear(state.valenYear);
    if (state.valenDay > max) state.valenDay = max;
    state.valenTimeOfDay = 0;
    rebuildValenMonthSelect();
    updateFromValen();
  });

  el.valenMonth.addEventListener('change', () => {
  state.valenMonthIdx = parseInt(el.valenMonth.value);
  const months = getValenMonths(state.valenYear);
  const month = months[state.valenMonthIdx];
  state.valenDay = month.start;
  state.valenTimeOfDay = 0;
  updateFromValen();
});

  el.valenDay.addEventListener('change', () => {
  const months = getValenMonths(state.valenYear);
  const month = months[state.valenMonthIdx];
  const dayInMonth = parseInt(el.valenDay.value) || 1;
  state.valenDay = month.start + Math.min(Math.max(dayInMonth, 1), month.days) - 1;
  state.valenTimeOfDay = 0;
  updateFromValen();
});
}

function renderEarth() {
  const { earthYear, earthMonth, earthDay } = state;
  const firstDay = new Date(Date.UTC(earthYear, earthMonth, 1));
  let offset = (firstDay.getUTCDay() + 6) % 7;
  const daysInMonth = getEarthDaysInMonth(earthYear, earthMonth);

  const isLeap = isEarthLeap(earthYear);
  const leapText = (earthMonth === 1 && isLeap) ? ' (leap)' : '';
  el.earthMonthDisp.textContent = `${EARTH_MONTHS[earthMonth]} ${earthYear}${leapText}`;

  let html = '';
  for (let i = 0; i < offset; i++) html += `<div class="cal-cell other-month"></div>`;

  for (let d = 1; d <= daysInMonth; d++) {
    const sel = (d === earthDay);
    const season = getEarthSeasonForDate(earthYear, earthMonth, d, state.hemisphere);
    const seasonStyle = season ? `background: ${season.color};` : '';
    const tooltip = season ? season.hover : '';

    html += `<div class="cal-cell ${sel ? 'highlight' : ''}" data-day="${d}" style="${seasonStyle}" title="${tooltip}">${d}</div>`;
  }

  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;
  for (let i = offset + daysInMonth; i < totalCells; i++) html += `<div class="cal-cell other-month"></div>`;

  el.earthGrid.innerHTML = html;

  document.querySelectorAll('#earthCalendarGrid .cal-cell[data-day]').forEach(c => {
    c.addEventListener('click', () => {
      state.earthDay = parseInt(c.dataset.day);
      updateFromEarth();
    });
  });
}

function renderValen() {
  const { valenYear, valenDay, valenTimeOfDay } = state;
  const months = getValenMonths(valenYear);
  const info = getValenMonthInfo(valenYear, valenDay);
  const month = months[info.index];
  const selDay = info.dayInMonth;

  state.valenMonthIdx = info.index;

  const isLeap = isValenLeap(valenYear);
  const leapNote = (month.name === "Inter Two" && isLeap) ? ' (leap +2)' : '';
  const season = getValenSeasonForDate(valenYear, valenDay);
  const seasonName = season ? ` · ${season.name}` : '';
  el.valenMonthDisp.textContent = month.name + leapNote;

  const timeStr = formatTimeOfDay(valenTimeOfDay);
  el.valenDayRange.textContent = `Day ${selDay} of ${month.days}${seasonName} · ${timeStr}`;

  if (month.type === 'lentar') {
    let html = `<div class="valen-grid lentar-grid">`;
    html += `<div class="grid-label"></div>`;
    for (let i = 1; i <= 9; i++) html += `<div class="weekday-header valen">${i}</div>`;

    html += `<div class="grid-label">Free</div>`;
    for (let i = 1; i <= 9; i++) {
      if (i <= 3) {
        const d = i;
        const dayOfYear = month.start + d - 1;
        const cellSeason = getValenSeasonForDate(valenYear, dayOfYear);
        const seasonStyle = cellSeason ? `background: ${cellSeason.color};` : '';
        const tooltip = cellSeason ? cellSeason.hover : '';
        html += `<div class="cal-cell free-day ${d === selDay ? 'highlight' : ''}" data-vday="${dayOfYear}" style="${seasonStyle}" title="${tooltip}">${d}</div>`;
      } else {
        html += `<div class="cal-cell empty-cell"></div>`;
      }
    }

    for (let w = 1; w <= 16; w++) {
      html += `<div class="grid-label">Week ${w}</div>`;
      for (let wd = 1; wd <= 9; wd++) {
        const d = 3 + (w - 1) * 9 + wd;
        const dayOfYear = month.start + d - 1;
        const cellSeason = getValenSeasonForDate(valenYear, dayOfYear);
        const seasonStyle = cellSeason ? `background: ${cellSeason.color};` : '';
        const tooltip = cellSeason ? cellSeason.hover : '';
        html += `<div class="cal-cell ${d === selDay ? 'highlight' : ''}" data-vday="${dayOfYear}" style="${seasonStyle}" title="${tooltip}">${d}</div>`;
      }
    }

    html += `<div class="grid-label">Free</div>`;
    for (let i = 1; i <= 9; i++) {
      if (i <= 3) {
        const d = 147 + i;
        const dayOfYear = month.start + d - 1;
        const cellSeason = getValenSeasonForDate(valenYear, dayOfYear);
        const seasonStyle = cellSeason ? `background: ${cellSeason.color};` : '';
        const tooltip = cellSeason ? cellSeason.hover : '';
        html += `<div class="cal-cell free-day ${d === selDay ? 'highlight' : ''}" data-vday="${dayOfYear}" style="${seasonStyle}" title="${tooltip}">${d}</div>`;
      } else {
        html += `<div class="cal-cell empty-cell"></div>`;
      }
    }
    html += `</div>`;
    el.valenContainer.innerHTML = html;
  } else {
    let html = `<div class="inter-grid">`;
    for (let d = 1; d <= month.days; d++) {
      const dayOfYear = month.start + d - 1;
      const extra = (month.name === "Inter Two" && isLeap && d > 12) ? 'leap-day' : '';
      const cellSeason = getValenSeasonForDate(valenYear, dayOfYear);
      const seasonStyle = cellSeason ? `background: ${cellSeason.color};` : '';
      const tooltip = cellSeason ? cellSeason.hover : '';
      html += `<div class="cal-cell ${extra} ${d === selDay ? 'highlight' : ''}" data-vday="${dayOfYear}" style="${seasonStyle}" title="${tooltip}">${d}</div>`;
    }
    html += `</div>`;
    el.valenContainer.innerHTML = html;
  }

  document.querySelectorAll('[data-vday]').forEach(c => {
    c.addEventListener('click', () => {
      state.valenDay = parseInt(c.dataset.vday);
      state.valenTimeOfDay = 0;
      updateFromValen();
    });
  });
}

function updateFromEarth() {
  const conv = earthToValen(state.earthYear, state.earthMonth, state.earthDay);
  state.valenYear = conv.year;
  state.valenDay = conv.day;
  state.valenTimeOfDay = conv.timeOfDay;
  updateUI();
}

function updateFromValen() {
  const earth = valenToEarth(state.valenYear, state.valenDay);
  state.earthYear = earth.year;
  state.earthMonth = earth.month;
  state.earthDay = earth.day;
  updateUI();
}

function updateUI() {
   el.earthYear.value = state.earthYear;
  el.earthMonth.value = state.earthMonth;
  el.earthDay.value = state.earthDay;
  el.valenYear.value = state.valenYear;
  el.valenMonth.value = state.valenMonthIdx;
  const currentMonth = getValenMonths(state.valenYear)[state.valenMonthIdx];
  const dayInMonth = state.valenDay - currentMonth.start + 1;
  el.valenDay.value = dayInMonth;

  renderEarth();
  renderValen();
  
  const info = getValenMonthInfo(state.valenYear, state.valenDay);
  const timeStr = formatTimeOfDay(state.valenTimeOfDay);
  const earthSeason = getEarthSeasonForDate(state.earthYear, state.earthMonth, state.earthDay, state.hemisphere);
  const earthSeasonName = earthSeason ? earthSeason.name : '';
  const valenSeason = getValenSeasonForDate(state.valenYear, state.valenDay);
  const valenSeasonName = valenSeason ? valenSeason.name : '';

  el.resultMain.innerHTML = `📌 ${state.earthDay} ${EARTH_MONTHS[state.earthMonth]} ${state.earthYear} (${earthSeasonName}) ⇢ Valen ${state.valenYear} · ${info.name} day ${info.dayInMonth} (${valenSeasonName}) ${timeStr}`;

  const hourDiff = (state.valenTimeOfDay * VALEN_DAY_HOURS).toFixed(1);
  const hemiText = state.hemisphere === 'northern' ? 'N. Hemisphere' : 'S. Hemisphere';
  el.resultDetails.innerHTML = `📐 1 Valen day = ${VALEN_DAY_HOURS.toFixed(3)}h · ${hemiText} · Offset: +${hourDiff}h`;
}
