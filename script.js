"use strict";

/* DATA */
const KEY = "clubGear.v1";
const today = () => new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

// Sample records (8 items, 6 reservations). Reservation status: pending | approved | rejected | returned
const seed = () => ({
  items: [
    { id: 1, name: "Canon DSLR camera",   category: "Media",   condition: "Good" },
    { id: 2, name: "Tripod",              category: "Media",   condition: "Good" },
    { id: 3, name: "Epson projector",     category: "Display", condition: "Fair" },
    { id: 4, name: "Wireless mic set",    category: "Audio",   condition: "Good" },
    { id: 5, name: "Portable speaker",    category: "Audio",   condition: "Fair" },
    { id: 6, name: "20m extension cable", category: "Power",   condition: "Needs repair" },
    { id: 7, name: "Laptop",              category: "Computing", condition: "Good" },
    { id: 8, name: "Banner stand",        category: "Display", condition: "Good" },
  ],
  reservations: [
    { id: 1, itemId: 1, name: "Manahil Faran",  studentId: "511190", start: "2026-11-16", end: "2026-11-18", purpose: "Society photoshoot",   status: "approved" },
    { id: 2, itemId: 3, name: "Murshad Aziz",  studentId: "508792", start: "2026-11-12", end: "2026-11-13", purpose: "Orientation session",  status: "approved" },
    { id: 3, itemId: 4, name: "Armaghan Mehmood Shams",   studentId: "510780", start: "2026-11-20", end: "2026-11-21", purpose: "Debate night",         status: "pending" },
    { id: 4, itemId: 5, name: "Ali Abdullah Abbasi",  studentId: "509561", start: "2026-11-25", end: "2026-11-26", purpose: "Club social",          status: "pending" },
    { id: 5, itemId: 7, name: "Abdur Rafay",  studentId: "508369", start: "2026-11-02", end: "2026-11-04", purpose: "Workshop slides",      status: "returned" },
    { id: 6, itemId: 2, name: "Rida Shah", studentId: "509451", start: "2026-11-14", end: "2026-11-15", purpose: "Personal project",    status: "rejected" },
  ],
});

// Load from localStorage if possible, else use sample data
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* storage blocked or corrupt: fall back to seed */ }
  return seed();
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}

let state = load();

/* 2. HELPERS */
const $ = (id) => document.getElementById(id);

// Build an element safely (textContent, never innerHTML)
function el(tag, text, cls) {
  const n = document.createElement(tag);
  if (text !== undefined) n.textContent = text;
  if (cls) n.className = cls;
  return n;
}
function button(label, ariaLabel, onClick) {
  const b = el("button", label);
  b.type = "button";
  b.setAttribute("aria-label", ariaLabel);
  b.addEventListener("click", onClick);
  return b;
}
function say(id, text, ok) {
  const n = $(id);
  n.textContent = text;
  n.className = "msg " + (ok ? "ok" : "err");
}

const itemById = (id) => state.items.find((i) => i.id === id);
const nextId = (list) => list.reduce((max, x) => Math.max(max, x.id), 0) + 1;

// Two date ranges overlap if each starts before the other ends
const overlaps = (a, b) => a.start <= b.end && b.start <= a.end;

// Status is calculated from condition + approved bookings, not stored
function statusOf(item) {
  if (item.condition === "Needs repair") return "Under repair";
  const t = today();
  const live = state.reservations.filter((r) => r.itemId === item.id && r.status === "approved");
  if (live.some((r) => r.start <= t && t <= r.end)) return "In use";
  if (live.some((r) => r.start > t)) return "Reserved";
  return "Available";
}

// Conflict check: any pending/approved booking for the same item that overlaps
function findConflict(itemId, start, end) {
  return state.reservations.find(
    (r) => r.itemId === itemId && (r.status === "pending" || r.status === "approved") && overlaps(r, { start, end })
  );
}

/* 3. RENDERING */
function renderInventory() {
  const q = $("search").value.trim().toLowerCase();
  const cond = $("f-condition").value;
  const stat = $("f-status").value;

  const shown = state.items
    .filter((i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q))
    .filter((i) => !cond || i.condition === cond)
    .filter((i) => !stat || statusOf(i) === stat);

  const list = $("inventory-list");
  list.replaceChildren();
  shown.forEach((i) => {
    const li = el("li", undefined, "card cond-" + i.condition.replace(" ", "-").toLowerCase());
    li.append(el("h3", i.name), el("p", i.category, "muted"), el("p", "Condition: " + i.condition), el("p", statusOf(i), "badge"));
    list.append(li);
  });

  $("inventory-count").textContent = `${shown.length} of ${state.items.length} items shown`;
  $("inventory-empty").hidden = shown.length > 0; // empty state
}

function renderSelects() {
  // Reserve form: items that are not under repair
  const sel = $("r-item");
  sel.replaceChildren(new Option("Choose an item", ""));
  state.items
    .filter((i) => i.condition !== "Needs repair")
    .forEach((i) => sel.append(new Option(i.name, i.id)));

  // Return form: approved bookings only
  const ret = $("ret-res");
  const approved = state.reservations.filter((r) => r.status === "approved");
  ret.replaceChildren(new Option(approved.length ? "Choose a booking" : "No approved bookings to return", ""));
  approved.forEach((r) => ret.append(new Option(`${itemById(r.itemId).name} - ${r.name} (${r.start} to ${r.end})`, r.id)));
}

function renderRequests() {
  const order = { pending: 0, approved: 1, returned: 2, rejected: 3 };
  const rows = [...state.reservations].sort(
    (a, b) => order[a.status] - order[b.status] || a.start.localeCompare(b.start)
  );

  const list = $("request-list");
  list.replaceChildren();
  rows.forEach((r) => {
    const name = itemById(r.itemId).name;
    const li = el("li", undefined, "request");

    const info = el("div");
    info.append(
      el("strong", name),
      el("p", `${r.name} (${r.studentId}), ${r.start} to ${r.end}`),
      el("p", r.purpose, "muted")
    );

    const side = el("div", undefined, "actions");
    side.append(el("span", r.status, "badge st-" + r.status));
    if (r.status === "pending") {
      side.append(
        button("Approve", `Approve ${name} for ${r.name}`, () => decide(r.id, "approved")),
        button("Reject", `Reject ${name} for ${r.name}`, () => decide(r.id, "rejected"))
      );
    }
    li.append(info, side);
    list.append(li);
  });
  $("request-empty").hidden = rows.length > 0;
}

function renderAll() {
  renderInventory();
  renderSelects();
  renderRequests();
}

/* 4. ACTIONS */
function decide(id, status) {
  const r = state.reservations.find((x) => x.id === id);
  if (!r) return;
  if (status === "approved" &&
      state.reservations.some((o) => o.id !== r.id && o.itemId === r.itemId && o.status === "approved" && overlaps(o, r))) {
    say("request-msg", "Can't approve: another approved booking overlaps these dates.", false);
    return;
  }
  r.status = status;
  save();
  renderAll();
  say("request-msg", `Request ${status}.`, true);
}

function onReserve(e) {
  e.preventDefault();
  const f = e.target;
  const data = {
    name: f.name.value.trim(),
    studentId: f.studentId.value.trim(),
    itemId: Number(f.item.value),
    start: f.start.value,
    end: f.end.value,
    purpose: f.purpose.value.trim(),
  };

  // Validation: each check gives a specific, fixable message
  if (data.name.length < 2) return say("reserve-msg", "Enter the borrower's full name.", false);
  if (!/^[0-9]{6}$/.test(data.studentId)) return say("reserve-msg", "Student ID must be exactly 6 digits.", false);
  const item = itemById(data.itemId);
  if (!item) return say("reserve-msg", "Choose an item to reserve.", false);
  if (item.condition === "Needs repair") return say("reserve-msg", "This item needs repair and can't be reserved.", false);
  if (!data.start || !data.end) return say("reserve-msg", "Pick both a start and an end date.", false);
  if (data.start < today()) return say("reserve-msg", "Start date can't be in the past.", false);
  if (data.end < data.start) return say("reserve-msg", "End date must be on or after the start date.", false);
  if (data.purpose.length < 5) return say("reserve-msg", "Describe the purpose in at least 5 characters.", false);

  const clash = findConflict(data.itemId, data.start, data.end);
  if (clash) {
    return say("reserve-msg", `Not available: ${item.name} is already booked ${clash.start} to ${clash.end}. Pick other dates.`, false);
  }

  state.reservations.push({ id: nextId(state.reservations), status: "pending", ...data });
  save();
  renderAll();
  f.reset();
  say("reserve-msg", "Request sent. A manager can approve it under Requests.", true);
}

function onReturn(e) {
  e.preventDefault();
  const resId = Number($("ret-res").value);
  const cond = $("ret-cond").value;
  const checks = [...document.querySelectorAll("#return-form input[name=check]")];
  const allChecked = checks.every((c) => c.checked);

  const r = state.reservations.find((x) => x.id === resId && x.status === "approved");
  if (!r) return say("return-msg", "Choose an approved booking to return.", false);
  if (!cond) return say("return-msg", "Choose the condition after return.", false);
  if (!allChecked && cond === "Good") {
    return say("return-msg", "Checklist is incomplete, so the condition can't be 'Good'. Pick Fair or Needs repair.", false);
  }

  r.status = "returned";
  itemById(r.itemId).condition = cond; // return updates the item's condition
  save();
  renderAll();
  e.target.reset();
  say("return-msg", `Checked in. Condition set to ${cond}.`, true);
}

/* 5. START UP */
$("r-start").min = today();
$("r-end").min = today();

$("filter-form").addEventListener("input", renderInventory);
$("filter-form").addEventListener("submit", (e) => e.preventDefault());
$("reserve-form").addEventListener("submit", onReserve);
$("return-form").addEventListener("submit", onReturn);
$("reset").addEventListener("click", () => {
  if (confirm("Reset all data back to the sample records?")) {
    state = seed();
    save();
    renderAll();
  }
});

renderAll();