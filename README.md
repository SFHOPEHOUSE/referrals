# Hope House Referral Form

A standalone referral form for **The Salvation Army — Hope House** (The Way Out SF). Submissions are stored in Google Sheets and an updated `.xlsx` export is emailed on every submission.

---

## Setup

### 1. Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet.
2. Rename it to something like **"Hope House Referrals"**.
3. You do **not** need to add headers — the script creates them automatically on the first submission.

### 2. Add the Apps Script

1. In your new spreadsheet, go to **Extensions → Apps Script**.
2. Delete any code in the editor.
3. Copy the entire contents of **`apps-script.js`** from this repo and paste it in.
4. Near the top, change `RECIPIENT_EMAIL` to the email address that should receive spreadsheet updates:
   ```js
   const RECIPIENT_EMAIL = 'yourname@example.com';
   ```
5. Click **Save** (💾).

### 3. Deploy the Apps Script as a Web App

1. In the Apps Script editor, click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set:
   - **Description:** `Hope House Referral` (or anything)
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
4. Click **Deploy**.
5. **Authorize** the script when prompted (it needs permission to access Sheets, send email, and fetch URLs).
6. Copy the **Web app URL** — it looks like:
   ```
   https://script.google.com/macros/s/ABCDEF.../exec
   ```

### 4. Connect the Form to the Script

1. Open **`index.html`** in a text editor.
2. Find this line near the top of the `<script>` block:
   ```js
   const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
   ```
3. Replace `YOUR_APPS_SCRIPT_WEB_APP_URL_HERE` with the web app URL you copied.
4. Save the file.

### 5. Host the Form

**Option A — GitHub Pages (recommended):**
1. Create a GitHub repo (public or private with Pages enabled).
2. Push `index.html` to the repo root (or a `docs/` folder).
3. Go to **Settings → Pages** and enable GitHub Pages from the appropriate branch/folder.
4. Your form will be live at `https://yourusername.github.io/repo-name/`.

**Option B — Open locally:**
- Simply double-click `index.html` to open it in your browser. The form will work as long as the Apps Script URL is set.

---

## How It Works

1. User fills out the referral form and clicks **Submit Referral**.
2. The browser sends the data as a `POST` request to the Google Apps Script web app.
3. The Apps Script:
   - Appends a new row to the Google Sheet.
   - Exports the entire sheet as an `.xlsx` file.
   - Emails the `.xlsx` as an attachment to the configured recipient.
4. The form shows a success confirmation.

---

## Form Fields

| Field | Required | Validation |
|-------|----------|------------|
| Referral Date | Yes | Must be a date |
| Client Date of Birth | Yes | Must be a date |
| Client First and Last Name | No | — |
| Client Phone | No | Phone format if filled |
| Referring Agency | No | — |
| Referring Partner Name | No | — |
| Referring Partner Phone | No | Phone format if filled |
| Referring Partner Email | No | Email format if filled |

---

## Troubleshooting

- **Form submits but no row appears in the sheet:** Make sure the Apps Script is deployed as a web app with access set to "Anyone" and that the URL in `index.html` is correct.
- **No email received:** Check that `RECIPIENT_EMAIL` is correct in the Apps Script. Also check your spam folder. Google has a daily email quota (100/day for free accounts).
- **Authorization errors:** Re-open the Apps Script editor and run `doPost` manually once to trigger the authorization prompt. Grant all requested permissions.
- **Changes to the script don't take effect:** After editing the Apps Script, you must create a **new deployment** (Deploy → New deployment) or update the existing one (Deploy → Manage deployments → Edit → Version: New version → Deploy).
