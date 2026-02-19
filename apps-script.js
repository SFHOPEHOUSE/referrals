// ============================================================
// Hope House Referral — Google Apps Script
// ============================================================
// 1. Open your Google Sheet → Extensions → Apps Script
// 2. Replace the default Code.gs contents with this entire file
// 3. Set RECIPIENT_EMAIL below
// 4. Deploy → New deployment → Web app
//      Execute as: Me | Who has access: Anyone
// 5. Copy the web app URL into index.html
// ============================================================

/** Email address that receives the updated spreadsheet on every submission */
const RECIPIENT_EMAIL = 'SFhope@usw.salvationarmy.org';

/** Subject line for the email */
const EMAIL_SUBJECT = 'Hope House — New Participant Referral';

// ── Web app entry point ──────────────────────────────────────

function doPost(e) {
  try {
    var data;
    if (e.parameter && e.parameter.payload) {
      data = JSON.parse(e.parameter.payload);
    } else {
      data = JSON.parse(e.postData.contents);
    }
    var rowNum = appendRow(data);
    emailSpreadsheet(data, rowNum);
    return HtmlService.createHtmlOutput('<html><body>OK</body></html>');
  } catch (err) {
    return HtmlService.createHtmlOutput('<html><body>Error: ' + err.message + '</body></html>');
  }
}

function doGet(e) {
  return HtmlService.createHtmlOutput('<html><body>This endpoint accepts POST requests only.</body></html>');
}

// ── Append a row to the first sheet ──────────────────────────

function appendRow(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Add headers if the sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      '#',
      'Referral Date',
      'Participant Date of Birth',
      'Participant Name',
      'Participant Phone',
      'Participant Email',
      'Referring Agency',
      'Partner Name',
      'Partner Phone',
      'Partner Email',
      'Submitted At',
    ]);
  }

  // Row number = total data rows (excluding header)
  var rowNum = sheet.getLastRow(); // after header, this is the count of existing data rows
  // If only header exists, lastRow is 1, so first entry is #1
  // If 3 data rows exist, lastRow is 4, so next entry is #4... but we want count of data rows
  rowNum = sheet.getLastRow() === 0 ? 1 : sheet.getLastRow(); // handles edge case

  var submittedAt = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });

  sheet.appendRow([
    rowNum,
    data.referralDate     || '',
    data.clientDob        || '',
    data.clientName       || '',
    data.clientPhone      || '',
    data.clientEmail      || '',
    data.referringAgency  || '',
    data.partnerName      || '',
    data.partnerPhone     || '',
    data.partnerEmail     || '',
    submittedAt,
  ]);

  // If participant opted in to emails, add to the mailing list sheet
  if (data.emailOptIn === true) {
    addToMailingList(data);
  }

  return rowNum;
}

// ── Add to mailing list sheet ────────────────────────────────

function addToMailingList(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var listSheet = ss.getSheetByName('Mailing List');

  // Create the sheet if it doesn't exist
  if (!listSheet) {
    listSheet = ss.insertSheet('Mailing List');
    listSheet.appendRow(['Name', 'Email', 'Phone', 'Date Added']);
  }

  // Use participant email if available, fall back to partner email
  var email = data.participantEmail || data.clientEmail || data.partnerEmail || '';
  var name = data.participantName || data.clientName || '';
  var phone = data.participantPhone || data.clientPhone || '';

  if (email) {
    listSheet.appendRow([
      name,
      email,
      phone,
      new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }),
    ]);
  }
}

// ── Export as .xlsx and email with submission details ─────────

function emailSpreadsheet(data, rowNum) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var id    = ss.getId();

  // Export the sheet as .xlsx
  var url   = 'https://docs.google.com/spreadsheets/d/' + id + '/export?format=xlsx';
  var token = ScriptApp.getOAuthToken();

  var response = UrlFetchApp.fetch(url, {
    headers: { Authorization: 'Bearer ' + token },
    muteHttpExceptions: true,
  });

  var blob = response.getBlob().setName('Hope House Waiting List.xlsx');

  // Build a nicely formatted email body showing the current submission
  var body = 'A new participant referral (#' + rowNum + ') has been submitted.\n\n'
    + '────────────────────────────────────\n'
    + 'SUBMISSION DETAILS\n'
    + '────────────────────────────────────\n\n'
    + 'Entry #:              ' + rowNum + '\n'
    + 'Referral Date:        ' + (data.referralDate || '—') + '\n'
    + 'Participant DOB:           ' + (data.clientDob || '—') + '\n'
    + 'Participant Name:          ' + (data.clientName || '—') + '\n'
    + 'Participant Phone:         ' + (data.clientPhone || '—') + '\n'
    + 'Participant Email:         ' + (data.clientEmail || '—') + '\n'
    + 'Referring Agency:     ' + (data.referringAgency || '—') + '\n'
    + 'Partner Name:         ' + (data.partnerName || '—') + '\n'
    + 'Partner Phone:        ' + (data.partnerPhone || '—') + '\n'
    + 'Partner Email:        ' + (data.partnerEmail || '—') + '\n\n'
    + '────────────────────────────────────\n\n'
    + 'The full waiting list is attached as an Excel file.\n';

  MailApp.sendEmail({
    to: RECIPIENT_EMAIL,
    subject: EMAIL_SUBJECT + ' — #' + rowNum + (data.clientName ? ' — ' + data.clientName : ''),
    body: body,
    attachments: [blob],
  });
}
