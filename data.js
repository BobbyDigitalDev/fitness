// CLAUDE REMINDER: This is the single source of truth for all dashboard charts.
// Update these arrays whenever Bobby sends new data:
// - calorieData + proteinData → food logs / meal updates
// - weightData → morning weigh-ins
// - stepsData + walksData → Fitbit EOD stats or walk reports
// - sleepData → sleep screenshots
// - gymWorkoutsData → gym session logs (exercises, sets, weights) → Workouts card in index.html
// - meals array → Meals card in index.html
// - events array → Activity card in index.html
// Always keep data.js and index.html static sections in sync.

// Bobby's Fitness Data — THE SINGLE SOURCE OF TRUTH for the dashboard.
// index.html is a display engine only — it has no hardcoded facts about
// Bobby (no weights, dates, scores, gym pricing, activity text). Every
// fact on the dashboard is read from one of the arrays/objects below.
// To change what the dashboard shows, edit this file only.
//
// Dates are always full ISO ("YYYY-MM-DD") so they sort correctly across
// year boundaries — index.html converts them to a readable label like
// "Jul 24 '26" for display.
//
// How to add a new entry (one line each, append to the end of the array,
// oldest first so charts/sorting read correctly):
//
//   weightData:      { date: "2026-07-26", value: 205.1, note: "morning fasted" }
//                    → note "non-fasted" (any casing/substring) to exclude a reading from the trend line and the primary stat card
//   calorieData:     { date: "2026-07-26", value: 1850, note: "" }
//                    → note "partial" to mark a day still in progress (bar renders in blue, not green; card labels it "in progress")
//   proteinData:     { date: "2026-07-26", value: 194, note: "" }
//                    → note "partial" for in-progress day (bar renders blue); value: null if not tracked (e.g. party day)
//   sleepData:       { date: "2026-07-26", hours: 7.1, score: 82, readiness: 75, note: "" }
//                    → score/readiness: null if not yet synced from Fitbit; note "self-reported" if manual.
//                      Optional once Fitbit confirms: bedtime ("HH:MM"), wake ("HH:MM"), deep/rem/light/awake
//                      (minutes), oxygenVariation ("Low"/"Normal"/"High" per Fitbit's SpO2 variation reading).
//   stepsData:       { date: "2026-07-26", value: 9120, distance: 4.3, calories: 2400, floors: 12, zoneMin: 40 }
//   walksData:       { date: "2026-07-26", distance: 4.3, note: "" }
//                    → the day's GENERAL walking distance for the "Walks" chart. Add an entry every day Fitbit
//                      EOD stats come in — if there's no dedicated tracked walk, just use that day's total
//                      Fitbit distance (same number as stepsData.distance) and note why, e.g. "gym day" /
//                      "fishing day". Richer fields (duration, pace, elevation, hrZones, cardioLoad, name) are
//                      optional, for when Strava or Fitbit's own walk-detection gives more detail.
//                      Do NOT put dedicated GPS-tracked runs here — those go in runsData instead (separate chart).
//   runsData:        { date: "2026-07-26", name: "Prospect Park Loop", distance: 4.48, distanceFitbit: 3.70,
//                       movingTime: "56:01", elapsedTime: "1:00:03", avgPace: "12:29", fastestSplit: "10:24",
//                       calories: 793, elevationGain: 200, maxElevation: 163, avgHR: 143,
//                       hrZones: { peak: {min:7,pct:12}, vigorous: {min:44,pct:81}, moderate: {min:3,pct:5}, light: {min:0,pct:0} },
//                       cardioLoad: 99, zoneMin: 100, laps: ["14:21/mi", ...], note: "" }
//                    → distance/pace/calories from Strava (usually the complete track); distanceFitbit + HR/zone
//                      data from Fitbit (sometimes a partial capture if the watch started late — note it when so)
//   measurementData: { date: "2026-07-26", neck, shoulders, chest, waist, hips, bicepL, bicepR, thigh, calf, note: "" }
//                    → bicepL/bicepR (flexed) instead of a single bicep value, since Bobby's arms measure
//                      differently side to side — always log both.
//                    → tailor's-tape measurements in inches; leave a field null until measured
//   meals:           { date: "2026-07-26", time: "12:00", description: "grilled chicken + rice", photo: "food-photos/2026-07-26-grilled-chicken.jpeg",
//                       calories: 520, protein: 40, carbs: 45, fat: 15, sodium: 380, sodiumNote: "" }
//                    → one entry per photographed meal (see WORKFLOW.md for the full food-photo SOP).
//                      photo path is relative to site/index.html. sodiumNote: short flag text
//                      when an ingredient is notably high-sodium (blank/omit otherwise) — Bobby is on
//                      BP meds, so sodium gets called out same as calories.
//                      time: 24-hour "HH:MM", REQUIRED going forward (added 2026-08-03) — the
//                      Meals feed sorts by date+time so the most recent meal lands on top and same-day
//                      meals group in the right order. If the exact time isn't known, use your best
//                      estimate rather than omitting it — a missing time sorts before all others on
//                      that day and throws the grouping off, which is worse than an approximate time.
//   gymWorkoutsData: { date: "2026-08-01", gym: "Gym", label: "Day 1", startTime: "08:35", endTime: "09:34",
//                       duration: 59, exercises: [ { name: "Machine Chest Press", equipment: "", feel: "",
//                       sets: [ { reps: 12, weight: 60, note: "" }, ... ], note: "" } ], note: "" }
//                    → one entry per gym session, feeds the full-width Workouts card (added
//                      2026-08-03). exercises[].sets[] entries use either reps+weight (weighted/
//                      bodyweight sets) or duration (seconds, for planks/holds) — never both.
//                      Per-set note (e.g. "bare bar") and per-exercise note both display inline;
//                      the top-level session note is for whole-session context (e.g. a Fitbit
//                      auto-detect discrepancy). Scoped to the month-selector dropdown like the
//                      Meals/Activity feeds.
//                      exercises[].feel: added 2026-08-04, one of "Easy" / "Just right" / "Hard" /
//                      "Too much" — captured per exercise (not per session) via the interactive
//                      HTML workout guides in workout_guides/, which log directly through the same
//                      JSONBin pending-queue pattern as Quick Log (see WORKFLOW.md). Leave "" if not
//                      set (older sessions logged before this field existed, or sessions logged by
//                      hand in a Cowork session without asking how each exercise felt).
//                      startTime/endTime/duration: added 2026-08-08 — the guide pages now have a
//                      "Start Session" button (tap right before set 1) and capture the save-time as
//                      the end, so the JSONBin queue entry carries real startedAt/endedAt ISO
//                      timestamps. When merging a queue entry, prefer those over inferring the
//                      window from Fitbit's auto-detected walks (which have been off by 30+ min —
//                      see the Aug 8 Full-Body B session note for an example of the old, fuzzier
//                      approach). startedAt may be null if Bobby forgot to tap Start; duration in
//                      that case has to fall back to the old Fitbit-bookend estimate, flagged as such.
//   events:          { date: "2026-07-26", text: "Whatever happened, in one line. <strong>tags</strong> ok for emphasis." }
//                    → the Activity feed. Newest-looking-first is automatic (sorted by date,
//                      same-day entries shown in reverse of the order you added them). Both this
//                      feed and the Meals feed are scoped to the month-selector dropdown (added
//                      2026-08-03) — an entry only shows once its month is selected.
//                      Do NOT log meals/food here — that's what the meals[] array + Meals
//                      feed is for. Five meal-restating entries got removed 2026-08-03 for exactly
//                      this reason (pure duplication, no info the meals[] entry didn't already have).
//                      Same logic for gym sessions: don't summarize a workout here — that's what
//                      gymWorkoutsData + the Workouts card is for. The one existing gym-session
//                      event got removed 2026-08-03 when the Workouts card was built, since it was
//                      a strict subset of the same session's full exercise/set detail. Fitbit/walk
//                      narrative and genuine exceptions (e.g. "nutrition not logged today") still
//                      belong here.
//   meta.goalsSummary: edit the string directly. (Gym status and medications used to
//                    live here too — removed 2026-08-03, dashboard-display-only info that
//                    duplicated what's already tracked in gym/options.md and
//                    health/medications.md. Those .md files remain the real source of
//                    truth; Cowork sessions should keep reading them directly rather than
//                    expecting this file to carry that context.)

const weightData = [
  { date: "2026-07-23", value: 203.2, note: "morning fasted" },
  { date: "2026-07-25", value: 204.6, note: "afternoon non-fasted — exclude from trend" },
  { date: "2026-07-26", value: 202.2, note: "morning fasted" },
  { date: "2026-07-27", value: 201.8, note: "morning fasted" },
  { date: "2026-07-28", value: 202.2, note: "morning fasted" },
  { date: "2026-07-30", value: 203.8, note: "morning fasted" },
  { date: "2026-07-31", value: 204.6, note: "morning" },
  { date: "2026-08-01", value: 203.8, note: "morning fasted" },
  { date: "2026-08-02", value: 202.4, note: "morning fasted (via Fitbit sync, fishing day)" },
  { date: "2026-08-03", value: 203.4, note: "morning fasted" },
  { date: "2026-08-04", value: 203.8, note: "morning fasted" },
  { date: "2026-08-06", value: 204.2, note: "backfilled via Fitbit sync, fasted status unconfirmed" },
  { date: "2026-08-07", value: 202.6, note: "morning fasted" },
  { date: "2026-08-08", value: 203.8, note: "via Fitbit smart scale sync, timing unspecified" },
  { date: "2026-08-09", value: 203.2, note: "via Fitbit smart scale sync, timing unspecified" },
  { date: "2026-08-10", value: 204.8, note: "morning fasted" }
];

const calorieData = [
  { date: "2026-07-24", value: 1600, note: "Mets game night" },
  { date: "2026-07-25", value: 2225, note: "final — ~225 cal over the 2,000 target" },
  { date: "2026-07-26", value: 2335, note: "final — ~1,836 cal net deficit (burned 4,171, consumed ~2,335)" },
  { date: "2026-07-27", value: 2845, burned: 3011, note: "final — first day hitting 180g+ protein target (~199g). Burned corrected 2026-08-03 from 2,825 to 3,011 per final Fitbit sync." },
  { date: "2026-07-29", value: 2722, note: "final — ~322 over 2,400 target; protein 194g ✅" },
  { date: "2026-07-30", value: 2818 },
  { date: "2026-07-31", value: 2675, note: "final" },
  { date: "2026-08-01", value: 1935, note: "final" },
  { date: "2026-08-02", value: null, note: "not logged — fishing day, off pattern" },
  { date: "2026-08-03", value: 2435, note: "final — ~35 cal over the 2,400 target" },
  { date: "2026-08-04", value: 1945, note: "final — corrected after chicken label" },
  { date: "2026-08-05", value: 2850, note: "final — well over the 2,400 target, driven mostly by the restaurant dinner" },
  { date: "2026-08-06", value: 2183, note: "final — includes a retroactively-logged concert bratwurst + beer" },
  { date: "2026-08-07", value: 2110, note: "partial — breakfast+shake, lunch, and fig bar/crisps snack so far" },
  { date: "2026-08-08", value: 2210, note: "partial — pre-workout meal, post-workout Gai bowl, and afternoon shake so far" },
  { date: "2026-08-09", value: null, note: "not logged — family day, cemetery visit, off pattern" },
  { date: "2026-08-10", value: 350, note: "partial — breakfast so far" }
];

const sleepData = [
  { date: "2026-07-24", hours: 5.58, score: 88, readiness: 80 },
  { date: "2026-07-25", hours: 6.67, score: 85, readiness: 80 },
  { date: "2026-07-26", hours: 6.52, score: 84, bedtime: "02:03", wake: "09:41", deep: 125, rem: 59, light: 207, awake: 66, oxygenVariation: "Low", note: "late night gaming (RDR2) — bedtime issue not sleep quality issue" },
  { date: "2026-07-27", hours: 6.2, score: 89, bedtime: "23:58", wake: "06:45", deep: 81, rem: 67, light: 224, awake: 35, note: "bedtime improvement from 2:03 AM Sat → 11:58 PM Sun; awake time (35 min) from partner coming to bed later" },
  { date: "2026-07-28", hours: 6.67, score: 86, bedtime: "23:04", wake: "06:47", deep: 106, rem: 67, light: 227, awake: 63 },
  { date: "2026-07-29", hours: 5.72, score: 76 },
  { date: "2026-07-30", hours: 7.1, score: 92, bedtime: "23:07", wake: "06:44", deep: 98, rem: 85, light: 242, awake: 31 },
  { date: "2026-07-31", hours: 7.37, score: 87, bedtime: "22:58", wake: "07:12", deep: 107, rem: 73, light: 261, awake: 52 },
  { date: "2026-08-01", hours: 5.7, score: 82, readiness: 68, bedtime: "00:44", wake: "07:05", deep: 97, rem: 65, light: 179, awake: 39 },
  { date: "2026-08-02", hours: 5.4, score: 81, readiness: 67, note: "summary only, no stage breakdown available" },
  { date: "2026-08-03", hours: 6.58, score: 88, bedtime: "23:31", wake: "06:44", deep: 88, rem: 80, light: 227, awake: 38 },
  { date: "2026-08-04", hours: 7.35, score: 93, bedtime: "22:45", wake: "06:42", deep: 99, rem: 84, light: 257, awake: 36, oxygenVariation: "Low" },
  { date: "2026-08-05", hours: 6.93, score: 86, bedtime: "23:43", wake: "07:10", deep: 77, rem: 81, light: 258, awake: 31, oxygenVariation: "Low", note: "bedtime ~1hr later than usual — got home later than a normal rest day (gym night), pushed the whole night back; deep sleep down to 77min from 99min the night before, likely just the delayed first sleep cycle" },
  { date: "2026-08-06", hours: 5.42, score: 79, bedtime: "00:52", wake: "07:07", deep: 103, rem: 50, light: 171, awake: 50, oxygenVariation: "Low", note: "backfilled — this is the night before the Yoasobi concert (concert itself was Aug 6 evening, that night's sleep is logged under Aug 7). Lowest score of the week (Fair vs the recent string of Good), driven by short total sleep and high awake time (50min), not poor deep sleep (103min was actually solid)" },
  { date: "2026-08-07", hours: 6.47, score: 89, bedtime: "00:07", wake: "07:02", deep: 101, rem: 85, light: 202, awake: 27, oxygenVariation: "Low", note: "night after the Yoasobi concert (late night out, one beer) — still landed a Good score with the most deep sleep in the past week (101min)" },
  { date: "2026-08-08", hours: 5.95, score: 76, readiness: 37, note: "Fair score, Moderate readiness (37) — lowest readiness of the week. No bedtime/wake or stage breakdown available from this screenshot." },
  { date: "2026-08-09", hours: 6.8, score: 85, readiness: 78, note: "Good score, High readiness (78) — rebounded well off Aug 8's low. No bedtime/wake or stage breakdown available from this screenshot." }
];

const stepsData = [
  { date: "2026-07-24", value: 15375, distance: 7.37, calories: 3738, floors: 34, zoneMin: 78 },
  { date: "2026-07-25", value: 10737, distance: 5.19, calories: 3040, floors: 15, zoneMin: 7 },
  { date: "2026-07-26", value: 20523, distance: 10.29, calories: 4171, floors: 30, zoneMin: 305 },
  { date: "2026-07-27", value: 10765, distance: 5.14, calories: 3011, floors: 13, zoneMin: 40, note: "burned corrected 2026-08-03 from 2,825 to 3,011 per final Fitbit sync" },
  { date: "2026-07-29", value: 11875, distance: 5.7, calories: 3162, floors: 19, note: "burned corrected 2026-08-03 from 3,021 to 3,162 per final Fitbit sync" },
  { date: "2026-07-30", value: 15425, distance: 7.47, calories: 3434, floors: 20, zoneMin: 8, note: "burned corrected 2026-08-03 from 3,337 to 3,434 per final Fitbit sync" },
  { date: "2026-07-31", value: 9723, distance: 4.65, calories: 2853, floors: 12, zoneMin: 3, note: "burned corrected 2026-08-03 from 2,871 to 2,853 per final Fitbit sync" },
  { date: "2026-08-01", value: 8136, distance: 3.84, calories: 2986, floors: 17, zoneMin: 0 },
  { date: "2026-08-02", value: 5059, distance: 2.51, calories: 3346, floors: 3, zoneMin: 0 },
  { date: "2026-08-03", value: 7908, distance: 3.85, calories: 2792, floors: 11, zoneMin: 0 },
  { date: "2026-08-04", value: 16370, distance: 7.74, calories: 3545, floors: 20, zoneMin: 40 },
  { date: "2026-08-05", value: 14654, distance: 7.05, calories: 3257, floors: 17, zoneMin: 12 },
  { date: "2026-08-06", value: 11760, distance: 5.7, calories: 3054, floors: 12, zoneMin: 17, note: "backfilled" },
  { date: "2026-08-08", value: 12830, distance: 6.15, calories: 2798, floors: 19, zoneMin: 92, note: "as of 4:55 PM — day in progress, not final" },
  { date: "2026-08-09", value: 9370, distance: 4.39, calories: 3133, floors: 10, zoneMin: 27 }
];

// Tracked runs. distance/pace/calories are from Strava (usually the full
// track); distanceFitbit + HR/zone data are from Fitbit, which sometimes
// starts late and captures a partial distance — see note when that happens.
const runsData = [
  {
    date: "2026-07-19",
    name: "Prospect Park Loop",
    distance: 3.60,
    movingTime: "44:33",
    elapsedTime: "46:18",
    avgPace: "12:22",       // per mi
    fastestSplit: "10:49",  // per mi
    calories: 631,
    elevationGain: 123,     // ft
    maxElevation: 166,      // ft
    note: "First run back — \"Back at it.\" No HR data (Fitbit not used). Run/walk pattern, significant pace variation."
  },
  {
    date: "2026-07-26",
    name: "Prospect Park Loop",
    distance: 4.48,          // mi, Strava (full run)
    distanceFitbit: 3.70,    // mi, Fitbit (started late)
    movingTime: "56:01",
    elapsedTime: "1:00:03",
    avgPace: "12:29",        // per mi
    fastestSplit: "10:24",   // per mi
    calories: 793,           // Strava
    elevationGain: 200,      // ft
    maxElevation: 163,       // ft
    avgHR: 143,              // bpm, Fitbit's captured 52-min portion
    hrZones: {
      peak: { min: 7, pct: 12 },
      vigorous: { min: 44, pct: 81 },
      moderate: { min: 3, pct: 5 },
      light: { min: 0, pct: 0 }
    },
    cardioLoad: 99,
    zoneMin: 100,
    laps: ["14:21/mi", "11:47/mi", "13:43/mi", "17:00/mi (0.74 mi)"],
    note: "Fitbit started 8 min late at 11:06 AM, missed first 0.78 mi. Strava captured full run from 10:58 AM."
  }
];

// Tracked walks. distance/pace/calories from Strava; HR data from Fitbit.
const walksData = [
  {
    date: "2026-07-26",
    name: "Tacos del Barrio → Doughnut Plant (Sunset Park)",
    distance: 3.92,             // mi, Strava (authoritative)
    duration: 80.52,            // minutes
    avgPace: 20.52,             // min/mi
    elevationGain: 187,         // ft
    maxElevation: 177,          // ft
    steps: 7584,
    calories: 684,              // active cal, Strava
    caloriesTotal: 919,         // total cal, Fitbit
    avgHR: 133,                 // bpm, Fitbit
    hrZones: {
      vigorous: { pct: 73 },
      moderate: { pct: 26 }
    },
    cardioLoad: 106,
    zoneMin: 133,
    note: "Strava start 1:26 PM, Fitbit started 3 min late at 1:29 PM — Strava distance is authoritative. Vigorous HR from Sunset Park hills."
  },
  { date: "2026-07-27", distance: 1.97, duration: 43.55, pace: 22.03, elevation: 26 },
  { date: "2026-07-27", name: "Evening walk (auto-detected)", distance: 0.67, duration: 26, pace: 38.8, elevation: 0, note: "Fitbit auto-detected, 6:04 PM" },
  { date: "2026-07-29", distance: 1.58, duration: 35, pace: 22.15 },
  { date: "2026-07-30", distance: 0.74, duration: 17, pace: 22.97 },
  { date: "2026-07-31", distance: 1.44, duration: 29, pace: 20.14 },
  { date: "2026-08-01", distance: 3.84, note: "No dedicated tracked walk — this is the day's total Fitbit distance (gym day)" },
  { date: "2026-08-02", distance: 2.51, note: "No dedicated tracked walk — this is the day's total Fitbit distance (fishing day)" },
  { date: "2026-08-03", distance: 3.85, note: "No dedicated tracked walk — this is the day's total Fitbit distance (desk/computer day)" },
  { date: "2026-08-04", name: "Evening walk (auto-detected)", distance: 0.77, duration: 22, note: "Fitbit auto-detected, 7:43 PM — right after the Full-Body A gym session ended (7:38 PM), likely a cooldown walk" },
  {
    date: "2026-08-05",
    name: "Lunchtime walk",
    distance: 1.56,
    duration: 34.53,      // 34:32
    pace: 22.13,          // 22'08"/mi
    steps: 3270,
    calories: 277,
    avgHR: 97,
    hrZones: {
      light: { pct: 100, min: 36 }
    },
    cardioLoad: 3,
    note: "Fitbit (Versa 4), 12:56 PM — entirely light-intensity zone"
  },
  { date: "2026-08-05", name: "Evening walk (auto-detected)", distance: 0.33, duration: 21, note: "Fitbit auto-detected, 10:15 PM — right after the Japanese restaurant dinner" },
  { date: "2026-08-06", name: "Lunchtime walk", distance: 2.31, duration: 49, note: "Backfilled, 12:18 PM" },
  { date: "2026-08-08", name: "Pre-workout brisk treadmill walk", distance: 0.51, duration: 9, note: "Fitbit, 12:12 PM — warm-up before the Full-Body B gym session" },
  { date: "2026-08-08", name: "Post-workout brisk treadmill walk", distance: 0.56, duration: 10, note: "Fitbit, 1:51 PM — cool-down after the Full-Body B gym session" },
  { date: "2026-08-08", name: "Afternoon walk", distance: 0.54, duration: 18, note: "Fitbit auto-detected, 3:59 PM — unrelated to the gym session" },
  { date: "2026-08-09", distance: 4.39, note: "No dedicated tracked walk — this is the day's total Fitbit distance (family day, visiting the cemetery)" }
];

// Gym workout sessions. One entry per session; exercises listed in order performed.
// Weight in lbs. Plank/timed exercises use duration (seconds) instead of weight.
const gymWorkoutsData = [
  {
    date: "2026-08-01",
    gym: "Gym",
    label: "Day 1",
    startTime: "08:35",
    endTime: "09:34",
    duration: 59,           // minutes
    exercises: [
      {
        name: "Machine Chest Press",
        sets: [
          { reps: 12, weight: 60 },
          { reps: 12, weight: 70 },
          { reps: 12, weight: 80 }
        ]
      },
      {
        name: "Lat Pulldown (Technogym Vertical Traction)",
        sets: [
          { reps: 12, weight: 90 },
          { reps: 12, weight: 100 },
          { reps: 12, weight: 110 }
        ]
      },
      {
        name: "Seated Cable Row (Technogym Low Row)",
        sets: [
          { reps: 12, weight: 90 },
          { reps: 12, weight: 100 },
          { reps: 12, weight: 100 }
        ]
      },
      {
        name: "Leg Press",
        sets: [
          { reps: 20, weight: 140 },
          { reps: 20, weight: 160 },
          { reps: 20, weight: 160 }
        ],
        note: "Prescribed 3×12; went to 20 reps — weight was light"
      },
      {
        name: "Romanian Deadlift",
        equipment: "barbell",
        sets: [
          { reps: 12, weight: 45, note: "bare bar" },
          { reps: 12, weight: 65, note: "bar + 20 lbs" },
          { reps: 12, weight: 85, note: "bar + 40 lbs" }
        ]
      },
      {
        name: "Forearm Plank",
        sets: [
          { duration: 45 },   // seconds
          { duration: 45 },
          { duration: 50 }
        ]
      }
    ],
    note: "First gym session. Fitbit auto-detected this as \"Strength training\" 8:35 AM · 1h8m · 252 cal — slightly longer/lower-cal than the manually logged 59 min, likely includes a few minutes of setup/cooldown Fitbit kept tracking."
  },
  {
    date: "2026-08-04",
    gym: "Gym",
    label: "Full-Body A",
    startTime: "18:08",
    endTime: "19:38",
    duration: 90,           // minutes
    exercises: [
      {
        name: "Incline Chest Press",
        feel: "Just right",
        sets: [
          { reps: 15, weight: 20 },
          { reps: 15, weight: 20 },
          { reps: 12, weight: 20 }
        ]
      },
      {
        name: "Lat Pulldown",
        feel: "Just right",
        sets: [
          { reps: 10, weight: 100 },
          { reps: 15, weight: 100 },
          { reps: 15, weight: 110 }
        ]
      },
      {
        name: "Leg Press",
        feel: "Just right",
        sets: [
          { reps: 15, weight: 140 },
          { reps: 15, weight: 160 },
          { reps: 15, weight: 180 }
        ]
      },
      {
        name: "Lateral Raises",
        feel: "Just right",
        sets: [
          { reps: 10, weight: 10 },
          { reps: 15, weight: 10 },
          { reps: 10, weight: 15 }
        ]
      },
      {
        name: "Dumbbell Flat Bench Fly",
        feel: "Hard",
        sets: [
          { reps: 12, weight: 20 },
          { reps: 15, weight: 20 },
          { reps: 10, weight: 25 }
        ]
      },
      {
        name: "Forearm Plank",
        feel: "Just right",
        sets: [
          { duration: 60 },
          { duration: 60 },
          { duration: 60 }
        ]
      }
    ],
    note: "10 min brisk treadmill walk warm-up at the start, 5 min of an ~11 min/mile treadmill run at the end (bookending the strength work below — not separately GPS-tracked, so not logged in walksData/runsData; captured here as session context instead). Logged via the interactive Full-Body A guide (workout_guides/2026-08-03-full-body-a-guide.html) and synced through JSONBin — the first session to go through the guide end-to-end since the credentials were wired up. Start/end time/duration added from Fitbit (guide itself doesn't capture session timing, only exercise/set data). Fitbit auto-detected the whole session as \"Strength training\" 6:08 PM · 1h30m · 460 cal · avg HR 99bpm · Cardio Load 19 · 21 zone min (81% light, 14% moderate, 4% vigorous, 0% peak)."
  },
  {
    date: "2026-08-08",
    gym: "Lifetime Gym",
    label: "Full-Body B",
    startTime: "12:12",
    endTime: "14:01",
    duration: 109,           // minutes
    exercises: [
      {
        name: "Seated Shoulder Press",
        feel: "Just right",
        sets: [
          { reps: 12, weight: 15 },
          { reps: 12, weight: 20 },
          { reps: 12, weight: 20 }
        ]
      },
      {
        name: "Seated Cable Row",
        feel: "Just right",
        sets: [
          { reps: 12, weight: 90 },
          { reps: 12, weight: 100 },
          { reps: 12, weight: 120 }
        ]
      },
      {
        name: "Romanian Deadlift",
        feel: "Just right",
        sets: [
          { reps: 12, weight: 95 },
          { reps: 12, weight: 95 },
          { reps: 10, weight: 115 }
        ]
      },
      {
        name: "Rear Delt Fly",
        feel: "Just right",
        sets: [
          { reps: 12, weight: 10 },
          { reps: 12, weight: 10 },
          { reps: 12, weight: 15 }
        ]
      },
      {
        name: "Flat/Machine Chest Press",
        feel: "",
        sets: [
          { reps: 12, weight: 60 },
          { reps: 12, weight: 70 },
          { reps: 7, weight: 80, note: "dropped to 7 reps, weight felt heavy" }
        ]
      },
      {
        name: "Forearm Plank",
        feel: "Just right",
        sets: [
          { duration: 60 },
          { duration: 60 },
          { duration: 60 }
        ]
      }
    ],
    note: "First session logged against the Full-Body B guide (workout_guides/2026-08-03-full-body-b-guide.html), synced through JSONBin. Preceded by a 51-min Pilates class (10:32 AM, 110 cal per Fitbit) earlier the same morning. Bracketed by two Fitbit-detected brisk walks — 10-min warm-up (12:12 PM, 0.51 mi/9 min) and 10-min cool-down (1:51 PM, 0.56 mi/10 min) — used here for start/end time since Fitbit didn't auto-detect a separate \"Strength training\" block this session (guide itself doesn't capture session timing). Actual lifting time between the two walks runs a bit under Bobby's own \"couple hours\" estimate. A separate, unrelated 18-min walk logged later at 3:59 PM (0.54 mi) is filed in walksData, not counted as part of this session."
  }
];

const measurementData = [
  // First real tape measurements. bicepL/bicepR used instead of a single
  // "bicep" field since Bobby's are notably asymmetric (0.5" difference) —
  // update the schema comment near the top of this file if this becomes
  // the standing convention for future entries too.
  { date: "2026-08-05", neck: 13.75, shoulders: 44.75, chest: 42, waist: 40, hips: null, bicepL: 12.5, bicepR: 12, thigh: null, calf: null, note: "flexed bicep measurements; left 0.5\" bigger than right. Waist corrected same day — first pass was taken above the navel (39.75\"), retaken at the navel per protocol (40\")" }
];

// Photographed meals — one entry per photo, added automatically per the
// food-photo workflow in WORKFLOW.md. Photo paths are relative to this
// site folder (formerly "dashboard/", renamed 2026-08-03 once it started
// holding more than just the dashboard — see workout_guides/). This is
// the per-meal detail behind the daily totals in calorieData above.
const meals = [
  // July 30 — all times as logged
  { date: "2026-07-30", time: "08:00", description: "Breakfast (8:00 AM) — 2 eggs + sausage patty",
    photo: "food-photos/2026-07-30-breakfast.jpeg",
    calories: 335, protein: 21, carbs: 2, fat: 27, sodium: null },
  { date: "2026-07-30", time: "13:00", description: "Lunch (1:00 PM) — 0.24 lbs shrimp + 2 hard boiled eggs",
    photo: "food-photos/2026-07-30-lunch.jpeg",
    calories: 255, protein: 37, carbs: 1, fat: 11, sodium: null },
  { date: "2026-07-30", time: "20:30", description: "Dinner (8:30 PM) — Air fryer salmon (~5.5 oz) + dinner salad (mixed greens, avocado, cucumber, TJ's Nut Mix, sesame seeds) + TJ's Green Onion Pancake",
    photo: "food-photos/2026-07-30-dinner.jpeg",
    calories: 1157, protein: 64, carbs: 65, fat: 71, sodium: null },
  { date: "2026-07-30", time: "21:30", description: "Protein Shake (9:30 PM) — 3 scoops rice protein + banana + 2 tbsp PB + 4 oz almond milk",
    photo: "food-photos/2026-07-30-shake.jpeg",
    calories: 731, protein: 56, carbs: 45, fat: 36, sodium: null },
  // July 31 — only Breakfast had a logged time; the rest are estimated
  // (2026-08-03) based on the usual meal-timing pattern, since the
  // original entries didn't capture one. Correct these if you remember
  // the actual times.
  { date: "2026-07-31", time: "11:00", description: "Breakfast (11:00 AM) — 2 eggs overhard + sausage patty",
    photo: "food-photos/2026-07-31-breakfast.jpeg",
    calories: 335, protein: 21, carbs: 2, fat: 27, sodium: null },
  { date: "2026-07-31", time: "13:00", description: "Lunch — Shrimp + Hard Boiled Eggs (0.3 lbs cooked shrimp ~136g + 2 hard boiled eggs)",
    calories: 290, protein: 46, sodium: 274, note: "time estimated — not logged" },
  { date: "2026-07-31", time: "15:00", description: "Snack — Chobani Blueberry Yogurt (nonfat, 1 container)",
    calories: 110, protein: 12, sodium: 60, note: "time estimated — not logged" },
  { date: "2026-07-31", time: "16:30", description: "Snack — Honey BBQ Kettle Chips + La Croix (Community Snacks, 1 bag 2 oz + seltzer)",
    calories: 290, protein: 3, sodium: 290, note: "time estimated — not logged" },
  {
    date: "2026-07-31",
    time: "18:30",
    name: "Protein Shake",
    description: "3 scoops rice protein + banana + PB + almond milk",
    calories: 690,
    protein: 54,
    sodium: 150,
    note: "time estimated — not logged",
  },
  {
    date: "2026-07-31",
    time: "19:00",
    name: "Dinner Salad",
    description: "Mixed greens, cucumber, TJ's Nut Mix (1.5 srv), sesame seeds, olive oil",
    calories: 250,
    protein: 5,
    sodium: 90,
    note: "time estimated — not logged",
  },
  {
    date: "2026-07-31",
    time: "19:00",
    name: "Air Fryer Ribeye",
    description: "Half ribeye, ~5.5 oz cooked",
    calories: 420,
    protein: 40,
    sodium: 100,
    note: "time estimated — not logged",
  },
  // August 1
  { date: "2026-08-01", time: "12:00", name: "Post-Workout Shake",
    description: "3 scoops Growing Naturals rice protein + 1 cup unsweetened almond milk + 1 banana + 2 heaping tbsp peanut butter + 5g creatine monohydrate",
    calories: 750, protein: 59, sodium: 291 },
  { date: "2026-08-01", time: "15:30", name: "Chips & Salsa",
    description: "TJ's Unsalted Organic White Corn Tortilla Chips (1 oz / ~11 chips) + Trader Jose's Chunky Salsa (2 tbsp) — FODMAP flag: salsa contains onions and garlic",
    calories: 160, protein: 2, carbs: 20, fat: 7, sodium: 180, note: "time estimated — not logged" },
  { date: "2026-08-01", time: "19:00", name: "Bacon, Eggs & Salad",
    description: "Kirkland Thick Cut Bacon — 4 slices, air fried (fat drained) + 2 large eggs (no oil) + 2 handfuls spring salad mix (plain). Sodium flag: ~1,040mg from bacon alone.",
    calories: 380, protein: 33, carbs: 3, fat: 27, sodium: 1230, sodiumNote: "High — bacon 1,040mg of 1,230mg total", note: "time estimated — not logged" },
  { date: "2026-08-01", time: "20:00", name: "Evening Protein Shake",
    description: "3 scoops Growing Naturals rice protein + 1 cup unsweetened almond milk + 2 heaping tbsp peanut butter (no banana — out of bananas)",
    calories: 645, protein: 58, sodium: 290 },
  // August 3 (August 2 intentionally not logged — fishing day, off pattern, skipped by request)
  { date: "2026-08-03", time: "11:26", name: "Over-Hard Eggs & Sausage Patty",
    description: "2 large eggs, over-hard + 1 breakfast sausage patty (~2 oz, standard) — first meal, ~11:26 AM. Portion/brand assumed, not confirmed.",
    calories: 350, protein: 21, carbs: 2, fat: 29, sodium: 550, sodiumNote: "Sausage patty ~380mg of the 550mg total" },
  { date: "2026-08-03", time: "13:00", name: "Hard Boiled Eggs, Jerk Shrimp & Chobani Yogurt", photo: "food-photos/2026-08-03-chobani-blueberry-yogurt-1.jpeg",
    description: "2 hard boiled eggs + 0.31 lb (~140g) jerk shrimp + Chobani Blueberry Yogurt (Protein Rich), 1 container (150g) — second meal, all eaten together. Sodium estimate for the shrimp has wider-than-usual uncertainty since jerk seasoning intensity varies a lot by brand/recipe; yogurt values are exact from the label.",
    calories: 465, protein: 56, carbs: 20, fat: 18, sodium: 770, sodiumNote: "Jerk marinade/seasoning is the main sodium driver — shrimp itself is naturally lean and low-sodium", note: "time estimated — not logged" },
  { date: "2026-08-03", time: "15:05", name: "Afternoon Snack — Chips, Fig Bar & Sparkling Water", photo: "food-photos/2026-08-03-community-snacks-honey-bbq-chips.jpeg",
    description: "Community Snacks Honey BBQ Kettle Cooked Potato Chips (1 package, 2oz/56g — flavor confirmed via front-of-bag photo) + Nature's Bakery Fig Bar, Strawberry (1 package, 57g) + LaCroix Pure sparkling water (1 can, plain, 0 cal). Label values, exact.",
    calories: 490, protein: 6, carbs: 72, fat: 21, sodium: 365, sodiumNote: "Chips are the whole story — 290mg of the 365mg total. Moderate, not a major flag." },
  { date: "2026-08-03", time: "20:12", name: "Pork Cutlet, Broccoli & Sweet Potato", photo: "food-photos/2026-08-03-pork-cutlet-broccoli-sweet-potato.jpeg",
    description: "Pork cutlet (~6oz cooked, boneless loin, sliced), seasoned with salt and pepper only, pan-seared + broccoli + 1 small roasted sweet potato — dinner. Portion sizes estimated from the photo.",
    calories: 485, protein: 52, carbs: 31, fat: 20, sodium: 610, sodiumNote: "Mostly home seasoning (salt) on the pork, not a packaged ingredient — moderate, not a major flag" },
  { date: "2026-08-03", time: "21:00", name: "Peanut Butter Rice Protein Shake", photo: "",
    description: "3 flat scoops rice protein + 2 tbsp peanut butter + almond milk, no banana — after dinner. Same recipe as the August 1 evening shake, macros reused directly rather than re-estimated. No photo shared for this one.",
    calories: 645, protein: 58, carbs: 18, fat: 24, sodium: 290 },
  { date: "2026-08-04", time: "10:56", name: "Chobani Blueberry Greek Yogurt", photo: "food-photos/2026-08-04-chobani-blueberry-greek-yogurt.jpeg",
    description: "Chobani Greek Yogurt, Blueberry on the Bottom, 1 container (150g) — breakfast. Label values, exact.",
    calories: 110, protein: 12, carbs: 15, fat: 0, sodium: 60 },
  { date: "2026-08-04", time: "10:56", name: "Banana", photo: "food-photos/2026-08-04-banana.jpeg",
    description: "1 medium banana, eaten alongside the yogurt above — breakfast. USDA standard estimate (no label to read from).",
    calories: 105, protein: 1, carbs: 27, fat: 0, sodium: 1, note: "outside the usual noon-start eating window — a one-off, not flagged unless it becomes a pattern" },
  { date: "2026-08-04", time: "12:18", name: "Shrimp", photo: "food-photos/2026-08-04-shrimp.jpeg",
    description: "0.33 lb (~150g) shrimp, herb seasoned (thyme visible), no butter (corrected 2026-08-04 — originally assumed butter from the glossy look in the photo) — lunch. Estimate, no label.",
    calories: 180, protein: 36, carbs: 2, fat: 3, sodium: 350, sodiumNote: "Shrimp itself carries some natural/processing sodium, plus the seasoning — moderate, not a major flag without butter added on top" },
  { date: "2026-08-04", time: "12:18", name: "Hard Boiled Eggs & Romaine", photo: "food-photos/2026-08-04-hard-boiled-eggs-romaine.jpeg",
    description: "Made Here \"Eggs, Romaine\" pack, 2 hard boiled eggs + a few romaine leaves (114g net wt) — lunch, eaten alongside the shrimp above. Label values, exact (see food-photos/2026-08-04-hard-boiled-eggs-romaine-label.jpeg).",
    calories: 150, protein: 13, carbs: 1, fat: 10, sodium: 130 },
  { date: "2026-08-04", time: "12:18", name: "Rice Protein, Peanut Butter & Banana Shake", photo: "",
    description: "3 scoops rice protein + almond milk + 1 tsp creatine + 6 tsp (2 tbsp) crunchy peanut butter + 1 medium banana — lunch. Same recipe as the August 1 post-workout shake, cal/protein/sodium reused directly; carbs/fat estimated since that original entry didn't track them. No photo shared for this one.",
    calories: 750, protein: 59, carbs: 46, fat: 22, sodium: 291 },
  { date: "2026-08-04", time: "21:46", name: "Half Whole Foods Classic Rotisserie Chicken", photo: "food-photos/2026-08-04-wholefoods-roast-chicken.jpeg",
    description: "Half a Whole Foods Market Classic Rotisserie Chicken (chicken, organic salt & pepper blend only — no sauce/breading), net wt 1lb 12oz (794g) whole bird including bone. Corrected 2026-08-04 from an initial no-label estimate once the package label was shared: label gives 200 cal / 18g protein / 14g fat / 0g carb / 360mg sodium per 3oz edible serving; half the bird's edible meat+skin estimated at ~278g (~3.3 servings), assuming ~70% edible yield from the bone-in whole-bird weight (label doesn't state edible weight directly, so this fraction is the main remaining estimate).",
    calories: 650, protein: 58, carbs: 0, fat: 46, sodium: 1160, sodiumNote: "Confirmed via label — Whole Foods rotisserie chicken runs 360mg sodium per 3oz, well above home-roasted (brined/seasoned before cooking). This is now the single biggest sodium contributor of the day." },
  { date: "2026-08-05", time: "11:27", name: "Eggs Over-Hard & Sausage Patty", photo: "food-photos/2026-08-05-lunch1.jpeg",
    description: "2 large eggs, over-hard + 1 breakfast sausage patty (~2oz) — \"Lunch 1,\" more may follow today. Same combo as the August 3 first meal, macros reused directly since ingredients match exactly.",
    calories: 350, protein: 21, carbs: 2, fat: 29, sodium: 550, sodiumNote: "Sausage patty is doing most of the sodium here — breakfast sausage doesn't taste as salty as chips or bacon, but it's a sneaky contributor." },
  { date: "2026-08-05", time: "12:04", name: "Apple Cinnamon Crisps, Eggs & Romaine, Shrimp", photo: "food-photos/2026-08-05-lunch2-crisps-front.jpeg",
    description: "\"Lunch 2\": That's It Organic Fruit Crunchables Apple + Cinnamon Crisps x2 pouches (label, exact — see food-photos/2026-08-05-lunch2-crisps-label.jpeg) + Made Here \"Eggs, Romaine\" pack, 2 hard boiled eggs + romaine (114g, label exact — see food-photos/2026-08-05-lunch2-eggs-romaine-label.jpeg) + LaCroix Pure sparkling water (label, exact — see food-photos/2026-08-05-lunch2-lacroix.jpeg) + 0.32 lb (~145g) shrimp, no label/photo this time, macros scaled from the Aug 4 shrimp entry assuming similar preparation.",
    calories: 405, protein: 48, carbs: 21, fat: 13, sodium: 470, sodiumNote: "LaCroix and the crisps are both 0mg sodium — the Made Here eggs pack (130mg) and shrimp (~340mg, estimated) account for all of it." },
  { date: "2026-08-05", time: "13:38", name: "Nature's Bakery Fig Bar, Strawberry", photo: "food-photos/2026-08-05-fig-bar-front.jpeg",
    description: "1 package (57g), after the lunchtime walk — afternoon snack. Same product as the August 3 entry. Label values, exact.",
    calories: 200, protein: 3, carbs: 38, fat: 5, sodium: 75 },
  { date: "2026-08-05", time: "14:59", name: "Rice Protein, Peanut Butter & Banana Shake", photo: "",
    description: "3 scoops rice protein + almond milk + 3 tbsp crunchy peanut butter (1 more than the usual 2 tbsp) + 1 smallish banana (smaller than the usual medium), no creatine this time. Recalculated from the base recipe (no banana, 2 tbsp PB = 645 cal/58g protein/18g carb/24g fat/290mg sodium) plus the extra tbsp PB and a scaled-down banana, rather than reusing the standard recipe whole, since both quantities differ this time. No photo shared.",
    calories: 825, protein: 63, carbs: 43, fat: 32, sodium: 360 },
  { date: "2026-08-05", time: "22:53", name: "Japanese Restaurant Dinner: Vegetable Curry Rice + Pork Katsu", photo: "food-photos/2026-08-05-dinner-curry-rice.jpeg",
    description: "Japanese-style vegetable curry rice (roux-based curry over white rice with roasted potato, carrot, eggplant, zucchini, red pepper, lotus root, a floss-style topping, and pickled red ginger — see food-photos/2026-08-05-dinner-curry-rice.jpeg) plus a pork katsu side, no visible sauce (see food-photos/2026-08-05-dinner-katsu.jpeg). Restaurant meal, no label — portions estimated from photos, wider-than-usual uncertainty especially on the curry sauce and rice amount.",
    calories: 1070, protein: 40, carbs: 108, fat: 46, sodium: 1430, sodiumNote: "Likely the single biggest sodium contributor of the day — Japanese curry roux runs high, and this was a restaurant kitchen's version." },
  { date: "2026-08-06", time: "10:21", name: "Eggs Over-Hard (No Salt) & Sausage Patty", photo: "food-photos/2026-08-06-breakfast.jpeg",
    description: "2 large eggs, over-hard, no salt added + 1 breakfast sausage patty (~2oz) — breakfast. Same combo as the August 3 and August 5 first meals, macros reused directly; the no-salt eggs don't move the total meaningfully since the sausage patty already accounts for nearly all the sodium.",
    calories: 350, protein: 21, carbs: 2, fat: 29, sodium: 550, sodiumNote: "Sausage patty is doing nearly all the sodium here, not the eggs (no salt added to those)." },
  { date: "2026-08-06", time: "10:40", name: "Rice Protein, Peanut Butter & Banana Shake", photo: "",
    description: "3 scoops rice protein + unsweetened almond milk + 6 tsp (2 tbsp) crunchy peanut butter + 1 medium banana. Standard recipe, macros reused directly from the August 1 post-workout shake. No photo shared for this one.",
    calories: 750, protein: 59, carbs: 46, fat: 22, sodium: 291 },
  { date: "2026-08-06", time: "16:19", name: "Hard Boiled Eggs, Romaine & Shrimp", photo: "food-photos/2026-08-06-eggs-shrimp-front.jpeg",
    description: "Made Here \"Eggs, Romaine\" pack, 2 hard boiled eggs + arugula/romaine (114g net wt, label exact — see food-photos/2026-08-06-eggs-romaine-label.jpeg) + 0.32 lb (~145g) shrimp, herb seasoned, no label — macros scaled from the same shrimp entries used on August 4 and 5.",
    calories: 325, protein: 48, carbs: 3, fat: 13, sodium: 470 },
  { date: "2026-08-06", time: "19:29", name: "Kettle-Cooked Chipotle Chips", photo: "food-photos/2026-08-06-chips-label.jpeg",
    description: "1 serving (1oz/28g, ~13 chips), seed-oil-free, avocado oil, kettle cooked. Ingredients: potatoes, avocado oil, cane sugar, sea salt, paprika, tomato powder, onion powder, garlic powder, black pepper, chipotle pepper. Label values, exact.",
    calories: 140, protein: 2, carbs: 16, fat: 8, sodium: 170 },
  { date: "2026-08-06", time: "20:30", name: "Bratwurst on a Bun + Modelo Especial", photo: "food-photos/2026-08-06-bratwurst.jpeg",
    description: "At the Yoasobi concert, Barclays Center: bratwurst on a bun with light mustard (stadium vendor food, no label, estimated as a standard ~4oz grilled bratwurst) + Modelo Especial, 1 can (12 fl oz, standard published beer nutrition — see food-photos/2026-08-06-modelo.jpeg). Logged the morning after, retroactively.",
    calories: 618, protein: 18, carbs: 42, fat: 31, sodium: 1156, sodiumNote: "Single biggest sodium contributor of the day — stadium bratwurst runs high, brand/size uncertain." },
  { date: "2026-08-07", time: "09:28", name: "Eggs Over-Hard (No Salt), Sausage Patty & PB Banana Shake", photo: "food-photos/2026-08-07-breakfast-eggs-sausage.jpeg",
    description: "2 large eggs, over-hard, no salt + 1 breakfast sausage patty (~2oz), same combo as recent breakfasts, macros reused. Plus a Rice Protein, Peanut Butter & Banana Shake: 1 cup ice + almond milk + 3 scoops rice protein + 6 tsp (2 tbsp) crunchy peanut butter + 1 medium banana — standard recipe, macros reused from the August 1 post-workout shake (see food-photos/2026-08-07-breakfast-shake.jpeg).",
    calories: 1100, protein: 80, carbs: 48, fat: 51, sodium: 841, sodiumNote: "Sausage patty and the shake's almond milk/rice protein are the main sodium sources — nothing unusual." },
  { date: "2026-08-07", time: "13:56", name: "Hard Boiled Eggs & Romaine, Shrimp & Gummy Bears", photo: "food-photos/2026-08-07-lunch-eggs-shrimp.jpeg",
    description: "Made Here \"Eggs, Romaine\" pack, 2 hard boiled eggs + arugula/romaine (114g net wt, label exact — see food-photos/2026-08-07-lunch-eggs-romaine-label.jpeg) + 0.33 lb (~150g) shrimp (same weight as the August 4 lunch shrimp, macros reused directly) + Black Forest Organic Gummy Bears, 4 small snack bags (~1oz each, no nutrition panel visible — see food-photos/2026-08-07-lunch-gummy-bears.jpeg — estimated from this product's typical published label).",
    calories: 730, protein: 49, carbs: 103, fat: 13, sodium: 520, sodiumNote: "Eggs pack and shrimp account for nearly all of it — the gummy bears are low-sodium." },
  { date: "2026-08-07", time: "14:49", name: "Fig Bar & Apple Cinnamon Crisps", photo: "food-photos/2026-08-07-snack-figbar-front.jpeg",
    description: "Nature's Bakery Fig Bar, Strawberry, 1 package (57g, label exact — see food-photos/2026-08-07-snack-figbar-label.jpeg, same product as recent snacks) + That's It Organic Fruit Crunchables Apple + Cinnamon Crisps, 2 pouches (10g each, label exact — see food-photos/2026-08-07-snack-crisps-label.jpeg, same product as the August 5 snack).",
    calories: 280, protein: 3, carbs: 56, fat: 5, sodium: 75 },
  { date: "2026-08-08", time: "10:45", name: "Grilled Jerk Chicken Legs & Curry Coconut Roasted Sweet Potatoes", photo: "food-photos/2026-08-08-lunch-jerk-chicken-front.jpeg",
    description: "Prepared hot-bar meal: grilled jerk chicken leg quarter (~6oz, label gives 260 cal per 4oz serving — see food-photos/2026-08-08-lunch-jerk-chicken-label.jpeg, ingredients led by sea salt) + curry coconut roasted sweet potatoes (~5oz, label gives 210 cal per 4oz serving — see food-photos/2026-08-08-lunch-sweet-potato-label.jpeg). Sold by weight with no scale reading, so portion size is estimated from the photo (food-photos/2026-08-08-lunch-plate.jpeg) as ~1.5x and ~1.25x the labeled 4oz servings respectively; labels give calories only (no protein/carb/fat breakdown), so those macros are estimated using typical values for grilled bone-in chicken leg and oil-roasted sweet potato. First meal of the day — after Pilates, before an 11:40 AM weight training session.",
    calories: 650, protein: 37, carbs: 35, fat: 41, sodium: 990, sodiumNote: "Jerk seasoning (sea salt is the first ingredient) is doing most of the work here — worth noting given the BP meds." },
  { date: "2026-08-08", time: "13:15", name: "Gai Roasted Chicken Bowl", photo: "food-photos/2026-08-08-dinner-gai-bowl-full.jpeg",
    description: "Post-weight-training meal from Gai (Fulton St, Manhattan) — the menu's \"Roasted Chicken Bowl\": roasted boneless chicken thighs (~7oz, char-glazed) over ginger rice (~1.25 cups) with cherry tomatoes, corn, cucumber, and lettuce (see food-photos/2026-08-08-dinner-gai-menu.jpeg for the menu listing and food-photos/2026-08-08-dinner-gai-bowl-remainder.jpeg for the meal partway through). Restaurant meal, no nutrition label — portions and macros estimated from the photos and typical values for roasted chicken thigh and seasoned rice; side sauce wasn't visibly used. Time estimated (early afternoon, after the 11:40 AM gym session).",
    calories: 820, protein: 60, carbs: 78, fat: 29, sodium: 950, sodiumNote: "Restaurant-cooked, no label — rice and the chicken's glaze are the likely main contributors. Estimate, not exact." },
  { date: "2026-08-08", time: "16:45", name: "Rice Protein, Peanut Butter & Almond Milk Shake", photo: "",
    description: "1 cup almond milk + 3 tbsp crunchy peanut butter (1 more than the usual 2 tbsp) + 3 scoops rice protein + 3 ice cubes, no banana this time. Built from the no-banana base recipe (2 tbsp PB = 645 cal/58g protein/18g carb/24g fat/290mg sodium) plus the extra tbsp of peanut butter, rather than reused whole, since the PB amount differs. No photo shared.",
    calories: 740, protein: 62, carbs: 21, fat: 32, sodium: 365 },
  { date: "2026-08-10", time: "09:27", name: "Eggs Over-Hard (No Salt) & Sausage Patty", photo: "food-photos/2026-08-10-breakfast.jpeg",
    description: "2 large eggs, over-hard, no salt + 1 pork sausage patty (~2oz) — breakfast. Same combo as recent breakfasts (Aug 6, Aug 7), macros reused directly.",
    calories: 350, protein: 21, carbs: 2, fat: 29, sodium: 550, sodiumNote: "Sausage patty is doing nearly all the sodium here, not the eggs (no salt added to those)." },
];

// Narrative timeline for the "Activity" feed. Quantitative history
// (weight/sleep/steps/calories over time) lives in the arrays above and
// drives the charts; this is the log of notable one-off events.
const events = [
  { date: "2026-07-27", text: "Walk: Lunchtime walk logged" },
  { date: "2026-07-29", text: "Walk: Lunchtime walk (12:43 PM) · 1.58 mi · 35 min · pace ~22 min/mi" },
  { date: "2026-07-29", text: "<strong>Daily stats:</strong> 11,875 steps · 5.7 mi · 19 floors · 3,162 cal burned · 11 zone min · Readiness 25 (Low)" },
  { date: "2026-07-30", text: "Walk: Lunchtime walk (12:13 PM) · 0.74 mi · 17 min · pace ~23 min/mi" },
  { date: "2026-07-30", text: "<strong>Daily stats:</strong> 15,425 steps · 7.47 mi · 20 floors · 3,434 cal burned · 8 zone min · Readiness 65 (High)" },
  { date: "2026-07-31", text: "Walk: Lunchtime walk (12:04 PM) · 1.44 mi · 29 min · pace ~20.1 min/mi" },
  { date: "2026-07-31", text: "<strong>Daily stats:</strong> 9,723 steps · 4.65 mi · 12 floors · 2,853 cal burned · 3 zone min · Readiness 56 (Moderate) · RHR 67 bpm · Cardio Load 9 · 5/5 exercise days this week" },
  { date: "2026-08-01", text: "<strong>Daily stats:</strong> 8,136 steps · 3.84 mi · 17 floors · 2,986 cal burned · 0 zone min · Readiness 68 (High) · RHR 65 bpm (range 52–125) · Cardio Load 16 · 6 of 5 exercise days last week" },
  { date: "2026-08-02", text: "Fishing day — nutrition not logged (off normal pattern, skipped by request)" },
  { date: "2026-08-02", text: "<strong>Daily stats:</strong> 5,059 steps · 2.51 mi · 3 floors · 3,346 cal burned · 0 zone min · Readiness 67 (High) · RHR 66 bpm (range 54–118) · Cardio Load 62 · 0 of 5 exercise days this week" },
  { date: "2026-08-03", text: "<strong>Daily stats:</strong> 7,908 steps · 3.85 mi · 11 floors · 2,792 cal burned · 0 zone min · Readiness 56 (Moderate) · RHR 66 bpm (range 55–111) · Cardio Load 2 · 0 of 5 exercise days this week" },
  { date: "2026-08-04", text: "<strong>Daily stats:</strong> 16,370 steps · 7.74 mi · 20 floors · 3,545 cal burned · 40 zone min · Sleep 7h21m (score 93) · Readiness 67 (High) · RHR 66 bpm · Cardio Load 41 · 1 of 5 exercise days this week" },
  { date: "2026-08-05", text: "<strong>Daily stats:</strong> 14,654 steps · 7.05 mi · 17 floors · 3,257 cal burned · 12 zone min · Sleep 6h56m (score 86) · Readiness 58 (Moderate) · RHR 65 bpm · Cardio Load 17 · 2 of 5 exercise days this week" },
  { date: "2026-08-06", text: "<strong>Daily stats (backfilled):</strong> 11,760 steps · 5.7 mi · 12 floors · 3,054 cal burned · 17 zone min · Sleep 5h25m (score 79) · Readiness 59 (Moderate) · RHR 64 bpm (range 52–112) · Cardio Load 21 · 3 of 5 exercise days this week" },
  { date: "2026-08-08", text: "Pilates class, 51 min (10:32 AM, 110 cal per Fitbit)" },
  { date: "2026-08-08", text: "<strong>Daily stats (as of 4:55 PM, day in progress):</strong> 12,830 steps · 6.15 mi · 19 floors · 2,798 cal burned · 92 zone min · Sleep 5h57m (score 76) · Readiness 37 (Moderate) · RHR 66 bpm · Cardio Load 72 · 5 of 5 exercise days this week" },
  { date: "2026-08-09", text: "Family day — visited the cemetery to see his grandmother. Fitness plan intentionally off pattern; nutrition not logged." },
  { date: "2026-08-09", text: "<strong>Daily stats:</strong> 9,370 steps · 4.39 mi · 10 floors · 3,133 cal burned · 27 zone min · Sleep 6h48m (score 85) · Readiness 78 (High) · RHR 64 bpm (range 50–120) · Cardio Load 24 · 0 of 5 exercise days this week" },
];

// Structured facts that don't fit a time series — just a one-line goals
// summary. (Gym status and medications used to live here too — removed
// 2026-08-03. See the comment near the top of this file for why.)
const meta = {
  goalsSummary: "Overall health · muscle gain (arms, chest, back) · belly fat reduction · weight management. Full detail: profile/goals.md"
};

const DAILY_CALORIE_TARGET = 2400;
const DAILY_PROTEIN_TARGET = 180;
// Placeholder, not a confirmed target — nutrition/goals.md still lists sodium
// as "TBD, track it" (Bobby is on Lisinopril + Nifedipine for BP; sodium
// works directly against both, see health/medications.md). 2,300mg is the
// general FDA/AHA adult daily limit; some hypertension-specific guidance
// recommends a stricter 1,500mg instead. Update this once Bobby (ideally
// with his doctor) settles on a real number, and update goals.md to match.
const DAILY_SODIUM_TARGET = 2300;

const proteinData = [
  { date: "2026-07-27", value: 199 },
  { date: "2026-07-28", value: null, note: "incomplete - party day" },
  { date: "2026-07-29", value: 194 },
  { date: "2026-07-30", value: 192 },
  { date: "2026-07-31", value: 184, note: "final" },
  { date: "2026-08-01", value: 152, note: "final" },
  { date: "2026-08-02", value: null, note: "not logged — fishing day, off pattern" },
  { date: "2026-08-03", value: 193, note: "final — right in the 180–200g target range" },
  { date: "2026-08-04", value: 179, note: "final — corrected after chicken label, just under the 180–200g target" },
  { date: "2026-08-05", value: 175, note: "final — close to the 180–200g target" },
  { date: "2026-08-06", value: 148, note: "final — just under the 180–200g target" },
  { date: "2026-08-07", value: 132, note: "partial — breakfast+shake, lunch, and fig bar/crisps snack so far" },
  { date: "2026-08-08", value: 159, note: "partial — pre-workout meal, post-workout Gai bowl, and afternoon shake so far" },
  { date: "2026-08-09", value: null, note: "not logged — family day, cemetery visit, off pattern" },
  { date: "2026-08-10", value: 21, note: "partial — breakfast so far" }
];
