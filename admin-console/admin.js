import { onAuthChange, logIn, logOut, friendlyError, currentUser } from "../auth.js";
import { WORKER_URL } from "./admin-config.js";

const gate = document.getElementById("gate");
const gateForm = document.getElementById("gateForm");
const gateError = document.getElementById("gateError");
const app = document.getElementById("app");
const whoEl = document.getElementById("who");
const logoutBtn = document.getElementById("logoutBtn");

const statTotal = document.getElementById("statTotal");
const statNew = document.getElementById("statNew");
const statInProgress = document.getElementById("statInProgress");
const statResolved = document.getElementById("statResolved");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const tableBody = document.getElementById("tableBody");
const emptyState = document.getElementById("emptyState");

const modalOverlay = document.getElementById("modalOverlay");
const modalClose = document.getElementById("modalClose");
const modalReqId = document.getElementById("modalReqId");
const modalMeta = document.getElementById("modalMeta");
const modalMessage = document.getElementById("modalMessage");
const modalStatus = document.getElementById("modalStatus");
const modalNotes = document.getElementById("modalNotes");
const modalReply = document.getElementById("modalReply");
const saveBtn = document.getElementById("saveBtn");
const replyBtn = document.getElementById("replyBtn");
const resolveBtn = document.getElementById("resolveBtn");
const modalStatusMsg = document.getElementById("modalStatusMsg");

let activeRequestId = null;

// ── AUTH GATE ────────────────────────────────────────────────

onAuthChange((user) => {
  if (user) {
    showApp(user);
    refreshAll();
  } else {
    showGate();
  }
});

function showGate() {
  gate.style.display = "flex";
  app.classList.remove("visible");
}

function showApp(user) {
  gate.style.display = "none";
  app.classList.add("visible");
  whoEl.textContent = user.email || "";
}

gateForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  gateError.textContent = "";
  const email = gateForm.email.value.trim();
  const password = gateForm.password.value;
  try {
    await logIn(email, password);
  } catch (err) {
    gateError.textContent = friendlyError(err.code);
  }
});

logoutBtn.addEventListener("click", async () => {
  await logOut();
});

// ── API HELPER (attaches verified Firebase ID token) ────────

async function api(path, options = {}) {
  const user = currentUser();
  if (!user) throw new Error("Not signed in");
  const token = await user.getIdToken();

  const res = await fetch(`${WORKER_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

// ── DASHBOARD ────────────────────────────────────────────────

async function refreshAll() {
  await Promise.all([loadStats(), loadRequests()]);
}

async function loadStats() {
  try {
    const { stats } = await api("/api/stats");
    statTotal.textContent = stats.total;
    statNew.textContent = stats.new;
    statInProgress.textContent = stats.inProgress;
    statResolved.textContent = stats.resolved;
  } catch (err) {
    console.error(err);
  }
}

async function loadRequests() {
  const params = new URLSearchParams();
  if (statusFilter.value) params.set("status", statusFilter.value);
  if (searchInput.value.trim()) params.set("search", searchInput.value.trim());

  try {
    const { requests } = await api(`/api/requests?${params.toString()}`);
    renderTable(requests);
  } catch (err) {
    console.error(err);
    tableBody.innerHTML = "";
    emptyState.textContent = "Failed to load requests.";
    emptyState.style.display = "block";
  }
}

function renderTable(requests) {
  tableBody.innerHTML = "";
  if (!requests.length) {
    emptyState.textContent = "No requests found.";
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  for (const r of requests) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="req-id">${escapeHtml(r.request_id)}</td>
      <td>${escapeHtml(r.customer_name)}<br><span style="color:var(--text-muted); font-size:0.78rem;">${escapeHtml(r.customer_email)}</span></td>
      <td>${escapeHtml(r.subject)}</td>
      <td><span class="badge ${r.status}">${r.status.replace("_", " ")}</span></td>
      <td>${new Date(r.created_at).toLocaleDateString()}</td>
    `;
    tr.addEventListener("click", () => openRequest(r.request_id));
    tableBody.appendChild(tr);
  }
}

let searchDebounce;
searchInput.addEventListener("input", () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(loadRequests, 300);
});
statusFilter.addEventListener("change", loadRequests);

// ── REQUEST DETAIL MODAL ────────────────────────────────────

async function openRequest(requestId) {
  activeRequestId = requestId;
  modalStatusMsg.textContent = "";
  modalReply.value = "";
  try {
    const { request: r } = await api(`/api/requests/${requestId}`);
    modalReqId.textContent = r.request_id;
    modalMeta.textContent = `${r.customer_name} · ${r.customer_email} · ${new Date(r.created_at).toLocaleString()}`;
    modalMessage.textContent = r.message;
    modalStatus.value = r.status;
    modalNotes.value = r.admin_notes || "";
    modalOverlay.classList.add("visible");
  } catch (err) {
    alert(err.message);
  }
}

function closeModal() {
  modalOverlay.classList.remove("visible");
  activeRequestId = null;
}
modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

saveBtn.addEventListener("click", async () => {
  await runModalAction(async () => {
    await api(`/api/requests/${activeRequestId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: modalStatus.value, adminNotes: modalNotes.value }),
    });
    return "Saved.";
  });
});

replyBtn.addEventListener("click", async () => {
  const message = modalReply.value.trim();
  if (!message) {
    modalStatusMsg.textContent = "Write a reply message first.";
    modalStatusMsg.className = "status-msg err";
    return;
  }
  await runModalAction(async () => {
    await api(`/api/requests/${activeRequestId}/reply`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
    modalReply.value = "";
    return "Reply sent.";
  });
});

resolveBtn.addEventListener("click", async () => {
  await runModalAction(async () => {
    await api(`/api/requests/${activeRequestId}/resolve`, { method: "POST" });
    modalStatus.value = "resolved";
    return "Marked as resolved.";
  });
});

async function runModalAction(fn) {
  modalStatusMsg.textContent = "";
  try {
    const msg = await fn();
    modalStatusMsg.textContent = msg;
    modalStatusMsg.className = "status-msg ok";
    await refreshAll();
  } catch (err) {
    modalStatusMsg.textContent = err.message;
    modalStatusMsg.className = "status-msg err";
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
