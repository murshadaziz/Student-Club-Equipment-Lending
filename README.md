# Club Gear Room: Student Club Equipment Lending

**Course:** Web Technologies, Assignment 1 (Client-side web application)
**Assigned idea:** #22 Student Club Equipment Lending
**Author:** Murshad, Software Engineering, NUST
**Live demo:** https://murshadaziz.github.io/Student-Club-Equipment-Lending/
**Repository:** https://github.com/murshadaziz/Student-Club-Equipment-Lending

## The problem

A student club shares equipment (cameras, mics, projectors). Requests happen over chat, double bookings happen, and nobody knows what condition an item came back in.

**User:** the club's equipment manager, who logs requests from members, approves them, and checks items back in.

**Core workflow:** browse inventory -> reserve an item -> manager approves or rejects -> item is returned with a checklist and its condition is updated.

## Features

- **Inventory** with condition (Good / Fair / Needs repair) and a calculated status (Available / Reserved / In use / Under repair)
- **Filter and search** by name, category, condition and status, with an empty-results message
- **Reservation form** with browser validation and extra JS checks (name, 6-digit student ID, dates, purpose)
- **Conflict check:** blocks a booking that overlaps an existing pending or approved one for the same item
- **Approve / reject** requests, with a re-check for overlapping approved bookings
- **Return checklist** that updates the item's condition (an incomplete checklist can't be marked "Good")
- **Responsive layout** for mobile, tablet and desktop
- Data is saved in the browser with `localStorage`; "Reset sample data" in the footer restores the 8 items and 6 reservations

## Tech

Semantic HTML, CSS (variables, Flexbox, Grid, media queries at 600px and 960px) and vanilla JavaScript. No frameworks, no backend.

## Run it locally

1. Download or clone the repo:
   ```bash
   git clone https://github.com/murshadaziz/REPO-NAME.git
   cd REPO-NAME
   ```
2. Open `index.html` in a browser (double-click it). Nothing to install.

## Deploy (GitHub Pages)

Repo -> Settings -> Pages -> Source: `main` branch, `/ (root)` -> Save. The site appears at the live demo URL above after a minute or two.

## Project structure

```
index.html   page structure and forms
style.css    layout, theme, responsive rules
script.js       data, filtering, validation, conflict check, approvals, returns
DESIGN.md    user/problem, WDLC stages, client vs server, wireframe
```


## Later assignments

Assignment 2 and 3 extend this same project (backend API, role checks, damage/maintenance reports, tests).