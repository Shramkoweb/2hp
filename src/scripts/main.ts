const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;

function readSound() {
  try {
    return localStorage.getItem("th-sound") !== "off";
  } catch {
    return true;
  }
}

function saveSound(on: boolean) {
  try {
    localStorage.setItem("th-sound", on ? "on" : "off");
  } catch {
    return;
  }
}

let soundOn = readSound();
let actx: AudioContext | undefined;

function audio() {
  if (!soundOn) return undefined;
  actx ??= new AudioContext();
  if (actx.state === "suspended") void actx.resume();
  return actx;
}

const unlocked = () => soundOn && actx?.state === "running";

function tone(
  type: OscillatorType,
  f1: number,
  f2: number,
  dur: number,
  vol = 0.08,
  at = 0,
  vibrato = 0,
) {
  const a = audio();
  if (!a) return;
  const s = a.currentTime + at;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f1, s);
  o.frequency.exponentialRampToValueAtTime(f2, s + dur * 0.6);
  if (vibrato) {
    const l = a.createOscillator();
    const lg = a.createGain();
    l.frequency.value = 18;
    lg.gain.value = vibrato;
    l.connect(lg).connect(o.frequency);
    l.start(s);
    l.stop(s + dur);
  }
  g.gain.setValueAtTime(0.0001, s);
  g.gain.exponentialRampToValueAtTime(vol, s + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
  o.connect(g).connect(a.destination);
  o.start(s);
  o.stop(s + dur + 0.02);
}

function tick() {
  const a = audio();
  if (!a) return;
  const len = Math.round(a.sampleRate * 0.018);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = a.createBufferSource();
  const f = a.createBiquadFilter();
  const g = a.createGain();
  src.buffer = buf;
  f.type = "highpass";
  f.frequency.value = 2400;
  g.gain.value = 0.12;
  src.connect(f).connect(g).connect(a.destination);
  src.start(a.currentTime);
}

const blip = () => {
  tone("triangle", 660, 990, 0.12, 0.06);
};
const boing = () => {
  tone("sine", 140, 520, 0.42, 0.13, 0, 40);
};

const soundButton = document.querySelector<HTMLButtonElement>("[data-sound]");
const paintSound = () => {
  if (!soundButton) return;
  soundButton.setAttribute("aria-pressed", String(soundOn));
  soundButton.title = soundOn ? "Sound on" : "Sound off";
};
paintSound();
soundButton?.addEventListener("click", () => {
  soundOn = !soundOn;
  paintSound();
  saveSound(soundOn);
  if (soundOn) blip();
});

let lastTick = 0;
for (const letter of document.querySelectorAll("[data-letter]")) {
  letter.addEventListener("pointerenter", () => {
    const now = performance.now();
    if (now - lastTick < 120 || !unlocked()) return;
    lastTick = now;
    tick();
  });
}

const retrigger = (element: HTMLElement, name: string) => {
  element.classList.remove(name);
  element.getBoundingClientRect();
  element.classList.add(name);
};
for (const plate of document.querySelectorAll<HTMLElement>("[data-plate]")) {
  plate.addEventListener("click", () => {
    if (!reduce) retrigger(plate, "boing");
    boing();
  });
}

const onScroll = () => root.classList.toggle("scrolled", scrollY > 8);
onScroll();
addEventListener("scroll", onScroll, { passive: true });

const charts = document.querySelectorAll("[data-chart]");
if (!reduce) {
  for (const chart of charts) chart.classList.add("armed");
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("drawn");
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.5 },
  );
  for (const chart of charts) io.observe(chart);
}

const mail = document.querySelector<HTMLFormElement>("[data-mail]");
const mailStatus = document.querySelector("[data-mail-status]");
mail?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!mail.reportValidity() || !mailStatus) return;
  mailStatus.textContent =
    "The newsletter isn't set up yet, so your address wasn't saved. For now, follow on X.";
});
