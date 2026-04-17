/* ── 1. CONFIGURATION ─────────────────────── */

const FEATURE_LAYER_URL =
  "https://services.arcgis.com/ts4gk3YgS68yLGFl/arcgis/rest/services/Florida_Flood_Warning_Areas_view/FeatureServer/0/query";

const REFRESH_MS = 15 * 60 * 1000; // 15 minutes


/* ── 2. GET TODAY IN ALABAMA TIME ─────────────
   Returns "YYYY-MM-DD" in Alabama local time.
   e.g. at 8 PM Alabama on Apr 16 → "2026-04-16"
   (NOT "2026-04-17" which UTC would give)
   ─────────────────────────────────────────── */

function getTodayAlabama() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Chicago"
  });
  // "en-CA" locale forces YYYY-MM-DD format
  // which is exactly what ArcGIS DATE syntax needs
}


/* ── 3. FETCH HELPER ──────────────────────── */

async function arcgisCount(params) {
  const res  = await fetch(`${FEATURE_LAYER_URL}?${params}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  if (typeof data.count === "number") return data.count;
  throw new Error("No count in response");
}


/* ── 4. MAIN FETCH WITH FALLBACK ──────────────
   Attempt 1: Status=Active AND today's date (Alabama time)
   Attempt 2: Status=Active only (if date filter fails)
   ─────────────────────────────────────────── */

async function getLiveCount() {
  const today = getTodayAlabama();

  // Log so you can verify in browser console (F12)
  console.log("Querying for Alabama date:", today);

  // Attempt 1 — full filter with Alabama date
  try {
    const count = await arcgisCount(new URLSearchParams({
      where:           `Status='Active'`,
      returnCountOnly: "true",
      f:               "json"
    }));
    console.log("Result (date filter):", count);
    return count;
  } catch (e) {
    console.warn("Date filter failed:", e.message);
  }

  // Attempt 2 — status only fallback (no date)
  try {
    const count = await arcgisCount(new URLSearchParams({
      where:           `Status='Active'`,
      returnCountOnly: "true",
      f:               "json"
    }));
    console.log("Result (status-only fallback):", count);
    return count;
  } catch (e) {
    console.warn("Status-only filter also failed:", e.message);
  }

  return null; // all attempts failed
}


/* ── 5. UPDATE THE PILL ───────────────────── */

async function fetchActiveCount() {
  const dot   = document.getElementById("live-dot");
  const count = document.getElementById("active-count");

  // Show loading state
  dot.classList.add("loading");
  count.classList.add("updating");

  const result = await getLiveCount();

  setTimeout(() => {
    // Show number, or "—" if everything failed
    count.textContent = (result !== null) ? result : "—";
    count.classList.remove("updating");
    dot.classList.remove("loading");

    // Update ribbon with Alabama local time
    document.getElementById("last-updated").textContent =
      "Updated " + new Date().toLocaleTimeString("en-US", {
        timeZone: "America/Chicago",
        hour:     "2-digit",
        minute:   "2-digit"
      });

  }, 320);
}


/* ── 6. HIDE LOADER WHEN DASHBOARD LOADS ─────
   Called by onload="onDashboardLoaded()" in index.html
   ─────────────────────────────────────────── */

function onDashboardLoaded() {
  const loader = document.getElementById("loader");
  if (loader) loader.classList.add("hidden");
}


/* ── 7. START ─────────────────────────────── */

fetchActiveCount();
setInterval(fetchActiveCount, REFRESH_MS);
