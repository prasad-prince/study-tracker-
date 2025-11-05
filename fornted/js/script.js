// ============================
// DARK MODE TOGGLE
// ============================
function toggleDarkMode() {
  const isDark = document.body.classList.contains("dark-mode");
  if (isDark) {
    document.body.classList.replace("dark-mode", "light-mode");
    localStorage.setItem("theme", "light");
  } else {
    document.body.classList.replace("light-mode", "dark-mode");
    localStorage.setItem("theme", "dark");
  }

  // Also sync toggle checkbox if exists
  const toggleSwitch = document.getElementById("darkModeToggle");
  if (toggleSwitch) toggleSwitch.checked = !isDark;
}

// Apply saved theme on load
window.addEventListener("DOMContentLoaded", async () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.body.classList.add(savedTheme + "-mode");

  const toggleSwitch = document.getElementById("darkModeToggle");
  if (toggleSwitch) toggleSwitch.checked = savedTheme === "dark";

  // Auth guard: block pages if not logged in (except login/register)
  const publicPages = ["login.html", "register.html", "index.html", ""];
  const path = (location.pathname || "").toLowerCase();
  const isPublic = publicPages.some(p => path.endsWith(p));
  const token = localStorage.getItem("authToken");

  if (!isPublic) {
    if (!token) {
      location.href = "login.html";
      return;
    }
    // Validate token
    try {
      const me = await apiFetch("/api/me");
      if (!me || !me.user) throw new Error("no user");
    } catch (_) {
      localStorage.removeItem("authToken");
      location.href = "login.html";
      return;
    }
  }

  // Hook Get Start button to go to login if not authed, else dashboard
  const getStartBtn = document.getElementById("getStartBtn");
  if (getStartBtn) {
    getStartBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const t = localStorage.getItem("authToken");
      location.href = t ? "dashboard.html" : "login.html";
    });
  }

  // Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try { await apiFetch("/api/logout", { method: "POST" }); } catch (_) {}
      localStorage.removeItem("authToken");
      localStorage.removeItem("currentUserEmail");
      localStorage.removeItem("currentUserName");
      location.href = "login.html";
    });
  }

  // Load user data from backend if logged in
  if (token) {
    try {
      const resp = await apiFetch("/api/data");
      const data = (resp && resp.data) || {};

      // Notes
      const noteInput = document.getElementById("noteInput");
      if (noteInput && typeof data.notes === "string") {
        noteInput.value = data.notes;
      }

      // Attendance
      if (data.attendance) {
        const a = data.attendance;
        const attendedEl = document.getElementById("classesAttended");
        const missedEl = document.getElementById("classesMissed");
        if (attendedEl && missedEl && typeof a.attended === "number" && typeof a.missed === "number") {
          attendedEl.value = a.attended;
          missedEl.value = a.missed;
        }
        if (typeof a.percentage === "number") {
          const progressBar = document.getElementById("attendanceProgressBar");
          const percentageEl = document.getElementById("attendancePercentage");
          if (progressBar && percentageEl) {
            percentageEl.textContent = `${a.percentage}%`;
            progressBar.style.width = `${a.percentage}%`;
            progressBar.setAttribute("aria-valuenow", a.percentage);
            document.getElementById("attendanceResult").style.display = "block";
          }
        }
      }

      // Calculator
      if (data.calculator) {
        const c = data.calculator;
        const obtainedEl = document.getElementById("marksObtained");
        const totalEl = document.getElementById("totalMarks");
        const resultBox = document.getElementById("percentageResult");
        if (obtainedEl && totalEl && typeof c.obtained === "number" && typeof c.total === "number") {
          obtainedEl.value = c.obtained;
          totalEl.value = c.total;
          if (resultBox && typeof c.result === "number") {
            resultBox.innerText = `🎯 Percentage: ${c.result}%`;
            resultBox.style.display = "block";
          }
        }
      }
    } catch (_) {}
  }
});

// ============================
// NOTE SECTION
// ============================
function saveNote() {
  const note = document.getElementById("noteInput").value;
  localStorage.setItem("studentNote", note);

  const msg = document.getElementById("saveMessage");
  if (msg) {
    msg.style.display = "block";
    setTimeout(() => msg.style.display = "none", 2000);
  }

  // Persist to backend if logged in
  const token = localStorage.getItem("authToken");
  if (token) {
    apiFetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: note })
    }).catch(() => {});
  }
}

function clearNote() {
  const noteInput = document.getElementById("noteInput");
  if (noteInput) noteInput.value = "";
  localStorage.removeItem("studentNote");
}

// ============================
// ATTENDANCE TRACKER
// ============================
const attendanceForm = document.getElementById("attendanceForm");
if (attendanceForm) {
  attendanceForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const attended = parseInt(document.getElementById("classesAttended").value);
    const missed = parseInt(document.getElementById("classesMissed").value);
    const total = attended + missed;

    if (isNaN(attended) || isNaN(missed) || total === 0) {
      alert("Please enter valid attendance data.");
      return;
    }

    const percentage = Math.round((attended / total) * 100);
    document.getElementById("attendancePercentage").textContent = `${percentage}%`;

    const progressBar = document.getElementById("attendanceProgressBar");
    progressBar.style.width = `${percentage}%`;
    progressBar.setAttribute("aria-valuenow", percentage);

    if (percentage >= 75) {
      progressBar.className = "progress-bar bg-success";
    } else if (percentage >= 50) {
      progressBar.className = "progress-bar bg-warning";
    } else {
      progressBar.className = "progress-bar bg-danger";
    }

    document.getElementById("attendanceResult").style.display = "block";

    // Save to backend
    const token = localStorage.getItem("authToken");
    if (token) {
      apiFetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendance: { attended, missed, percentage } })
      }).catch(() => {});
    }
  });
}

// ============================
// CONTACT FORM HANDLER
// ============================
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    document.getElementById("contactResponse").style.display = "block";
    setTimeout(() => {
      document.getElementById("contactResponse").style.display = "none";
      contactForm.reset();
    }, 3000);
  });
}

// ============================
// PERCENTAGE CALCULATOR
// ============================
const percentageForm = document.getElementById("percentageForm");
if (percentageForm) {
  percentageForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const obtained = parseFloat(document.getElementById("marksObtained").value);
    const total = parseFloat(document.getElementById("totalMarks").value);

    if (isNaN(obtained) || isNaN(total) || total <= 0) {
      alert("Enter valid marks.");
      return;
    }

    const result = ((obtained / total) * 100).toFixed(2);
    const resultBox = document.getElementById("percentageResult");
    resultBox.innerText = `🎯 Percentage: ${result}%`;
    resultBox.style.display = "block";

    // Save to backend
    const token = localStorage.getItem("authToken");
    if (token) {
      apiFetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calculator: { obtained, total, result: Number(result) } })
      }).catch(() => {});
    }
  });
}

// Helper for authenticated fetch
async function apiFetch(path, options) {
  const token = localStorage.getItem("authToken");
  const headers = Object.assign({}, (options && options.headers) || {});
  if (token) headers["Authorization"] = "Bearer " + token;
  const res = await fetch(path, Object.assign({}, options, { headers }));
  const txt = await res.text();
  let data = {};
  try { data = txt ? JSON.parse(txt) : {}; } catch (_) {}
  if (!res.ok) throw new Error((data && data.error) || txt || "request failed");
  return data;
}
