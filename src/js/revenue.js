/* ─── Revenue Page ────────────────────────────────────────────────────────── */

function fmt(n) { return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

/* ── Debts (We Owe) ── */

var _debts = [];

function loadDebts() {
  if (!window.db || !window.db.debts) return;
  window.db.debts.list().then(function(rows) {
    _debts = rows || [];
    renderDebts();
  });
}

function renderDebts() {
  var list = document.getElementById("debts-list");
  var empty = document.getElementById("debts-empty");
  if (!list) return;

  /* Split into unpaid and paid */
  var unpaid = _debts.filter(function(d) { return !d.is_paid; });
  var paid = _debts.filter(function(d) { return d.is_paid; });

  if (_debts.length === 0) {
    list.innerHTML = "";
    if (empty) empty.style.display = "";
    return;
  }
  if (empty) empty.style.display = "none";

  var totalOwed = unpaid.reduce(function(s, d) { return s + (parseFloat(d.amount) || 0); }, 0);

  var html = "";

  /* Total owed banner */
  if (unpaid.length > 0) {
    html += '<div style="background:rgba(255,51,102,0.08);border:1px solid rgba(255,51,102,0.25);border-radius:10px;padding:14px 16px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center">';
    html += '<span style="font-size:13px;color:#FF3366;font-weight:600">Total Outstanding</span>';
    html += '<span style="font-size:18px;color:#FF3366;font-weight:800">' + fmt(totalOwed) + '</span>';
    html += '</div>';
  }

  /* Unpaid entries */
  for (var i = 0; i < unpaid.length; i++) {
    html += renderDebtCard(unpaid[i], false);
  }

  /* Paid entries (collapsed section) */
  if (paid.length > 0) {
    html += '<div style="margin-top:20px;border-top:1px solid #1E1E2E;padding-top:16px">';
    html += '<p style="font-size:12px;color:#555;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px 0">Paid (' + paid.length + ')</p>';
    for (var j = 0; j < paid.length; j++) {
      html += renderDebtCard(paid[j], true);
    }
    html += '</div>';
  }

  list.innerHTML = html;
}

function renderDebtCard(d, isPaid) {
  var name = escDebt(((d.first_name || "") + " " + (d.last_name || "")).trim());
  var amount = parseFloat(d.amount) || 0;
  var phone = escDebt(d.phone || "");
  var notes = escDebt(d.notes || "");
  var opacity = isPaid ? "opacity:0.5;" : "";
  var strikethrough = isPaid ? "text-decoration:line-through;" : "";

  var html = '<div style="background:#0D0D12;border:1.5px solid #1E1E2E;border-radius:10px;padding:14px 16px;margin-bottom:10px;' + opacity + '">';
  html += '<div style="display:flex;justify-content:space-between;align-items:flex-start">';
  html += '<div style="flex:1;min-width:0">';
  html += '<p style="font-size:14px;font-weight:600;color:#fff;margin:0;' + strikethrough + '">' + name + '</p>';
  if (phone) {
    html += '<p style="font-size:12px;color:#888;margin:4px 0 0 0">' + phone + '</p>';
  }
  if (notes) {
    html += '<p style="font-size:11px;color:#555;margin:4px 0 0 0;font-style:italic">' + notes + '</p>';
  }
  html += '</div>';
  html += '<div style="text-align:right;flex-shrink:0;margin-left:12px">';
  html += '<p style="font-size:16px;font-weight:700;color:' + (isPaid ? '#00E5A0' : '#FF3366') + ';margin:0;' + strikethrough + '">' + fmt(amount) + '</p>';
  html += '<div style="display:flex;gap:6px;margin-top:8px;justify-content:flex-end">';

  if (!isPaid) {
    html += '<button onclick="markDebtPaid(\'' + d.id + '\')" style="background:rgba(0,229,160,0.1);border:1px solid rgba(0,229,160,0.3);border-radius:6px;color:#00E5A0;font-size:11px;font-weight:600;padding:4px 10px;cursor:pointer" title="Mark as paid">Paid</button>';
    html += '<button onclick="openEditDebt(\'' + d.id + '\')" style="background:rgba(255,255,255,0.05);border:1px solid #1E1E2E;border-radius:6px;color:#888;font-size:11px;padding:4px 10px;cursor:pointer">Edit</button>';
  } else {
    html += '<button onclick="unmarkDebtPaid(\'' + d.id + '\')" style="background:rgba(255,255,255,0.05);border:1px solid #1E1E2E;border-radius:6px;color:#888;font-size:11px;padding:4px 10px;cursor:pointer">Undo</button>';
  }
  html += '<button onclick="deleteDebt(\'' + d.id + '\')" style="background:rgba(255,51,102,0.1);border:1px solid rgba(255,51,102,0.2);border-radius:6px;color:#FF3366;font-size:11px;padding:4px 10px;cursor:pointer">Delete</button>';
  html += '</div></div></div></div>';
  return html;
}

function escDebt(s) {
  var div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function openDebtModal() {
  document.getElementById("debt-edit-id").value = "";
  document.getElementById("debt-first").value = "";
  document.getElementById("debt-last").value = "";
  document.getElementById("debt-phone").value = "";
  document.getElementById("debt-amount").value = "";
  document.getElementById("debt-notes").value = "";
  document.getElementById("debt-modal-title").textContent = "Add Entry";
  document.getElementById("debt-modal").style.display = "flex";
}

function openEditDebt(id) {
  var d = _debts.find(function(x) { return x.id === id; });
  if (!d) return;
  document.getElementById("debt-edit-id").value = d.id;
  document.getElementById("debt-first").value = d.first_name || "";
  document.getElementById("debt-last").value = d.last_name || "";
  document.getElementById("debt-phone").value = d.phone || "";
  document.getElementById("debt-amount").value = d.amount || "";
  document.getElementById("debt-notes").value = d.notes || "";
  document.getElementById("debt-modal-title").textContent = "Edit Entry";
  document.getElementById("debt-modal").style.display = "flex";
}

function closeDebtModal() {
  document.getElementById("debt-modal").style.display = "none";
}

function submitDebt() {
  var first = document.getElementById("debt-first").value.trim();
  var amount = parseFloat(document.getElementById("debt-amount").value);
  if (!first) { alert("First name is required"); return; }
  if (!amount || amount <= 0) { alert("Amount must be greater than 0"); return; }

  var data = {
    first_name: first,
    last_name: document.getElementById("debt-last").value.trim(),
    phone: document.getElementById("debt-phone").value.trim(),
    amount: amount,
    notes: document.getElementById("debt-notes").value.trim()
  };

  var editId = document.getElementById("debt-edit-id").value;
  var promise;
  if (editId) {
    promise = window.db.debts.update(editId, data);
  } else {
    promise = window.db.debts.create(data);
  }

  promise.then(function() {
    closeDebtModal();
    loadDebts();
    if (window.showToast) showToast();
  });
}

function markDebtPaid(id) {
  window.db.debts.update(id, { is_paid: true }).then(function() {
    loadDebts();
    if (window.showToast) showToast();
  });
}

function unmarkDebtPaid(id) {
  window.db.debts.update(id, { is_paid: false }).then(function() {
    loadDebts();
  });
}

function deleteDebt(id) {
  if (!confirm("Delete this entry?")) return;
  window.db.debts.remove(id).then(function() {
    loadDebts();
  });
}

/* ── Revenue (from completed appointments) ── */

function loadRevenue() {
  if (!window.db || !window.db.appointments) return;
  window.db.appointments.list().then(function(rows) {
    var appts = (rows || []).map(function(a) {
      return {
        date: a.appt_date || a.scheduled_date || a.date || "",
        price: parseFloat(a.price) || parseFloat(a.service_price) || 0,
        status: a.status || "pending",
        notes: a.notes || ""
      };
    });
    renderRevenue(appts);
  });
}

function parseProductTotal(notes) {
  if (!notes || typeof notes !== "string") return 0;
  var idx = notes.indexOf("Products Total: $");
  if (idx === -1) return 0;
  var chunk = notes.slice(idx + 17);
  return parseFloat(chunk) || 0;
}

function renderRevenue(appts) {
  var now = new Date();
  var thisMonth = now.getMonth() + 1;
  var thisYear = now.getFullYear();

  /* Only completed appointments count as revenue */
  var completed = appts.filter(function(a) { return a.status === "complete"; });

  /* Group by year-month */
  var months = {};
  var allTimeRev = 0;
  var allTimeJobs = 0;

  for (var i = 0; i < completed.length; i++) {
    var a = completed[i];
    var parts = (a.date || "").split("-");
    var y = parseInt(parts[0]) || 0;
    var m = parseInt(parts[1]) || 0;
    if (!y || !m) continue;

    var key = y + "-" + String(m).padStart(2, "0");
    if (!months[key]) months[key] = { year: y, month: m, revenue: 0, jobs: 0 };

    var rev = a.price + parseProductTotal(a.notes);
    months[key].revenue += rev;
    months[key].jobs += 1;
    allTimeRev += rev;
    allTimeJobs += 1;
  }

  /* MTD */
  var mtdKey = thisYear + "-" + String(thisMonth).padStart(2, "0");
  var mtd = months[mtdKey] || { revenue: 0, jobs: 0 };

  var mtdEl = document.getElementById("rev-mtd-value");
  var mtdJobsEl = document.getElementById("rev-mtd-jobs");
  if (mtdEl) mtdEl.textContent = fmt(mtd.revenue);
  if (mtdJobsEl) mtdJobsEl.textContent = mtd.jobs + (mtd.jobs === 1 ? " job" : " jobs") + " completed";

  /* All time */
  var totalEl = document.getElementById("rev-total-value");
  var totalJobsEl = document.getElementById("rev-total-jobs");
  if (totalEl) totalEl.textContent = fmt(allTimeRev);
  if (totalJobsEl) totalJobsEl.textContent = allTimeJobs;

  /* Monthly history — sorted newest first */
  var keys = Object.keys(months).sort().reverse();
  var historyEl = document.getElementById("rev-history");
  if (!historyEl) return;

  if (keys.length === 0) {
    historyEl.innerHTML = '<p style="text-align:center;color:#444;font-size:13px;padding:20px 0">No completed jobs yet</p>';
    return;
  }

  var monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var html = "";

  for (var k = 0; k < keys.length; k++) {
    var entry = months[keys[k]];
    var isCurrentMonth = (entry.year === thisYear && entry.month === thisMonth);
    var highlight = isCurrentMonth ? "border-left:3px solid #00E5A0;padding-left:13px;" : "padding-left:16px;";

    html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;' + highlight + 'background:#0D0D12;border:1px solid #1E1E2E;border-radius:8px;margin-bottom:8px">';
    html += '<div>';
    html += '<p style="font-size:14px;font-weight:600;color:#fff;margin:0">' + monthNames[entry.month] + ' ' + entry.year + '</p>';
    html += '<p style="font-size:11px;color:#555;margin:2px 0 0 0">' + entry.jobs + (entry.jobs === 1 ? " job" : " jobs") + '</p>';
    html += '</div>';
    html += '<p style="font-size:16px;font-weight:700;color:#00E5A0;margin:0">' + fmt(entry.revenue) + '</p>';
    html += '</div>';
  }

  historyEl.innerHTML = html;
}

/* ── Init ── */
document.addEventListener("DOMContentLoaded", function() {
  loadDebts();
  loadRevenue();
});
