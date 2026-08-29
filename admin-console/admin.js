import { onAuthChange, logIn, logOut, friendlyError, currentUser } from "../auth.js";
import { WORKER_URL } from "./admin-config.js";

// ── ELEMENT REFERENCES ──────────────────────────────────────
const gate = document.getElementById("gate");
const gateForm = document.getElementById("gateForm");
const gateError = document.getElementById("gateError");
const app = document.getElementById("app");
const whoEl = document.getElementById("who");
const logoutBtn = document.getElementById("logoutBtn");

const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

// Request elements
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

// Certificate elements
const certSearchInput = document.getElementById("certSearchInput");
const certStatusFilter = document.getElementById("certStatusFilter");
const certTableBody = document.getElementById("certTableBody");
const certEmptyState = document.getElementById("certEmptyState");
const issueCertBtn = document.getElementById("issueCertBtn");
const issueCertModalOverlay = document.getElementById("issueCertModalOverlay");
const issueCertModalClose = document.getElementById("issueCertModalClose");
const issueCertRecipientEmail = document.getElementById("issueCertRecipientEmail");
const issueCertRecipientName = document.getElementById("issueCertRecipientName");
const issueCertProductId = document.getElementById("issueCertProductId");
const issueCertCompletedAt = document.getElementById("issueCertCompletedAt");
const confirmIssueCertBtn = document.getElementById("confirmIssueCertBtn");
const issueCertStatusMsg = document.getElementById("issueCertStatusMsg");

const certDetailModalOverlay = document.getElementById("certDetailModalOverlay");
const certDetailModalClose = document.getElementById("certDetailModalClose");
const certDetailId = document.getElementById("certDetailId");
const certDetailMeta = document.getElementById("certDetailMeta");
const certDetailRecipient = document.getElementById("certDetailRecipient");
const certDetailProduct = document.getElementById("certDetailProduct");
const certDetailStatus = document.getElementById("certDetailStatus");
const certDetailDownloadBtn = document.getElementById("certDetailDownloadBtn");
const certDetailResendBtn = document.getElementById("certDetailResendBtn");
const certDetailRevokeBtn = document.getElementById("certDetailRevokeBtn");
const certDetailStatusMsg = document.getElementById("certDetailStatusMsg");
let activeCertId = null;

// ── AUTH GATE ───────────────────────────────────────────────
onAuthChange((user) => {
  if (user) { showApp(user); refreshAll(); } else { showGate(); }
});

function showGate() { gate.style.display = "flex"; app.classList.remove("visible"); }
function showApp(user) { gate.style.display = "none"; app.classList.add("visible"); whoEl.textContent = user.email || ""; }

gateForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  gateError.textContent = "";
  try { await logIn(gateForm.email.value.trim(), gateForm.password.value); } catch (err) { gateError.textContent = friendlyError(err.code); }
});

logoutBtn.addEventListener("click", async () => { await logOut(); });

// ── TABS ────────────────────────────────────────────────────
tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    tabBtns.forEach(b => b.classList.remove("active"));
    tabContents.forEach(c => c.style.display = "none");
    btn.classList.add("active");
    const tabId = btn.getAttribute("data-tab");
    document.getElementById(`tab-${tabId}`).style.display = "block";
    if (tabId === "certificates") loadCertificates(); else refreshAll();
  });
});

// ── API HELPER ──────────────────────────────────────────────
async function api(path, options = {}) {
  const user = currentUser();
  if (!user) throw new Error("Not signed in");
  const token = await user.getIdToken();
  const res = await fetch(`${WORKER_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// ── REQUESTS DASHBOARD ──────────────────────────────────────
async function refreshAll() { await Promise.all([loadStats(), loadRequests()]); }

async function loadStats() {
  try {
    const { stats } = await api("/api/stats");
    statTotal.textContent = stats.total; statNew.textContent = stats.new; 
    statInProgress.textContent = stats.inProgress; statResolved.textContent = stats.resolved;
  } catch (err) { console.error(err); }
}

async function loadRequests() {
  const params = new URLSearchParams();
  if (statusFilter.value) params.set("status", statusFilter.value);
  if (searchInput.value.trim()) params.set("search", searchInput.value.trim());
  try {
    const { requests } = await api(`/api/requests?${params.toString()}`);
    renderTable(requests);
  } catch (err) {
    tableBody.innerHTML = ""; emptyState.textContent = "Failed to load requests."; emptyState.style.display = "block";
  }
}

function renderTable(requests) {
  tableBody.innerHTML = "";
  if (!requests.length) { emptyState.textContent = "No requests found."; emptyState.style.display = "block"; return; }
  emptyState.style.display = "none";
  for (const r of requests) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td class="req-id">${escapeHtml(r.request_id)}</td> <td>${escapeHtml(r.customer_name)}<br><span style="color:var(--text-muted); font-size:0.78rem;">${escapeHtml(r.customer_email)}</span></td> <td>${escapeHtml(r.subject)}</td> <td><span class="badge ${r.status}">${r.status.replace("_", " ")}</span></td> <td>${new Date(r.created_at).toLocaleDateString()}</td>`;
    tr.addEventListener("click", () => openRequest(r.request_id));
    tableBody.appendChild(tr);
  }
}

let searchDebounce;
searchInput.addEventListener("input", () => { clearTimeout(searchDebounce); searchDebounce = setTimeout(loadRequests, 300); });
statusFilter.addEventListener("change", loadRequests);

// ── REQUEST MODAL ───────────────────────────────────────────
async function openRequest(requestId) {
  activeRequestId = requestId; modalStatusMsg.textContent = ""; modalReply.value = "";
  try {
    const { request: r } = await api(`/api/requests/${requestId}`);
    modalReqId.textContent = r.request_id; modalMeta.textContent = `${r.customer_name} · ${r.customer_email} · ${new Date(r.created_at).toLocaleString()}`;
    modalMessage.textContent = r.message; modalStatus.value = r.status; modalNotes.value = r.admin_notes || "";
    modalOverlay.classList.add("visible");
  } catch (err) { alert(err.message); }
}

function closeModal() { modalOverlay.classList.remove("visible"); activeRequestId = null; }
modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });

saveBtn.addEventListener("click", async () => {
  await runModalAction(async () => {
    await api(`/api/requests/${activeRequestId}`, { method: "PATCH", body: JSON.stringify({ status: modalStatus.value, adminNotes: modalNotes.value }) });
    return "Saved.";
  });
});

replyBtn.addEventListener("click", async () => {
  const message = modalReply.value.trim();
  if (!message) { modalStatusMsg.textContent = "Write a reply message first."; modalStatusMsg.className = "status-msg err"; return; }
  await runModalAction(async () => {
    await api(`/api/requests/${activeRequestId}/reply`, { method: "POST", body: JSON.stringify({ message }) });
    modalReply.value = ""; return "Reply sent.";
  });
});

resolveBtn.addEventListener("click", async () => {
  await runModalAction(async () => {
    await api(`/api/requests/${activeRequestId}/resolve`, { method: "POST" });
    modalStatus.value = "resolved"; return "Marked as resolved.";
  });
});

async function runModalAction(fn) {
  modalStatusMsg.textContent = "";
  try { const msg = await fn(); modalStatusMsg.textContent = msg; modalStatusMsg.className = "status-msg ok"; await refreshAll(); }
  catch (err) { modalStatusMsg.textContent = err.message; modalStatusMsg.className = "status-msg err"; }
}

// ── CERTIFICATES DASHBOARD ──────────────────────────────────
async function loadCertificates() {
  const params = new URLSearchParams();
  if (certStatusFilter.value) params.set("status", certStatusFilter.value);
  if (certSearchInput.value.trim()) params.set("search", certSearchInput.value.trim());
  try {
    const { certificates } = await api(`/api/certificates?${params.toString()}`);
    renderCertTable(certificates);
  } catch (err) {
    certTableBody.innerHTML = ""; certEmptyState.textContent = "Failed to load certificates."; certEmptyState.style.display = "block";
  }
}

function renderCertTable(certs) {
  certTableBody.innerHTML = "";
  if (!certs.length) { certEmptyState.textContent = "No certificates found."; certEmptyState.style.display = "block"; return; }
  certEmptyState.style.display = "none";
  for (const c of certs) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td class="req-id">${escapeHtml(c.certificate_id)}</td> <td>${escapeHtml(c.recipient_name)}<br><span style="color:var(--text-muted); font-size:0.78rem;">${escapeHtml(c.recipient_email)}</span></td> <td>${escapeHtml(c.product_id)}</td> <td><span class="badge ${c.status}">${c.status}</span></td> <td>${new Date(c.issued_at).toLocaleDateString()}</td> <td><button class="btn-secondary manage-cert-btn" style="padding:0.3rem 0.6rem; font-size:0.75rem;" data-id="${c.id}">Manage</button></td>`;
    certTableBody.appendChild(tr);
  }
  document.querySelectorAll(".manage-cert-btn").forEach(btn => { btn.addEventListener("click", () => openCertDetail(btn.getAttribute("data-id"))); });
}

let certSearchDebounce;
certSearchInput.addEventListener("input", () => { clearTimeout(certSearchDebounce); certSearchDebounce = setTimeout(loadCertificates, 300); });
certStatusFilter.addEventListener("change", loadCertificates);

async function openCertDetail(certId) {
  activeCertId = certId; certDetailStatusMsg.textContent = "";
  try {
    const { certificate: c } = await api(`/api/certificates/${certId}`);
    certDetailId.textContent = c.certificate_id; certDetailMeta.textContent = `Customer: ${c.customer_id} · Issued: ${new Date(c.issued_at).toLocaleString()}`;
    certDetailRecipient.textContent = `${c.recipient_name} (${c.recipient_email})`; certDetailProduct.textContent = c.product_id;
    certDetailStatus.value = c.status; certDetailRevokeBtn.style.display = c.status === "revoked" ? "none" : "inline-block";
    certDetailModalOverlay.classList.add("visible");
  } catch (err) { alert(err.message); }
}

function closeCertDetailModal() { certDetailModalOverlay.classList.remove("visible"); activeCertId = null; }
certDetailModalClose.addEventListener("click", closeCertDetailModal);
certDetailModalOverlay.addEventListener("click", (e) => { if (e.target === certDetailModalOverlay) closeCertDetailModal(); });

certDetailDownloadBtn.addEventListener("click", async () => {
  try {
    const res = await fetch(`${WORKER_URL}/api/certificates/${activeCertId}/download`, { headers: { Authorization: `Bearer ${await currentUser().getIdToken()}` } });
    if (!res.ok) throw new Error("Download failed");
    const blob = await res.blob(); const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `certificate.html`;
    document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); a.remove();
  } catch (err) { certDetailStatusMsg.textContent = err.message; certDetailStatusMsg.className = "status-msg err"; }
});

certDetailResendBtn.addEventListener("click", async () => {
  await runCertModalAction(async () => { await api(`/api/certificates/${activeCertId}/resend`, { method: "POST" }); return "Certificate email resent."; });
});

certDetailRevokeBtn.addEventListener("click", async () => {
  if (!confirm("Are you sure you want to revoke this certificate? This action cannot be undone.")) return;
  await runCertModalAction(async () => { await api(`/api/certificates/${activeCertId}/revoke`, { method: "POST" }); certDetailStatus.value = "revoked"; certDetailRevokeBtn.style.display = "none"; return "Certificate revoked."; });
});

async function runCertModalAction(fn) {
  certDetailStatusMsg.textContent = "";
  try { const msg = await fn(); certDetailStatusMsg.textContent = msg; certDetailStatusMsg.className = "status-msg ok"; loadCertificates(); }
  catch (err) { certDetailStatusMsg.textContent = err.message; certDetailStatusMsg.className = "status-msg err"; }
}

// ── ISSUE CERTIFICATE MODAL ─────────────────────────────────
issueCertBtn.addEventListener("click", () => {
  issueCertStatusMsg.textContent = "";
  issueCertRecipientEmail.value = ""; issueCertRecipientName.value = ""; 
  issueCertProductId.value = ""; issueCertCompletedAt.value = "";
  issueCertModalOverlay.classList.add("visible");
});

issueCertModalClose.addEventListener("click", () => { issueCertModalOverlay.classList.remove("visible"); });

confirmIssueCertBtn.addEventListener("click", async () => {
  issueCertStatusMsg.textContent = "";
  const recipientEmail = issueCertRecipientEmail.value.trim();
  const recipientName = issueCertRecipientName.value.trim();
  const productId = issueCertProductId.value.trim();
  const completedAt = issueCertCompletedAt.value;

  if (!recipientEmail || !recipientName || !productId) {
    issueCertStatusMsg.textContent = "Email, Name, and Product ID are required.";
    issueCertStatusMsg.className = "status-msg err"; return;
  }

  try {
    issueCertStatusMsg.textContent = "Looking up customer...";
    let customerId;
    try {
      const lookupRes = await api(`/api/customers/lookup?email=${encodeURIComponent(recipientEmail)}`);
      customerId = lookupRes.customer.id;
    } catch (err) {
      if (err.message.includes("404") || err.message.includes("No customer found")) {
        const createRes = await api("/api/customers", { method: "POST", body: JSON.stringify({ email: recipientEmail, name: recipientName }) });
        customerId = createRes.customer.id;
      } else { throw err; }
    }

    issueCertStatusMsg.textContent = "Issuing certificate...";
    const body = { customer_id: customerId, product_id: productId, recipient_name: recipientName, recipient_email: recipientEmail };
    if (completedAt) body.course_completed_at = completedAt;
    
    await api("/api/certificates", { method: "POST", body: JSON.stringify(body) });
    
    issueCertStatusMsg.textContent = "Certificate issued and email sent!";
    issueCertStatusMsg.className = "status-msg ok";
    setTimeout(() => { issueCertModalOverlay.classList.remove("visible"); loadCertificates(); }, 1500);
  } catch (err) {
    issueCertStatusMsg.textContent = err.message;
    issueCertStatusMsg.className = "status-msg err";
  }
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
