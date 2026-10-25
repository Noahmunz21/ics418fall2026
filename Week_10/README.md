# UHMC Business Department Digital Signage

Team C's ICS 418 System Analysis and Design project for the University of Hawaiʻi Maui College Business Department.

The project is being developed incrementally using Lean methodology for eventual use on two touchscreen kiosks in the Ka Lama building. This first iteration provides the interface foundation; it is not the completed MVP or a verified public deployment. <b>Please note that this is a first, quickly implemented draft-- team members, please feel free to edit, rewrite, remove, and add content as needed. </b>

## Run locally

1. Download or clone the repository, keeping the folder structure intact.
2. Open `src/index.html` in a browser with JavaScript enabled.
3. Touch or click the welcome screen to enter the homepage.
4. To view slideshow behavior, leave the homepage untouched for 60 seconds.

## Current functionality

- UHMC-branded welcome screen that waits for a touch or click.
- Portrait-first homepage with large navigation links.
- Working navigation to Business Programs, Building Directory, and UHMC Website sections, with Return to Home links.
- Business Programs section with draft summaries of Business Administration, Hospitality & Tourism, Accounting, and ABIT, summarized from maui.hawaii.edu (October 2026). Content needs Business Department review before deployment.
- Idle slideshow after 60 seconds without activity once the visitor enters the application.
- Five supplied photographs, changing every 8 seconds-- will need to test on kiosks.
- One-touch or one-click return from the slideshow to the homepage.
- Activity detection for touch, clicks, keyboard use, scrolling, and dragging. Passive mouse movement does not restart the countdown.
- Security and deployment considerations for kiosk use, but this will need to be developed further before public deployment.

The welcome screen is not a loading delay. JavaScript is required for entry and slideshow behavior.

## Project structure

```
Kiosk/
├── README.md
└── src/
    ├── index.html       # Welcome, homepage, navigation, and slideshow markup
    ├── styles.css       # Shared styling and responsive layout
    ├── kiosk.js         # Screen interactions and inactivity timers
    └── assets/          # Supplied UHMC logos and five slideshow photographs
```

Image filenames contain spaces; references in the application handle those spaces. Keep filenames and capitalization consistent. The current interface uses `Branding Image 5.png`; the other supplied branding files are retained for later use.--- We will likley need to add underscores to the filenames later for easier handling in code.

## Change the timing

The settings are near the top of `src/kiosk.js`:

```js
/* Change these two values to adjust the kiosk timings, in milliseconds. */
var INACTIVITY_DELAY = 60 * 1000;
var SLIDE_DELAY = 8 * 1000;
```

Multiplying by `1000` converts seconds to milliseconds. For a quicker manual check, temporarily use 10 seconds and 2 seconds. Restore 60 seconds and 8 seconds before committing the change.

## Manual testing

Keep the browser tab visible during inactivity testing. Switching away pauses the inactivity behavior; returning starts a fresh countdown.

| Check | Expected result |
| --- | --- |
| Open or refresh the page and wait | Welcome remains visible until selected. |
| Touch or click the welcome screen once | Homepage opens immediately. |
| Select each navigation card | The matching section appears; Business Programs shows four program cards. |
| Select Return to Home | The page returns to the welcome header. |
| Leave the homepage untouched for 60 seconds | The idle slideshow appears. |
| Watch the slideshow for at least 40 seconds | All five photographs appear, changing every 8 seconds. |
| Touch or click the slideshow once | Slideshow closes and the homepage returns at the top. |
| Interact periodically for more than 60 seconds | Slideshow stays closed while the interface is being used. |
| Repeat inactivity and return at least three times | Each cycle works without refreshing or speeding up the slideshow. |
| Resize the window and use keyboard Tab navigation | Content remains usable and focused links or buttons have a visible outline. |

### Checks completed during development

JavaScript syntax checks and automated headless Edge checks were completed at a simulated 1080 × 1920 viewport. The browser checks used a controlled clock to verify welcome persistence, entry, navigation, all five photo loads, activity resets, three idle/return cycles, and timer cleanup. The main navigation fit within the tested viewport, and captured layouts were visually reviewed.

These checks do not establish real elapsed-time reliability, physical touch accuracy, or compatibility with the actual kiosk. The temporary browser test harness is not included in this repository; the table above provides repeatable manual checks.

### Physical kiosk testing still required

The intended hardware is a 43-inch KEINONE portrait touchscreen. The simulated viewport is a development reference, not a confirmed kiosk browser resolution. We will likley need to alter the styling and slideshow image sizes to fit the actual kiosk. 

## Not yet implemented

- Approved final program content, photos, or promotional material (current summaries are drafts).
- Verified building directory and room information.
- External UHMC website access.
- Jobs, surveys, events, announcements, or other proposed future features.


## Security and deployment considerations-- the following needs to be verified before public deployment

This version does not (needs verification) collect personal information or use accounts, forms, cookies, browser storage, tracking, external services, or third-party libraries. External website navigation is not enabled. Returning from the idle slideshow brings visitors to a neutral homepage; this is not a browser-session cleanup mechanism for future features.

Browser and operating-system lockdown, restrictions on leaving the application, approved hosting or local-file access, and recovery after interruptions require review before public deployment. The application alone cannot enforce kiosk lockdown. Security and kiosk compatibility have not been certified.

Confirm permission to distribute the supplied logos and photographs before publishing them in a public repository. No asset license or institutional branding approval is asserted here.
