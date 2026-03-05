/**
 * TMC Brotherhood Events — Bidirectional Sync
 * 
 * Spreadsheet ↔ Google Calendar
 * 
 * SETUP:
 * 1. Open the spreadsheet → Extensions → Apps Script
 * 2. Paste this entire file into Code.gs (replace any existing code)
 * 3. Run setupTriggers() once from the Apps Script editor (Run → setupTriggers)
 * 4. Authorize when prompted
 * 
 * HOW IT WORKS:
 * - Sheet → Calendar: Runs on every edit. When a row has Date + Start Time + End Time,
 *   it creates/updates a calendar event. Stores the event ID in a hidden column (K).
 * - Calendar → Sheet: Runs every hour. Pulls non-recurring events from the TMC calendar
 *   and adds any that aren't already in the sheet.
 */

const CALENDAR_ID = 'b7cad28ac6a1dc2c862ddfb8af611eb955f6748c042309ef8ea5bdc27b9c31ec@group.calendar.google.com';
const SHEET_NAME = 'Sheet1';
const EVENT_ID_COL = 11; // Column K — hidden, stores calendar event IDs
const HEADER_ROW = 1;

// Column indices (1-based)
const COL = {
  SPONSOR: 1,
  COSPONSOR: 2,
  NAME: 3,
  THEME: 4,
  LOCATION: 5,
  OTHER: 6,
  SCHEDULED: 7,
  DATE: 8,
  START: 9,
  END: 10,
};

/**
 * Run once to set up triggers.
 */
function setupTriggers() {
  // Remove existing triggers to avoid duplicates
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  // On edit → push sheet changes to calendar
  ScriptApp.newTrigger('onSheetEdit')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onEdit()
    .create();

  // Every hour → pull calendar changes to sheet
  ScriptApp.newTrigger('calendarToSheet')
    .timeBased()
    .everyHours(1)
    .create();

  Logger.log('Triggers set up: onEdit + hourly calendar pull');
}

/**
 * Triggered on every edit. Syncs the edited row to the calendar
 * if it has the required fields (date, start time, end time).
 */
function onSheetEdit(e) {
  const sheet = e.source.getSheetByName(SHEET_NAME);
  if (!sheet || e.range.getSheet().getName() !== SHEET_NAME) return;

  const row = e.range.getRow();
  if (row <= HEADER_ROW) return;

  syncRowToCalendar(sheet, row);
}

/**
 * Sync a single spreadsheet row → calendar event.
 */
function syncRowToCalendar(sheet, row) {
  const data = sheet.getRange(row, 1, 1, EVENT_ID_COL).getValues()[0];

  const eventName = data[COL.NAME - 1];
  const dateVal = data[COL.DATE - 1];
  const startVal = data[COL.START - 1];
  const endVal = data[COL.END - 1];

  // Need at minimum: name, date, start time, end time
  if (!eventName || !dateVal || !startVal || !endVal) return;

  const startDt = combineDateAndTime(dateVal, startVal);
  const endDt = combineDateAndTime(dateVal, endVal);
  if (!startDt || !endDt) return;

  // Build description from sponsor, theme, other
  const sponsor = data[COL.SPONSOR - 1] || '';
  const cosponsor = data[COL.COSPONSOR - 1] || '';
  const theme = data[COL.THEME - 1] || '';
  const other = data[COL.OTHER - 1] || '';
  const location = data[COL.LOCATION - 1] || '';

  let desc = '';
  if (theme) desc += theme + '\n\n';
  if (sponsor) desc += 'Sponsor: ' + sponsor + '\n';
  if (cosponsor) desc += 'Co-sponsor: ' + cosponsor + '\n';
  if (other) desc += '\n' + other;
  desc = desc.trim();

  const existingEventId = data[EVENT_ID_COL - 1];
  const calendar = CalendarApp.getCalendarById(CALENDAR_ID);

  if (existingEventId) {
    // Update existing event
    try {
      const event = calendar.getEventById(existingEventId);
      if (event) {
        event.setTitle(eventName);
        event.setTime(startDt, endDt);
        event.setDescription(desc);
        if (location) event.setLocation(location);
        return;
      }
    } catch (e) {
      // Event was deleted from calendar — recreate
    }
  }

  // Create new event
  const event = calendar.createEvent(eventName, startDt, endDt, {
    description: desc,
    location: location,
  });

  // Store event ID in column K
  sheet.getRange(row, EVENT_ID_COL).setValue(event.getId());

  // Mark as scheduled
  if (!data[COL.SCHEDULED - 1]) {
    sheet.getRange(row, COL.SCHEDULED).setValue('Yes');
  }
}

/**
 * Pull non-recurring events from calendar → sheet.
 * Runs hourly via trigger. Skips events already tracked by ID.
 */
function calendarToSheet() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const calendar = CalendarApp.getCalendarById(CALENDAR_ID);

  // Look 6 months ahead
  const now = new Date();
  const future = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
  const events = calendar.getEvents(now, future);

  // Get existing event IDs from column K
  const lastRow = Math.max(sheet.getLastRow(), HEADER_ROW);
  const existingIds = new Set();
  const existingNames = new Set();

  if (lastRow > HEADER_ROW) {
    const idRange = sheet.getRange(HEADER_ROW + 1, EVENT_ID_COL, lastRow - HEADER_ROW, 1).getValues();
    const nameRange = sheet.getRange(HEADER_ROW + 1, COL.NAME, lastRow - HEADER_ROW, 1).getValues();
    idRange.forEach(r => { if (r[0]) existingIds.add(r[0]); });
    nameRange.forEach(r => { if (r[0]) existingNames.add(r[0].toString().trim().toLowerCase()); });
  }

  for (const event of events) {
    // Skip recurring events (the Wednesday TMC meetings)
    if (event.isRecurringEvent()) continue;

    const eventId = event.getId();
    if (existingIds.has(eventId)) continue;

    // Also skip if an event with the same name already exists (fuzzy match)
    const title = event.getTitle();
    if (existingNames.has(title.trim().toLowerCase())) continue;

    // Parse description for sponsor/cosponsor
    const desc = event.getDescription() || '';
    let sponsor = '', cosponsor = '', theme = '', other = '';

    const sponsorMatch = desc.match(/Sponsor:\s*(.+)/i);
    const cosponsorMatch = desc.match(/Co-sponsor:\s*(.+)/i);
    if (sponsorMatch) sponsor = sponsorMatch[1].trim();
    if (cosponsorMatch) cosponsor = cosponsorMatch[1].trim();

    // First line before any "Sponsor:" is the theme
    const lines = desc.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length > 0 && !lines[0].match(/^(Sponsor|Co-sponsor):/i)) {
      theme = lines[0];
    }

    // Everything else is "other"
    const otherLines = lines.filter(l =>
      l !== theme &&
      !l.match(/^Sponsor:/i) &&
      !l.match(/^Co-sponsor:/i)
    );
    other = otherLines.join('\n');

    const startDt = event.getStartTime();
    const endDt = event.getEndTime();
    const location = event.getLocation() || '';

    const dateStr = Utilities.formatDate(startDt, Session.getScriptTimeZone(), 'M/d/yy');
    const startStr = Utilities.formatDate(startDt, Session.getScriptTimeZone(), 'h:mm a');
    const endStr = Utilities.formatDate(endDt, Session.getScriptTimeZone(), 'h:mm a');

    // Append row
    const newRow = [
      sponsor, cosponsor, title, theme, location, other,
      'Yes', dateStr, startStr, endStr, eventId
    ];
    sheet.appendRow(newRow);
    existingIds.add(eventId);
    existingNames.add(title.trim().toLowerCase());
  }
}

/**
 * Manual full sync: push all sheet rows to calendar.
 * Run this once after initial setup to sync existing data.
 */
function fullSyncSheetToCalendar() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const lastRow = sheet.getLastRow();
  for (let row = HEADER_ROW + 1; row <= lastRow; row++) {
    syncRowToCalendar(sheet, row);
  }
  Logger.log('Full sync complete: rows ' + (HEADER_ROW + 1) + ' to ' + lastRow);
}

/**
 * Combine a date value and a time value into a single Date object.
 */
function combineDateAndTime(dateVal, timeVal) {
  try {
    let d;
    if (dateVal instanceof Date) {
      d = new Date(dateVal);
    } else {
      d = new Date(dateVal);
      if (isNaN(d.getTime())) return null;
    }

    if (timeVal instanceof Date) {
      d.setHours(timeVal.getHours(), timeVal.getMinutes(), 0, 0);
    } else {
      // Parse "7:00 PM" style
      const match = timeVal.toString().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!match) return null;
      let hours = parseInt(match[1]);
      const mins = parseInt(match[2]);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      d.setHours(hours, mins, 0, 0);
    }
    return d;
  } catch (e) {
    return null;
  }
}
