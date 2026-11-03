const SVG_NS = "http://www.w3.org/2000/svg";
const M = { top: 22, right: 8, bottom: 8, left: 42 };
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Every plot gets the same height, whatever its range.
const PLOT_H = 190, PLOT_H_NARROW = 150;

function parseDate(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

function yearSuffix(d) {
  return `'${String(d.getFullYear()).slice(2)}`;
}

function fmt(x) {
  return String(Math.round(x * 10) / 10);
}

// Epley-implied load at the lift's target reps.
function impliedLoad(weight, reps, targetReps) {
  return weight * (30 + reps) / (30 + targetReps);
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines.shift().split(",").map(s => s.trim());
  return lines.filter(l => l.trim()).map(line => {
    const cells = line.split(",").map(s => s.trim());
    return Object.fromEntries(header.map((h, i) => [h, cells[i]]));
  });
}

function el(name, attrs, parent) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, v);
  if (parent) parent.appendChild(node);
  return node;
}

function niceStep(span, count) {
  const raw = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  for (const f of [1, 2, 2.5, 5, 10]) if (f * mag >= raw) return f * mag;
  return 10 * mag;
}

// Of the nice steps (5, 2.5, 2, 1 times a power of ten) that put a gridline
// exactly on the target, use the one closest to the default spacing.
function gridStep(span, target) {
  const base = niceStep(span, 4);
  let best = null;
  for (let e = Math.ceil(Math.log10(base)) + 1; e >= -3; e--) {
    for (const f of [5, 2.5, 2, 1]) {
      const step = f * Math.pow(10, e);
      const k = target / step;
      if (Math.abs(k - Math.round(k)) > 1e-9) continue;
      const dist = Math.abs(Math.log(step / base));
      if (!best || dist < best.dist) best = { step, dist };
    }
  }
  return best ? best.step : base;
}

const overlaps = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

// Places text at the first candidate spot clear of the boxes already taken.
function placeText(svg, boxes, text, cls, spots, charW, h, bounds) {
  const w = text.length * charW;
  const cands = spots
    .map(s => ({ x0: Math.max(s.x, bounds.x0), y0: s.y }))
    .map(s => ({ x0: s.x0, x1: s.x0 + w, y0: s.y0, y1: s.y0 + h }))
    .filter(b => b.x1 <= bounds.x1 && b.y0 >= bounds.y0 && b.y1 <= bounds.y1);
  const spot = cands.find(b => !boxes.some(o => overlaps(o, b))) || cands[0];
  if (!spot) return;
  el("text", { class: cls, x: spot.x0, y: spot.y1 - 2 }, svg).textContent = text;
  boxes.push(spot);
}

function drawLift(lift, points, domain, box) {
  box.textContent = "";
  const W = Math.max(box.clientWidth, 260);
  const [t0, t1] = domain;
  const x = d => M.left + (d - t0) / (t1 - t0) * (W - M.left - M.right);

  const ts = parseDate(lift.start.date), tt = parseDate(lift.target.date);
  const values = [lift.start.value, lift.target.value, ...points.map(p => p.value)];
  const lo = Math.min(...values), hi = Math.max(...values);
  const pad = (hi - lo) * 0.08 || 1;
  // The range snaps outward to whole gridlines, so it starts and ends on one.
  const step = gridStep(hi - lo + 2 * pad, lift.target.value);
  const y0 = Math.floor((lo - pad) / step) * step, y1 = Math.ceil((hi + pad) / step) * step;

  const plotH = W < 480 ? PLOT_H_NARROW : PLOT_H;
  const H = M.top + plotH + M.bottom;
  const y = v => M.top + (y1 - v) / (y1 - y0) * plotH;

  const svg = el("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": `${lift.name} progress` }, box);
  const right = W - M.right;
  const boxes = [];

  for (let d = new Date(t0.getFullYear(), t0.getMonth(), 1, 12); d <= t1; d = new Date(d.getFullYear(), d.getMonth() + 1, 1, 12)) {
    if (d >= t0) el("line", { class: "month", x1: x(d), x2: x(d), y1: M.top, y2: M.top + plotH }, svg);
  }

  for (let v = Math.ceil(y0 / step) * step; v <= y1 + 1e-9; v += step) {
    if (Math.abs(v - lift.target.value) < 1e-9) continue;
    el("line", { class: "gridline", x1: M.left, x2: right, y1: y(v), y2: y(v) }, svg);
    el("text", { class: "y-tick", x: M.left - 8, y: y(v) + 4.5, "text-anchor": "end" }, svg).textContent = fmt(v);
  }
  const ty = y(lift.target.value);
  el("line", { class: "target-line", x1: M.left, x2: right, y1: ty, y2: ty }, svg);
  el("text", { class: "target-value", x: M.left - 8, y: ty + 4.5, "text-anchor": "end" }, svg).textContent = fmt(lift.target.value);

  el("line", { class: "plan", x1: x(ts), y1: y(lift.start.value), x2: x(tt), y2: ty }, svg);
  el("circle", { class: "target-dot", cx: x(tt), cy: ty, r: 2.2 }, svg);

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  if (today >= ts && today <= tt) {
    const f = (today - ts) / (tt - ts);
    const v = lift.start.value + f * (lift.target.value - lift.start.value);
    el("line", { class: "today", x1: x(today), x2: x(today), y1: y(v) - 5, y2: y(v) + 5 }, svg);
  }

  // The start counts as the first point, unless a set was logged on the start
  // date, in which case that set is the start.
  const loggedOnStart = points.some(p => p.date.getTime() === ts.getTime());
  const series = [...(loggedOnStart ? [] : [{ date: ts, value: lift.start.value, start: true }]), ...points];
  const latest = series[series.length - 1];
  const best = series.reduce((a, b) => (b.value >= a.value ? b : a));

  for (const p of series) {
    const cx = x(p.date), cy = y(p.value);
    boxes.push({ x0: cx - 4, x1: cx + 4, y0: cy - 4, y1: cy + 4 });
  }

  el("circle", { class: "start" + (latest.start ? " latest" : ""), cx: x(ts), cy: y(lift.start.value), r: 3 }, svg);
  for (const p of points) {
    const cx = x(p.date), cy = y(p.value);
    el("circle", { class: "dot" + (p === latest ? " latest" : ""), cx, cy, r: p === latest ? 3.5 : 2.5 }, svg);
  }

  const bounds = { x0: M.left, x1: right, y0: 0, y1: H };
  const label = (p, cls) => {
    const cx = x(p.date), cy = y(p.value), t = fmt(p.value);
    const w = t.length * 7;
    placeText(svg, boxes, t, cls, [
      { x: cx - w / 2, y: cy - 8 - 14 },
      { x: cx + 7, y: cy - 7 },
      { x: cx - w / 2, y: cy + 7 },
      { x: cx - 7 - w, y: cy - 7 },
      { x: cx - w / 2, y: cy - 22 - 14 },
    ], 7, 14, bounds);
  };
  if (best !== latest) label(best, "value");
  label(latest, "value latest");
}

function drawAxis(box, domain) {
  box.textContent = "";
  const W = Math.max(box.clientWidth, 260), H = 26;
  const [t0, t1] = domain;
  const x = d => M.left + (d - t0) / (t1 - t0) * (W - M.left - M.right);
  const svg = el("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, box);
  const narrow = W < 480;
  let i = 0;
  for (let d = new Date(t0.getFullYear(), t0.getMonth(), 1, 12); d <= t1; d = new Date(d.getFullYear(), d.getMonth() + 1, 1, 12)) {
    if (d < t0) continue;
    if (!narrow || i % 2 === 0) {
      el("line", { class: "axis-tick", x1: x(d), x2: x(d), y1: 0, y2: 5 }, svg);
      el("text", { x: x(d), y: 19, "text-anchor": "middle" }, svg).textContent = `${MONTHS[d.getMonth()]} ${yearSuffix(d)}`;
    }
    i++;
  }
}

function makeRow(stack, cls) {
  const row = document.createElement("section");
  row.className = "row" + (cls ? " " + cls : "");
  row.innerHTML = `<h2></h2><div class="plot"></div>`;
  stack.appendChild(row);
  return row;
}

async function main() {
  const stack = document.getElementById("stack");
  try {
    const [lifts, csv] = await Promise.all([
      fetch("data/lifts.json", { cache: "no-cache" }).then(r => r.json()),
      fetch("data/sets.csv", { cache: "no-cache" }).then(r => r.text()),
    ]);
    const sets = parseCsv(csv);
    const rows = lifts.map(lift => {
      const points = sets.filter(s => s.lift === lift.id).map(s => {
        return { date: parseDate(s.date), value: impliedLoad(Number(s.weight), Number(s.reps), lift.reps) };
      }).sort((a, b) => a.date - b.date);
      const row = makeRow(stack);
      const h2 = row.querySelector("h2");
      const unit = document.createElement("span");
      unit.className = "unit";
      unit.textContent = `est. ${lift.reps}-rep load, ${lift.unit}`;
      h2.append(lift.name, unit);
      return { lift, points, row };
    });
    const dates = rows.flatMap(r => [parseDate(r.lift.start.date), parseDate(r.lift.target.date), ...r.points.map(p => p.date)]);
    const domain = [new Date(Math.min(...dates)), new Date(Math.max(...dates))];
    const axisRow = makeRow(stack, "axis-row");
    axisRow.querySelector("h2").remove();

    const draw = () => {
      for (const r of rows) drawLift(r.lift, r.points, domain, r.row.querySelector(".plot"));
      drawAxis(axisRow.querySelector(".plot"), domain);
    };
    draw();
    let lastWidth = 0;
    new ResizeObserver(() => {
      const w = stack.clientWidth;
      if (w !== lastWidth) { lastWidth = w; draw(); }
    }).observe(stack);
  } catch (err) {
    stack.innerHTML = `<p class="error">Could not load data.</p>`;
    console.error(err);
  }
}

main();
