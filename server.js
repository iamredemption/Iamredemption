/**
 * I Am Redemption — Web Server
 *
 * Serves static HTML/CSS/JS files from the same directory as this file,
 * and handles POST /api/submit-form for Contact Us + Share Your Story forms.
 *
 * Environment variables (set in Render dashboard under "Environment"):
 *   SMTP_HOST   – e.g. smtp.gmail.com
 *   SMTP_PORT   – e.g. 587
 *   SMTP_USER   – the Gmail/SMTP address you send from
 *   SMTP_PASS   – the app password for that account
 *   TO_EMAIL    – recipient (defaults to jasmine@iamredemption.org)
 *   RECAPTCHA_SECRET – your Google reCAPTCHA v3 secret key
 *   PORT        – set automatically by Render
 *
 * Deploy checklist:
 *   1. Place this file alongside index.html, shared.css, shared.js, etc.
 *   2. Set the env vars above in the Render dashboard.
 *   3. Build command: npm install
 *   4. Start command: node server.js
 */

const express    = require('express');
const nodemailer = require('nodemailer');
const path       = require('path');

const app = express();
app.use(express.json());

// ── Security Headers ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://fonts.googleapis.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "frame-src https://www.google.com https://recaptcha.google.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://formspree.io https://www.google.com https://www.google-analytics.com",
  ].join('; '));
  next();
});

// ── Static files ─────────────────────────────────────────────────────────────
app.use(express.static(__dirname));

// ── reCAPTCHA v3 Verifier ─────────────────────────────────────────────────────
async function verifyRecaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET;
  if (!secret) { console.warn('RECAPTCHA_SECRET not set — skipping'); return true; }
  if (!token)  return false;
  try {
    const resp = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
      { method: 'POST' }
    );
    const data = await resp.json();
    // Score: 1.0 = human, 0.0 = bot. 0.5 is the standard threshold.
    return data.success && data.score >= 0.5;
  } catch (err) {
    console.error('reCAPTCHA error:', err);
    return false;
  }
}

// ── Nodemailer transporter ────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const TO_EMAIL = process.env.TO_EMAIL || 'jasmine@iamredemption.org';

// ── POST /api/submit-form ─────────────────────────────────────────────────────
app.post('/api/submit-form', async (req, res) => {
  try {
    // ── reCAPTCHA v3 check ──
    const recaptchaOk = await verifyRecaptcha(req.body.recaptchaToken);
    if (!recaptchaOk) {
      return res.status(400).json({ success: false, error: 'reCAPTCHA check failed. Please try again.' });
    }

    const { formType } = req.body;
    let subject, html;

    if (formType === 'story') {
      const { name = 'Anonymous', email = '', story = '' } = req.body;
      if (!story.trim()) {
        return res.status(400).json({ success: false, error: 'Story is required.' });
      }
      subject = `IAR Story Submission from ${name}`;
      html = `
        <h2 style="color:#1e2e10;font-family:sans-serif;">New Story Submission — I Am Redemption</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px;font-family:sans-serif;">
          <tr style="background:#f5f5f5;">
            <td style="padding:10px 14px;font-weight:bold;width:100px;">Name</td>
            <td style="padding:10px 14px;">${esc(name)}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;font-weight:bold;">Email</td>
            <td style="padding:10px 14px;">${esc(email)}</td>
          </tr>
        </table>
        <h3 style="color:#1e2e10;font-family:sans-serif;margin-top:1.5rem;">Their Story</h3>
        <p style="font-family:sans-serif;line-height:1.8;white-space:pre-wrap;">${esc(story)}</p>
      `;

    } else if (formType === 'contact') {
      const { topic = 'General Question', name = '', email = '', message = '' } = req.body;
      if (!message.trim()) {
        return res.status(400).json({ success: false, error: 'Message is required.' });
      }
      subject = `IAR Contact: ${topic}${name ? ' from ' + name : ''}`;
      html = `
        <h2 style="color:#1e2e10;font-family:sans-serif;">New Contact Message — I Am Redemption</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px;font-family:sans-serif;">
          <tr style="background:#f5f5f5;">
            <td style="padding:10px 14px;font-weight:bold;width:100px;">Topic</td>
            <td style="padding:10px 14px;">${esc(topic)}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;font-weight:bold;">Name</td>
            <td style="padding:10px 14px;">${esc(name)}</td>
          </tr>
          <tr style="background:#f5f5f5;">
            <td style="padding:10px 14px;font-weight:bold;">Email</td>
            <td style="padding:10px 14px;">${esc(email)}</td>
          </tr>
        </table>
        <h3 style="color:#1e2e10;font-family:sans-serif;margin-top:1.5rem;">Message</h3>
        <p style="font-family:sans-serif;line-height:1.8;white-space:pre-wrap;">${esc(message)}</p>
      `;

    } else {
      return res.status(400).json({ success: false, error: 'Unknown form type.' });
    }

    await transporter.sendMail({
      from:    `"I Am Redemption" <${process.env.SMTP_USER}>`,
      to:      TO_EMAIL,
      subject,
      html,
    });

    return res.json({ success: true });

  } catch (err) {
    console.error('Form submission error:', err);
    return res.status(500).json({ success: false, error: 'Server error. Please try again.' });
  }
});

// ── HTML escape helper ────────────────────────────────────────────────────────
function esc(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
}

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`IAR server listening on port ${PORT}`));
