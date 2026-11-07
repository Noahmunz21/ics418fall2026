# UHMC Business Department Digital Signage

Team C's ICS 418 System Analysis and Design project for the University of Hawaiʻi Maui College Business Department.

Developed incrementally using Lean methodology for two touchscreen kiosks in the Ka Lama building. This is a working draft, not a completed MVP or verified public deployment. Team members are welcome to review and improve it.

## Week 12 update (Noah, November 7, 2026)

Built on Lily's November 6 version, following the instructor's direction from the November 3 meeting: keep it simple, keep every task within three touches, and make sure nothing breaks.

- **Keyword search:** Search on Home and in the menu now finds sections, individual programs, Ka Lama rooms, restrooms, the elevator, stairs, calendars, and job boards. Results show what each item is and where it is, and one touch goes straight there. Common words like "where is" are ignored, so "where is room 207" works.
- **Quick finds:** One-touch shortcuts under Home search for Restrooms, Elevator, Academic calendar, Campus events, Student jobs, and Kiosk feedback.
- **Interactive Building Directory:** Ka Lama 1st and 2nd floor plans with a floor switch, an on-screen room keypad (no phone-style keyboard needed), tappable rooms on the map, and Restrooms, Elevator, and Stairs buttons. A pulsing marker shows the selected location, and the map switches to the right floor automatically.
- Idle reset also clears the directory and returns it to the kiosk's floor.

## Run locally

1. Download or clone the repository, keeping its folder structure intact.
2. Open `src/index.html` in a browser with JavaScript enabled.
3. Touch **Touch to Begin** to enter the homepage.
4. Leave the kiosk untouched for 60 seconds to start the slideshow.

Alternatively, run `python -m http.server 8000 --directory src` from the repository and visit `http://localhost:8000`. No install or build is required. External websites and calendars require internet access.

## Current functionality

- **Navigation:** six Home tiles, quick-find shortcuts, a collapsible side menu, keyword search across sections, programs, rooms, and places, Return to Home links, and a Help popup. Sections share one continuous scrolling page with a sticky UHMC header.
- **Programs:** four Business Department summaries generated from `programs.js`: Business Administration, Hospitality & Tourism, Accounting, and ABIT. Content is draft material pending review.
- **Building Directory:** interactive Ka Lama floor plans built by `directory.js`. Type a room number on the keypad, tap a room on the map, or choose Restrooms, Elevator, or Stairs. Room numbers come from the floor plans; room names and uses are pending verification.
- **UHMC Website:** loads the official homepage inline when reached, with loading feedback and **Show QR Code** for phone access.
- **Job Opportunities:** College Jobs opens a phone QR code; Student Jobs opens the official SECE search with a QR option. **Keep browsing** restarts the inactivity countdown.
- **Calendar and Events:** Academic Calendar retrieves official deadlines with month controls; Campus Events displays the official calendar inline. Both provide QR access.
- **Student Surveys:** clickable questions and a rotating question popup offered after 20 seconds, deferred while another modal is open. **Skip** closes it; **View Student Surveys** opens the survey section.
- **Kiosk Feedback:** six usability questions with selectable answers and optional written responses. Survey and feedback submission remain disabled; responses are not sent or permanently stored.
- **Idle slideshow:** five campus photographs rotate every 8 seconds after 60 seconds without activity. A touch returns Home. Idle reset clears temporary answers, searches, and open panels.

The frontend uses HTML, CSS, and JavaScript without third-party runtime libraries. Embedded external sites load their own resources.

## Project structure

```text
Kiosk/
├── README.md
└── src/
    ├── index.html       # Screens, sections, forms, and dialogs
    ├── styles.css       # UHMC styling and responsive layout
    ├── programs.js      # Program data and card rendering
    ├── directory.js     # Ka Lama room data, floor maps, keypad, and markers
    ├── kiosk.js         # Navigation, Help, calendars, and idle behavior
    └── assets/          # Branding, photographs, floor plans, and QR SVGs
```

Asset filenames use underscores instead of spaces or hyphens. Preserve capitalization and matching references. The interface uses `Branding_Image_5.png`; other supplied branding and floor-plan assets are retained.

## Add or change a program

Edit the `departments` list near the top of `src/programs.js`:

- **Edit:** update a program's text.
- **Add a program:** copy an entry inside a department's `programs` list.
- **Add a department:** copy a department entry. An empty `programs` list displays its `emptyMessage`.

No HTML changes are needed. Program content is inserted as plain text.

## Directory settings

Near the top of `src/directory.js`:

- `HOME_FLOOR` is the floor the kiosk stands on; the directory opens there. Set it to `2` for the 2nd-floor kiosk.
- `rooms` lists each room's number, floor, and position on its floor plan (as percentages from the left and top of the image). To add or move a room, edit its entry.
- `facilities` lists restrooms, elevator, and stairs for each floor.

## Change the timing

Settings are near the top of `src/kiosk.js`:

```js
var INACTIVITY_DELAY = 60 * 1000;
var SLIDE_DELAY = 8 * 1000;
```

Values are milliseconds. Restore these defaults after testing. Search destinations and terms, quick finds, Help instructions, survey questions, and job-board URLs are also maintained in `kiosk.js`. Search automatically includes every program in `programs.js` and every room and place in `directory.js`.

## Manual testing

Keep the browser tab visible during idle checks. Returning from a hidden tab starts a fresh inactivity countdown.

| Check | Expected result |
| --- | --- |
| Open or refresh, then wait | Welcome remains until deliberately entered. |
| Use Home tiles, menu, search, Help, and Return to Home | Correct sections open; headings remain below the header. |
| Search for calendar and an unmatched phrase | Relevant section or helpful no-results text appears. |
| Search 207, accounting, and bathroom; touch each first result | Room 207 is marked on the 2nd floor; the Accounting card is outlined; restrooms are marked. |
| In Directory, type 1, 0, 4 on the keypad, then A | Rooms 104A and 104B are listed; A marks Room 104A on the 1st floor. |
| Tap a room number on the map; switch floors with Restrooms selected | The room is marked; restrooms stay marked on the new floor. |
| Use each quick find under Home search | Each opens its destination in one touch. |
| Open Website and Student Jobs; use Show QR Code and Close | Frames remain usable; QR dialogs close without reloading them. |
| Select each calendar and change academic months | Content, status messages, and QR destinations match the selection. |
| Answer surveys and feedback, then wait 60 seconds | Slideshow starts and temporary input clears; Submit stays disabled. |
| Watch all five photos, then touch once | Photos change every 8 seconds; Home returns without activating a tile underneath. |
| Repeat idle/return three times and interact between checks | Timers remain consistent; deliberate activity postpones idle. |
| Use Tab, Escape, and different viewport sizes | Focus is visible, dialogs remain usable, and content does not overflow horizontally. |

Earlier development checks covered navigation, timers, dialogs, QR decoding, embedded content, and several simulated screen sizes. Later refinements received targeted code checks. These do not replace physical kiosk testing or establish complete verification of the current version.

### Physical kiosk testing still required

Target hardware: **43-inch 4K touchscreen, Android 12.0, native 3840 × 2160 resolution**. Confirm orientation, browser, CSS viewport, scaling, and zoom on the actual device.

Check standing-distance readability, touch accuracy, on-screen keyboard behavior, scrolling, QR scanning, external-site compatibility, idle cleanup, and recovery after restarts or network loss.

## Not yet implemented

- Final customer-approved program content and verified directory information.
- Survey and feedback submission through an approved response service.
- Completed physical kiosk validation and managed-device deployment.
- Automatic campus emergency alerts; research did not establish a reliable active-emergency data source.

### Possible AI kiosk navigation assistant

A small AI question field could be added to Help while keeping the existing frontend. It would interpret questions and suggest approved kiosk destinations. A genuine AI integration would require a secure backend/API connection, usage limits, and visitor-input cleanup. This remains a proposal; nothing is implemented or approved for development.

## Security and deployment considerations

Local searches and survey/feedback responses are not transmitted or saved in browser storage. Idle reset clears temporary input, but **does not clear external websites' cookies or signed-in sessions**. Avoid signing in or applying for jobs on the shared kiosk until managed-browser session cleanup is verified; QR access supports personal-phone use.

Interactions inside external frames cannot be observed by the kiosk's inactivity handler. The 60-second timeout still applies based on activity in the parent kiosk; Student Jobs includes **Keep browsing** to extend it.

External providers may change embedding permissions or linked-page behavior. QR access remains available. `UHMC_WEBSITE_CAN_EMBED` can disable website embedding if needed. An iframe load event is not proof that content loaded successfully.

Before public deployment, confirm browser/Android lockdown, external-navigation restrictions, session cleanup, recovery behavior, and permission to distribute supplied assets. The application alone does not enforce kiosk lockdown. Branding reference: [UHMC Brand Toolkit](https://maui.hawaii.edu/brand-toolkit).

### Hosting

The frontend is static and can be served locally or through static hosting. For branch-based GitHub Pages publishing, choose the intended branch and `/ (root)`, then visit `https://OWNER.github.io/REPOSITORY/src/`.

Preserve relative paths and filename capitalization. If an approved job-board URL changes, update `jobBoards` and regenerate the corresponding local QR SVG; keep their destinations consistent. Hosting, publication, and repository settings must be handled separately.
