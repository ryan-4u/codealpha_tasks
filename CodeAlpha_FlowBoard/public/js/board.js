if (!localStorage.getItem("token")) window.location.href = "/";

const user = JSON.parse(localStorage.getItem("user"));
const params = new URLSearchParams(window.location.search);
const projectId = params.get("projectId");

if (!projectId) window.location.href = "/dashboard";

document.getElementById("nav-username").textContent = user?.username || "";
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "/";
});

let boardId = null;
let allTasks = [];
let projectMembers = [];
let activeTaskId = null;

const COLUMNS = [
  { id: "todo", title: "Todo" },
  { id: "inprogress", title: "In Progress" },
  { id: "inreview", title: "In Review" },
  { id: "done", title: "Done" }
];

const socket = io();
socket.emit("joinBoard", projectId);

socket.on("taskCreated", (task) => { allTasks.push(task); renderBoard(); });
socket.on("taskMoved", (data) => {
  const t = allTasks.find(t => t._id === data.taskId);
  if (t) { t.column = data.column; renderBoard(); }
});
socket.on("taskUpdated", (task) => {
  const idx = allTasks.findIndex(t => t._id === task._id);
  if (idx !== -1) { allTasks[idx] = task; renderBoard(); }
});
socket.on("taskDeleted", (data) => {
  allTasks = allTasks.filter(t => t._id !== data.taskId);
  renderBoard();
});
socket.on("newComment", (data) => {
  if (activeTaskId === data.taskId) loadComments(data.taskId);
});

async function init() {
  try {
    const project = await apiFetch(`/projects/${projectId}`);
    document.getElementById("project-title").textContent = project.name;
    projectMembers = project.members;

    const boardDoc = await apiFetch(`/tasks/board-by-project/${projectId}`);
    boardId = boardDoc._id;

    allTasks = await apiFetch(`/tasks/board/${boardId}`);
    renderBoard();
  } catch (err) {
    console.error("Init error:", err);
  }
}

function renderBoard() {
  const board = document.getElementById("board");
  board.innerHTML = COLUMNS.map(col => {
    const tasks = allTasks.filter(t => t.column === col.id);
    return `
      <div class="column" data-col="${col.id}">
        <div class="column-header">
          <span class="column-title">${col.title}</span>
          <span class="task-count">${tasks.length}</span>
        </div>
        <div class="task-list" id="col-${col.id}"
          ondragover="event.preventDefault()"
          ondrop="onDrop(event, '${col.id}')">
          ${tasks.map(t => taskCard(t)).join("")}
        </div>
        <button class="add-task-btn" onclick="openNewTaskModal('${col.id}')">+ Add task</button>
      </div>
    `;
  }).join("");
}

function taskCard(task) {
  const priority = { low: "🟢", medium: "🟡", high: "🔴" };
  const due = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "";
  return `
    <div class="task-card" draggable="true"
      ondragstart="onDragStart(event, '${task._id}')"
      onclick="openTaskModal('${task._id}')">
      <div class="task-title">${task.title}</div>
      <div class="task-meta">
        <span>${priority[task.priority] || "🟡"} ${task.priority}</span>
        ${due ? `<span>📅 ${due}</span>` : ""}
      </div>
      ${task.assignedTo ? `<div class="task-assignee">👤 ${task.assignedTo.username}</div>` : ""}
    </div>
  `;
}

let draggedTaskId = null;
function onDragStart(e, taskId) { draggedTaskId = taskId; }
async function onDrop(e, column) {
  if (!draggedTaskId) return;
  const task = allTasks.find(t => t._id === draggedTaskId);
  if (!task || task.column === column) return;

  task.column = column;
  renderBoard();

  await apiFetch(`/tasks/${draggedTaskId}`, {
    method: "PATCH",
    body: JSON.stringify({ column })
  });

  socket.emit("taskMoved", { projectId, taskId: draggedTaskId, column });
  draggedTaskId = null;
}

function openNewTaskModal(column) {
  activeTaskId = null;
  document.getElementById("modal-task-title").value = "";
  document.getElementById("modal-task-desc").value = "";
  document.getElementById("modal-priority").value = "medium";
  document.getElementById("modal-due-date").value = "";
  document.getElementById("modal-column").value = column;
  document.getElementById("modal-assignee").innerHTML = memberOptions();
  document.getElementById("comments-list").innerHTML = "";
  document.getElementById("delete-task-btn").classList.add("hidden");
  document.getElementById("task-modal").classList.remove("hidden");
}

async function openTaskModal(taskId) {
  activeTaskId = taskId;
  const task = allTasks.find(t => t._id === taskId);
  if (!task) return;

  document.getElementById("modal-task-title").value = task.title;
  document.getElementById("modal-task-desc").value = task.description || "";
  document.getElementById("modal-priority").value = task.priority;
  document.getElementById("modal-due-date").value = task.dueDate
    ? new Date(task.dueDate).toISOString().split("T")[0] : "";
  document.getElementById("modal-column").value = task.column;
  document.getElementById("modal-assignee").innerHTML = memberOptions(task.assignedTo?._id);
  document.getElementById("delete-task-btn").classList.remove("hidden");
  document.getElementById("task-modal").classList.remove("hidden");

  loadComments(taskId);
}

function memberOptions(selectedId = "") {
  const opts = projectMembers.map(m =>
    `<option value="${m.user._id}" ${m.user._id === selectedId ? "selected" : ""}>${m.user.username}</option>`
  ).join("");
  return `<option value="">Unassigned</option>${opts}`;
}

document.getElementById("close-task-modal").addEventListener("click", () => {
  document.getElementById("task-modal").classList.add("hidden");
  activeTaskId = null;
});

document.getElementById("save-task-btn").addEventListener("click", async () => {
  const title = document.getElementById("modal-task-title").value.trim();
  const description = document.getElementById("modal-task-desc").value.trim();
  const priority = document.getElementById("modal-priority").value;
  const dueDate = document.getElementById("modal-due-date").value;
  const column = document.getElementById("modal-column").value;
  const assignedTo = document.getElementById("modal-assignee").value;

  if (!title) return alert("Title is required");

  try {
    if (activeTaskId) {
      const updated = await apiFetch(`/tasks/${activeTaskId}`, {
        method: "PATCH",
        body: JSON.stringify({ title, description, priority, dueDate, column, assignedTo: assignedTo || null })
      });
      const idx = allTasks.findIndex(t => t._id === activeTaskId);
      if (idx !== -1) allTasks[idx] = updated;
      socket.emit("taskUpdated", { projectId, ...updated });
    } else {
      const created = await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({ boardId, title, description, priority, dueDate, column, assignedTo: assignedTo || null })
      });
      allTasks.push(created);
      socket.emit("taskCreated", { projectId, ...created });
    }
    document.getElementById("task-modal").classList.add("hidden");
    renderBoard();
  } catch (err) {
    alert(err.message);
  }
});

document.getElementById("delete-task-btn").addEventListener("click", async () => {
  if (!activeTaskId || !confirm("Delete this task?")) return;
  await apiFetch(`/tasks/${activeTaskId}`, { method: "DELETE" });
  allTasks = allTasks.filter(t => t._id !== activeTaskId);
  socket.emit("taskDeleted", { projectId, taskId: activeTaskId });
  document.getElementById("task-modal").classList.add("hidden");
  renderBoard();
});

async function loadComments(taskId) {
  const list = document.getElementById("comments-list");
  try {
    const comments = await apiFetch(`/comments/${taskId}`);
    list.innerHTML = comments.length === 0
      ? `<p class="empty-state">No comments yet</p>`
      : comments.map(c => `
          <div class="comment">
            <span class="comment-author">${c.author.username}</span>
            <p class="comment-content">${c.content}</p>
            <span class="comment-time">${new Date(c.createdAt).toLocaleString()}</span>
          </div>
        `).join("");
  } catch (err) {}
}

document.getElementById("send-comment-btn").addEventListener("click", async () => {
  if (!activeTaskId) return;
  const content = document.getElementById("comment-input").value.trim();
  if (!content) return;

  try {
    const comment = await apiFetch("/comments", {
      method: "POST",
      body: JSON.stringify({ taskId: activeTaskId, content })
    });
    document.getElementById("comment-input").value = "";
    socket.emit("newComment", { projectId, taskId: activeTaskId, comment });
    loadComments(activeTaskId);
  } catch (err) {
    alert(err.message);
  }
});

// ── INVITE MODAL WITH SEARCH ──────────────────────────────
let selectedInviteUsername = null;
let searchTimeout = null;

function openInviteModal() {
  selectedInviteUsername = null;
  document.getElementById("invite-username").value = "";
  document.getElementById("invite-suggestions").classList.add("hidden");
  document.getElementById("invite-selected").classList.add("hidden");
  document.getElementById("invite-msg").classList.add("hidden");
  document.getElementById("invite-modal").classList.remove("hidden");
}

function closeInviteModal() {
  document.getElementById("invite-modal").classList.add("hidden");
}

document.getElementById("invite-btn").addEventListener("click", openInviteModal);
document.getElementById("close-invite-modal").addEventListener("click", closeInviteModal);
document.getElementById("cancel-invite-btn").addEventListener("click", closeInviteModal);

document.getElementById("invite-username").addEventListener("input", (e) => {
  const q = e.target.value.trim();
  clearTimeout(searchTimeout);

  if (q.length < 1) {
    document.getElementById("invite-suggestions").classList.add("hidden");
    return;
  }

  searchTimeout = setTimeout(async () => {
    try {
      const users = await apiFetch(`/auth/search?q=${encodeURIComponent(q)}`);
      const dropdown = document.getElementById("invite-suggestions");

      // Filter out existing members
      const memberIds = projectMembers.map(m => m.user._id);
      const filtered = users.filter(u => !memberIds.includes(u._id));

      if (filtered.length === 0) {
        dropdown.innerHTML = `<div class="suggestion-item" style="color:var(--text-muted)">No users found</div>`;
      } else {
        dropdown.innerHTML = filtered.map(u => `
          <div class="suggestion-item" onclick="selectInviteUser('${u.username}')">
            <div class="suggestion-avatar">${u.username[0].toUpperCase()}</div>
            <div>
              <div class="suggestion-username">${u.username}</div>
              <div class="suggestion-email">${u.email}</div>
            </div>
          </div>
        `).join("");
      }
      dropdown.classList.remove("hidden");
    } catch (err) {}
  }, 300);
});

function selectInviteUser(username) {
  selectedInviteUsername = username;
  document.getElementById("invite-username").value = "";
  document.getElementById("invite-suggestions").classList.add("hidden");
  document.getElementById("invite-selected-name").textContent = `👤 ${username} selected`;
  document.getElementById("invite-selected").classList.remove("hidden");
}

document.getElementById("invite-clear-selected").addEventListener("click", () => {
  selectedInviteUsername = null;
  document.getElementById("invite-selected").classList.add("hidden");
  document.getElementById("invite-username").focus();
});

// Close suggestions when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest("#invite-modal")) return;
  if (!e.target.closest(".form-group")) {
    document.getElementById("invite-suggestions").classList.add("hidden");
  }
});

document.getElementById("send-invite-btn").addEventListener("click", async () => {
  const username = selectedInviteUsername || document.getElementById("invite-username").value.trim();
  const msgEl = document.getElementById("invite-msg");
  msgEl.classList.add("hidden");

  if (!username) {
    msgEl.textContent = "Please search and select a user first";
    msgEl.className = "alert alert-error";
    msgEl.classList.remove("hidden");
    return;
  }

  try {
    const res = await apiFetch(`/projects/${projectId}/invite`, {
      method: "POST",
      body: JSON.stringify({ username })
    });
    msgEl.textContent = res.message;
    msgEl.className = "alert alert-success";
    msgEl.classList.remove("hidden");
    selectedInviteUsername = null;
    document.getElementById("invite-selected").classList.add("hidden");
    document.getElementById("invite-username").value = "";
  } catch (err) {
    msgEl.textContent = err.message;
    msgEl.className = "alert alert-error";
    msgEl.classList.remove("hidden");
  }
});

init();