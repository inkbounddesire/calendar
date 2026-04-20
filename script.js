(function() {
  "use strict";

  // ---------- CONSTANTS ----------
  const VALEN_DAYS_PER_YEAR = 486;
  const VALEN_DAY_HOURS = 20 + 47/60;
  const EARTH_DAY_HOURS = 24;

  const VALEN_MONTHS = [
    { name: "First Len'tar", days: 150, startDay: 1, type: 'lentar' },
    { name: "Inter One", days: 12, startDay: 151, type: 'inter' },
    { name: "Second Len'tar", days: 150, startDay: 163, type: 'lentar' },
    { name: "Inter Two", days: 12, startDay: 313, type: 'inter' },
    { name: "Third Len'tar", days: 150, startDay: 325, type: 'lentar' },
    { name: "Inter Three", days: 12, startDay: 475, type: 'inter' }
  ];

  const ANCHOR_EARTH = new Date(Date.UTC(2264, 8, 23, 0, 0, 0, 0));
  const ANCHOR_VALEN_YEAR = 754;
  const ANCHOR_VALEN_DAY = 2;

  const epochEarth = new Date(Date.UTC(1970, 0, 1, 0, 0, 0, 0));
  const MS_PER_EARTH_DAY = EARTH_DAY_HOURS * 3600 * 1000;
  
  const anchorEarthDaysSinceEpoch = (ANCHOR_EARTH.getTime() - epochEarth.getTime()) / MS_PER_EARTH_DAY;
  const anchorValenTotalDays = (ANCHOR_VALEN_YEAR - 1) * VALEN_DAYS_PER_YEAR + (ANCHOR_VALEN_DAY - 1);
  const VALEN_DAY_EARTH_DAYS = VALEN_DAY_HOURS / EARTH_DAY_HOURS;

  // ---------- HELPERS ----------
  function earthDaysFromDate(year, month, day) {
    const d = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    return (d.getTime() - epochEarth.getTime()) / MS_PER_EARTH_DAY;
  }

  function earthDaysToValenTotal(earthDays) {
    const deltaEarth = earthDays - anchorEarthDaysSinceEpoch;
    const deltaValen = deltaEarth / VALEN_DAY_EARTH_DAYS;
    return anchorValenTotalDays + deltaValen;
  }

  function valenTotalToEarthDays(valenTotal) {
    const deltaValen = valenTotal - anchorValenTotalDays;
    const deltaEarth = deltaValen * VALEN_DAY_EARTH_DAYS;
    return anchorEarthDaysSinceEpoch + deltaEarth;
  }

  function valenTotalToYearDay(valenTotal) {
    let total = Math.floor(valenTotal);
    const year = Math.floor(total / VALEN_DAYS_PER_YEAR) + 1;
    const dayOfYear = (total % VALEN_DAYS_PER_YEAR) + 1;
    return { year, day: dayOfYear };
  }

  function earthDaysToUTCDate(earthDays) {
    const ms = epochEarth.getTime() + earthDays * MS_PER_EARTH_DAY;
    return new Date(ms);
  }

  function getValenMonthFromDay(dayOfYear) {
    for (let i = 0; i < VALEN_MONTHS.length; i++) {
      const month = VALEN_MONTHS[i];
      if (dayOfYear >= month.startDay && dayOfYear < month.startDay + month.days) {
        return {
          index: i,
          name: month.name,
          days: month.days,
          startDay: month.startDay,
          type: month.type,
          dayInMonth: dayOfYear - month.startDay + 1
        };
      }
    }
    return null;
  }

  // ---------- UI STATE ----------
  let currentEarthYear = 2264;
  let currentEarthMonth = 8;
  let currentEarthDay = 23;
  
  let currentValenYear = 754;
  let currentValenDayOfYear = 2;
  let currentValenMonthIndex = 0;

  // DOM elements
  const earthYearInput = document.getElementById('earthYear');
  const earthMonthSelect = document.getElementById('earthMonth');
  const earthDayInput = document.getElementById('earthDay');
  const earthMonthDisplay = document.getElementById('earthMonthDisplay');
  const earthCalendarGrid = document.getElementById('earthCalendarGrid');
  const valenYearInput = document.getElementById('valenYear');
  const valenDayInput = document.getElementById('valenDay');
  const valenMonthDisplay = document.getElementById('valenMonthDisplay');
  const valenDayRange = document.getElementById('valenDayRange');
  const valenCalendarContainer = document.getElementById('valenCalendarContainer');
  const resultMain = document.getElementById('resultMainText');
  const resultDetails = document.getElementById('resultDetails');

  const earthPrev = document.getElementById('earthPrevMonth');
  const earthNext = document.getElementById('earthNextMonth');
  const earthToValenBtn = document.getElementById('earthToValenBtn');
  const valenToEarthBtn = document.getElementById('valenToEarthBtn');
  const valenPrevMonth = document.getElementById('valenPrevMonth');
  const valenNextMonth = document.getElementById('valenNextMonth');

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  
  function populateMonthSelect() {
    earthMonthSelect.innerHTML = '';
    monthNames.forEach((m, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = m;
      earthMonthSelect.appendChild(opt);
    });
    earthMonthSelect.value = currentEarthMonth;
  }
  populateMonthSelect();

  function updateValenMonthFromDay() {
    const monthInfo = getValenMonthFromDay(currentValenDayOfYear);
    if (monthInfo) {
      currentValenMonthIndex = monthInfo.index;
    }
  }

  // ---------- RENDER EARTH ----------
  function renderEarthCalendar() {
    const year = currentEarthYear;
    const month = currentEarthMonth;
    const firstDay = new Date(Date.UTC(year, month, 1, 0, 0, 0));
    let startOffset = (firstDay.getUTCDay() + 6) % 7;
    const daysInMonth = new Date(Date.UTC(year, month+1, 0)).getUTCDate();
    
    earthMonthDisplay.textContent = `${monthNames[month]} ${year}`;
    
    let gridHtml = '';
    let cellCount = 0;
    for (let i=0; i<startOffset; i++) {
      gridHtml += `<div class="cal-cell other-month"></div>`;
      cellCount++;
    }
    
    for (let d=1; d<=daysInMonth; d++) {
      const isSelected = (year === currentEarthYear && month === currentEarthMonth && d === currentEarthDay);
      gridHtml += `<div class="cal-cell ${isSelected ? 'highlight' : ''}" data-day="${d}">${d}</div>`;
      cellCount++;
    }
    
    while (cellCount < 42) {
      gridHtml += `<div class="cal-cell other-month"></div>`;
      cellCount++;
    }
    
    earthCalendarGrid.innerHTML = gridHtml;
    
    document.querySelectorAll('#earthCalendarGrid .cal-cell[data-day]').forEach(cell => {
      cell.addEventListener('click', (e) => {
        const day = parseInt(cell.dataset.day, 10);
        currentEarthDay = day;
        earthDayInput.value = day;
        renderEarthCalendar();
        updateFromEarth();
      });
    });
  }

  function updateEarthUI() {
    earthYearInput.value = currentEarthYear;
    earthMonthSelect.value = currentEarthMonth;
    earthDayInput.value = currentEarthDay;
    renderEarthCalendar();
  }

  // ---------- RENDER VALEN ----------
  function renderValenCalendar() {
    const month = VALEN_MONTHS[currentValenMonthIndex];
    const monthInfo = getValenMonthFromDay(currentValenDayOfYear);
    const selectedDayInMonth = monthInfo ? monthInfo.dayInMonth : 1;
    
    valenMonthDisplay.textContent = month.name;
    valenDayRange.textContent = `Day ${selectedDayInMonth} of ${month.days}`;
    
    if (month.type === 'lentar') {
      renderLentarGrid(month, selectedDayInMonth);
    } else {
      renderInterGrid(month, selectedDayInMonth);
    }
  }

  function renderLentarGrid(month, selectedDayInMonth) {
    let html = `<div class="valen-calendar-wrapper">`;
    
    html += `<div class="valen-grid lentar-grid">`;
    html += `<div class="grid-label"></div>`;
    for (let i = 1; i <= 9; i++) {
      html += `<div class="weekday-header valen">${i}</div>`;
    }
    
    // Free days row 1 (days 1-3)
    html += `<div class="grid-label free-label">Free</div>`;
    for (let i = 1; i <= 9; i++) {
      if (i <= 3) {
        const dayNum = i;
        const dayOfYear = month.startDay + dayNum - 1;
        const isSelected = (dayNum === selectedDayInMonth);
        html += `<div class="cal-cell free-day ${isSelected ? 'highlight' : ''}" data-valenday="${dayOfYear}">${dayNum}</div>`;
      } else {
        html += `<div class="cal-cell empty-cell"></div>`;
      }
    }
    
    // 16 weeks of 9 days
    for (let week = 1; week <= 16; week++) {
      html += `<div class="grid-label">Week ${week}</div>`;
      for (let wd = 1; wd <= 9; wd++) {
        const dayNum = 3 + (week - 1) * 9 + wd;
        const dayOfYear = month.startDay + dayNum - 1;
        const isSelected = (dayNum === selectedDayInMonth);
        html += `<div class="cal-cell ${isSelected ? 'highlight' : ''}" data-valenday="${dayOfYear}">${dayNum}</div>`;
      }
    }
    
    // Free days row 2 (days 148-150)
    html += `<div class="grid-label free-label">Free</div>`;
    for (let i = 1; i <= 9; i++) {
      if (i <= 3) {
        const dayNum = 147 + i;
        const dayOfYear = month.startDay + dayNum - 1;
        const isSelected = (dayNum === selectedDayInMonth);
        html += `<div class="cal-cell free-day ${isSelected ? 'highlight' : ''}" data-valenday="${dayOfYear}">${dayNum}</div>`;
      } else {
        html += `<div class="cal-cell empty-cell"></div>`;
      }
    }
    
    html += `</div></div>`;
    valenCalendarContainer.innerHTML = html;
    
    document.querySelectorAll('[data-valenday]').forEach(cell => {
      cell.addEventListener('click', (e) => {
        const dayOfYear = parseInt(cell.dataset.valenday, 10);
        currentValenDayOfYear = dayOfYear;
        valenDayInput.value = dayOfYear;
        updateValenMonthFromDay();
        renderValenCalendar();
        updateFromValen();
      });
    });
  }

  function renderInterGrid(month, selectedDayInMonth) {
    let html = `<div class="valen-calendar-wrapper">`;
    html += `<div class="inter-grid">`;
    
    for (let d = 1; d <= month.days; d++) {
      const dayOfYear = month.startDay + d - 1;
      const isSelected = (d === selectedDayInMonth);
      html += `<div class="cal-cell inter-cell ${isSelected ? 'highlight' : ''}" data-valenday="${dayOfYear}">${d}</div>`;
    }
    
    html += `</div></div>`;
    valenCalendarContainer.innerHTML = html;
    
    document.querySelectorAll('[data-valenday]').forEach(cell => {
      cell.addEventListener('click', (e) => {
        const dayOfYear = parseInt(cell.dataset.valenday, 10);
        currentValenDayOfYear = dayOfYear;
        valenDayInput.value = dayOfYear;
        updateValenMonthFromDay();
        renderValenCalendar();
        updateFromValen();
      });
    });
  }

  function updateValenUI() {
    valenYearInput.value = currentValenYear;
    valenDayInput.value = currentValenDayOfYear;
    updateValenMonthFromDay();
    renderValenCalendar();
  }

  // ---------- CONVERSION ----------
  function earthToValen(year, month, day) {
    const earthDays = earthDaysFromDate(year, month, day);
    const valenTotal = earthDaysToValenTotal(earthDays);
    return valenTotalToYearDay(valenTotal);
  }

  function valenToEarth(valenYear, valenDayOfYear) {
    const totalValen = (valenYear - 1) * VALEN_DAYS_PER_YEAR + (valenDayOfYear - 1);
    const earthDays = valenTotalToEarthDays(totalValen);
    const date = earthDaysToUTCDate(earthDays);
    return { year: date.getUTCFullYear(), month: date.getUTCMonth(), day: date.getUTCDate() };
  }

  function updateFromEarth() {
    try {
      const conv = earthToValen(currentEarthYear, currentEarthMonth, currentEarthDay);
      currentValenYear = conv.year;
      currentValenDayOfYear = conv.day;
      updateValenUI();
      displayResult();
    } catch(e) { console.warn(e); }
  }

  function updateFromValen() {
    try {
      const earth = valenToEarth(currentValenYear, currentValenDayOfYear);
      currentEarthYear = earth.year;
      currentEarthMonth = earth.month;
      currentEarthDay = earth.day;
      updateEarthUI();
      displayResult();
    } catch(e) { console.warn(e); }
  }

  function displayResult() {
    const earthDateStr = `${currentEarthDay} ${monthNames[currentEarthMonth]} ${currentEarthYear}`;
    const monthInfo = getValenMonthFromDay(currentValenDayOfYear);
    const monthName = monthInfo ? monthInfo.name : '';
    const dayInMonth = monthInfo ? monthInfo.dayInMonth : currentValenDayOfYear;
    
    const valenStr = `Valen ${currentValenYear} · ${monthName} day ${dayInMonth} (day ${currentValenDayOfYear} of year)`;
    resultMain.innerHTML = `🌍 ${earthDateStr} ⇢ 🪐 ${valenStr}`;
    
    const earthDays = earthDaysFromDate(currentEarthYear, currentEarthMonth, currentEarthDay);
    const valenTotal = earthDaysToValenTotal(earthDays);
    const precise = valenTotal - (currentValenYear-1)*VALEN_DAYS_PER_YEAR;
    resultDetails.innerHTML = `📐 precise Valen day: ${precise.toFixed(4)} · 1 Valen day = ${VALEN_DAY_HOURS.toFixed(3)}h`;
  }

  // ---------- EVENT LISTENERS ----------
  earthPrev.addEventListener('click', () => {
    if (currentEarthMonth === 0) { currentEarthMonth = 11; currentEarthYear -= 1; }
    else { currentEarthMonth -= 1; }
    const daysInNew = new Date(Date.UTC(currentEarthYear, currentEarthMonth+1, 0)).getUTCDate();
    if (currentEarthDay > daysInNew) currentEarthDay = daysInNew;
    updateEarthUI(); updateFromEarth();
  });
  
  earthNext.addEventListener('click', () => {
    if (currentEarthMonth === 11) { currentEarthMonth = 0; currentEarthYear += 1; }
    else { currentEarthMonth += 1; }
    const daysInNew = new Date(Date.UTC(currentEarthYear, currentEarthMonth+1, 0)).getUTCDate();
    if (currentEarthDay > daysInNew) currentEarthDay = daysInNew;
    updateEarthUI(); updateFromEarth();
  });

  earthYearInput.addEventListener('change', () => {
    let y = parseInt(earthYearInput.value, 10); if (isNaN(y)||y<1) y=2264;
    currentEarthYear = y;
    const daysInMonth = new Date(Date.UTC(currentEarthYear, currentEarthMonth+1, 0)).getUTCDate();
    if (currentEarthDay > daysInMonth) currentEarthDay = daysInMonth;
    updateEarthUI(); updateFromEarth();
  });
  
  earthMonthSelect.addEventListener('change', () => {
    currentEarthMonth = parseInt(earthMonthSelect.value, 10);
    const daysInMonth = new Date(Date.UTC(currentEarthYear, currentEarthMonth+1, 0)).getUTCDate();
    if (currentEarthDay > daysInMonth) currentEarthDay = daysInMonth;
    updateEarthUI(); updateFromEarth();
  });
  
  earthDayInput.addEventListener('change', () => {
    let d = parseInt(earthDayInput.value, 10);
    const maxDays = new Date(Date.UTC(currentEarthYear, currentEarthMonth+1, 0)).getUTCDate();
    if (isNaN(d)||d<1) d=1; if (d>maxDays) d=maxDays;
    currentEarthDay = d;
    updateEarthUI(); updateFromEarth();
  });

  earthToValenBtn.addEventListener('click', updateFromEarth);
  
  valenPrevMonth.addEventListener('click', () => {
    if (currentValenMonthIndex > 0) {
      currentValenMonthIndex--;
    } else {
      currentValenYear--;
      currentValenMonthIndex = VALEN_MONTHS.length - 1;
    }
    const month = VALEN_MONTHS[currentValenMonthIndex];
    currentValenDayOfYear = month.startDay;
    valenDayInput.value = currentValenDayOfYear;
    updateValenUI();
    updateFromValen();
  });
  
  valenNextMonth.addEventListener('click', () => {
    if (currentValenMonthIndex < VALEN_MONTHS.length - 1) {
      currentValenMonthIndex++;
    } else {
      currentValenYear++;
      currentValenMonthIndex = 0;
    }
    const month = VALEN_MONTHS[currentValenMonthIndex];
    currentValenDayOfYear = month.startDay;
    valenDayInput.value = currentValenDayOfYear;
    updateValenUI();
    updateFromValen();
  });
  
  valenYearInput.addEventListener('change', () => {
    let y = parseInt(valenYearInput.value, 10); if (isNaN(y)||y<1) y=754;
    currentValenYear = y;
    if (currentValenDayOfYear > VALEN_DAYS_PER_YEAR) currentValenDayOfYear = VALEN_DAYS_PER_YEAR;
    updateValenUI(); updateFromValen();
  });
  
  valenDayInput.addEventListener('change', () => {
    let d = parseInt(valenDayInput.value, 10);
    if (isNaN(d)||d<1) d=1; if (d>VALEN_DAYS_PER_YEAR) d=VALEN_DAYS_PER_YEAR;
    currentValenDayOfYear = d;
    updateValenUI(); updateFromValen();
  });
  
  valenToEarthBtn.addEventListener('click', updateFromValen);

  function initialize() {
    currentEarthYear = 2264; currentEarthMonth = 8; currentEarthDay = 23;
    currentValenYear = 754; currentValenDayOfYear = 2;
    updateValenMonthFromDay();
    updateEarthUI();
    updateValenUI();
    displayResult();
  }
  initialize();
})();
