# UsedBookR Operations Management — Fixed Package

Files:
- index.html — main website
- style.css — complete responsive UI styling
- script.js — login, navigation, Google Sheets API, task editing, dashboard and refresh

Google Sheets API:
The website uses the Apps Script Web App endpoint already configured in script.js.

Login:
- Password: admin123

Data:
- Google Sheets is the source of truth.
- The website refreshes from Google Sheets every 60 seconds.
- Use the Refresh button for an immediate refresh.
- Editing a task sends updateTask to Apps Script.
- Adding a task sends addTask to Apps Script.

Important:
The Apps Script must expose these actions:
- getTasks
- addTask
- updateTask

The API endpoint must be deployed as a Web App with access allowed for the users who need to use the site.
