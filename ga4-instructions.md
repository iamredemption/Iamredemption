# GA4 Setup Instructions for I Am Redemption

## When you get your GoDaddy account:

### Step 1 — Get your Measurement ID
1. Go to analytics.google.com
2. Create account → Property name: "IAR Website"
3. Platform: Web → URL: iamredemption.com
4. Copy your Measurement ID (looks like: G-XXXXXXXXXX)

### Step 2 — Replace the placeholder in ALL files
Open each HTML file and find this line near the top:
    const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
Replace G-XXXXXXXXXX with your real ID. That's it.

### Files to update:
- index.html
- get-started.html
- get-involved.html
- where-you-stand.html
- merch.html
- admin.html

### Step 3 — Set your admin password
In admin.html, find this line:
    const ADMIN_PASSWORD = 'IAR2026admin';
Change it to a password only you know.

### Step 4 — Upload all files to GoDaddy
Upload everything to your public_html folder via GoDaddy File Manager or FTP.

### Step 5 — Access your dashboard
Go to: https://iamredemption.com/admin.html
Enter your password to see all analytics.

### Note on GA4 data
GA4 takes 24-48 hours to start showing data after first installation.
The Realtime report shows live visitors immediately.
