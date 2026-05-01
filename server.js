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

// ── Static files ─────────────────────────────────────────────────────────────
// Serves everything in the same directory as server.js
// (index.html, shared.css, shared.js, merch.html, etc.)
// No /public sub-folder needed.
app.use(express.static(__dirname));

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
