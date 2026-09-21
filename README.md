# Christmas Bonus System V2 — Admin + Agent Dashboard

## What changed
- Added login screen.
- Added `USERS` Google Sheet.
- Admin can create/disable user accounts from the web dashboard.
- User accounts can be `ADMIN` or `AGENT`.
- Each AGENT user is linked to one `AGENT_ID`.
- Agent users can only view/edit their own players and NEGA.
- Admin users can view all agents, users, players, NEGA and bonus summaries.
- The same 20-player qualification rule remains.
- Points remain: ₱1,000 combined NEGA = 0.1 point; 1 point = ₱50.

## Google Sheet setup
1. Create a Google Spreadsheet.
2. Extensions → Apps Script.
3. Replace/add the supplied `Code.gs` and `Auth.gs`.
4. Run `setupSpreadsheet()` once.
5. Authorize.
6. In the `USERS` tab, immediately change the default password for `admin` from `change-me`.
7. Deploy as Web app, Execute as Me, access as Anyone.
8. Copy the deployment URL into `frontend/app.js`:
   `const API_URL = "YOUR_WEB_APP_URL";`
9. Upload `frontend/` to GitHub and enable GitHub Pages.

## USERS sheet
Columns:
USER_ID | USERNAME | PASSWORD | ROLE | AGENT_ID | STATUS | CREATED_AT | UPDATED_AT

Example:
- admin | ADMIN | blank Agent ID
- agent01 | AGENT | A-XXXXXXXX

For an AGENT account, `AGENT_ID` must match an entry in the AGENTS sheet.

## Security note
This V2 stores passwords in the Google Sheet as requested. For a stronger production setup, use password hashing and a proper identity/session system instead of plaintext passwords.
