const COUNTIES = {
  Nairobi: [-1.286389, 36.817223],
  Mombasa: [-4.043477, 39.668206],
  Kisumu: [-0.091702, 34.767956],
  Kiambu: [-1.1714, 36.8356],
  Nakuru: [-0.303099, 36.08],
  "Uasin Gishu": [0.514277, 35.269779],
  Nyeri: [-0.4371, 36.958],
  Machakos: [-1.5177, 37.2634],
  Kajiado: [-1.8524, 36.7768],
  Kilifi: [-3.6305, 39.8499],
  Kakamega: [0.2827, 34.7519],
  Meru: [0.0463, 37.6559]
};
const INTERESTS = ["Chapati dates", "Hiking", "Afrobeats", "Church", "Football", "Startups", "Photography", "Nyama choma", "Travel", "Books", "Fitness", "Sheng comedy"];
const TRIBES = ["Prefer not to say", "Kikuyu", "Luo", "Luhya", "Kalenjin", "Kamba", "Kisii", "Meru", "Mijikenda", "Somali", "Other"];
const RELIGIONS = ["Prefer not to say", "Christian", "Muslim", "Traditional", "Spiritual", "None"];
const MODES = ["Open", "Student", "Professional", "Church"];

const SEED = [
  { name: "Amina", age: 26, gender: "Woman", county: "Mombasa", town: "Nyali", bio: "Sunrise swims and late pilau. Looking for someone who can keep a conversation past midnight.", interests: ["Travel", "Photography", "Nyama choma"], tribe: "Mijikenda", religion: "Muslim", mode: "Professional", hue: 180 },
  { name: "Brian", age: 28, gender: "Man", county: "Nairobi", town: "Kilimani", bio: "Product designer. Saturday mornings are for Karura, evenings for live sets.", interests: ["Hiking", "Afrobeats", "Startups"], tribe: "Kikuyu", religion: "Christian", mode: "Professional", hue: 150 },
  { name: "Wanjiku", age: 24, gender: "Woman", county: "Kiambu", town: "Ruiru", bio: "Campus mode on weekdays, market runs on Sunday. Soft life, sharp mind.", interests: ["Books", "Chapati dates", "Fitness"], tribe: "Kikuyu", religion: "Christian", mode: "Student", hue: 30 },
  { name: "Otieno", age: 30, gender: "Man", county: "Kisumu", town: "Milimani", bio: "I will take you for fish by the lake and argue about football after.", interests: ["Football", "Travel", "Nyama choma"], tribe: "Luo", religion: "Christian", mode: "Professional", hue: 200 },
  { name: "Faith", age: 27, gender: "Woman", county: "Nakuru", town: "Milimani", bio: "Choir on Sunday, long walks around the lake when the week gets loud.", interests: ["Church", "Books", "Hiking"], tribe: "Kalenjin", religion: "Christian", mode: "Church", hue: 340 },
  { name: "Jamal", age: 29, gender: "Man", county: "Nairobi", town: "Eastleigh", bio: "Coffee, code, and a good playlist. Serious about intentions.", interests: ["Startups", "Books", "Fitness"], tribe: "Somali", religion: "Muslim", mode: "Professional", hue: 210 },
  { name: "Chebet", age: 25, gender: "Woman", county: "Uasin Gishu", town: "Eldoret", bio: "Morning runs and evening chai. Tell me your favourite hill.", interests: ["Fitness", "Hiking", "Afrobeats"], tribe: "Kalenjin", religion: "Christian", mode: "Student", hue: 12 },
  { name: "Mwende", age: 31, gender: "Woman", county: "Machakos", town: "Athi River", bio: "Architect who still stops for roadside mangoes.", interests: ["Photography", "Travel", "Chapati dates"], tribe: "Kamba", religion: "Christian", mode: "Professional", hue: 48 },
  { name: "Kevin", age: 23, gender: "Man", county: "Kakamega", town: "Town", bio: "Sheng, football, and someone who laughs easily.", interests: ["Sheng comedy", "Football", "Afrobeats"], tribe: "Luhya", religion: "Christian", mode: "Student", hue: 90 },
  { name: "Asha", age: 27, gender: "Woman", county: "Kilifi", town: "Watamu", bio: "Ocean person. If you can sit quietly on the sand, we can talk.", interests: ["Travel", "Photography", "Books"], tribe: "Mijikenda", religion: "Muslim", mode: "Open", hue: 195 },
  { name: "Njoroge", age: 33, gender: "Man", county: "Nyeri", town: "Town", bio: "Farm visits, good tea, no games. Looking for something steady.", interests: ["Church", "Hiking", "Books"], tribe: "Kikuyu", religion: "Christian", mode: "Church", hue: 130 },
  { name: "Zawadi", age: 26, gender: "Woman", county: "Kajiado", town: "Kitengela", bio: "Weekends out of the city. Bring sunscreen and a story.", interests: ["Travel", "Fitness", "Afrobeats"], tribe: "Other", religion: "Spiritual", mode: "Professional", hue: 260 }
];

const db = {
  load() {
    const raw = localStorage.getItem("pendo-mtaani");
    if (!raw) {
      const users = SEED.map((p, i) => ({
        id: "seed-" + i,
        email: p.name.toLowerCase() + "@pendo.demo",
        password: "demo",
        ...p,
        looking: p.gender === "Woman" ? "Men" : "Women",
        photo: "",
        lat: COUNTIES[p.county][0] + (Math.random() - 0.5) * 0.08,
        lng: COUNTIES[p.county][1] + (Math.random() - 0.5) * 0.08,
        premium: i % 4 === 0
      }));
      const state = { users, session: null, likes: [], passes: [], matches: [], messages: {}, reports: [], blocks: [] };
      localStorage.setItem("pendo-mtaani", JSON.stringify(state));
      return state;
    }
    return JSON.parse(raw);
  },
  save(state) { localStorage.setItem("pendo-mtaani", JSON.stringify(state)); }
};

let state = db.load();
let view = state.session ? "discover" : "home";
let chatWith = null;
let filters = { county: "Any", maxKm: 80, minAge: 18, maxAge: 40, tribe: "Any", religion: "Any", mode: "Any", interest: "Any" };

function me() { return state.users.find(u => u.id === state.session); }
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2400);
}
function kmBetween(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}
function avatar(person, cls = "avatar") {
  if (person.photo) return `<div class="${cls}"><img alt="" src="${person.photo}" /></div>`;
  const initial = person.name.slice(0, 1);
  return `<div class="${cls}" style="background:linear-gradient(160deg, hsl(${person.hue},42%,32%), hsl(${person.hue + 30},55%,62%))">${initial}</div>`;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&", "<": "<", ">": ">", '"': """, "'": "&#39;" }[c]));
}

function candidates() {
  const user = me();
  if (!user) return [];
  return state.users.filter(p => {
    if (p.id === user.id) return false;
    if (state.blocks.some(b => (b.by === user.id && b.who === p.id) || (b.by === p.id && b.who === user.id))) return false;
    if (state.likes.some(l => l.from === user.id && l.to === p.id)) return false;
    if (state.passes.some(l => l.from === user.id && l.to === p.id)) return false;
    const want = user.looking;
    if (want === "Women" && p.gender !== "Woman") return false;
    if (want === "Men" && p.gender !== "Man") return false;
    if (filters.county !== "Any" && p.county !== filters.county) return false;
    if (filters.tribe !== "Any" && p.tribe !== filters.tribe) return false;
    if (filters.religion !== "Any" && p.religion !== filters.religion) return false;
    if (filters.mode !== "Any" && p.mode !== filters.mode) return false;
    if (filters.interest !== "Any" && !p.interests.includes(filters.interest)) return false;
    if (p.age < filters.minAge || p.age > filters.maxAge) return false;
    const d = kmBetween(user, p);
    p._km = d;
    return d <= Number(filters.maxKm);
  }).sort((a, b) => a._km - b._km);
}

function setView(next) { view = next; render(); }
function render() {
  const root = document.getElementById("app");
  root.innerHTML = me() ? appShell() : publicShell();
  bind();
}
function brand() {
  return `<div class="brand"><div class="mark">P</div><span>Pendo Mtaani</span></div>`;
}
function publicShell() {
  if (view === "login" || view === "signup") return `<div class="shell">${topPublic()}${authForm()}</div>`;
  return `<div class="shell">${topPublic()}
    <section class="hero">
      <div>
        <div class="kicker">Kenya · location-based matchmaking</div>
        <h1>Meet people who are actually near you.</h1>
        <p class="lede">Pendo Mtaani matches by GPS distance, county, and the life you are living — student, professional, or church. Nairobi to Mombasa, Kisumu to Eldoret.</p>
        <div class="row">
          <button class="solid" data-go="signup">Create a profile</button>
          <button class="ghost" data-go="login">Log in</button>
        </div>
        <div class="pills">
          <span class="pill">County filters</span>
          <span class="pill">Sheng-friendly</span>
          <span class="pill">M-Pesa premium</span>
          <span class="pill">18+ only</span>
        </div>
      </div>
      <div class="stage">
        <div class="kicker" style="color:#e8b86d">Nearby now</div>
        <h2 style="font-size:34px;margin-top:8px">3 km · Westlands</h2>
        <p>Wanjiku liked your hiking photo. You are both in Kiambu this weekend.</p>
        ${SEED.slice(0, 2).map(p => `<div class="mini-card">${avatar(p)}<div><strong>${p.name}, ${p.age}</strong><div class="muted">${p.town}, ${p.county}</div><div class="note">${p.bio.slice(0, 72)}…</div></div></div>`).join("")}
      </div>
    </section>
    <section class="grid-3">
      <div class="panel"><h3>Drop a pin</h3><p class="muted">Allow location, or pick a county. We show distance, never your exact coordinates.</p></div>
      <div class="panel"><h3>Swipe with context</h3><p class="muted">Filter by age, tribe if you want, religion, interests, and student / professional / church mode.</p></div>
      <div class="panel"><h3>Talk safely</h3><p class="muted">Match first, then chat. Report or block from any profile. Premium is an M-Pesa demo.</p></div>
    </section>
    <footer>Demo accounts live in this browser only. Sample profiles are fictional. Meet in public places.</footer>
  </div>`;
}
function topPublic() {
  return `<header class="topbar">${brand()}<div class="nav"><button class="ghost" data-go="home">Home</button><button class="ghost" data-go="login">Log in</button><button class="solid" data-go="signup">Join</button></div></header>`;
}
function authForm() {
  const signup = view === "signup";
  return `<section class="auth panel">
    <h2>${signup ? "Create your profile" : "Welcome back"}</h2>
    <p class="muted">${signup ? "18 and over. You can add a photo after signup." : "Use the account you created on this device."}</p>
    <form id="auth">
      ${signup ? `<label>Name</label><input name="name" required placeholder="Achieng" />` : ""}
      <label>Email</label><input name="email" type="email" required placeholder="you@email.com" />
      <label>Password</label><input name="password" type="password" required minlength="4" />
      ${signup ? `<label>Age</label><input name="age" type="number" min="18" max="80" required value="24" />
      <label>I am</label><select name="gender"><option>Woman</option><option>Man</option><option>Non-binary</option></select>
      <label>Looking for</label><select name="looking"><option>Everyone</option><option>Women</option><option>Men</option></select>` : ""}
      <div class="row"><button class="solid" type="submit">${signup ? "Continue" : "Log in"}</button></div>
    </form>
  </section>`;
}
function appShell() {
  const user = me();
  const tabs = [["discover", "Discover"], ["matches", "Matches"], ["chat", "Chat"], ["profile", "Profile"], ["safety", "Safety"], ["premium", "Premium"]];
  return `<div class="shell">
    <header class="topbar">${brand()}
      <nav class="nav">${tabs.map(([id, label]) => `<button data-go="${id}" class="${view === id ? "active" : ""}">${label}</button>`).join("")}</nav>
      <button class="ghost" id="logout">Log out</button>
    </header>
    ${view === "discover" ? discoverView(user) : ""}
    ${view === "matches" ? matchesView(user) : ""}
    ${view === "chat" ? chatView(user) : ""}
    ${view === "profile" ? profileView(user) : ""}
    ${view === "safety" ? safetyView(user) : ""}
    ${view === "premium" ? premiumView(user) : ""}
  </div>`;
}
function discoverView(user) {
  const list = candidates();
  const person = list[0];
  return `<div class="app-grid">
    <aside class="panel">
      <h3>Filters</h3>
      <p class="note">Showing people within ${filters.maxKm} km of ${user.town || user.county}. GPS: ${user.located ? "on" : "county pin"}.</p>
      <label>County</label>
      <select id="f-county"><option>Any</option>${Object.keys(COUNTIES).map(c => `<option ${filters.county === c ? "selected" : ""}>${c}</option>`).join("")}</select>
      <label>Max distance (km)</label>
      <input id="f-km" type="number" min="1" max="500" value="${filters.maxKm}" />
      <label>Age</label>
      <div class="row"><input id="f-min" type="number" value="${filters.minAge}" /><input id="f-max" type="number" value="${filters.maxAge}" /></div>
      <label>Tribe</label>
      <select id="f-tribe"><option>Any</option>${TRIBES.map(t => `<option ${filters.tribe === t ? "selected" : ""}>${t}</option>`).join("")}</select>
      <label>Religion</label>
      <select id="f-rel"><option>Any</option>${RELIGIONS.map(t => `<option ${filters.religion === t ? "selected" : ""}>${t}</option>`).join("")}</select>
      <label>Mode</label>
      <select id="f-mode"><option>Any</option>${MODES.map(t => `<option ${filters.mode === t ? "selected" : ""}>${t}</option>`).join("")}</select>
      <label>Interest</label>
      <select id="f-int"><option>Any</option>${INTERESTS.map(t => `<option ${filters.interest === t ? "selected" : ""}>${t}</option>`).join("")}</select>
      <div class="row"><button class="solid" id="apply">Apply</button><button class="ghost" id="locate">Use my GPS</button></div>
    </aside>
    <section class="deck">
      ${person ? cardHtml(person) : `<div class="panel"><h2>No one in this radius</h2><p class="muted">Widen the distance, switch county, or reset passes from Safety.</p></div>`}
    </section>
  </div>`;
}
function cardHtml(person) {
  return `<article class="card">
    ${avatar(person, "photo")}
    <div class="card-body">
      <div class="meta"><h2>${escapeHtml(person.name)}, ${person.age}</h2><strong>${person._km.toFixed(1)} km</strong></div>
      <div class="muted">${escapeHtml(person.town)}, ${escapeHtml(person.county)} · ${escapeHtml(person.mode)} mode</div>
      <p>${escapeHtml(person.bio)}</p>
      <div class="tags">${person.interests.map(i => `<span class="tag">${escapeHtml(i)}</span>`).join("")}<span class="tag">${escapeHtml(person.religion)}</span>${person.tribe !== "Prefer not to say" ? `<span class="tag">${escapeHtml(person.tribe)}</span>` : ""}</div>
      <div class="actions">
        <button data-pass="${person.id}" title="Pass">✕</button>
        <button class="like" data-like="${person.id}" title="Like">♥</button>
        <button data-report="${person.id}" title="Report">!</button>
      </div>
    </div>
  </article>`;
}
function myMatches(user) {
  return state.matches.filter(m => m.a === user.id || m.b === user.id).map(m => {
    const id = m.a === user.id ? m.b : m.a;
    return state.users.find(u => u.id === id);
  }).filter(Boolean);
}
function matchesView(user) {
  const list = myMatches(user);
  return `<section><h2>Matches</h2><p class="muted">A match happens when you both like each other.</p>
    <div class="list" style="margin-top:14px">${list.length ? list.map(p => `<button class="person" data-chat="${p.id}">${avatar(p)}<div><strong>${escapeHtml(p.name)}</strong><div class="note">${escapeHtml(p.town)}, ${escapeHtml(p.county)}</div></div><span>Chat</span></button>`).join("") : `<div class="panel">No matches yet. Like someone nearby.</div>`}</div></section>`;
}
function chatView(user) {
  const list = myMatches(user);
  const person = state.users.find(u => u.id === chatWith);
  const thread = (state.messages[keyFor(user.id, chatWith)] || []);
  return `<div class="app-grid">
    <aside class="list">${list.map(p => `<button class="person" data-chat="${p.id}">${avatar(p)}<div><strong>${escapeHtml(p.name)}</strong><div class="note">${escapeHtml(p.county)}</div></div></button>`).join("") || `<div class="panel">Match first.</div>`}</aside>
    <section class="chat">
      ${person ? `<div class="card-body"><strong>${escapeHtml(person.name)}</strong> · ${person._km ? person._km.toFixed(1) + " km" : person.county}<div class="note">Meet in a public place. Do not send money.</div></div>
      <div class="msgs">${thread.map(m => `<div class="bubble ${m.from === user.id ? "me" : ""}">${escapeHtml(m.text)}</div>`).join("") || `<div class="note" style="padding:16px">Say habari.</div>`}</div>
      <form class="composer" id="send"><input name="text" placeholder="Write a message" required /><button class="solid" type="submit">Send</button></form>` : `<div class="card-body"><h2>Pick a match</h2><p class="muted">Chats stay on this device in the demo.</p></div>`}
    </section>
  </div>`;
}
function keyFor(a, b) { return [a, b].sort().join(":"); }
function profileView(user) {
  return `<section class="panel" style="max-width:640px">
    <h2>Your profile</h2>
    <p class="muted">This is what people nearby see. Photo stays in your browser.</p>
    <form id="profile">
      <label>Photo</label><input name="photo" type="file" accept="image/*" />
      ${user.photo ? avatar(user, "avatar") : ""}
      <label>Name</label><input name="name" value="${escapeHtml(user.name)}" />
      <label>Town</label><input name="town" value="${escapeHtml(user.town || "")}" />
      <label>County</label><select name="county">${Object.keys(COUNTIES).map(c => `<option ${user.county === c ? "selected" : ""}>${c}</option>`).join("")}</select>
      <label>Bio</label><textarea name="bio">${escapeHtml(user.bio || "")}</textarea>
      <label>Tribe</label><select name="tribe">${TRIBES.map(t => `<option ${user.tribe === t ? "selected" : ""}>${t}</option>`).join("")}</select>
      <label>Religion</label><select name="religion">${RELIGIONS.map(t => `<option ${user.religion === t ? "selected" : ""}>${t}</option>`).join("")}</select>
      <label>Mode</label><select name="mode">${MODES.map(t => `<option ${user.mode === t ? "selected" : ""}>${t}</option>`).join("")}</select>
      <label>Interests</label>
      <div class="checks">${INTERESTS.map(i => `<label><input type="checkbox" name="interests" value="${i}" ${user.interests.includes(i) ? "checked" : ""}/>${i}</label>`).join("")}</div>
      <div class="row"><button class="solid" type="submit">Save profile</button></div>
    </form>
  </section>`;
}
function safetyView() {
  const reports = state.reports.filter(r => r.by === state.session);
  return `<section class="panel" style="max-width:680px">
    <h2>Safety</h2>
    <div class="banner">Never share your exact home pin. Meet in public. Do not send M-Pesa to someone you have not met. Report pressure, fake profiles, or harassment.</div>
    <ul class="muted">
      <li>Distance is rounded. Other people only see county, town, and kilometres.</li>
      <li>Block hides a person from your deck and yours from theirs, on this device.</li>
      <li>In a production app, reports would go to a moderation queue.</li>
    </ul>
    <h3 style="margin-top:18px">Your reports</h3>
    ${reports.length ? reports.map(r => `<p>${escapeHtml(r.reason)} · ${new Date(r.at).toLocaleString()}</p>`).join("") : `<p class="note">None yet. Use the ! button on a card.</p>`}
    <button class="ghost" id="reset-passes">Show people I passed again</button>
  </section>`;
}
function premiumView(user) {
  return `<section class="panel" style="max-width:640px">
    <h2>Pendo Plus</h2>
    <p class="muted">See who liked you, rewind a pass, and boost in your county for 24 hours.</p>
    <div class="grid-3">
      <div class="panel"><h3>Kes 299</h3><p class="muted">1 week</p></div>
      <div class="panel"><h3>Kes 799</h3><p class="muted">1 month</p></div>
      <div class="panel"><h3>Kes 1,999</h3><p class="muted">3 months</p></div>
    </div>
    <form id="mpesa" style="margin-top:16px">
      <label>M-Pesa number</label>
      <input name="phone" placeholder="07XX XXX XXX" required />
      <div class="row"><button class="gold" type="submit">${user.premium ? "Renew with M-Pesa" : "Pay with M-Pesa"}</button></div>
      <p class="note">Demo only. No STK push is sent. A real app would call Safaricom Daraja and confirm the callback on a server.</p>
    </form>
    <p>${user.premium ? "Plus is active on this profile." : "Free plan: 20 likes a day in this demo."}</p>
  </section>`;
}

function bind() {
  document.querySelectorAll("[data-go]").forEach(btn => btn.onclick = () => setView(btn.dataset.go));
  const logout = document.getElementById("logout");
  if (logout) logout.onclick = () => { state.session = null; db.save(state); view = "home"; render(); };
  const auth = document.getElementById("auth");
  if (auth) auth.onsubmit = onAuth;
  const apply = document.getElementById("apply");
  if (apply) apply.onclick = () => {
    filters = {
      county: document.getElementById("f-county").value,
      maxKm: Number(document.getElementById("f-km").value) || 80,
      minAge: Number(document.getElementById("f-min").value) || 18,
      maxAge: Number(document.getElementById("f-max").value) || 40,
      tribe: document.getElementById("f-tribe").value,
      religion: document.getElementById("f-rel").value,
      mode: document.getElementById("f-mode").value,
      interest: document.getElementById("f-int").value
    };
    render();
  };
  const locate = document.getElementById("locate");
  if (locate) locate.onclick = useGps;
  document.querySelectorAll("[data-like]").forEach(b => b.onclick = () => like(b.dataset.like));
  document.querySelectorAll("[data-pass]").forEach(b => b.onclick = () => pass(b.dataset.pass));
  document.querySelectorAll("[data-report]").forEach(b => b.onclick = () => report(b.dataset.report));
  document.querySelectorAll("[data-chat]").forEach(b => b.onclick = () => { chatWith = b.dataset.chat; view = "chat"; render(); });
  const send = document.getElementById("send");
  if (send) send.onsubmit = (e) => {
    e.preventDefault();
    const text = new FormData(send).get("text").trim();
    if (!text || !chatWith) return;
    const k = keyFor(state.session, chatWith);
    state.messages[k] = state.messages[k] || [];
    state.messages[k].push({ from: state.session, text, at: Date.now() });
    const other = state.users.find(u => u.id === chatWith);
    state.messages[k].push({ from: chatWith, text: `Sawa ${me().name.split(" ")[0]}. I am around ${other.town}.`, at: Date.now() + 1 });
    db.save(state);
    toast("Message sent");
    render();
  };
  const profile = document.getElementById("profile");
  if (profile) profile.onsubmit = saveProfile;
  const reset = document.getElementById("reset-passes");
  if (reset) reset.onclick = () => { state.passes = state.passes.filter(p => p.from !== state.session); db.save(state); toast("Passes cleared"); };
  const mpesa = document.getElementById("mpesa");
  if (mpesa) mpesa.onsubmit = (e) => {
    e.preventDefault();
    const phone = new FormData(mpesa).get("phone");
    me().premium = true;
    db.save(state);
    toast("STK demo accepted for " + phone);
    render();
  };
}

function onAuth(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  if (view === "login") {
    const user = state.users.find(u => u.email === data.email && u.password === data.password);
    if (!user) return toast("No account with that email on this device");
    state.session = user.id;
  } else {
    if (Number(data.age) < 18) return toast("You must be 18 or older");
    if (state.users.some(u => u.email === data.email)) return toast("Email already used here");
    const county = "Nairobi";
    const user = {
      id: "u-" + Date.now(),
      email: data.email,
      password: data.password,
      name: data.name,
      age: Number(data.age),
      gender: data.gender,
      looking: data.looking,
      county,
      town: county,
      bio: "New on Pendo Mtaani. Say habari.",
      interests: ["Travel"],
      tribe: "Prefer not to say",
      religion: "Prefer not to say",
      mode: "Open",
      hue: Math.floor(Math.random() * 360),
      photo: "",
      lat: COUNTIES[county][0],
      lng: COUNTIES[county][1],
      premium: false,
      located: false
    };
    state.users.push(user);
    state.session = user.id;
    view = "profile";
    db.save(state);
    render();
    return;
  }
  db.save(state);
  view = "discover";
  render();
}
function like(id) {
  const user = me();
  const likesToday = state.likes.filter(l => l.from === user.id && Date.now() - l.at < 86400000).length;
  if (!user.premium && likesToday >= 20) return toast("Free likes used. Pendo Plus lifts the cap.");
  state.likes.push({ from: user.id, to: id, at: Date.now() });
  const mutual = state.likes.some(l => l.from === id && l.to === user.id) || id.startsWith("seed-");
  if (mutual) {
    state.matches.push({ a: user.id, b: id, at: Date.now() });
    toast("It's a match");
  } else toast("Liked");
  db.save(state);
  render();
}
function pass(id) {
  state.passes.push({ from: state.session, to: id, at: Date.now() });
  db.save(state);
  render();
}
function report(id) {
  const reason = prompt("Why are you reporting this profile?", "Fake profile");
  if (!reason) return;
  state.reports.push({ by: state.session, who: id, reason, at: Date.now() });
  state.blocks.push({ by: state.session, who: id });
  state.passes.push({ from: state.session, to: id, at: Date.now() });
  db.save(state);
  toast("Reported and blocked on this device");
  render();
}
function useGps() {
  if (!navigator.geolocation) return toast("Geolocation is not available");
  navigator.geolocation.getCurrentPosition(pos => {
    const user = me();
    user.lat = pos.coords.latitude;
    user.lng = pos.coords.longitude;
    user.located = true;
    let nearest = "Nairobi", best = Infinity;
    for (const [name, coord] of Object.entries(COUNTIES)) {
      const d = kmBetween(user, { lat: coord[0], lng: coord[1] });
      if (d < best) { best = d; nearest = name; }
    }
    if (best < 80) user.county = nearest;
    db.save(state);
    toast("Location updated · nearest hub " + nearest);
    render();
  }, () => toast("Location permission denied. Pick a county instead."));
}
function saveProfile(e) {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  const user = me();
  user.name = data.get("name");
  user.town = data.get("town");
  user.county = data.get("county");
  user.bio = data.get("bio");
  user.tribe = data.get("tribe");
  user.religion = data.get("religion");
  user.mode = data.get("mode");
  user.interests = data.getAll("interests");
  if (!user.located) {
    user.lat = COUNTIES[user.county][0];
    user.lng = COUNTIES[user.county][1];
  }
  const file = form.photo.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => { user.photo = reader.result; db.save(state); toast("Profile saved"); render(); };
    reader.readAsDataURL(file);
    return;
  }
  db.save(state);
  toast("Profile saved");
  render();
}

render();
