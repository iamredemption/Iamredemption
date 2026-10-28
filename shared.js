// ══════════════════════════════════════════════════════════════════════════
//  GIVINGTUESDAY 2026 CAMPAIGN — banner on every page + homepage pop-up
// ══════════════════════════════════════════════════════════════════════════
//
//  TEST_DATE makes the site act like it's a certain day, so you can preview.
//    • Test site:  leave it as '2026-11-01' (or try '2026-12-01', '2026-12-02')
//    • Live site:  change it to null   →   var TEST_DATE = null;
//
//  You can also preview any day without editing, by adding this to the address:
//    ?campaign-date=2026-12-01
//
//  Schedule (Central time, switches at midnight):
//    Before Nov 1 ........ nothing shows (Austin Marathon pop-up as usual)
//    Nov 1 – Nov 30 ...... "GivingTuesday is December 1" banner + GivingTuesday pop-up
//    Dec 1 ............... match-day banner + GivingTuesday pop-up
//    Dec 2 – Dec 4 ....... "Last chance" banner + GivingTuesday pop-up
//    After Dec 4 ......... nothing shows (Austin Marathon pop-up comes back)
//
var TEST_DATE = '2026-11-01';

(function () {
  var CAMPAIGN_URL = 'https://givebutter.com/IARGives';
  // Givebutter "Give Today" button for the GivingTuesday campaign. It opens the donation form
  // in a pop-up without leaving the site. If Givebutter ever fails to load, the plain
  // link to the campaign page shows instead, so giving still works.
  var GT_WIDGET_ID = 'g8Mrq2';

  // Today's date in Central time, as 'YYYY-MM-DD'
  function centralToday() {
    try {
      var p = {};
      new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' })
        .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      return p.year + '-' + p.month + '-' + p.day;
    } catch (e) {
      return new Date().toISOString().slice(0, 10);
    }
  }

  function pickDate() {
    var m = /[?&]campaign-date=(\d{4}-\d{2}-\d{2})/.exec(window.location.search);
    if (m) return m[1];
    if (TEST_DATE) return TEST_DATE;
    return centralToday();
  }

  var today = pickDate();
  var phase = null;
  if (today >= '2026-11-01' && today <= '2026-11-30') phase = 'nov';
  else if (today === '2026-12-01') phase = 'day';
  else if (today >= '2026-12-02' && today <= '2026-12-04') phase = 'last';

  var COPY = {
    nov:  { title: 'GivingTuesday is December 1', text: 'Help us raise $5,000 to keep our programs accessible.',
            titleShort: 'GivingTuesday is Dec 1',  textShort: 'Help us raise $5,000',
            button: 'Give Today', popupButton: 'Give Today' },
    day:  { title: 'Today is GivingTuesday',      text: 'The first $500 given today is matched, dollar for dollar.',
            titleShort: 'Double Your Impact',      textShort: 'First $500 today is matched',
            button: 'Double Your Impact', buttonShort: 'Give Today', popupButton: 'Double Your Impact Today' },
    last: { title: 'Last Chance',                 text: 'Our GivingTuesday campaign closes December 4.',
            titleShort: 'Last Chance',             textShort: 'Giving closes Dec 4',
            button: 'Give Today', popupButton: 'Last Chance to Give' }
  };

  // Other scripts (like the homepage pop-up) read this
  // testing = true while TEST_DATE is set (or ?campaign-date= is used). In testing, the
  // homepage pop-up shows on every page load, even after you close it, so it's easy to check.
  var testing = !!TEST_DATE || /[?&]campaign-date=/.test(window.location.search);
  window.IARCampaign = { date: today, phase: phase, url: CAMPAIGN_URL, copy: phase ? COPY[phase] : null, testing: testing };

  if (!phase) return;
  var c = COPY[phase];

  function track(label) {
    try { if (typeof gtag === 'function') gtag('event', 'givingtuesday_click', { event_category: 'GivingTuesday', event_label: label }); } catch (e) {}
  }
  window.IARCampaign.track = track;

  // Swap a plain link for the Givebutter button — but only once the Givebutter button has
  // actually appeared on the page. Until then (or if it never appears), the plain link stays.
  function useWidget(link, onClick) {
    if (!link || !window.customElements) return;
    customElements.whenDefined('givebutter-widget').then(function () {
      if (link.dataset.gbSwapped) return;
      link.dataset.gbSwapped = '1';
      var w = document.createElement('givebutter-widget');
      w.setAttribute('id', GT_WIDGET_ID);
      w.className = 'gt-widget';
      // Load it invisibly first so we can check that it really shows up
      w.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;';
      if (onClick) w.addEventListener('click', onClick);
      link.insertAdjacentElement('afterend', w);
      var tries = 0;
      (function check() {
        var r = w.getBoundingClientRect();
        if (r.width > 10 && r.height > 10) {
          w.style.cssText = '';
          link.style.display = 'none';
        } else if (++tries < 40) {
          setTimeout(check, 250);      // keep checking for up to 10 seconds
        } else {
          w.remove();                  // never appeared: keep the plain link
          link.dataset.gbSwapped = '';
          try { console.warn('GivingTuesday: Givebutter button ' + GT_WIDGET_ID + ' did not appear; using the plain link instead.'); } catch (e) {}
        }
      })();
    });
  }
  window.IARCampaign.useWidget = useWidget;

  // ── Styles ──
  var css = ''
    + ':root{--gt-bar-h:52px;}'
    + '@media (max-width:760px){:root{--gt-bar-h:62px;}}'
    + 'html.gt-bar-on body{padding-top:var(--gt-bar-h);}'
    + 'html.gt-bar-on nav#top-nav{top:var(--gt-bar-h);}'
    + 'html.gt-bar-on #mobile-nav-overlay{margin-top:var(--gt-bar-h);}'
    + '#gt-bar{position:fixed;top:0;left:0;right:0;height:var(--gt-bar-h);z-index:1003;background:#FDBF12;color:#000;'
    +   'display:flex;align-items:center;justify-content:center;gap:18px;padding:0 20px;box-sizing:border-box;'
    +   'font-family:"Barlow",Arial,sans-serif;box-shadow:0 1px 0 rgba(0,0,0,0.25);}'
    + '#gt-bar .gt-heart{height:30px;width:auto;flex-shrink:0;}'
    + '#gt-bar .gt-words{display:flex;align-items:center;gap:16px;min-width:0;}'
    + '#gt-bar .gt-title{font-family:"Barlow Condensed",sans-serif;font-size:20px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;white-space:nowrap;line-height:1.1;}'
    + '#gt-bar .gt-divider{width:2px;height:22px;background:#000;flex-shrink:0;}'
    + '#gt-bar .gt-text{font-size:16px;font-weight:600;white-space:nowrap;line-height:1.2;}'
    + '#gt-bar .gt-short{display:none;}'
    + '#gt-bar .gt-btn{flex-shrink:0;background:#000;color:#FDBF12;text-decoration:none;font-family:"Barlow Condensed",sans-serif;'
    +   'font-size:16px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;padding:8px 18px;white-space:nowrap;transition:background 0.2s;}'
    + '#gt-bar .gt-btn:hover{background:#222;}'
    + '#gt-bar givebutter-widget{flex-shrink:0;display:flex;align-items:center;}'
    + '@media (max-width:1100px){#gt-bar .gt-text .gt-long{display:none;}#gt-bar .gt-text .gt-short{display:inline;}}'
    + '@media (max-width:760px){'
    +   '#gt-bar{justify-content:space-between;gap:10px;padding:0 12px;}'
    +   '#gt-bar .gt-heart{height:28px;}'
    +   '#gt-bar .gt-words{flex-direction:column;align-items:flex-start;gap:2px;flex:1;overflow:hidden;}'
    +   '#gt-bar .gt-divider{display:none;}'
    +   '#gt-bar .gt-long{display:none !important;}#gt-bar .gt-short{display:inline !important;}'
    +   '#gt-bar .gt-title{font-size:15px;letter-spacing:0.03em;max-width:100%;overflow:hidden;text-overflow:ellipsis;}'
    +   '#gt-bar .gt-text{font-size:13px;max-width:100%;overflow:hidden;text-overflow:ellipsis;}'
    +   '#gt-bar .gt-btn{font-size:14px;letter-spacing:0.06em;padding:0 11px;min-height:44px;display:flex;align-items:center;}'
    + '}'
    + '@media (max-width:374px){#gt-bar .gt-heart{display:none;}}';
  var style = document.createElement('style');
  style.id = 'gt-bar-style';
  style.textContent = css;
  document.head.appendChild(style);

  // ── Banner ──
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function addBar() {
    if (document.getElementById('gt-bar') || !document.getElementById('top-nav')) return;
    var bar = document.createElement('div');
    bar.id = 'gt-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'GivingTuesday');
    bar.innerHTML =
        '<img class="gt-heart" src="images/gt-heart.webp" alt="" width="96" height="77">'
      + '<div class="gt-words">'
      +   '<span class="gt-title"><span class="gt-long">' + esc(c.title) + '</span><span class="gt-short">' + esc(c.titleShort) + '</span></span>'
      +   '<span class="gt-divider" aria-hidden="true"></span>'
      +   '<span class="gt-text"><span class="gt-long">' + esc(c.text) + '</span><span class="gt-short">' + esc(c.textShort) + '</span></span>'
      + '</div>'
      + '<a class="gt-btn" href="' + CAMPAIGN_URL + '">'
      +   '<span class="gt-long">' + esc(c.button) + '</span><span class="gt-short">' + esc(c.buttonShort || c.button) + '</span>'
      + '</a>';
    var link = bar.querySelector('.gt-btn');
    link.addEventListener('click', function () { track('banner_' + phase); });
    document.body.insertBefore(bar, document.body.firstChild);
    document.documentElement.classList.add('gt-bar-on');
    useWidget(link, function () { track('banner_' + phase); });
  }
  if (document.body) addBar();
  else document.addEventListener('DOMContentLoaded', addBar);
})();


// ── GIVEBUTTER WIDGET LIBRARY (donation popup) ──
(function () {
  if (document.querySelector('script[src*="widgets.givebutter.com"]')) return;
  var gb = document.createElement('script');
  gb.async = true;
  gb.src = 'https://widgets.givebutter.com/latest.umd.cjs?acct=q5iKedqaQPeYDepT&p=other';
  document.head.appendChild(gb);
})();


// ── DONATE BUTTONS → GIVEBUTTER POPUP ──
// Swaps each header Donate link (and the one in the phone menu) for Givebutter's Donate button,
// which opens the donation amounts in a popup. The swap only happens once Givebutter has loaded,
// so if it ever fails, the original link to givebutter.com/IAR stays put and Donate still works.
(function () {
  var WIDGET_ID = 'LWkn4J';
  if (!window.customElements) return;
  function swap(link) {
    if (link.dataset.gbSwapped) return;
    link.dataset.gbSwapped = '1';
    var w = document.createElement('givebutter-widget');
    w.setAttribute('id', WIDGET_ID);
    link.insertAdjacentElement('afterend', w);
    link.style.display = 'none';
  }
  customElements.whenDefined('givebutter-widget').then(function () {
    document.querySelectorAll('a.nav-cta').forEach(swap);
    // The phone menu is built the first time it opens, so watch for its Donate link too.
    new MutationObserver(function () {
      document.querySelectorAll('#mobile-nav-overlay a.mob-cta').forEach(swap);
    }).observe(document.body, { childList: true, subtree: true });
  });
})();


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

// ── reCAPTCHA v3 helper ──
const RECAPTCHA_SITE_KEY = '6LdwX9wsAAAAAK-McOkZTDRvuLgVXMYHh-hS0wim';

// Cache of pre-fetched tokens keyed by action
const _rcTokenCache = {};

function _prefetchToken(action) {
  if (typeof grecaptcha === 'undefined') return;
  grecaptcha.ready(() => {
    grecaptcha.execute(RECAPTCHA_SITE_KEY, { action })
      .then(token => { _rcTokenCache[action] = token; })
      .catch(() => {});
  });
}

// Returns cached token instantly if available, otherwise fetches fresh with 3s timeout
async function getRecaptchaToken(action) {
  if (_rcTokenCache[action]) {
    const token = _rcTokenCache[action];
    delete _rcTokenCache[action];
    return token;
  }
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(''), 3000);
    if (typeof grecaptcha === 'undefined') { clearTimeout(timeout); resolve(''); return; }
    grecaptcha.ready(() => {
      grecaptcha.execute(RECAPTCHA_SITE_KEY, { action })
        .then(token => { clearTimeout(timeout); resolve(token); })
        .catch(() => { clearTimeout(timeout); resolve(''); });
    });
  });
}

// Pre-fetch tokens after page is fully interactive
// Uses requestIdleCallback so it never competes with critical rendering
function _setupRecaptchaPrefetch() {
  if (typeof grecaptcha === 'undefined') {
    // reCAPTCHA not loaded yet — retry after a short delay
    setTimeout(_setupRecaptchaPrefetch, 500);
    return;
  }
  grecaptcha.ready(() => {
    _prefetchToken('email_subscribe');
    _prefetchToken('submit_story');
    _prefetchToken('submit_contact');
    _prefetchToken('submit_volunteer');
  });
}
// Only prefetch if the reCAPTCHA script tag is actually on this page
var _hasRecaptchaScript = !!document.querySelector('script[src*="recaptcha/api.js"]');
if (_hasRecaptchaScript) {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(_setupRecaptchaPrefetch, { timeout: 3000 });
  } else {
    setTimeout(_setupRecaptchaPrefetch, 1000);
  }
}

// ── EMAIL + SMS SUBSCRIBE (Formspree) ──
// Email is required. A phone number is only sent when the visitor has
// ticked "Yes, text me." (express SMS consent). The checkbox is never pre-checked.
async function submitEmailBar(suffix) {
  const input = document.getElementById('email-input-' + suffix);
  const phoneInput = document.getElementById('phone-input-' + suffix);
  const consent = document.getElementById('sms-consent-' + suffix);
  const consentLabel = consent ? consent.closest('.eb-check') : null;
  const btn = document.getElementById('email-btn-' + suffix);
  const formWrap = document.getElementById('email-bar-form-' + suffix);
  const successDiv = document.getElementById('email-bar-success-' + suffix);
  [input, phoneInput].forEach(el => { if (el) el.style.borderColor = ''; });
  if (consentLabel) consentLabel.classList.remove('eb-error');

  if (!input || !/^\S+@\S+\.\S+$/.test(input.value.trim())) {
    if (input) { input.style.borderColor = '#e05555'; input.focus(); }
    return;
  }
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const wantsSms = !!(consent && consent.checked);
  const digits = phone.replace(/\D/g, '');
  if (wantsSms && (digits.length < 10 || digits.length > 11)) {
    if (phoneInput) { phoneInput.style.borderColor = '#e05555'; phoneInput.focus(); }
    return;
  }
  if (phone && !wantsSms) {
    // Number typed but consent not given: ask them to confirm instead of silently dropping it.
    if (consentLabel) consentLabel.classList.add('eb-error');
    return;
  }

  if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }
  try {
    const token = await getRecaptchaToken('email_subscribe');
    const formData = new FormData();
    formData.append('email', input.value.trim());
    formData.append('form_type', wantsSms ? 'Email + SMS Subscription' : 'Email Subscription');
    if (wantsSms) {
      formData.append('phone', phone);
      formData.append('sms_consent', 'Yes - opted in to text messages from I AM REDEMPTION');
      formData.append('sms_consent_timestamp', new Date().toISOString());
      formData.append('sms_consent_page', window.location.href);
    }
    formData.append('g-recaptcha-response', token);
    const res = await fetch('https://formspree.io/f/mzdylgwk', { method: 'POST', body: formData, headers: { 'Accept': 'application/json' } });
    if (res.ok) {
      if (formWrap) formWrap.style.display = 'none';
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
    const token = await getRecaptchaToken('submit_story');
    const data = new FormData(form);
    data.append('g-recaptcha-response', token);
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
    const token = await getRecaptchaToken('submit_contact');
    const data = new FormData(form);
    data.append('g-recaptcha-response', token);
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

// ── AUSTIN MARATHON VOLUNTEER FORM (Formspree) ──
async function submitVolunteerFormspree(e) {
  e.preventDefault();
  const form = document.getElementById('am-volunteer-form');
  const btn = form ? form.querySelector('button[type="submit"]') : null;
  const successDiv = document.getElementById('am-volunteer-success');
  if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }
  try {
    const token = await getRecaptchaToken('submit_volunteer');
    const data = new FormData(form);
    data.append('g-recaptcha-response', token);
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
