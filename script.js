const DEMO = {
    email: "anis@tasktify.id",
    pass: "tasktify123",
    name: "Anis",
    };

    let tasks = [];
    let filter = "all";

    const catLabel = {
    kerja: "Kerja",
    pribadi: "Pribadi",
    belanja: "Belanja",
    belajar: "Belajar",
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

    /* ─── DEADLINE UTILS ─── */
    function deadlineStatus(deadline) {
    if (!deadline) return null;
    const now = new Date();
    const dl = new Date(deadline);
    const diffMs = dl - now;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffMs < 0) return "overdue";
    if (diffHours < 1) return "urgent";       // < 1 jam
    if (diffHours < 24) return "today";       // hari ini (< 24j)
    if (diffDays < 2) return "tomorrow";      // besok
    if (diffDays <= 7) return "soon";         // minggu ini
    return "ok";
    }

    function deadlineDiffDays(deadline) {
    if (!deadline) return null;
    const now = new Date();
    const dl = new Date(deadline);
    return (dl - now) / (1000 * 60 * 60 * 24);
    }

    function formatDeadline(deadline) {
    if (!deadline) return null;
    const dl = new Date(deadline);
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const now = new Date();
    const diffMs = dl - now;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const timeStr = dl.getHours().toString().padStart(2, "0") + ":" + dl.getMinutes().toString().padStart(2, "0");

    if (diffMs < 0) {
        const absDiff = Math.abs(diffMs);
        const absHours = Math.floor(absDiff / (1000 * 60 * 60));
        if (absHours < 1) {
        const absMins = Math.floor(absDiff / (1000 * 60));
        return { label: `Terlambat ${absMins}m`, status: "overdue" };
        }
        if (absHours < 24) return { label: `Terlambat ${absHours}j`, status: "overdue" };
        const absDays = Math.floor(absHours / 24);
        return { label: `Terlambat ${absDays} hari`, status: "overdue" };
    }
    if (diffHours < 1) {
        const mins = Math.floor(diffMs / (1000 * 60));
        return { label: `${mins} menit lagi`, status: "urgent" };
    }
    if (diffHours < 24) {
        return { label: `Hari ini · ${timeStr}`, status: "today" };
    }
    if (diffDays < 2) {
        return { label: `Besok · ${timeStr}`, status: "tomorrow" };
    }
    const daysLeft = Math.floor(diffDays);
    if (daysLeft <= 7) {
        return { label: `${daysLeft} hari lagi`, status: "soon" };
    }
    return { label: `${dayNames[dl.getDay()]}, ${dl.getDate()} ${months[dl.getMonth()]} · ${timeStr}`, status: "ok" };
    }

    function buildDeadlineBadge(t) {
    if (!t.deadline) return "";
    const dl = formatDeadline(t.deadline);
    if (!dl) return "";

    // If task is done, show neutral style
    if (t.done) {
        return `<span class="deadline-badge deadline-done">✓ ${dl.label}</span>`;
    }

    const statusMap = {
        overdue:  { cls: "deadline-overdue",  icon: "⚠️", pulse: true },
        urgent:   { cls: "deadline-urgent",   icon: "🔥", pulse: true },
        today:    { cls: "deadline-today",    icon: "🔥", pulse: false },
        tomorrow: { cls: "deadline-tomorrow", icon: "⏳", pulse: false },
        soon:     { cls: "deadline-soon",     icon: "⏳", pulse: false },
        ok:       { cls: "deadline-ok",       icon: "📅", pulse: false },
    };
    const s = statusMap[dl.status] || statusMap.ok;
    const pulseClass = s.pulse ? " badge-pulse" : "";
    return `<span class="deadline-badge ${s.cls}${pulseClass}">${s.icon} ${dl.label}</span>`;
    }

    /* ─── SEED DATA ─── */
    function seedTasks() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in3h = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 20 * 60 * 60 * 1000);
    const in3days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    tasks = [
        { id: 1, text: "Belajar UAS Praktikum PBW",           cat: "belajar", deadline: toLocalISO(in3h),     done: false, time: nowTime() },
        { id: 2, text: "Beli bahan masak untuk makan malam", cat: "belanja", deadline: toLocalISO(tomorrow), done: false, time: nowTime() },
        { id: 3, text: "Olahraga pagi 30 menit",             cat: "pribadi", deadline: toLocalISO(yesterday),done: true,  time: nowTime() },
        { id: 4, text: "Project Akhir Visualisasi Data",      cat: "belajar", deadline: toLocalISO(in3days),  done: false, time: nowTime() },
        { id: 5, text: "Baca buku pengembangan diri",         cat: "pribadi", deadline: "",                  done: false, time: nowTime() },
    ];
    }

    function toLocalISO(date) {
    const pad = (n) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }

    function nowTime() {
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
    const deadline = document.getElementById("deadline-input").value;
    tasks.unshift({ id: Date.now(), text, cat, deadline, done: false, time: nowTime() });
    input.value = "";
    document.getElementById("deadline-input").value = "";
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
    else if (filter === "overdue") filtered = tasks.filter((t) => !t.done && deadlineStatus(t.deadline) === "overdue");

    if (filtered.length === 0) {
        list.innerHTML = "";
        empty.style.display = "block";
    } else {
        empty.style.display = "none";
        list.innerHTML = filtered
        .map((t) => {
            const status = deadlineStatus(t.deadline);
            const isOverdue = status === "overdue" && !t.done;
            const isUrgent  = status === "urgent"  && !t.done;
            const isToday   = status === "today"   && !t.done;
            let itemClass = "task-item";
            if (isOverdue) itemClass += " overdue-item";
            else if (isUrgent) itemClass += " urgent-item";
            else if (isToday) itemClass += " today-item";
            if (t.done) itemClass += " done-item";

            const dlBadge = buildDeadlineBadge(t);

            return `
            <div class="${itemClass}">
            <div class="check-wrap ${t.done ? "checked" : ""}" onclick="toggleTask(${t.id})">
                <div class="check-mark"></div>
            </div>
            <div class="task-body">
                <div class="task-text">${escHtml(t.text)}</div>
                <div class="task-meta">
                <span class="cat-tag cat-${t.cat}">${catLabel[t.cat]}</span>
                ${dlBadge}
                <span class="task-time">${t.time}</span>
                </div>
            </div>
            <button class="del-btn" onclick="deleteTask(${t.id})" title="Hapus">✕</button>
            </div>
        `;
        })
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
