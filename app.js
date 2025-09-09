let lessons = [];
let currentWeekStart = getStartOfWeek(new Date());

document.addEventListener("DOMContentLoaded", () => {
  init();

  // кнопка импорта
  document.getElementById("importBtn").addEventListener("click", () => {
    document.getElementById("fileInput").click();
  });

  document.getElementById("fileInput").addEventListener("change", async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      JSON.parse(text); // проверим что JSON валидный
      localStorage.setItem("schedule_json", text);
      alert("Расписание успешно импортировано ✅");
      location.reload();
    } catch (err) {
      alert("Ошибка при импорте JSON: " + err.message);
    }
  });
});

async function init() {
  lessons = await loadLessons();
  renderWeek();
}

async function loadLessons() {
  const imported = localStorage.getItem("schedule_json");
  if (imported) return JSON.parse(imported);

  const res = await fetch("/schedule.json");
  return res.json();
}

function renderWeek() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const weekHeader = document.createElement("div");
  weekHeader.className = "week-header";

  const prev = document.createElement("button");
  prev.textContent = "←";
  prev.onclick = () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    renderWeek();
  };

  const next = document.createElement("button");
  next.textContent = "→";
  next.onclick = () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    renderWeek();
  };

  const label = document.createElement("span");
  label.textContent = formatWeekLabel(currentWeekStart);

  weekHeader.appendChild(prev);
  weekHeader.appendChild(label);
  weekHeader.appendChild(next);
  app.appendChild(weekHeader);

  const daysContainer = document.createElement("div");
  daysContainer.className = "days";

  for (let i = 0; i < 7; i++) {
    const day = new Date(currentWeekStart);
    day.setDate(day.getDate() + i);

    const dayEl = document.createElement("div");
    dayEl.className = "day";
    dayEl.textContent = day.toLocaleDateString("ru-RU", {weekday:"short", day:"numeric"});
    dayEl.onclick = () => renderDay(day);

    daysContainer.appendChild(dayEl);
  }

  app.appendChild(daysContainer);

  renderDay(new Date()); // показываем сегодня
}

function renderDay(day) {
  const old = document.querySelector(".lessons");
  if (old) old.remove();

  const list = document.createElement("div");
  list.className = "lessons";

  const dayLessons = lessons
    .map(l => ({...l, startsAt: new Date(l.startsAt), endsAt: new Date(l.endsAt)}))
    .filter(l => isSameDay(l.startsAt, day))
    .sort((a,b) => a.startsAt - b.startsAt);

  if (!dayLessons.length) {
    list.innerHTML = "<p>Пар нет 🎉</p>";
  } else {
    dayLessons.forEach(l => {
      const card = document.createElement("div");
      card.className = "lesson";
      card.innerHTML = `
        <div class="lesson-type">${l.type || "Пара"}</div>
        <div class="lesson-title">${l.title}</div>
        <div class="lesson-meta">
          <span>${l.location || ""}</span>
          <span>${formatTime(l.startsAt)} – ${formatTime(l.endsAt)}</span>
        </div>
        <div class="lesson-extra">
          ${l.teacher || ""}<br>
          ${l.group || ""}
        </div>
      `;
      list.appendChild(card);
    });
  }
  document.getElementById("app").appendChild(list);
}

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function formatWeekLabel(start) {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${start.toLocaleDateString("ru-RU", {month:"long", day:"numeric"})} – ${end.toLocaleDateString("ru-RU", {month:"long", day:"numeric"})}`;
}

function isSameDay(a,b) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}

function formatTime(d) {
  return d.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
}
