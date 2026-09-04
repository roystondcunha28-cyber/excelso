<div align="center">

<img src="assets/logo-usedbookr.png" alt="UsedBookR logo" width="110">

# Excelso-UsedBookR

**Operations tracker for UsedBookR / Simply Sell Books**

[![Status](https://img.shields.io/badge/status-active-brightgreen)](https://excelso26.co.in/)
[![Made by a student](https://img.shields.io/badge/made%20by-a%20student-blueviolet)](https://github.com/roystondcunha28-cyber)
[![Live Site](https://img.shields.io/badge/Live-excelso26.co.in-000000)](https://excelso26.co.in/)

[Live Site](https://excelso26.co.in/) · [Report an Issue](../../issues)

</div>

---

## About

**Excelso** is a centralized operations dashboard built to track, monitor, and manage tasks across the departments of **UsedBookR** and **Simply Sell Books**. It replaces scattered spreadsheets and chat threads with a single place to log tasks, follow up on commitments, and see what's overdue at a glance.

This project was designed and built independently as a student developer project, taken on as a real internal tool for the business rather than a class assignment — so it's built and maintained to production standards, not just as a demo.

## What it does

- 🔐 **Operations login** — access is restricted to authorized team members
- 🗂️ **14 departments tracked** — from B2B/Sales and Warehouse to IT and Product Development
- ✅ **Task management** — create, assign, prioritize, and update tasks with due dates
- ↺ **Regular (recurring) tasks** — a dedicated view for tasks that repeat on a schedule
- ↻ **Follow-up monitoring** — see what's due today, overdue, or coming up
- 📊 **Live dashboard** — KPI cards for open, in-progress, blocked, overdue, and completed tasks
- 🔍 **Filtering & search** — filter the task list by department, priority, or status
- ⭳ **CSV export** — pull task data out for reporting
- 🕓 **Activity log** — an audit trail of task changes and follow-up actions

## Tech Stack

| Layer      | Technology                          |
|------------|---------------------------------------|
| Frontend   | HTML, CSS, vanilla JavaScript        |
| Fonts      | Fraunces, Inter, IBM Plex Mono (Google Fonts) |
| Hosting    | GitHub Pages, with a custom domain (`CNAME`) |
| Domain     | [excelso26.co.in](https://excelso26.co.in/) |

> This is a static frontend. If task/login data is being read from or written to a backend (e.g. a spreadsheet API, database, or serverless function), document that connection here so anyone picking up the project understands the full data flow.

## Project Structure

```
excelso/
├── assets/          # Logos and images
├── index.html       # App shell: login screen + dashboard UI
├── script.js         # App logic (auth, task CRUD, filtering, rendering)
├── style.css         # Styling
└── CNAME             # Custom domain config for GitHub Pages
```

## Running Locally

Since this is a static site, you can preview it without any build tools:

```bash
# Clone the repository
git clone https://github.com/roystondcunha28-cyber/excelso.git
cd excelso

# Open directly in a browser
open index.html        # macOS
# or just double-click index.html
```

For a closer-to-production preview (recommended, since some browsers restrict local file access for scripts), serve it with a simple local server:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then visit `http://localhost:8000` (or the port shown).

## Deployment

This site is deployed via **GitHub Pages**:

1. Push changes to the `main` branch
2. GitHub Pages serves the site automatically
3. The `CNAME` file points the custom domain `excelso26.co.in` to this repository

## Security Note

⚠️ Because this repository is **public**, make sure no real credentials, API keys, or sensitive business data are hardcoded anywhere in `script.js` or elsewhere. If login credentials are currently hardcoded client-side, consider:

- Moving authentication to a backend service
- Using environment variables / a secrets manager for any keys
- Restricting write access to task data through a proper API rather than client-side logic alone

## License

This project is **not open source** — see [`LICENSE`](LICENSE) for details. The code is shared publicly for portfolio purposes only; it was built for the internal use of UsedBookR / Simply Sell Books.

## Author

**Royston Jhowin Dcunha**
Student developer

- GitHub: [@roystondcunha28-cyber](https://github.com/roystondcunha28-cyber)

---

<div align="center">
Built to keep two storefronts, fourteen departments, and a lot of moving parts in sync. 📚
</div>
