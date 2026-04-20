// Auth guard
if (!localStorage.getItem("token")) window.location.href = "/";

const user = JSON.parse(localStorage.getItem("user"));
document.getElementById("nav-username").textContent = user?.username || "";

// Logout
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "/";
});

// Load projects
async function loadProjects() {
  const grid = document.getElementById("project-grid");
  try {
    const projects = await apiFetch("/projects");
    if (projects.length === 0) {
      grid.innerHTML = `<div class="empty-state">No projects yet. Create one!</div>`;
      return;
    }
    grid.innerHTML = projects.map(p => `
      <div class="project-card" onclick="openProject('${p._id}')">
        <div class="project-card-header">
          <h3>${p.name}</h3>
          <span class="member-count">${p.members.length} member${p.members.length !== 1 ? "s" : ""}</span>
        </div>
        <p class="project-desc">${p.description || "No description"}</p>
        <div class="project-meta">
          <span class="owner-tag">Owner: ${p.owner.username}</span>
        </div>
      </div>
    `).join("");
  } catch (err) {
    grid.innerHTML = `<div class="empty-state error">${err.message}</div>`;
  }
}

function openProject(projectId) {
  window.location.href = `/board?projectId=${projectId}`;
}

// New project modal
const modal = document.getElementById("project-modal");
document.getElementById("new-project-btn").addEventListener("click", () => {
  modal.classList.remove("hidden");
});
document.getElementById("close-project-modal").addEventListener("click", () => {
  modal.classList.add("hidden");
});
document.getElementById("cancel-project-btn").addEventListener("click", () => {
  modal.classList.add("hidden");
});

document.getElementById("create-project-btn").addEventListener("click", async () => {
  const name = document.getElementById("project-name").value.trim();
  const description = document.getElementById("project-desc").value.trim();
  const errEl = document.getElementById("project-error");
  errEl.classList.add("hidden");

  if (!name) {
    errEl.textContent = "Project name is required";
    errEl.classList.remove("hidden");
    return;
  }

  try {
    await apiFetch("/projects", {
      method: "POST",
      body: JSON.stringify({ name, description })
    });
    modal.classList.add("hidden");
    document.getElementById("project-name").value = "";
    document.getElementById("project-desc").value = "";
    loadProjects();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  }
});

// Notifications
async function loadNotifications() {
  try {
    const notifs = await apiFetch("/auth/notifications");
    const unread = notifs.filter(n => !n.read);
    const badge = document.getElementById("notif-count");
    const list = document.getElementById("notif-list");

    if (unread.length > 0) {
      badge.textContent = unread.length;
      badge.classList.remove("hidden");
    }

    if (notifs.length === 0) {
      list.innerHTML = `<p class="empty-state">No notifications</p>`;
    } else {
      list.innerHTML = notifs.map(n => `
        <div class="notif-item ${n.read ? "" : "unread"}">
          <p>${n.message}</p>
          <span class="notif-time">${new Date(n.createdAt).toLocaleDateString()}</span>
        </div>
      `).join("");
    }
  } catch (err) {}
}

document.getElementById("notif-btn").addEventListener("click", () => {
  document.getElementById("notif-dropdown").classList.toggle("hidden");
});

document.getElementById("mark-read-btn").addEventListener("click", async () => {
  await apiFetch("/auth/notifications/read", { method: "PATCH" });
  document.getElementById("notif-count").classList.add("hidden");
  loadNotifications();
});

loadProjects();
loadNotifications();