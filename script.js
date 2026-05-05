const DEMO = {
  email: "demo@taskly.id",
  pass: "taskly123",
  name: "Demo Manis",
};

let tasks = [];
let filter = "all";

const catLabel = {
  kerja: "Kerja",
  pribadi: "Pribadi",
  belanja: "Belanja",
  lainnya: "Lainnya",
};

/* ─── AUTH ─── */
function doLogin() {
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("password").value;
  const err = document.getElementById("login-error");

  if (email === DEMO.email && pass === DEMO.pass) {
    err.style.display = "none";
    const name = DEMO.name;
    document.getElementById("user-name-display").textContent = name.split(" ")[0];
    document.getElementById("greeting-name").textContent = name.split(" ")[0];
    document.getElementById("user-avatar").textContent = name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    setGreetingDate();
    seedTasks();
    renderTasks();
    switchPage("login-page", "app-page");
  } else {
    err.style.display = "block";
    document.getElementById("password").value = "";
  }
}

function doLogout() {
  tasks = [];
  filter = "all";
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
  document.getElementById("login-error").style.display = "none";
  switchPage("app-page", "login-page");
}

/* ─── PAGE TRANSITION ─── */
function switchPage(fromId, toId) {
  const from = document.getElementById(fromId);
  const to = document.getElementById(toId);
  from.classList.add("exit");
  from.classList.remove("active");
  to.scrollTop = 0;
  setTimeout(() => {
    from.classList.remove("exit");
    to.classList.add("active");
  }, 50);
}

/* ─── GREETING ─── */
function setGreetingDate() {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const d = new Date();
  document.getElementById("greeting-date").textContent =
    days[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
}

/* ─── SEED DATA ─── */
function seedTasks() {
  tasks = [
    { id: 1, text: "Review laporan keuangan Q2",          cat: "kerja",   pri: "high", done: false, time: now() },
    { id: 2, text: "Beli bahan masak untuk makan malam",  cat: "belanja", pri: "med",  done: false, time: now() },
    { id: 3, text: "Olahraga pagi 30 menit",              cat: "pribadi", pri: "low",  done: true,  time: now() },
    { id: 4, text: "Meeting tim product jam 14.00",        cat: "kerja",   pri: "high", done: false, time: now() },
    { id: 5, text: "Baca buku pengembangan diri",          cat: "pribadi", pri: "low",  done: false, time: now() },
  ];
}

function now() {
  const d = new Date();
  return d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0");
}

/* ─── TASK ACTIONS ─── */
function handleKey(e) {
  if (e.key === "Enter") addTask();
}

function addTask() {
  const input = document.getElementById("task-input");
  const text = input.value.trim();
  if (!text) { input.focus(); return; }
  const cat = document.getElementById("cat-select").value;
  const pri = document.getElementById("pri-select").value;
  tasks.unshift({ id: Date.now(), text, cat, pri, done: false, time: now() });
  input.value = "";
  renderTasks();
  input.focus();
}

function toggleTask(id) {
  const t = tasks.find((t) => t.id === id);
  if (t) { t.done = !t.done; renderTasks(); }
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  renderTasks();
}

function setFilter(f, el) {
  filter = f;
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
  el.classList.add("active");
  renderTasks();
}

/* ─── RENDER ─── */
function renderTasks() {
  const list = document.getElementById("task-list");
  const empty = document.getElementById("empty-state");

  let filtered = tasks;
  if (filter === "pending") filtered = tasks.filter((t) => !t.done);
  else if (filter === "done") filtered = tasks.filter((t) => t.done);
  else if (filter === "high") filtered = tasks.filter((t) => t.pri === "high" && !t.done);

  if (filtered.length === 0) {
    list.innerHTML = "";
    empty.style.display = "block";
  } else {
    empty.style.display = "none";
    list.innerHTML = filtered
      .map(
        (t) => `
        <div class="task-item priority-${t.pri} ${t.done ? "done-item" : ""}">
          <div class="check-wrap ${t.done ? "checked" : ""}" onclick="toggleTask(${t.id})">
            <div class="check-mark"></div>
          </div>
          <div class="task-body">
            <div class="task-text">${escHtml(t.text)}</div>
            <div class="task-meta">
              <span class="cat-tag cat-${t.cat}">${catLabel[t.cat]}</span>
              <span class="task-time">${t.time}</span>
            </div>
          </div>
          <button class="del-btn" onclick="deleteTask(${t.id})" title="Hapus">✕</button>
        </div>
      `
      )
      .join("");
  }

  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const pend = total - done;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-done").textContent = done;
  document.getElementById("stat-pending").textContent = pend;
  document.getElementById("progress-pct").textContent = pct + "%";
  document.getElementById("progress-fill").style.width = pct + "%";
}

function escHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ─── INIT ─── */
document.getElementById("password").addEventListener("keydown", (e) => {
  if (e.key === "Enter") doLogin();
});

document.getElementById("login-page").classList.add("active");