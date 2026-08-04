// Shared JSONBin.io client for the "pending entries" queue — added
// 2026-08-04, extracted out of index.html once the 3 interactive workout
// guides (workout_guides/*.html) also needed the same read/write logic.
// Loaded by index.html AND all 3 guide pages (relative path differs: guides
// are one directory deeper, so they load "../quicklog-config.js").
//
// Kept in its own file specifically so the bin ID/access key can never
// drift out of sync across 4 different HTML files — filling this in once
// here wires up Quick Log on the dashboard AND weight/reps/feel logging on
// every workout guide at the same time.
//
// Fill in binId + accessKey once the JSONBin bin exists (Bobby creates it —
// see WORKFLOW.md for exact steps; Claude can't create third-party accounts
// on his behalf). accessKey should be a JSONBin "Access Key" scoped to
// read+update only, NOT the account's master key.
const QUICKLOG_CONFIG = {
  binId: "",
  accessKey: "",
};

function quicklogConfigured() {
  return !!(QUICKLOG_CONFIG.binId && QUICKLOG_CONFIG.accessKey);
}

async function fetchPendingEntries() {
  if (!quicklogConfigured()) return [];
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${QUICKLOG_CONFIG.binId}/latest`, {
      headers: { "X-Access-Key": QUICKLOG_CONFIG.accessKey },
    });
    if (!res.ok) throw new Error(`read failed (${res.status})`);
    const json = await res.json();
    return Array.isArray(json.record) ? json.record : [];
  } catch (err) {
    console.warn("Quick Log: couldn't read pending queue —", err);
    return [];
  }
}

async function savePendingEntries(entries) {
  const res = await fetch(`https://api.jsonbin.io/v3/b/${QUICKLOG_CONFIG.binId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Access-Key": QUICKLOG_CONFIG.accessKey,
    },
    body: JSON.stringify(entries),
  });
  if (!res.ok) throw new Error(`write failed (${res.status})`);
}
