# Design Note: Club Gear Room

Idea #22, Student Club Equipment Lending (Assignment 1)

## 1. User and problem

**User:** the club's equipment manager. They log borrow requests from club members, approve or reject them, and check items back in.

**Problem:** requests arrive over chat, bookings overlap, and nobody records what condition equipment came back in. The manager needs one place to see what is available, prevent double bookings, and track condition.

**Core workflow:** browse inventory -> reserve an item -> approve or reject -> return with checklist and condition update.

## 2. Web Development Life Cycle (WDLC)

| Stage | What I did |
|---|---|
| Planning | Picked the user (equipment manager), the problem, and the scope for this stage: inventory, reservations, approvals, returns. Damage reports, role checks and an API are left for Assignments 2 and 3. |
| Analysis | Listed requirements from the brief: semantic HTML, a validated form, responsive layout, 2+ interactions, 6+ sample records, no backend. Defined the data: items and reservations. |
| Design | Sketched the wireframes (below), chose a mobile-first layout, a colour palette, and the status/condition rules. |
| Development | Built `index.html`, `style.css` and `app.js` using vanilla JS only. |
| Testing | Checked valid and invalid form input, overlapping dates, empty filters, the return rules, and the layout at mobile, tablet and desktop widths. |
| Deployment | Source on GitHub, hosted on GitHub Pages. |
| Maintenance | The same project is extended in Assignments 2 and 3. |

## 3. Browser (client) vs server

| Runs in the browser (this assignment) | Would run on a server (Assignments 2 and 3) |
|---|---|
| Rendering the page (HTML, CSS) | Storing data in a real database |
| Form validation and conflict checking (JS) | Re-validating every request (never trust the client) |
| Filtering and searching inventory | User accounts and role checks (manager vs borrower) |
| Approve / reject and return logic | An API for the data and shared access across devices |
| Saving data in `localStorage` (this browser only) | Transactions, so two people can't book the same item at once |

At this stage there is no backend. Data lives in JavaScript arrays and `localStorage`, so it is private to one browser.

## 4. Data model

- **Item:** id, name, category, condition (Good / Fair / Needs repair)
- **Reservation:** id, itemId, name, studentId, start, end, purpose, status (pending / approved / rejected / returned)
- **Relationship:** one item has many reservations.
- **Item status** (Available / Reserved / In use / Under repair) is calculated from condition and approved bookings, not stored.

## 5. Wireframes

### Mobile (single column)

```
+-----------------------+
| Club Gear Room        |
| [Inv][Res][Req][Ret]  |
+-----------------------+
| Inventory             |
| [search.............] |
| [Condition v][Status v]|
| +-------------------+ |
| | Canon DSLR camera | |
| | Good   Available  | |
| +-------------------+ |
| (more cards stacked)  |
+-----------------------+
| Reserve equipment     |
| name / ID / item      |
| from / to / purpose   |
| [Request reservation] |
+-----------------------+
| Requests              |
| item, borrower, dates |
| [Approve] [Reject]    |
+-----------------------+
| Return equipment      |
| booking, checklist    |
| [Check item in]       |
+-----------------------+
```

### Desktop (960px and up)

```
+---------------------------------------------------+
| Club Gear Room        [Inv][Res][Req][Ret]        |
+---------------------------------------------------+
| Inventory  [search] [Condition v] [Status v]      |
| [card] [card] [card] [card]                       |
| [card] [card] [card] [card]                       |
+-------------------------+-------------------------+
| Reserve equipment       | Return equipment        |
| (form)                  | (checklist + condition) |
+-------------------------+-------------------------+
| Requests                                          |
| [request] [request]                               |
| [request] [request]                               |
+---------------------------------------------------+
```

Tablet (600px and up) keeps one column but uses two inventory cards per row and puts form fields side by side.

## 6. Design decisions

- **Mobile first:** base CSS is for small screens, and two `min-width` breakpoints (600px, 960px) add columns.
- **Colour:** dark ink header with a safety-yellow accent. Condition is shown by both a coloured edge and text, so it doesn't rely on colour alone.
- **Accessibility:** semantic landmarks, a label on every input, visible focus, a skip link, and `aria-live` for messages.
- **Safety:** DOM content is built with `textContent`, not `innerHTML`, so user input can't inject HTML.