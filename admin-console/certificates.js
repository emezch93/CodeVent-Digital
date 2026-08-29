import { currentUser } from "../auth.js";
import { CENTRAL_WORKER_URL } from "./central-config.js";

async function centralApi(path, options = {}) {
  const user = currentUser();
  if (!user) throw new Error("Not signed in");
  const token = await user.getIdToken();

  const res = await fetch(`${CENTRAL_WORKER_URL}${path}`, {
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

const PRODUCT_NAMES = {
  "codevent-web-development-course": "Web Development",
  "codevent-nodejs-course": "Node.js",
  "codevent-machine-learning-course": "Machine Learning",
  "codevent-ai-automation": "AI Automation",
};

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function initCertificatesPanel() {
  try {
    const panel = document.getElementById("certificatesPanel");
    const navBtn = document.getElementById("navCertificates");
    if (!panel) return; // index.html not yet wired up — no-op safely

    panel.innerHTML = `
    <div class="cert-toolbar" style="display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap;">
      <input id="certSearch" type="text" placeholder="Search name, email, certificate ID…" style="flex:1; min-width:200px;" />
      <select id="certProductFilter">
        <option value="">All courses</option>
        ${Object.entries(PRODUCT_NAMES).map(([id, name]) => `<option value="${id}">${name}</option>`).join("")}
      </select>
      <select id="certStatusFilter">
        <option value="">All statuses</option>
        <option value="valid">Valid</option>
        <option value="revoked">Revoked</option>
      </select>
      <button id="certRefreshBtn">Refresh</button>
      <button id="certIssueBtn">Issue Certificate</button>
    </div>
    <table class="cert-table" style="width:100%; border-collapse:collapse;">
      <thead>
        <tr>
          <th>Certificate ID</th><th>Recipient</th><th>Course</th>
          <th>Issued</th><th>Status</th><th>Actions</th>
        </tr>
      </thead>
      <tbody id="certTableBody"></tbody>
    </table>
    <p id="certEmptyState" hidden>No certificates found.</p>
    <p id="certStatusMsg" style="color:#8b8fa8; font-size:0.85rem;"></p>
  `;

  const tableBody = document.getElementById("certTableBody");
  const emptyState = document.getElementById("certEmptyState");
  const statusMsg = document.getElementById("certStatusMsg");
  const search = document.getElementById("certSearch");
  const productFilter = document.getElementById("certProductFilter");
  const statusFilter = document.getElementById("certStatusFilter");

  async function loadCertificates() {
    statusMsg.textContent = "Loading…";
    try {
      const params = new URLSearchParams();
      if (search.value.trim()) params.set("search", search.value.trim());
      if (productFilter.value) params.set("product", productFilter.value);
      if (statusFilter.value) params.set("status", statusFilter.value);

      const data = await centralApi(`/api/certificates?${params.toString()}`);
      renderCertificates(data.certificates || []);
      statusMsg.textContent = "";
    } catch (err) {
      statusMsg.textContent = `Error: ${err.message}`;
    }
  }

  function renderCertificates(certs) {
    tableBody.innerHTML = "";
    emptyState.hidden = certs.length > 0;

    for (const c of certs) {
      const tr = document.createElement("tr");
      const courseName = PRODUCT_NAMES[c.product_id] || c.product_id;
      const statusColor = c.status === "revoked" ? "#ff5c5c" : "#00e5a0";

      tr.innerHTML = `
        <td><code>${escapeHtml(c.certificate_id)}</code></td>
        <td>${escapeHtml(c.recipient_name)}<br/><small>${escapeHtml(c.recipient_email)}</small></td>
        <td>${escapeHtml(courseName)}</td>
        <td>${new Date(c.issued_at).toLocaleDateString()}</td>
        <td style="color:${statusColor}; text-transform:uppercase; font-size:0.75rem;">${escapeHtml(c.status)}</td>
        <td style="display:flex; gap:6px;">
          <button data-action="download" data-id="${escapeHtml(c.certificate_id)}">Download</button>
          <button data-action="copy" data-id="${escapeHtml(c.certificate_id)}">Copy link</button>
          ${c.status !== "revoked" ? `<button data-action="resend" data-id="${escapeHtml(c.certificate_id)}">Resend</button>` : ""}
          ${c.status !== "revoked" ? `<button data-action="revoke" data-id="${escapeHtml(c.certificate_id)}">Revoke</button>` : ""}
        </td>
      `;
      tableBody.appendChild(tr);
    }
  }

  tableBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const { action, id } = btn.dataset;

    try {
      if (action === "download") {
        const user = currentUser();
        const token = await user.getIdToken();
        // Server-protected download — auth via a short-lived query param
        // would leak in logs, so open via fetch + blob instead.
        const res = await fetch(`${CENTRAL_WORKER_URL}/api/certificates/${encodeURIComponent(id)}/download`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Download failed");
        const html = await res.text();
        const win = window.open("", "_blank");
        win.document.write(html);
        win.document.close();
      } else if (action === "copy") {
        const url = `https://codeventdigital.site/verify-certificate.html?id=${encodeURIComponent(id)}`;
        await navigator.clipboard.writeText(url);
        statusMsg.textContent = "Verification link copied.";
      } else if (action === "resend") {
        await centralApi(`/api/certificates/${encodeURIComponent(id)}/resend`, { method: "POST" });
        statusMsg.textContent = "Certificate email resent.";
      } else if (action === "revoke") {
        if (!confirm(`Revoke certificate ${id}? This cannot be undone.`)) return;
        await centralApi(`/api/certificates/${encodeURIComponent(id)}/revoke`, { method: "POST" });
        statusMsg.textContent = "Certificate revoked.";
        loadCertificates();
      }
    } catch (err) {
      statusMsg.textContent = `Error: ${err.message}`;
    }
  });

  document.getElementById("certRefreshBtn").addEventListener("click", loadCertificates);
  search.addEventListener("keydown", (e) => e.key === "Enter" && loadCertificates());
  productFilter.addEventListener("change", loadCertificates);
  statusFilter.addEventListener("change", loadCertificates);

  document.getElementById("certIssueBtn").addEventListener("click", async () => {
    const email = prompt("Customer's email address:");
    if (!email) return;

    let customerId;
    try {
      const lookup = await centralApi(`/api/customers/lookup?email=${encodeURIComponent(email)}`);
      customerId = lookup.customer.id;
    } catch (err) {
      const createNew = confirm(
        `No customer found for ${email}.\n\nCreate a new record for this student now? (Use this for legacy/pre-existing students not in the payment system.)`
      );
      if (!createNew) return;
      const name = prompt("Student's full name:") || null;
      try {
        const created = await centralApi("/api/customers", {
          method: "POST",
          body: JSON.stringify({ email, name }),
        });
        customerId = created.customer.id;
      } catch (err2) {
        statusMsg.textContent = `Error creating customer: ${err2.message}`;
        return;
      }
    }

    const productId = prompt("Product ID (e.g. codevent-web-development-course):");
    if (!productId) return;
    const recipientName = prompt("Recipient full name:");
    if (!recipientName) return;
    const courseCompletedAt = prompt("Course completed date (YYYY-MM-DD):");
    if (!courseCompletedAt) return;

    try {
      const data = await centralApi("/api/certificates", {
        method: "POST",
        body: JSON.stringify({ customerId, productId, recipientName, courseCompletedAt }),
      });
      statusMsg.textContent = `Issued certificate ${data.certificate.certificate_id}.`;
      loadCertificates();
    } catch (err) {
      if (/no purchase\/entitlement/i.test(err.message)) {
        const confirmOverride = confirm(
          "No purchase record found for this customer/product.\n\nOnly confirm if you have manually verified this student paid or completed the course before this system existed."
        );
        if (!confirmOverride) { statusMsg.textContent = "Issuance cancelled."; return; }
        try {
          const data = await centralApi("/api/certificates", {
            method: "POST",
            body: JSON.stringify({ customerId, productId, recipientName, courseCompletedAt, override: true }),
          });
          statusMsg.textContent = `Issued certificate ${data.certificate.certificate_id} (manual override).`;
          loadCertificates();
        } catch (err2) {
          statusMsg.textContent = `Error: ${err2.message}`;
        }
      } else {
        statusMsg.textContent = `Error: ${err.message}`;
      }
    }
  });

  if (navBtn) {
    navBtn.addEventListener("click", () => {
      panel.hidden = false;
      loadCertificates();
    });
  } else {
    loadCertificates();
  }
  } catch (err) {
    // Never fail silently into a blank panel — show what went wrong.
    const panel = document.getElementById("certificatesPanel");
    if (panel) {
      panel.innerHTML = `<p style="color:#ff5c5c;">Certificates panel failed to load: ${err.message}<br/>
        Check that certificates.js and central-config.js are both uploaded to admin-console/, and that CENTRAL_WORKER_URL is correct.</p>`;
    }
    console.error("Certificates panel init failed:", err);
  }
}

document.addEventListener("DOMContentLoaded", initCertificatesPanel);
