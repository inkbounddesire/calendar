(function() {
  "use strict";

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

  const ANCHOR_EARTH = new Date(Date.UTC(2264, 8, 23));
  const ANCHOR_VALEN_YEAR = 754;
  const ANCHOR_VALEN_DAY = 2;

  const epochEarth = new Date(Date.UTC(1970, 0, 1));
  const MS_PER_EARTH_DAY = 24 * 3600 * 1000;
  
  const anchorEarthDays = (ANCHOR_EARTH - epochEarth) / MS_PER_EARTH_DAY;
  const anchorValenTotal = (ANCHOR_VALEN_YEAR - 1) * VALEN_DAYS_PER_YEAR + (ANCHOR_VALEN_DAY - 1);
  const VALEN_DAY_EARTH_DAYS = VALEN_DAY_HOURS / EARTH_DAY_HOURS;

  let currentEarthYear = 2264;
  let currentEarthMonth = 8;
  let currentEarthDay = 23;
  let currentValenYear = 754;
  let currentValenDayOfYear = 2;
  let currentValenMonthIndex = 0;

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

  function getValenMonthFromDay(dayOfYear) {
    for (let i = 0; i < VALEN_MONTHS.length; i++) {
      const m = VALEN_MONTHS[i];
      if (dayOfYear >= m.startDay && dayOfYear < m.startDay + m.days) {
        return { index: i, name: m.name, days: m.days, startDay: m.startDay, type: m.type, dayInMonth: dayOfYear - m.startDay + 1 };
      }
    }
    return null;
  }

  function earthDaysFromDate(y, m, d) {
    return (new Date(Date.UTC(y, m, d)) - epochEarth) / MS_PER_EARTH_DAY;
  }

  function earthToValenTotal(earthDays) {
    return anchorValenTotal + (earthDays - anchorEarthDays) / VALEN_DAY_EARTH_DAYS;
  }

  function valenTotalToEarthDays(valenTotal) {
    return anchorEarthDays + (valenTotal - anchorValenTotal) * VALEN_DAY_EARTH_DAYS;
  }

  function earthToValen(y, m, d) {
    const total = earthToValenTotal(earthDaysFromDate(y, m, d));
    const year = Math.floor(total / VALEN_DAYS_PER_YEAR) + 1;
    const day = Math.floor(total % VALEN_DAYS_PER_YEAR) + 1;
    return { year, day };
  }

  function valenToEarth(y, dayOfYear) {
    const total = (y - 1) * VALEN_DAYS_PER_YEAR + (dayOfYear - 1);
    const earthDays = valenTotalToEarthDays(total);
    const date = new Date(epochEarth.getTime() + earthDays * MS_PER_EARTH_DAY);
    return { year: date.getUTCFullYear(), month: date.getUTCMonth(), day: date.getUTCDate() };
  }

  function renderEarthCalendar() {
    const year = currentEarthYear;
    const month = currentEarthMonth;
    const firstDay = new Date(Date.UTC(year, month, 1));
    let startOffset = (firstDay.getUTCDay() + 6) % 7;
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    
    earthMonthDisplay.textContent = `${monthNames[month]} ${year}`;
    
    let html = '';
    let cellCount = 0;
    for (let i = 0; i < startOffset; i++) {
      html += `<div class="cal-cell other-month"></div>`;
      cellCount++;
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const selected = (year === currentEarthYear && month === currentEarthMonth && d === currentEarthDay);
      html += `<div class="cal-cell ${selected ? 'highlight' : ''}" data-day="${d}">${d}</div>`;
      cellCount++;
    }
    while (cellCount < 42) {
      html += `<div class="cal-cell other-month"></div>`;
      cellCount++;
    }
    
    earthCalendarGrid.innerHTML = html;
    
    document.querySelectorAll('#earthCalendarGrid .cal-cell[data-day]').forEach(cell => {
      cell.addEventListener('click', () => {
        currentEarthDay = parseInt(cell.dataset.day);
        updateFromEarth();
      });
    });
  }

  function renderValenCalendar() {
    const month = VALEN_MONTHS[currentValenMonthIndex];
    const info = getValenMonthFromDay(currentValenDayOfYear);
    const selectedDayInMonth = info ? info.dayInMonth : 1;
    
    valenMonthDisplay.textContent = month.name;
    valenDayRange.textContent = `Day ${selectedDayInMonth} of ${month.days}`;
    
    if (month.type === 'lentar') {
      let html = `<div class="valen-grid lentar-grid">`;
      html += `<div class="grid-label"></div>`;
      for (let i = 1; i <= 9; i++) html += `<div class="weekday-header">${i}</div>`;
      
      html += `<div class="grid-label">Free</div>`;
      for (let i = 1; i <= 9; i++) {
        if (i <= 3) {
          const d = i;
          const selected = (d === selectedDayInMonth);
          html += `<div class="cal-cell free-day ${selected ? 'highlight' : ''}" data-vday="${month.startDay + d - 1}">${d}</div>`;
        } else {
          html += `<div class="cal-cell empty-cell"></div>`;
        }
      }
      
      for (let w = 1; w <= 16; w++) {
        html += `<div class="grid-label">Week ${w}</div>`;
        for (let wd = 1; wd <= 9; wd++) {
          const d = 3 + (w - 1) * 9 + wd;
          const selected = (d === selectedDayInMonth);
          html += `<div class="cal-cell ${selected ? 'highlight' : ''}" data-vday="${month.startDay + d - 1}">${d}</div>`;
        }
      }
      
      html += `<div class="grid-label">Free</div>`;
      for (let i = 1; i <= 9; i++) {
        if (i <= 3) {
          const d = 147 + i;
          const selected = (d === selectedDayInMonth);
          html += `<div class="cal-cell free-day ${selected ? 'highlight' : ''}" data-vday="${month.startDay + d - 1}">${d}</div>`;
        } else {
          html += `<div class="cal-cell empty-cell"></div>`;
        }
      }
      html += `</div>`;
      valenCalendarContainer.innerHTML = html;
    } else {
      let html = `<div class="inter-grid">`;
      for (let d = 1; d <= month.days; d++) {
        const selected = (d === selectedDayInMonth);
        html += `<div class="cal-cell ${selected ? 'highlight' : ''}" data-vday="${month.startDay + d - 1}">${d}</div>`;
      }
      html += `</div>`;
      valenCalendarContainer.innerHTML = html;
    }
    
    document.querySelectorAll('[data-vday]').forEach(cell => {
      cell.addEventListener('click', () => {
        currentValenDayOfYear = parseInt(cell.dataset.vday);
        updateFromValen();
      });
    });
  }

  function updateFromEarth() {
    const conv = earthToValen(currentEarthYear, currentEarthMonth, currentEarthDay);
    currentValenYear = conv.year;
    currentValenDayOfYear = conv.day;
    currentValenMonthIndex = getValenMonthFromDay(currentValenDayOfYear).index;
    updateUI();
  }

  function updateFromValen() {
    const earth = valenToEarth(currentValenYear, currentValenDayOfYear);
    currentEarthYear = earth.year;
    currentEarthMonth = earth.month;
    currentEarthDay = earth.day;
    updateUI();
  }

  function updateUI() {
    earthYearInput.value = currentEarthYear;
    earthMonthSelect.value = currentEarthMonth;
    earthDayInput.value = currentEarthDay;
    valenYearInput.value = currentValenYear;
    valenDayInput.value = currentValenDayOfYear;
    
    renderEarthCalendar();
    renderValenCalendar();
    
    const info = getValenMonthFromDay(currentValenDayOfYear);
    resultMain.innerHTML = `📌 ${currentEarthDay} ${monthNames[currentEarthMonth]} ${currentEarthYear} ⇢ Valen ${currentValenYear} · ${info.name} day ${info.dayInMonth} (day ${currentValenDayOfYear})`;
    resultDetails.innerHTML = `📐 1 Valen day = ${VALEN_DAY_HOURS.toFixed(3)}h · Year: 486 days`;
  }

  document.getElementById('earthPrevMonth').addEventListener('click', () => {
    if (currentEarthMonth === 0) { currentEarthMonth = 11; currentEarthYear--; }
    else { currentEarthMonth--; }
    const maxDays = new Date(Date.UTC(currentEarthYear, currentEarthMonth + 1, 0)).getUTCDate();
    if (currentEarthDay > maxDays) currentEarthDay = maxDays;
    updateFromEarth();
  });

  document.getElementById('earthNextMonth').addEventListener('click', () => {
    if (currentEarthMonth === 11) { currentEarthMonth = 0; currentEarthYear++; }
    else { currentEarthMonth++; }
    const maxDays = new Date(Date.UTC(currentEarthYear, currentEarthMonth + 1, 0)).getUTCDate();
    if (currentEarthDay > maxDays) currentEarthDay = maxDays;
    updateFromEarth();
  });

  earthYearInput.addEventListener('change', () => {
    currentEarthYear = parseInt(earthYearInput.value) || 2264;
    const maxDays = new Date(Date.UTC(currentEarthYear, currentEarthMonth + 1, 0)).getUTCDate();
    if (currentEarthDay > maxDays) currentEarthDay = maxDays;
    updateFromEarth();
  });

  earthMonthSelect.addEventListener('change', () => {
    currentEarthMonth = parseInt(earthMonthSelect.value);
    const maxDays = new Date(Date.UTC(currentEarthYear, currentEarthMonth + 1, 0)).getUTCDate();
    if (currentEarthDay > maxDays) currentEarthDay = maxDays;
    updateFromEarth();
  });

  earthDayInput.addEventListener('change', () => {
    currentEarthDay = parseInt(earthDayInput.value) || 1;
    const maxDays = new Date(Date.UTC(currentEarthYear, currentEarthMonth + 1, 0)).getUTCDate();
    if (currentEarthDay > maxDays) currentEarthDay = maxDays;
    updateFromEarth();
  });

  document.getElementById('valenPrevMonth').addEventListener('click', () => {
    if (currentValenMonthIndex > 0) { currentValenMonthIndex--; }
    else { currentValenYear--; currentValenMonthIndex = VALEN_MONTHS.length - 1; }
    currentValenDayOfYear = VALEN_MONTHS[currentValenMonthIndex].startDay;
    updateFromValen();
  });

  document.getElementById('valenNextMonth').addEventListener('click', () => {
    if (currentValenMonthIndex < VALEN_MONTHS.length - 1) { currentValenMonthIndex++; }
    else { currentValenYear++; currentValenMonthIndex = 0; }
    currentValenDayOfYear = VALEN_MONTHS[currentValenMonthIndex].startDay;
    updateFromValen();
  });

  valenYearInput.addEventListener('change', () => {
    currentValenYear = parseInt(valenYearInput.value) || 754;
    if (currentValenDayOfYear > VALEN_DAYS_PER_YEAR) currentValenDayOfYear = VALEN_DAYS_PER_YEAR;
    updateFromValen();
  });

  valenDayInput.addEventListener('change', () => {
    currentValenDayOfYear = parseInt(valenDayInput.value) || 1;
    if (currentValenDayOfYear > VALEN_DAYS_PER_YEAR) currentValenDayOfYear = VALEN_DAYS_PER_YEAR;
    updateFromValen();
  });

  updateUI();
})();
