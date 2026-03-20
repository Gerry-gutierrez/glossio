/* ─── Dashboard Home ─────────────────────────────────────────────────────── */

function fmt(n) { return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

function loadDashStats() {
  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();

  const getMonth = (a) => parseInt(a.date.split("-")[1]);
  const getYear = (a) => parseInt(a.date.split("-")[0]);

  /* Load appointments */
  let appts = [];
  try { appts = JSON.parse(localStorage.getItem("glossio_appointments") || "[]"); } catch(e) {}

  const completedThisMonth = appts.filter(a => a.status === "complete" && getMonth(a) === thisMonth && getYear(a) === thisYear);
  const projThisMonth = appts.filter(a => ["confirmed","pending"].includes(a.status) && getMonth(a) === thisMonth && getYear(a) === thisYear);
  const pending = appts.filter(a => a.status === "pending");

  const revMtd = completedThisMonth.reduce((s, a) => s + a.price, 0);
  const revProj = projThisMonth.reduce((s, a) => s + a.price, 0);

  /* Update stat cards */
  const statValues = document.querySelectorAll(".stat-value");
  const statDetails = document.querySelectorAll(".stat-detail");
  if (statValues[0]) statValues[0].textContent = fmt(revMtd);
  if (statValues[1]) statValues[1].textContent = fmt(revProj);
  if (statValues[2]) statValues[2].textContent = appts.length;
  if (statDetails[0]) statDetails[0].textContent = completedThisMonth.length + (completedThisMonth.length === 1 ? " job" : " jobs") + " completed";
  if (statDetails[1]) statDetails[1].textContent = projThisMonth.length + (projThisMonth.length === 1 ? " job" : " jobs") + " remaining";
  if (statDetails[2]) statDetails[2].textContent = pending.length + " awaiting confirmation";

  /* Pending banner */
  const banner = document.querySelector(".pending-banner");
  if (banner) {
    const pendingText = banner.querySelector(".pending-text");
    if (pending.length > 0) {
      banner.style.display = "";
      if (pendingText) pendingText.textContent = pending.length + " Pending Appointment" + (pending.length > 1 ? "s" : "");
    } else {
      banner.style.display = "none";
    }
  }

  /* Status legend */
  const confirmed = appts.filter(a => a.status === "confirmed").length;
  const complete = appts.filter(a => a.status === "complete").length;
  const statusItems = document.querySelectorAll(".status-item span");
  if (statusItems[0]) statusItems[0].textContent = "Pending (" + pending.length + ")";
  if (statusItems[1]) statusItems[1].textContent = "Confirmed (" + confirmed + ")";
  if (statusItems[2]) statusItems[2].textContent = "Complete (" + complete + ")";

  /* Appointment count */
  const apptSub = document.querySelector(".appt-subtitle");
  if (apptSub) apptSub.textContent = appts.length + " total";

  /* Recent appointments list */
  const emptyState = document.querySelector(".appt-card .empty-state");
  const recentContainer = document.getElementById("dash-recent-appts");

  if (appts.length > 0 && emptyState) emptyState.style.display = "none";
  if (appts.length === 0 && emptyState) emptyState.style.display = "";

  if (recentContainer) {
    const upcoming = appts
      .filter(a => ["pending","confirmed"].includes(a.status))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);

    if (upcoming.length > 0) {
      const statusColors = {
        pending: "#FFD60A", confirmed: "#00C2FF", complete: "#00E5A0", cancelled: "#FF3366"
      };
      recentContainer.innerHTML = upcoming.map(a => {
        const c = statusColors[a.status] || "#FFD60A";
        return '<div style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid var(--border)">' +
          '<div style="width:4px;height:40px;border-radius:2px;background:' + c + ';flex-shrink:0"></div>' +
          '<div style="flex:1;min-width:0">' +
            '<p style="margin:0 0 3px;font-size:14px;font-weight:700">' + a.client + '</p>' +
            '<p style="margin:0;font-size:12px;color:var(--text-dim)">' + a.service + ' · ' + a.date + '</p>' +
          '</div>' +
          '<div style="text-align:right;flex-shrink:0">' +
            '<p style="margin:0 0 2px;font-size:14px;font-weight:700;color:var(--success)">' + fmt(a.price) + '</p>' +
            '<span style="font-size:10px;background:' + c + '15;color:' + c + ';border:1px solid ' + c + '33;border-radius:20px;padding:2px 8px;font-weight:700;text-transform:uppercase">' + a.status + '</span>' +
          '</div>' +
        '</div>';
      }).join("");
    }
  }
}

/* ── Quick Actions ───────────────────────────────────────────────────────── */

function copyBookingLink(e) {
  if (e) e.preventDefault();
  const slug = "yourbusiness";
  const url = window.location.origin + "/" + slug + "/";
  navigator.clipboard.writeText(url).then(() => {
    showDashToast("Booking link copied!");
  }).catch(() => {
    showDashToast("Link: " + url);
  });
}

function showDashToast(msg) {
  const existing = document.getElementById("dash-toast");
  if (existing) existing.remove();
  const t = document.createElement("div");
  t.id = "dash-toast";
  t.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#00E5A0;border-radius:10px;padding:12px 24px;display:flex;align-items:center;gap:8px;box-shadow:0 8px 32px rgba(0,229,160,0.3);z-index:999";
  t.innerHTML = '<span style="font-size:16px">✓</span><span style="font-size:13px;font-weight:700;color:#0A0A0F">' + msg + '</span>';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

/* ── Init ─────────────────────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", function() {
  loadDashStats();

  /* Wire up "Copy Booking Link" quick action */
  document.querySelectorAll(".quick-card").forEach(card => {
    const label = card.querySelector(".quick-label");
    if (label && label.textContent.includes("Copy Booking Link")) {
      card.addEventListener("click", function(e) {
        e.preventDefault();
        copyBookingLink();
      });
    }
  });
});
