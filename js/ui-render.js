// UI Rendering functions

function populateEarthMonthSelect(selectElement, currentMonth) {
  selectElement.innerHTML = '';
  EARTH_MONTH_NAMES.forEach((name, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = name;
    selectElement.appendChild(opt);
  });
  selectElement.value = currentMonth;
}

function renderEarthCalendar(state, elements) {
  const { year, month, day } = state;
  const firstDay = new Date(Date.UTC(year, month, 1));
  const startOffset = (firstDay.getUTCDay() + 6) % 7;
  const daysInMonth = getEarthDaysInMonth(year, month);
  
  const isLeap = isEarthLeapYear(year);
  const leapDisplay = (month === 1 && isLeap) ? ' (leap)' : '';
  elements.monthDisplay.textContent = `${EARTH_MONTH_NAMES[month]} ${year}${leapDisplay}`;
  
  let html = '';
  let cellCount = 0;
  
  for (let i = 0; i < startOffset; i++) {
    html += `<div class="cal-cell other-month"></div>`;
    cellCount++;
  }
  
  for (let d = 1; d <= daysInMonth; d++) {
    const selected = (year === state.year && month === state.month && d === day);
    html += `<div class="cal-cell ${selected ? 'highlight' : ''}" data-day="${d}">${d}</div>`;
    cellCount++;
  }
  
  while (cellCount < 42) {
    html += `<div class="cal-cell other-month"></div>`;
    cellCount++;
  }
  
  elements.calendarGrid.innerHTML = html;
  
  return html;
}

function renderValenCalendar(state, elements) {
  const { year, dayOfYear, monthIndex } = state;
  const months = getValenMonthsForYear(year);
  const month = months[monthIndex];
  const info = getValenMonthFromDay(year, dayOfYear);
  const selectedDayInMonth = info ? info.dayInMonth : 1;
  
  const isLeap = isValenLeapYear(year);
  const leapNote = (month.name === "Inter Two" && isLeap) ? ' (leap +2)' : '';
  elements.monthDisplay.textContent = month.name + leapNote;
  elements.dayRange.textContent = `Day ${selectedDayInMonth} of ${month.days}`;
  
  if (month.type === 'lentar') {
    renderLentarGrid(month, selectedDayInMonth, elements.container);
  } else {
    renderInterGrid(month, selectedDayInMonth, year, elements.container);
  }
}

function renderLentarGrid(month, selectedDayInMonth, container) {
  let html = `<div class="valen-grid lentar-grid">`;
  html += `<div class="grid-label"></div>`;
  for (let i = 1; i <= 9; i++) {
    html += `<div class="weekday-header">${i}</div>`;
  }
  
  // Free days 1-3
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
  
  // 16 weeks of 9 days
  for (let w = 1; w <= 16; w++) {
    html += `<div class="grid-label">Week ${w}</div>`;
    for (let wd = 1; wd <= 9; wd++) {
      const d = 3 + (w - 1) * 9 + wd;
      const selected = (d === selectedDayInMonth);
      html += `<div class="cal-cell ${selected ? 'highlight' : ''}" data-vday="${month.startDay + d - 1}">${d}</div>`;
    }
  }
  
  // Free days 148-150
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
  container.innerHTML = html;
}

function renderInterGrid(month, selectedDayInMonth, year, container) {
  const isLeap = isValenLeapYear(year);
  let html = `<div class="inter-grid">`;
  
  for (let d = 1; d <= month.days; d++) {
    const selected = (d === selectedDayInMonth);
    const extraClass = (month.name === "Inter Two" && isLeap && d > 12) ? 'leap-day' : '';
    html += `<div class="cal-cell ${extraClass} ${selected ? 'highlight' : ''}" data-vday="${month.startDay + d - 1}">${d}</div>`;
  }
  
  html += `</div>`;
  container.innerHTML = html;
}

function updateResultDisplay(state, elements) {
  const { earthYear, earthMonth, earthDay, valenYear, valenDayOfYear } = state;
  const info = getValenMonthFromDay(valenYear, valenDayOfYear);
  const totalDays = getValenDaysPerYear(valenYear);
  const isValenLeap = isValenLeapYear(valenYear);
  const isEarthLeap = isEarthLeapYear(earthYear);
  
  elements.resultMain.innerHTML = `📌 ${earthDay} ${EARTH_MONTH_NAMES[earthMonth]} ${earthYear} ⇢ Valen ${valenYear} · ${info.name} day ${info.dayInMonth}`;
  elements.resultDetails.innerHTML = `📐 Valen year: ${totalDays} days${isValenLeap ? ' (leap)' : ''} · Earth ${isEarthLeap ? 'leap' : 'common'} year · 1 Valen day = ${VALEN_DAY_HOURS.toFixed(3)}h`;
}
