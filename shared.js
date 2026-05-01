// ── FADE-IN ON SCROLL ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
setTimeout(() => {
  document.querySelectorAll('.hero .fade-in, .page-hero .fade-in').forEach(el => el.classList.add('visible'));
}, 80);


// ── NAV SCROLL SHRINK ──
window.addEventListener('scroll', () => {
  const nav = document.getElementById('top-nav');
  if (nav) nav.style.padding = window.scrollY > 60 ? '0.4rem 2rem' : '0.75rem 2rem';
}, { passive: true });

// ── MOBILE MENU ──
function toggleMenu() {
  const leftLinks = document.querySelector('#top-nav .nav-links-left');
  const rightLinks = document.querySelector('#top-nav .nav-links-right');
  const links = leftLinks || rightLinks;
  if (!links) return;
  const isOpen = leftLinks && leftLinks.style.display === 'flex';
  const mobileStyle = 'display:flex;flex-direction:column;position:fixed;left:0;right:0;background:rgba(10,10,10,0.99);padding:1.5rem 2rem;gap:1.25rem;z-index:999;border-bottom:1px solid rgba(200,151,58,0.2);';
  if (isOpen) {
    if (leftLinks) leftLinks.style.display = 'none';
    if (rightLinks) rightLinks.style.display = 'none';
  } else {
    // Stack left links first, right links below
    const navBottom = (document.getElementById('top-nav') || {}).offsetBottom || 92;
    if (leftLinks) { leftLinks.style.cssText = mobileStyle + 'top:92px;'; }
    if (rightLinks) { rightLinks.style.cssText = mobileStyle + 'top:' + (leftLinks ? leftLinks.offsetHeight + 92 : 92) + 'px;'; }
  }
}

// ── EMAIL SUBSCRIBE (Formspree) ──
async function submitEmailBar(suffix) {
  const input = document.getElementById('email-input-' + suffix);
  const btn = input ? input.parentElement.querySelector('.email-btn') : null;
  const successDiv = document.getElementById('email-bar-success-' + suffix);
  if (!input || !input.value.includes('@')) {
    if (input) input.style.borderColor = '#b83232';
    return;
  }
  if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }
  try {
    const formData = new FormData();
    formData.append('email', input.value);
    formData.append('form_type', 'Email Subscription');
    const res = await fetch('https://formspree.io/f/mzdylgwk', { method: 'POST', body: formData, headers: { 'Accept': 'application/json' } });
    if (res.ok) {
      if (input.parentElement) input.parentElement.style.display = 'none';
      if (successDiv) successDiv.style.display = 'block';
    } else {
      if (btn) { btn.textContent = 'Try Again'; btn.disabled = false; }
    }
  } catch(e) {
    if (btn) { btn.textContent = 'Try Again'; btn.disabled = false; }
  }
}
// Legacy alias
function subscribeEmail() { submitEmailBar('index'); }

// ── STORY FORM (Formspree) ──
async function submitStoryFormspree(e) {
  e.preventDefault();
  const form = document.getElementById('story-form');
  const btn = form ? form.querySelector('button[type="submit"]') : null;
  const successDiv = document.getElementById('story-success');
  if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }
  try {
    const data = new FormData(form);
    const res = await fetch('https://formspree.io/f/mzdylgwk', { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
    if (res.ok) {
      form.querySelectorAll('input:not([type=hidden]),textarea,select').forEach(el => el.value = '');
      if (successDiv) successDiv.style.display = 'block';
      if (btn) { btn.textContent = 'Submitted!'; }
    } else {
      if (btn) { btn.textContent = 'Error — Try Again'; btn.disabled = false; }
    }
  } catch(e) {
    if (btn) { btn.textContent = 'Error — Try Again'; btn.disabled = false; }
  }
}

// ── CONTACT FORM (Formspree) ──
async function submitContactFormspree(e) {
  e.preventDefault();
  const form = document.getElementById('contact-form');
  const btn = form ? form.querySelector('button[type="submit"]') : null;
  const successDiv = document.getElementById('contact-success');
  if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }
  try {
    const data = new FormData(form);
    const res = await fetch('https://formspree.io/f/mzdylgwk', { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
    if (res.ok) {
      form.querySelectorAll('input:not([type=hidden]),textarea,select').forEach(el => el.value = '');
      if (successDiv) successDiv.style.display = 'block';
      if (btn) { btn.textContent = 'Sent!'; }
    } else {
      if (btn) { btn.textContent = 'Error — Try Again'; btn.disabled = false; }
    }
  } catch(e) {
    if (btn) { btn.textContent = 'Error — Try Again'; btn.disabled = false; }
  }
}

// ── PHASES ──
const phaseContent = {
  1: `<div class="stand-detail-block"><h4>What This Looks Like</h4><p>You may notice your mindset isn't where it should be, your routine is slipping, or you're not showing up the way you know you can. Something feels off, even if you haven't fully figured out what it is yet.</p></div>
      <div class="stand-detail-block"><h4>What to Work Towards</h4><p>The goal here is to take a step back, notice what needs to change, and be honest with yourself about it instead of brushing it off or pushing it aside.</p></div>
      <div class="stand-detail-block"><h4>How to Move Through It</h4><p>A good place to start is by listening to the IAR Podcast, hearing how others have gone through it, and joining a peer group so you can get connected and not feel like you're figuring it out on your own.</p></div>`,
  2: `<div class="stand-detail-block"><h4>What This Looks Like</h4><p>Knowing what needs to change but still struggling to follow through, falling back into old habits, or avoiding the things you know you need to do because they're uncomfortable.</p></div>
      <div class="stand-detail-block"><h4>What to Work Towards</h4><p>Choosing to show up even when it's hard, building structure into your day, and starting to hold yourself accountable for what you said you'd do.</p></div>
      <div class="stand-detail-block"><h4>How to Move Through It</h4><p>Showing up to community runs, doing something active even when you don't feel like it, and being around people who are doing the work too.</p></div>`,
  3: `<div class="stand-detail-block"><h4>What This Looks Like</h4><p>Things start to feel different. You're showing up more consistently, your habits are changing, and the way you handle things isn't the same as it used to be.</p></div>
      <div class="stand-detail-block"><h4>What to Work Towards</h4><p>It becomes about taking ownership, staying consistent even when no one is watching, and building an identity around how you show up every day.</p></div>
      <div class="stand-detail-block"><h4>How to Move Through It</h4><p>Keep showing up to community events, stay involved, and surround yourself with people who are living the same way and will hold you to it.</p></div>`,
  4: `<div class="stand-detail-block"><h4>What This Looks Like</h4><p>The focus starts to shift beyond just you. You're still showing up for yourself, but you're also thinking about how you can support others and be part of something bigger.</p></div>
      <div class="stand-detail-block"><h4>What to Work Towards</h4><p>It becomes about stepping up, taking initiative, and using what you've built to have an impact on the people around you.</p></div>
      <div class="stand-detail-block"><h4>How to Move Through It</h4><p>Help at events, support new people as they come in, and be someone others can rely on when they're trying to figure things out.</p></div>`,
  5: `<div class="stand-detail-block"><h4>What This Looks Like</h4><p>People start to notice it. The way you carry yourself, how you show up, and the consistency behind it. Others naturally look to you because you've put the work in and stayed with it.</p></div>
      <div class="stand-detail-block"><h4>What to Work Towards</h4><p>It becomes about holding a standard, staying consistent long term, and being someone others can rely on within the community.</p></div>
      <div class="stand-detail-block"><h4>How to Move Through It</h4><p>Represent IAR at events, step into opportunities to speak on behalf of the mission, and take on roles where you help lead and support the community.</p></div>`
};

let activePhase = null;
function togglePhase(num) {
  const panel = document.getElementById('stand-detail-panel');
  const detailContent = document.getElementById('detail-content');

  // Deactivate all cards
  document.querySelectorAll('.stand-card').forEach(c => c.classList.remove('active'));

  // Toggle off if same card clicked again
  if (activePhase === num) {
    activePhase = null;
    panel.classList.remove('active');
    document.querySelectorAll('.phase-node').forEach(n => n.classList.remove('active'));
    const progress = document.getElementById('phase-progress');
    if (progress) progress.style.width = '0%';
    return;
  }

  activePhase = num;

  // Activate clicked card
  const card = document.getElementById('card-' + num);
  if (card) card.classList.add('active');

  // Swap content into the single panel
  detailContent.innerHTML = phaseContent[num];

  // Show the panel
  panel.classList.remove('active');
  void panel.offsetWidth; // force reflow for animation replay
  panel.classList.add('active');

  // Sync phase map
  document.querySelectorAll('.phase-node').forEach(n => n.classList.remove('active'));
  const node = document.querySelector('.phase-node[data-phase="' + num + '"]');
  if (node) node.classList.add('active');
  const progress = document.getElementById('phase-progress');
  if (progress) progress.style.width = ((num - 1) / 4 * 100) + '%';

  // Smooth scroll to panel
  setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 30);
}

// ── PHASE MAP ──
function selectPhaseNode(num) {
  togglePhase(num);
  const standSection = document.getElementById('phases');
  if (standSection) setTimeout(() => standSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
}

// ── PODCAST PLAYER ──
let isPlaying = false;
let progressInterval = null;
function togglePlay(btn) {
  isPlaying = !isPlaying;
  const fill = document.getElementById('progress-fill');
  const icon = document.getElementById('play-icon');
  if (!fill || !icon) return;
  if (isPlaying) {
    icon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
    let pct = parseFloat(fill.style.width) || 0;
    progressInterval = setInterval(() => {
      pct = Math.min(pct + 0.06, 100);
      fill.style.width = pct + '%';
      if (pct >= 100) { clearInterval(progressInterval); isPlaying = false; icon.innerHTML = '<path d="M8 5v14l11-7z"/>'; }
    }, 200);
  } else {
    icon.innerHTML = '<path d="M8 5v14l11-7z"/>';
    clearInterval(progressInterval);
  }
}
function loadEpisode(title, guest, pct) {
  const t = document.getElementById('np-title');
  const g = document.getElementById('np-guest');
  const f = document.getElementById('progress-fill');
  if (t) t.textContent = title;
  if (g) g.textContent = guest;
  if (f) f.style.width = pct + '%';
  isPlaying = false; clearInterval(progressInterval);
  const icon = document.getElementById('play-icon');
  if (icon) icon.innerHTML = '<path d="M8 5v14l11-7z"/>';
}

// ── TESTIMONIALS ──
let tCurrent = 0;
function initTestimonials() {
  const track = document.getElementById('t-track');
  const nav = document.getElementById('t-nav');
  if (!track || !nav) return;
  const cards = track.querySelectorAll('.t-card');
  const getVis = () => window.innerWidth < 960 ? 1 : 3;
  function buildDots() {
    nav.innerHTML = '';
    const vis = getVis();
    const count = Math.ceil(cards.length / vis);
    for (let i = 0; i < count; i++) {
      const d = document.createElement('div');
      d.className = 't-dot' + (i === 0 ? ' active' : '');
      d.onclick = () => goTo(i);
      nav.appendChild(d);
    }
  }
  function goTo(idx) {
    tCurrent = idx;
    const vis = getVis();
    const w = cards[0] ? cards[0].offsetWidth + 24 : 0;
    track.style.transform = `translateX(-${idx * vis * w}px)`;
    nav.querySelectorAll('.t-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
  }
  buildDots();
  window.addEventListener('resize', () => { buildDots(); goTo(0); });
  setInterval(() => {
    const vis = getVis();
    goTo((tCurrent + 1) % Math.ceil(cards.length / vis));
  }, 5000);
}
initTestimonials();

// ── 60-DAY TRACKER ──
function initDayTracker() {
  const grid = document.getElementById('challenge-days');
  if (!grid) return;
  grid.innerHTML = '';
  for (let i = 1; i <= 60; i++) {
    const d = document.createElement('div');
    d.className = 'day-block' + (i <= 14 ? ' filled' : '');
    d.textContent = i;
    d.onclick = () => d.classList.toggle('filled');
    grid.appendChild(d);
  }
}
initDayTracker();
