import { useState, useEffect, useRef } from "react";

// ---------------- PROGRAM DATA ----------------
// rec = recommended starting weight (kg). The app adjusts it from your logged reps.
// DB exercises = kg PER dumbbell. Smith = added plates total (don't count the bar).
// Every exercise: 4 sets. You log the reps of your LAST set only.
const SETS = 4;
const PROGRAM = [
  {
    id: "push", name: "Push", sub: "Chest · Shoulders · Triceps",
    exercises: [
      { id: "chest-press", name: "Chest Press", equip: "Machine", repMin: 8, repMax: 12, inc: 2.5, rec: 20, vid: "Renaissance Periodization machine chest press technique" },
      { id: "shoulder-press-m", name: "Shoulder Press", equip: "Machine", repMin: 8, repMax: 12, inc: 2.5, rec: 15, vid: "Renaissance Periodization machine shoulder press technique" },
      { id: "dips", name: "Seated Dip Machine", equip: "Machine", repMin: 8, repMax: 12, inc: 2.5, rec: 25, vid: "Renaissance Periodization machine dip technique" },
      { id: "cable-fly", name: "Cable Fly", equip: "Cables, mid height", repMin: 12, repMax: 15, inc: 2.5, rec: 10, vid: "Jeff Nippard cable fly technique" },
      { id: "lat-raise", name: "Lateral Raise", equip: "Dumbbells (kg per DB)", repMin: 12, repMax: 15, inc: 2, rec: 4, vid: "Jeff Nippard lateral raise technique" },
      { id: "pushdown", name: "Triceps Rope Pushdown", equip: "Cable", repMin: 10, repMax: 15, inc: 2.5, rec: 15, vid: "Jeff Nippard triceps pushdown technique" },
    ],
  },
  {
    id: "pull", name: "Pull", sub: "Back · Rear delts · Biceps",
    exercises: [
      { id: "pulldown", name: "Lat Pulldown", equip: "Machine, shoulder-width grip", repMin: 8, repMax: 12, inc: 2.5, rec: 30, vid: "Jeff Nippard lat pulldown technique" },
      { id: "cable-row", name: "Seated Cable Row", equip: "Cable", repMin: 8, repMax: 12, inc: 2.5, rec: 30, vid: "Jeff Nippard seated cable row technique" },
      { id: "rear-delt", name: "Rear Delt Row", equip: "Technogym machine", repMin: 10, repMax: 15, inc: 2.5, rec: 15, vid: "Renaissance Periodization rear delt row machine technique" },
      { id: "face-pull", name: "Face Pull", equip: "Cable, rope at face height", repMin: 12, repMax: 15, inc: 2.5, rec: 15, vid: "Athlean-X face pull technique" },
      { id: "ez-curl", name: "EZ Bar Curl", equip: "Bar + plates (total kg)", repMin: 8, repMax: 12, inc: 2.5, rec: 15, vid: "Renaissance Periodization ez bar curl technique" },
      { id: "hammer-curl", name: "Hammer Curl", equip: "Dumbbells (kg per DB)", repMin: 10, repMax: 15, inc: 2, rec: 8, vid: "Renaissance Periodization hammer curl technique" },
    ],
  },
  {
    id: "legs", name: "Legs", sub: "Quads · Hamstrings · Calves",
    exercises: [
      { id: "leg-press", name: "Leg Press", equip: "Machine", repMin: 8, repMax: 12, inc: 5, rec: 60, vid: "Renaissance Periodization leg press technique" },
      { id: "smith-squat", name: "Smith Machine Squat", equip: "Added plates total, feet slightly forward", repMin: 8, repMax: 10, inc: 2.5, rec: 20, vid: "Jeremy Ethier smith machine squat technique" },
      { id: "leg-curl", name: "Leg Curl", equip: "Machine", repMin: 10, repMax: 15, inc: 2.5, rec: 25, vid: "Renaissance Periodization seated leg curl technique" },
      { id: "leg-ext", name: "Leg Extension", equip: "Machine", repMin: 12, repMax: 15, inc: 2.5, rec: 25, vid: "Renaissance Periodization leg extension technique" },
      { id: "calf-press", name: "Calf Press", equip: "On leg press, full stretch at bottom", repMin: 15, repMax: 20, inc: 5, rec: 60, vid: "Renaissance Periodization leg press calf raise technique" },
    ],
  },
  {
    id: "upper", name: "Upper", sub: "Chest · Back · Shoulders · Arms",
    exercises: [
      { id: "smith-incline", name: "Smith Incline Press", equip: "Added plates total", repMin: 8, repMax: 12, inc: 2.5, rec: 15, vid: "Jeremy Ethier smith machine incline press technique" },
      { id: "pulldown-close", name: "Close-Grip Pulldown", equip: "Machine, neutral grip", repMin: 10, repMax: 12, inc: 2.5, rec: 30, vid: "Renaissance Periodization close grip pulldown technique" },
      { id: "db-shoulder", name: "DB Shoulder Press", equip: "Dumbbells (kg per DB), seated", repMin: 8, repMax: 12, inc: 2, rec: 10, vid: "Jeff Nippard dumbbell shoulder press technique" },
      { id: "row-wide", name: "Cable Row (wide grip)", equip: "Cable", repMin: 10, repMax: 12, inc: 2.5, rec: 25, vid: "Jeff Nippard cable row technique" },
      { id: "ez-curl-2", name: "EZ Bar Curl", equip: "Bar + plates (total kg)", repMin: 10, repMax: 12, inc: 2.5, rec: 15, vid: "Renaissance Periodization ez bar curl technique" },
      { id: "oh-triceps", name: "Overhead Cable Extension", equip: "Cable, rope", repMin: 10, repMax: 15, inc: 2.5, rec: 10, vid: "Jeff Nippard overhead triceps extension technique" },
    ],
  },
  {
    id: "lower", name: "Lower", sub: "Hamstrings · Glutes · Quads · Core",
    exercises: [
      { id: "db-rdl", name: "DB Romanian Deadlift", equip: "Dumbbells (kg per DB), hinge at hips", repMin: 10, repMax: 12, inc: 2, rec: 12, vid: "Jeff Nippard Romanian deadlift technique" },
      { id: "split-squat", name: "Bulgarian Split Squat", equip: "Dumbbells (kg per DB), per leg", repMin: 8, repMax: 10, inc: 2, rec: 8, vid: "Jeff Nippard bulgarian split squat technique" },
      { id: "leg-ext-2", name: "Leg Extension", equip: "Machine", repMin: 12, repMax: 15, inc: 2.5, rec: 25, vid: "Renaissance Periodization leg extension technique" },
      { id: "leg-curl-2", name: "Leg Curl", equip: "Machine", repMin: 12, repMax: 15, inc: 2.5, rec: 25, vid: "Renaissance Periodization seated leg curl technique" },
      { id: "smith-calf", name: "Standing Calf Raise", equip: "Smith, added plates total", repMin: 15, repMax: 20, inc: 2.5, rec: 20, vid: "Jeff Nippard standing calf raise technique" },
      { id: "cable-crunch", name: "Cable Crunch", equip: "Cable, kneeling", repMin: 12, repMax: 15, inc: 2.5, rec: 25, vid: "Jeff Nippard cable crunch technique" },
    ],
  },
];

// Gym days: Mon, Tue, Wed, Fri, Sat. Rest: Thu, Sun. (JS getDay: 0=Sun)
const GYM_BY_DOW = { 1: "push", 2: "pull", 3: "legs", 5: "upper", 6: "lower" };
const SA_NIGHTS = [1, 4]; // Monday & Thursday nights

const WEEK_LAYOUT = [
  ["Mon", "Push"], ["Tue", "Pull"], ["Wed", "Legs"], ["Thu", "Rest"], ["Fri", "Upper"], ["Sat", "Lower"], ["Sun", "Rest"],
];

// ---------------- DIET DATA ----------------
// Daily target: ~3000 kcal · ~110g protein · ~85g fat · ~420g carbs.
// Breakfast + lunch + snack are fixed (~2040 kcal, 305g carbs). Dinner is your call and fills the rest.
const DIET_TARGETS = [
  { label: "Calories", value: "~3,000", note: "kcal / day" },
  { label: "Protein", value: "~110 g", note: "some at every meal" },
  { label: "Carbs", value: "~420 g", note: "the hard one, so eat the rice" },
  { label: "Fat", value: "~85 g", note: "a bit over on ribeye nights is fine" },
  { label: "Sleep", value: "9–11 h", note: "lights out 21:30 on school nights" },
  { label: "Gain rate", value: "0.25–0.5 kg", note: "per week" },
];

const BREAKFAST = {
  food: "Overnight oats: 100g oats + 400ml whole milk + banana + honey",
  macros: "~800 kcal · 27g P · 21g F · 122g C",
  info: [
    "Made the night before (Prep step), so it's ready instantly: 100g oats + 400ml whole milk in a tub, lid on, fridge.",
    "Morning: slice a banana on top + 1 big spoon of honey (~20g). Eat it cold, or microwave 2 min if you want it hot.",
    "~800 kcal · 27g protein · 21g fat · 122g carbs.",
    "Swap: 3 eggs + 3 buttered toast + banana + glass of milk (~830 kcal, 38g P). Takes ~10 min and has fewer carbs, so only if you're up on time.",
  ],
};

const LUNCH = {
  food: "2 chicken wraps with cheese + apple + 250ml orange juice",
  macros: "~870 kcal · 49g P · 20g F · 120g C",
  info: [
    "2 large flour wraps + 100g cooked chicken split between them + 1 slice of cheese + salad + sweet chilli or salsa.",
    "+ 1 apple + 250ml orange juice (a carton is fine).",
    "~870 kcal · 49g protein · 20g fat · 120g carbs. This is about half your day's protein, so don't skip it.",
    "Chicken: cook a batch on Sunday (for Mon–Wed) and Wednesday (for Thu–Fri). Cooked chicken keeps ~3 days in the fridge. Pack it with an ice pack or a frozen drink.",
    "Buying lunch instead? A chicken wrap or sandwich + juice + fruit or a flapjack. Skip crisps-only meal deals because they have no protein.",
  ],
};

const SNACK = {
  food: "Banana + flapjack (~60g)",
  macros: "~375 kcal · 4g P · 12g F · 63g C",
  info: [
    "Banana + a ~60g flapjack: ~375 kcal, 63g carbs. Quick fuel straight after school.",
    "Swap: 2 cereal bars + banana, or a bagel with jam.",
  ],
};

const DINNER = {
  food: "Rice (or other carbs) + meat. Your call",
  macros: "aim ~900–1,100 kcal · 40g+ P · ~118g C",
  info: [
    "Your call. Just roughly hit this: ~150g DRY rice (≈ 450g cooked, about 3 fists) + meat.",
    "Ribeye night (3× a week): one ~200g raw ribeye. ≈ 37g protein, 44g fat. No extra oil needed.",
    "Other nights: ~150–200g chicken thigh, mince, etc., cooked in 1 tbsp olive oil or butter.",
    "Not rice? ~150g dry pasta, or ~600g potatoes (about 3 medium).",
    "Why so much carbs: breakfast + lunch + snack give ~305g, and dinner brings the last ~115g to reach 420g.",
  ],
};

const MEAL_SKELETON = [
  { time: "07:50: Breakfast", food: BREAKFAST.food, kcal: BREAKFAST.macros },
  { time: "School lunch", food: LUNCH.food, kcal: LUNCH.macros },
  { time: "15:40: Snack (on the way to the gym)", food: SNACK.food, kcal: SNACK.macros },
  { time: "18:30: Dinner", food: DINNER.food, kcal: DINNER.macros },
];

const DINNER_GUIDE = [
  ["Carbs", "~150g dry rice (≈ 450g cooked). Or 150g dry pasta / ~600g potatoes"],
  ["Meat", "~150–200g chicken thigh, mince, etc. + 1 tbsp olive oil or butter"],
  ["Steak", "Ribeye 3× a week: ~200g raw ≈ 37g P, 44g F. Skip the oil those nights"],
  ["Total", "Normal day ≈ 2,900 kcal · 123g P · 75g F · 423g C. Ribeye day ≈ 3,130 kcal · 127g P · 98g F · 423g C"],
];

const DIET_RULES = [
  "Weigh yourself every Sat morning after the toilet, before food. Log it in Progress.",
  "Scale not moving up after 2 weeks? Add 300ml whole milk + 1 spoon peanut butter daily (~300 kcal).",
  "Gaining faster than 0.5 kg/week? Cut dinner rice to ~120g dry.",
  "Carbs are the hardest number to hit. Don't shrink the rice portion, because it's most of dinner's carbs.",
  "Ribeye nights push fat to ~98g. That's fine because the other nights land under 85g.",
  "UK winter: a 10µg vitamin D tablet daily is standard NHS advice.",
];

// ---------------- SKINCARE INFO ----------------
const SKIN_AM_INFO = [
  "1. Splash your face with LUKEWARM water. Woke up oily or sweaty? Use the Hydrating Cleanser instead: 1–2 pumps on wet hands, massage the whole face 30–45 seconds, rinse fully.",
  "2. Pat dry with a clean towel. Pat — never rub.",
  "3. While skin is still slightly damp: fingertip amount of the AM SPF30 Moisturiser. Dots on forehead, both cheeks, nose, chin — spread evenly. Include ears and neck.",
  "4. This one stays on all day — it's your sunscreen. Reapply if you're outside for hours.",
  "5. SPF goes on EVERY morning, even cloudy days. Never use the SA cleanser in the morning.",
];
const SKIN_PM_NORMAL_INFO = [
  "1. Hydrating Cleanser: wet face with lukewarm water, 1–2 pumps, massage gently for 60 seconds, rinse completely.",
  "2. Pat with towel until skin is DAMP, not bone dry.",
  "3. Apply moisturiser on that damp skin (CeraVe PM when you buy it — the AM one works until then). Fingertip amount, spread evenly.",
  "4. LEAVE THE MOISTURISER ON ALL NIGHT. Do not rinse it, do not wipe it off. It works over hours while you sleep — that's the entire job.",
  "5. Two kinds of product: cleansers are WASH-OFF (60 seconds, then rinse). Moisturiser is LEAVE-ON (all night, no timer). Never mix the two rules up.",
  "6. In the morning you just splash with water — that takes off whatever's left. The old 3–6 minute cleanser leave-on habit is what dried you out; it's gone forever.",
];
const SKIN_PM_SA_INFO = [
  "1. SA Smoothing Cleanser night (Mon + Thu only). Wet face with lukewarm water.",
  "2. Small amount, massage the whole face for 60 SECONDS MAX — put a timer on. Not 3 minutes. Not 6. Sixty seconds.",
  "3. Rinse COMPLETELY. It's a wash-off cleanser, it does not stay on the skin.",
  "4. Pat until damp, then moisturiser straight away — SA nights need it most. It STAYS ON ALL NIGHT. The 60-second timer is for the cleanser only; moisturiser is never rinsed off.",
  "5. If your face feels tight or flaky this week, skip this SA night and use the Hydrating Cleanser instead. Dry skin = too much exfoliation.",
];

// ---------------- DAILY ROUTINE BUILDER ----------------
const DOW_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const GYM_INFO = [
  "Warm-up: 5 min bike or jump rope + 1 light set of the first exercise per muscle.",
  "4 sets each exercise. Rest ~2 min on the first two exercises, 60–90s after.",
  "Log the reps of your final set in the Lift tab and hit Finish Workout. The app sets next session's weights.",
];

function buildRoutine(dow) {
  const schoolDay = dow >= 1 && dow <= 5;
  const schoolTomorrow = dow >= 0 && dow <= 4;
  const gymId = GYM_BY_DOW[dow];
  const gymName = gymId ? PROGRAM.find((p) => p.id === gymId).name : null;
  const gymTomorrow = !!GYM_BY_DOW[(dow + 1) % 7];
  const saNight = SA_NIGHTS.includes(dow);
  const steps = [];

  if (schoolDay) {
    steps.push({ id: "wake", time: "07:30", title: "Wake up", sub: "Glass of water" });
    steps.push({ id: "shower-am", time: "07:35", title: "Shower + skincare", sub: "Splash face → pat dry → SPF moisturiser", info: SKIN_AM_INFO });
    steps.push({ id: "bfast", time: "07:50", title: "Breakfast", sub: BREAKFAST.food, info: BREAKFAST.info });
    steps.push({ id: "leave", time: "08:05", title: "Leave for school", sub: gymId ? "Take lunch, snack and gym kit · school 08:30" : "Take lunch + snack · school 08:30" });
    steps.push({ id: "lunch", time: "LUNCH BREAK", title: "Lunch", sub: LUNCH.food, info: LUNCH.info });
    if (gymId) {
      steps.push({ id: "gym", time: "15:40 – 17:00", title: `Gym: ${gymName} day`, sub: `Snack on the way: ${SNACK.food.toLowerCase()}`, info: [...SNACK.info, ...GYM_INFO] });
      steps.push({ id: "shower-pm", time: "17:30", title: "Shower", sub: "Home by 17:15, straight in" });
    } else {
      steps.push({ id: "snack", time: "15:40", title: "Snack: rest day", sub: SNACK.food, info: ["Still eat it on rest days, because muscle is built on rest days and needs the calories.", ...SNACK.info] });
    }
  } else {
    steps.push({ id: "wake", time: "09:00", title: "Wake up", sub: "Lie-in, but still inside 9–11h" });
    if (dow === 6) steps.push({ id: "weigh", time: "09:05", title: "Saturday weigh-in", sub: "After the toilet, before food. Log it in Progress, then tap Backup" });
    steps.push({ id: "shower-am", time: "09:10", title: "Shower + skincare", sub: "Splash face → pat dry → SPF moisturiser", info: SKIN_AM_INFO });
    steps.push({ id: "bfast", time: "09:30", title: "Breakfast", sub: "Same oats, made fresh (microwave 2 min), or the eggs + toast swap", info: BREAKFAST.info });
    if (gymId) steps.push({ id: "gym", time: "12:00", title: `Gym: ${gymName} day`, sub: "Shower after", info: GYM_INFO });
    steps.push({ id: "lunch", time: "13:30", title: "Lunch", sub: LUNCH.food, info: LUNCH.info });
    steps.push({ id: "snack", time: "16:00", title: "Snack", sub: SNACK.food, info: SNACK.info });
  }

  steps.push({ id: "dinner", time: "18:30", title: "Dinner", sub: `${DINNER.food} · ${DINNER.macros}`, info: DINNER.info });

  if (schoolTomorrow) {
    const cook = dow === 0 || dow === 3;
    steps.push({
      id: "prep", time: "20:30", title: "Prep tomorrow",
      sub: ["Oats in the fridge", "pack lunch + snack", gymTomorrow ? "gym kit by the door" : null, cook ? "cook the chicken batch" : null].filter(Boolean).join(" · "),
      info: ["Overnight oats: 100g oats + 400ml whole milk in a tub, lid on, fridge. Takes 1 minute.", "Mornings are 35 minutes, so anything done tonight is time saved tomorrow.", ...(cook ? ["Chicken batch: ~300g cooked covers the next 3 lunches. It keeps ~3 days in the fridge."] : [])],
    });
  }

  const skinSub = saNight ? "SA cleanser 60 sec MAX → rinse → moisturise" : "Cleanser → moisturise on damp skin";
  steps.push({
    id: "bed", time: schoolTomorrow ? "21:15" : "22:15",
    title: saNight ? "Skincare (SA night) → bed" : "Skincare → bed",
    sub: schoolTomorrow ? `${skinSub} · lights out 21:30 = 10h` : `${skinSub} · lights out 22:30 = 10.5h`,
    info: [
      ...(saNight ? SKIN_PM_SA_INFO : SKIN_PM_NORMAL_INFO),
      schoolTomorrow ? "Sleep: lights out 21:30 gives 10h before 07:30. Latest is 22:30 (9h)." : "Sleep: lights out 22:30 gives 10.5h before 09:00.",
      "Phone away before lights out. Sleep is when growth and muscle repair actually happen.",
    ],
  });

  return steps;
}

// ---------------- HELPERS ----------------
const STORAGE_KEY = "flow-program-v3";
const OLD_KEY = "flow-program-v2";
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const EMPTY = { weights: {}, sessions: [], bodyweight: [], dayChecks: {}, drafts: {}, lastBackup: null };
const clean = (p) => ({ weights: p.weights || {}, sessions: p.sessions || [], bodyweight: p.bodyweight || [], dayChecks: p.dayChecks || {}, drafts: p.drafts || {}, lastBackup: p.lastBackup || null });
const daysSince = (iso) => iso ? Math.floor((new Date(todayStr() + "T12:00:00") - new Date(iso + "T12:00:00")) / 86400000) : null;
const fmtDate = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const ytUrl = (q) => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);

function adjustWeight(ex, weight, reps) {
  if (!reps || reps <= 0) return { next: weight, tag: null };
  if (reps < ex.repMin) return { next: Math.max(0, +(weight - ex.inc).toFixed(1)), tag: "down" };
  if (reps >= ex.repMax + 4) return { next: +(weight + 2 * ex.inc).toFixed(1), tag: "jump" };
  if (reps >= ex.repMax) return { next: +(weight + ex.inc).toFixed(1), tag: "up" };
  return { next: weight, tag: "hold" };
}

function migrateV2(parsed) {
  const sessions = (parsed.sessions || []).map((s) => {
    const entries = {};
    Object.entries(s.entries || {}).forEach(([id, e]) => {
      const nz = Array.isArray(e.reps) ? e.reps.filter((r) => r > 0) : [e.reps];
      entries[id] = { weight: e.weight, reps: nz.length ? Math.min(...nz) : 0 };
    });
    return { ...s, entries };
  });
  return clean({ weights: parsed.weights, sessions, bodyweight: parsed.bodyweight });
}

export default function App() {
  const [tab, setTab] = useState("day");
  const [dayId, setDayId] = useState(GYM_BY_DOW[new Date().getDay()] || "push");
  const [data, setData] = useState(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [draftW, setDraftW] = useState({});
  const [draftR, setDraftR] = useState({});
  const [toast, setToast] = useState(null);
  const [bwInput, setBwInput] = useState("");
  const [openInfo, setOpenInfo] = useState({});
  const fileRef = useRef(null);
  const [rev, setRev] = useState(0);

  const dow = new Date().getDay();
  const routine = buildRoutine(dow);
  const todayChecks = data.dayChecks?.[todayStr()] || {};

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY);
        if (res && res.value) {
          const p = JSON.parse(res.value);
          setData(clean(p));
          setLoaded(true);
          return;
        }
      } catch (e) { /* no v3 yet */ }
      try {
        const old = await window.storage.get(OLD_KEY);
        if (old && old.value) setData(migrateV2(JSON.parse(old.value)));
      } catch (e) { /* fresh start */ }
      setLoaded(true);
    })();
    // Ask the browser to treat this app's data as important so it isn't cleared to free space.
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { /* not supported */ }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try { await window.storage.set(STORAGE_KEY, JSON.stringify(data)); }
      catch (e) { setToast({ type: "warn", msg: "Couldn't save on this device. Tap Backup in Progress now so nothing is lost." }); }
    })();
  }, [data, loaded]);

  useEffect(() => {
    const day = PROGRAM.find((d) => d.id === dayId);
    const saved = data.drafts?.[dayId];
    const fresh = saved && saved.date === todayStr();
    const w = {}; const r = {};
    day.exercises.forEach((ex) => {
      w[ex.id] = fresh && saved.w[ex.id] != null ? saved.w[ex.id] : (data.weights[ex.id] ?? ex.rec);
      r[ex.id] = fresh && saved.r[ex.id] != null ? saved.r[ex.id] : 0;
    });
    setDraftW(w); setDraftR(r);
  }, [dayId, loaded, rev]); // eslint-disable-line

  useEffect(() => {
    if (!loaded) return;
    const day = PROGRAM.find((d) => d.id === dayId);
    if (!day.exercises.every((ex) => ex.id in draftW && ex.id in draftR)) return; // drafts not set up for this day yet
    setData((p) => ({ ...p, drafts: { ...(p.drafts || {}), [dayId]: { date: todayStr(), w: draftW, r: draftR } } }));
  }, [draftW, draftR]); // eslint-disable-line

  const day = PROGRAM.find((d) => d.id === dayId);

  const toggleStep = (id) => {
    setData((p) => {
      const t = todayStr();
      const dc = { ...(p.dayChecks || {}) };
      const cur = { ...(dc[t] || {}) };
      cur[id] = !cur[id];
      dc[t] = cur;
      const keys = Object.keys(dc).sort();
      while (keys.length > 30) delete dc[keys.shift()];
      return { ...p, dayChecks: dc };
    });
  };

  const lastFor = (exId) => {
    for (let i = data.sessions.length - 1; i >= 0; i--) {
      const e = data.sessions[i].entries[exId];
      if (e && e.reps > 0) return { date: data.sessions[i].date, weight: e.weight, reps: e.reps };
    }
    return null;
  };

  const bumpW = (exId, dir, inc) => setDraftW((p) => ({ ...p, [exId]: Math.max(0, +(((parseFloat(p[exId]) || 0) + dir * inc)).toFixed(1)) }));
  const bumpR = (exId, dir) => setDraftR((p) => ({ ...p, [exId]: Math.max(0, Math.min(30, (p[exId] || 0) + dir)) }));

  const finishWorkout = () => {
    const entries = {}; const changes = []; let did = false;
    const newWeights = { ...data.weights };
    day.exercises.forEach((ex) => {
      const w = parseFloat(draftW[ex.id]);
      const reps = draftR[ex.id] || 0;
      if (reps <= 0) return;
      did = true;
      const weight = isNaN(w) ? 0 : w;
      entries[ex.id] = { weight, reps };
      const { next, tag } = adjustWeight(ex, weight, reps);
      newWeights[ex.id] = next;
      if (tag === "up") changes.push(`${ex.name} ▲ ${next}kg`);
      if (tag === "jump") changes.push(`${ex.name} ▲▲ ${next}kg (too easy)`);
      if (tag === "down") changes.push(`${ex.name} ▼ ${next}kg (reps under range)`);
    });
    if (!did) { setToast({ type: "warn", msg: "Log at least one exercise first." }); return; }
    const ups = changes.filter((c) => c.includes("▲")).length;
    setData((p) => ({ ...p, weights: newWeights, sessions: [...p.sessions, { date: todayStr(), dayId: day.id, dayName: day.name, entries, levelUps: ups }] }));
    setToast({ type: "good", msg: changes.length ? `Saved. Next session: ${changes.join(" · ")}` : "Saved. Weights held — add reps next time to level up." });
    const r = {}; day.exercises.forEach((ex) => { r[ex.id] = 0; });
    setDraftR(r);
    setDraftW((p) => { const w = { ...p }; day.exercises.forEach((ex) => { if (newWeights[ex.id] != null) w[ex.id] = newWeights[ex.id]; }); return w; });
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  const backup = async () => {
    const stamp = todayStr();
    const json = JSON.stringify({ app: "b3plan", version: 3, saved: stamp, data: { ...data, lastBackup: stamp } }, null, 1);
    const name = `b3plan-backup-${stamp}.json`;
    let ok = false;
    try {
      const file = new File([json], name, { type: "application/json" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "b3plan backup" });
        ok = true;
      }
    } catch (e) {
      if (e && e.name === "AbortError") return; // closed the share sheet
    }
    if (!ok) {
      const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
      const a = document.createElement("a"); a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }
    setData((p) => ({ ...p, lastBackup: stamp }));
    setToast({ type: "good", msg: "Backup made. Keep the file somewhere safe (Files, iCloud Drive, email it to yourself)." });
  };

  const restore = async (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    try {
      const parsed = JSON.parse(await f.text());
      const d = parsed && parsed.data ? parsed.data : parsed;
      if (!d || !Array.isArray(d.sessions) || typeof d.weights !== "object") throw new Error("bad file");
      const msg = `Restore backup from ${parsed.saved || "this file"}? (${d.sessions.length} workouts, ${(d.bodyweight || []).length} weigh-ins). This replaces what's on this phone now.`;
      if (!window.confirm(msg)) return;
      setData(clean(d));
      setRev((n) => n + 1); // reload Lift tab weights from the restored data
      setToast({ type: "good", msg: "Backup restored." });
    } catch (err) {
      setToast({ type: "warn", msg: "That file isn't a b3plan backup." });
    }
  };

  const addBodyweight = () => {
    const v = parseFloat(bwInput);
    if (isNaN(v) || v < 30 || v > 150) { setToast({ type: "warn", msg: "Enter a weight in kg, e.g. 58.4" }); return; }
    setData((p) => ({ ...p, bodyweight: [...p.bodyweight.filter((b) => b.date !== todayStr()), { date: todayStr(), kg: v }].sort((a, b) => a.date.localeCompare(b.date)) }));
    setBwInput("");
    setToast({ type: "good", msg: "Bodyweight logged." });
  };

  const Spark = () => {
    const pts = data.bodyweight;
    if (pts.length < 2) return <div className="spark-empty">Log your weight every Saturday — the graph builds itself. Goal: 65 kg.</div>;
    const W = 300, H = 90, pad = 8;
    const kgs = pts.map((p) => p.kg);
    const min = Math.min(...kgs, 65) - 1, max = Math.max(...kgs, 65) + 1;
    const x = (i) => pad + (i / (pts.length - 1)) * (W - 2 * pad);
    const y = (v) => H - pad - ((v - min) / (max - min)) * (H - 2 * pad);
    const line = pts.map((p, i) => `${x(i)},${y(p.kg)}`).join(" ");
    const goalY = y(65);
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="spark">
        <line x1={pad} x2={W - pad} y1={goalY} y2={goalY} className="spark-goal" />
        <text x={W - pad} y={goalY - 4} textAnchor="end" className="spark-goal-t">65 kg goal</text>
        <polyline points={line} className="spark-line" />
        {pts.map((p, i) => <circle key={i} cx={x(i)} cy={y(p.kg)} r="3" className="spark-dot" />)}
      </svg>
    );
  };

  const doneCount = routine.filter((s) => todayChecks[s.id]).length;

  return (
    <div className="app">
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{css}</style>

      <header className="hdr">
        <div className="hdr-kicker">FLOW · 5-DAY PROGRAM</div>
        <div className="hdr-title">{tab === "day" ? "TODAY" : tab === "lift" ? "LIFT" : tab === "fuel" ? "FUEL" : "PROGRESS"}</div>
      </header>

      {tab === "day" && (
        <main className="main">
          <div className="day-banner">
            <div>
              <div className="day-name">{DOW_NAMES[dow]}</div>
              <div className="day-type">{GYM_BY_DOW[dow] ? `${PROGRAM.find((p) => p.id === GYM_BY_DOW[dow]).name} day` : "Rest day"}{SA_NIGHTS.includes(dow) ? " · SA skincare night" : ""}</div>
            </div>
            <div className="day-count">{doneCount}/{routine.length}</div>
          </div>

          {routine.map((s) => {
            const done = !!todayChecks[s.id];
            const open = !!openInfo[s.id];
            return (
              <div className={"step" + (done ? " step-done" : "")} key={s.id}>
                <button className={"chk" + (done ? " chk-on" : "")} onClick={() => toggleStep(s.id)} aria-label="toggle done">
                  {done ? "✓" : ""}
                </button>
                <div className="step-body" onClick={() => toggleStep(s.id)}>
                  <div className="step-time">{s.time}</div>
                  <div className="step-title">{s.title}</div>
                  {s.sub && <div className="step-sub">{s.sub}</div>}
                  {open && s.info && (
                    <div className="info-panel" onClick={(e) => e.stopPropagation()}>
                      {s.info.map((line, i) => <p key={i}>{line}</p>)}
                    </div>
                  )}
                </div>
                {s.info && (
                  <button className={"info-btn" + (open ? " info-on" : "")} onClick={(e) => { e.stopPropagation(); setOpenInfo((p) => ({ ...p, [s.id]: !p[s.id] })); }}>
                    i
                  </button>
                )}
              </div>
            );
          })}
          <div className="day-note">Checklist resets itself at midnight. Info buttons (i) show the exact steps.</div>
        </main>
      )}

      {tab === "lift" && (
        <main className="main">
          <div className="chips">
            {PROGRAM.map((d) => (
              <button key={d.id} className={"chip" + (d.id === dayId ? " chip-on" : "")} onClick={() => setDayId(d.id)}>{d.name}</button>
            ))}
          </div>
          <div className="day-sub">{day.sub}</div>

          <details className="howto">
            <summary>How this app coaches you (read once)</summary>
            <div className="howto-body">
              <p><b>▶ Technique buttons</b> open a YouTube tutorial for that exact exercise (Jeff Nippard / Renaissance Periodization / Athlean-X / Jeremy Ethier). Watch it once before your first time doing the movement.</p>
              <p><b>It suggests your weights.</b> Every exercise starts on a recommended kg. Marked "SUGG." until you've logged it once. Adjust with ± if it feels wrong on set 1.</p>
              <p><b>Do 4 sets of every exercise.</b> Then log ONE number: the reps you got on your LAST set — the hardest one. Counter starts at 0 every session.</p>
              <p><b>It adjusts.</b> Last set hits the top of the range → weight goes up. 4+ reps over → double jump. Under the bottom → weight comes down. In between → it holds and you chase reps.</p>
              <p><b>Units:</b> dumbbell moves = kg per dumbbell. Smith machine = added plates only, don't count the bar.</p>
              <p><b>Rest</b> ~2 min on the first two exercises, 60–90s after. <b>Warm-up:</b> 5 min bike/rope + 1 light set of the first exercise per muscle. Dying by the last exercise? 3 sets on the final two is fine. A rep only counts if it's controlled.</p>
            </div>
          </details>

          {day.exercises.map((ex) => {
            const last = lastFor(ex.id);
            const reps = draftR[ex.id] || 0;
            const w = draftW[ex.id];
            const isSuggested = data.weights[ex.id] == null;
            return (
              <div className="card" key={ex.id}>
                <div className="card-top">
                  <div>
                    <div className="ex-name">{ex.name}</div>
                    <div className="ex-meta">{ex.equip} · {SETS} × {ex.repMin}–{ex.repMax}</div>
                  </div>
                  <div className="chip-col">
                    <div className="target">last set {ex.repMax}+ → +{ex.inc}kg</div>
                    <a className="tech" href={ytUrl(ex.vid)} target="_blank" rel="noreferrer">▶ Technique</a>
                  </div>
                </div>
                {last
                  ? <div className="last">Last time: {last.weight}kg, final set × {last.reps} · {fmtDate(last.date)}</div>
                  : <div className="last sugg">Suggested start — adjust with ± if it feels wrong on set 1</div>}
                <div className="w-row">
                  <button className="stp" onClick={() => bumpW(ex.id, -1, ex.inc)}>−</button>
                  <div className="w-num">{w}<span className="w-unit">kg</span>{isSuggested && <span className="sugg-tag">SUGG.</span>}</div>
                  <button className="stp" onClick={() => bumpW(ex.id, +1, ex.inc)}>+</button>
                  <div className="rep-block">
                    <div className="rep-label">last set reps</div>
                    <div className="set">
                      <button className="stp stp-s" onClick={() => bumpR(ex.id, -1)}>−</button>
                      <span className={"set-n" + (reps >= ex.repMax ? " set-max" : "")}>{reps}</span>
                      <button className="stp stp-s" onClick={() => bumpR(ex.id, +1)}>+</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button className="finish" onClick={finishWorkout}>FINISH WORKOUT</button>

          <div className="week">
            {WEEK_LAYOUT.map(([d, w]) => (
              <div className="week-row" key={d}><span>{d}</span><span>{w}</span></div>
            ))}
          </div>
        </main>
      )}

      {tab === "fuel" && (
        <main className="main">
          <div className="grid4">
            {DIET_TARGETS.map((t) => (
              <div className="tgt" key={t.label}>
                <div className="tgt-v">{t.value}</div>
                <div className="tgt-l">{t.label}</div>
                <div className="tgt-n">{t.note}</div>
              </div>
            ))}
          </div>
          <div className="sec-h">EVERY DAY — THE SKELETON</div>
          {MEAL_SKELETON.map((m) => (
            <div className="card meal" key={m.time}>
              <div className="meal-t">{m.time}</div>
              <div className="meal-f">{m.food}</div>
              <div className="meal-k">{m.kcal}</div>
            </div>
          ))}
          <div className="sec-h">DINNER (YOUR CALL)</div>
          <div className="card">
            {DINNER_GUIDE.map(([d, m]) => (
              <div className="din-row" key={d}><span className="din-d">{d}</span><span className="din-m">{m}</span></div>
            ))}
          </div>
          <div className="sec-h">RULES</div>
          <div className="card">
            {DIET_RULES.map((r, i) => (
              <div className="rule" key={i}><span className="rule-dot" />{r}</div>
            ))}
          </div>
        </main>
      )}

      {tab === "progress" && (
        <main className="main">
          <div className="sec-h">BODYWEIGHT · GOAL 65 KG</div>
          <div className="card">
            <Spark />
            <div className="bw-row">
              <input className="bw-in" inputMode="decimal" placeholder="e.g. 58.4" value={bwInput} onChange={(e) => setBwInput(e.target.value)} />
              <button className="bw-btn" onClick={addBodyweight}>Log today</button>
            </div>
            {data.bodyweight.length > 0 && (
              <div className="bw-list">
                {[...data.bodyweight].reverse().slice(0, 6).map((b) => (
                  <div className="bw-item" key={b.date}><span>{fmtDate(b.date)}</span><span>{b.kg} kg</span></div>
                ))}
              </div>
            )}
          </div>
          <div className="sec-h">BACKUP</div>
          <div className="card">
            <div className={"bk-status" + (daysSince(data.lastBackup) == null || daysSince(data.lastBackup) > 7 ? " bk-warn" : "")}>
              {data.lastBackup == null ? "No backup yet. Make one now." : daysSince(data.lastBackup) === 0 ? "Backed up today ✓" : `Last backup: ${daysSince(data.lastBackup)} day${daysSince(data.lastBackup) === 1 ? "" : "s"} ago${daysSince(data.lastBackup) > 7 ? ". Make a new one." : ""}`}
            </div>
            <div className="bk-row">
              <button className="bw-btn bk-btn" onClick={backup}>Backup</button>
              <button className="bk-btn bk-sec" onClick={() => fileRef.current && fileRef.current.click()}>Restore</button>
              <input ref={fileRef} type="file" accept=".json,application/json" onChange={restore} style={{ display: "none" }} />
            </div>
            <div className="bk-note">Your data lives on this phone only. Back up every Saturday after you weigh in, and save the file to Files / iCloud Drive or email it to yourself. Restore puts it back on a new phone or after data gets wiped.</div>
          </div>
          <div className="sec-h">SESSIONS · {data.sessions.length} LOGGED</div>
          {data.sessions.length === 0 && <div className="card empty-c">No workouts saved yet. Finish your first session in the Lift tab.</div>}
          {[...data.sessions].reverse().slice(0, 12).map((s, i) => (
            <div className="card sess" key={i}>
              <div>
                <div className="sess-n">{s.dayName}</div>
                <div className="sess-d">{fmtDate(s.date)} · {Object.keys(s.entries).length} exercises</div>
              </div>
              {s.levelUps > 0 && <div className="lvl">▲ {s.levelUps} level-up{s.levelUps > 1 ? "s" : ""}</div>}
            </div>
          ))}
        </main>
      )}

      {toast && <div className={"toast " + (toast.type === "good" ? "toast-g" : "toast-w")}>{toast.msg}</div>}

      <nav className="nav">
        {[["day", "Today"], ["lift", "Lift"], ["fuel", "Fuel"], ["progress", "Progress"]].map(([id, label]) => (
          <button key={id} className={"nav-b" + (tab === id ? " nav-on" : "")} onClick={() => setTab(id)}>{label}</button>
        ))}
      </nav>
    </div>
  );
}

const css = `
:root{
  --bg:#0F1216; --card:#171C22; --line:#242C36; --txt:#ECEFF3; --mut:#96A1AF;
  --acc:#FF7A3D; --good:#57D9A3; --warn:#FFC24B;
}
*{box-sizing:border-box; -webkit-tap-highlight-color:transparent;}
body{margin:0;}
.app{min-height:100vh;background:var(--bg);color:var(--txt);font-family:'Inter',system-ui,sans-serif;padding-bottom:76px;}
.hdr{padding:18px 16px 6px;}
.hdr-kicker{font-family:'Barlow Condensed';letter-spacing:.22em;font-size:12px;color:var(--acc);font-weight:600;}
.hdr-title{font-family:'Barlow Condensed';font-weight:700;font-size:44px;letter-spacing:.04em;line-height:1;}
.main{padding:8px 14px 24px;max-width:560px;margin:0 auto;}
.day-banner{display:flex;justify-content:space-between;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:13px 14px;margin-bottom:12px;}
.day-name{font-family:'Barlow Condensed';font-size:24px;font-weight:700;letter-spacing:.04em;}
.day-type{font-size:12px;color:var(--acc);font-weight:600;margin-top:1px;}
.day-count{font-family:'Barlow Condensed';font-size:26px;font-weight:700;color:var(--mut);font-variant-numeric:tabular-nums;}
.step{display:flex;gap:11px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 12px;margin-bottom:8px;align-items:flex-start;}
.step-done{opacity:.55;}
.chk{flex:0 0 28px;width:28px;height:28px;border-radius:50%;border:2px solid var(--mut);background:none;color:#14100C;font-size:15px;font-weight:800;cursor:pointer;margin-top:2px;display:flex;align-items:center;justify-content:center;padding:0;}
.chk-on{background:var(--good);border-color:var(--good);}
.step-body{flex:1;cursor:pointer;min-width:0;}
.step-time{font-size:11px;color:var(--acc);font-weight:700;letter-spacing:.06em;}
.step-title{font-family:'Barlow Condensed';font-size:20px;font-weight:600;letter-spacing:.02em;line-height:1.15;}
.step-done .step-title{text-decoration:line-through;text-decoration-thickness:2px;text-decoration-color:var(--good);}
.step-done .step-sub{text-decoration:line-through;text-decoration-color:var(--good);}
.step-sub{font-size:12.5px;color:var(--mut);margin-top:2px;line-height:1.4;}
.info-btn{flex:0 0 26px;width:26px;height:26px;border-radius:50%;border:1px solid var(--line);background:#1F2630;color:var(--acc);font-size:13px;font-weight:800;font-style:italic;font-family:Georgia,serif;cursor:pointer;margin-top:3px;padding:0;}
.info-on{background:var(--acc);color:#14100C;border-color:var(--acc);}
.info-panel{background:#12161B;border:1px solid #2C3642;border-left:3px solid var(--acc);border-radius:10px;padding:10px 12px;margin-top:9px;cursor:default;}
.info-panel p{margin:0 0 7px;font-size:12.5px;line-height:1.5;color:var(--txt);}
.info-panel p:last-child{margin-bottom:0;}
.day-note{color:var(--mut);font-size:12px;text-align:center;padding:6px 0 2px;}
.chips{display:flex;gap:8px;overflow-x:auto;padding:6px 0;}
.chip{flex:0 0 auto;background:var(--card);border:1px solid var(--line);color:var(--mut);border-radius:999px;padding:8px 16px;font-family:'Barlow Condensed';font-size:17px;font-weight:600;letter-spacing:.06em;cursor:pointer;}
.chip-on{background:var(--acc);border-color:var(--acc);color:#14100C;}
.day-sub{color:var(--mut);font-size:13px;margin:2px 2px 10px;}
.howto{background:var(--card);border:1px solid var(--line);border-radius:12px;margin-bottom:12px;}
.howto summary{padding:12px 14px;font-size:13px;font-weight:600;color:var(--acc);cursor:pointer;list-style:none;}
.howto summary::-webkit-details-marker{display:none;}
.howto-body{padding:0 14px 12px;font-size:13px;color:var(--mut);line-height:1.5;}
.howto-body b{color:var(--txt);}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:13px 14px;margin-bottom:10px;}
.card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;}
.ex-name{font-family:'Barlow Condensed';font-size:22px;font-weight:600;letter-spacing:.03em;}
.ex-meta{color:var(--mut);font-size:12px;margin-top:1px;}
.target{font-size:11px;color:var(--acc);white-space:nowrap;border:1px solid #3A2A1E;background:#221A13;padding:4px 8px;border-radius:8px;}
.chip-col{display:flex;flex-direction:column;gap:5px;align-items:flex-end;}
.tech{font-size:11px;font-weight:700;color:#14100C;background:var(--good);border-radius:8px;padding:4px 9px;text-decoration:none;white-space:nowrap;letter-spacing:.03em;}
.tech:active{filter:brightness(1.1);}
.last{font-size:12px;color:var(--mut);margin-top:6px;}
.sugg{color:var(--warn);}
.sugg-tag{font-family:'Inter';font-size:9px;font-weight:700;letter-spacing:.08em;color:var(--warn);border:1px solid #4A3A1C;background:#241D10;border-radius:5px;padding:2px 4px;margin-left:6px;vertical-align:middle;}
.w-row{display:flex;align-items:center;gap:8px;margin-top:10px;flex-wrap:wrap;}
.stp{width:38px;height:38px;border-radius:10px;border:1px solid var(--line);background:#1F2630;color:var(--txt);font-size:20px;font-weight:600;cursor:pointer;flex:0 0 auto;}
.stp:active{background:var(--acc);color:#14100C;}
.stp-s{width:34px;height:34px;font-size:17px;border-radius:8px;}
.w-num{font-family:'Barlow Condensed';font-size:32px;font-weight:700;min-width:74px;text-align:center;font-variant-numeric:tabular-nums;}
.w-unit{font-size:16px;color:var(--mut);margin-left:2px;}
.rep-block{margin-left:auto;display:flex;flex-direction:column;align-items:center;gap:3px;}
.rep-label{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--mut);font-weight:600;}
.set{display:flex;align-items:center;gap:4px;background:#12161B;border:1px solid var(--line);border-radius:10px;padding:3px;}
.set-n{min-width:34px;text-align:center;font-weight:700;font-size:18px;font-variant-numeric:tabular-nums;}
.set-max{color:var(--good);}
.finish{width:100%;padding:15px;border-radius:14px;border:none;background:var(--acc);color:#14100C;font-family:'Barlow Condensed';font-size:20px;font-weight:700;letter-spacing:.12em;cursor:pointer;margin:6px 0 14px;}
.finish:active{filter:brightness(1.1);}
.week{border-top:1px solid var(--line);padding-top:10px;}
.week-row{display:flex;justify-content:space-between;font-size:13px;color:var(--mut);padding:3px 2px;}
.week-row span:last-child{color:var(--txt);}
.grid4{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;}
.tgt{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px;}
.tgt-v{font-family:'Barlow Condensed';font-size:24px;font-weight:700;color:var(--acc);}
.tgt-l{font-size:13px;font-weight:600;margin-top:2px;}
.tgt-n{font-size:11px;color:var(--mut);}
.sec-h{font-family:'Barlow Condensed';letter-spacing:.18em;font-size:13px;color:var(--mut);font-weight:600;margin:16px 2px 8px;}
.meal-t{font-size:12px;color:var(--acc);font-weight:600;}
.meal-f{font-size:14px;margin-top:3px;line-height:1.45;}
.meal-k{font-size:12px;color:var(--mut);margin-top:4px;}
.din-row{display:flex;gap:10px;padding:7px 0;border-bottom:1px solid var(--line);font-size:14px;line-height:1.4;}
.din-row:last-child{border-bottom:none;}
.din-d{color:var(--acc);font-weight:700;min-width:48px;font-family:'Barlow Condensed';font-size:16px;}
.din-m{color:var(--txt);}
.rule{display:flex;gap:9px;font-size:13.5px;line-height:1.5;padding:5px 0;color:var(--txt);}
.rule-dot{flex:0 0 6px;width:6px;height:6px;border-radius:50%;background:var(--acc);margin-top:7px;}
.spark{width:100%;height:auto;}
.spark-line{fill:none;stroke:var(--acc);stroke-width:2.5;stroke-linejoin:round;}
.spark-dot{fill:var(--acc);}
.spark-goal{stroke:var(--good);stroke-dasharray:4 4;stroke-width:1;}
.spark-goal-t{fill:var(--good);font-size:9px;font-family:'Inter';}
.spark-empty{color:var(--mut);font-size:13px;padding:8px 0;line-height:1.5;}
.bw-row{display:flex;gap:8px;margin-top:10px;}
.bw-in{flex:1;background:#12161B;border:1px solid var(--line);border-radius:10px;color:var(--txt);padding:11px 12px;font-size:16px;}
.bw-in:focus{outline:2px solid var(--acc);border-color:var(--acc);}
.bw-btn{background:var(--acc);border:none;border-radius:10px;color:#14100C;font-weight:700;padding:0 16px;cursor:pointer;}
.bw-list{margin-top:10px;border-top:1px solid var(--line);padding-top:6px;}
.bw-item{display:flex;justify-content:space-between;font-size:13px;color:var(--mut);padding:3px 0;font-variant-numeric:tabular-nums;}
.bw-item span:last-child{color:var(--txt);font-weight:600;}
.sess{display:flex;justify-content:space-between;align-items:center;}
.sess-n{font-family:'Barlow Condensed';font-size:19px;font-weight:600;}
.sess-d{font-size:12px;color:var(--mut);}
.lvl{color:var(--good);font-size:12px;font-weight:700;background:#12241C;border:1px solid #1E3A2E;padding:4px 8px;border-radius:8px;}
.empty-c{color:var(--mut);font-size:13px;}
.bk-status{font-size:14px;font-weight:600;color:var(--good);}
.bk-warn{color:var(--warn);}
.bk-row{display:flex;gap:8px;margin-top:10px;}
.bk-btn{flex:1;padding:12px 0;font-size:15px;border-radius:10px;cursor:pointer;font-weight:700;}
.bk-sec{background:#1F2630;border:1px solid var(--line);color:var(--txt);}
.bk-note{font-size:12px;color:var(--mut);margin-top:10px;line-height:1.5;}
.toast{position:fixed;left:14px;right:14px;bottom:84px;padding:12px 14px;border-radius:12px;font-size:13.5px;font-weight:600;z-index:20;animation:up .25s ease;line-height:1.4;}
.toast-g{background:#12241C;border:1px solid #2A5A45;color:var(--good);}
.toast-w{background:#2A2113;border:1px solid #5A4420;color:var(--warn);}
@keyframes up{from{transform:translateY(8px);opacity:0;}to{transform:translateY(0);opacity:1;}}
.nav{position:fixed;bottom:0;left:0;right:0;display:flex;background:#12161BF2;backdrop-filter:blur(10px);border-top:1px solid var(--line);z-index:10;}
.nav-b{flex:1;padding:16px 0 20px;background:none;border:none;color:var(--mut);font-family:'Barlow Condensed';font-size:16px;font-weight:600;letter-spacing:.08em;cursor:pointer;}
.nav-on{color:var(--acc);box-shadow:inset 0 2px 0 var(--acc);}
@media(prefers-reduced-motion:reduce){.toast{animation:none;}}
`;
