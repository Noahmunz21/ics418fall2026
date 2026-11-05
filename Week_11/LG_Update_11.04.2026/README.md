# UHMC Business Department Digital Signage

Team C's ICS 418 System Analysis and Design project for the University of Hawaiʻi Maui College Business Department.

The project is being developed incrementally using Lean methodology for eventual use on two touchscreen kiosks in the Ka Lama building. This first iteration provides the interface foundation; it is not the completed MVP or a verified public deployment. <b>Please note that this is a first, quickly implemented draft-- team members, please feel free to edit, rewrite, remove, and add content as needed. </b>

## Run locally

1. Download or clone the repository, keeping the folder structure intact.
2. Open `src/index.html` in a browser with JavaScript enabled.
3. Touch or click the welcome screen to enter the homepage.
4. To view slideshow behavior, leave the homepage untouched for 60 seconds.

## Current functionality

- UHMC-branded "Campus Information Kiosk" welcome screen that waits for a touch or click. The kiosk is designed as a general campus information source, starting with Business Department content.
- Responsive homepage with large navigation tiles, a single compact sticky header, a collapsible menu, and local section search from Home and the menu.
- Continuous same-page navigation to Home, Programs, Building Directory, UHMC Website, Job Opportunities, Student Surveys, Events, and Kiosk Feedback, with Return to Home links and a question-mark Help menu.
- Template-based Programs section: program cards are generated from a data list in `src/programs.js`, grouped by department. Business Department programs (Business Administration, Hospitality & Tourism, Accounting, and ABIT) use draft summaries from maui.hawaii.edu (October 2026) that need review before deployment. An "Other UHMC Programs" group is reserved for future content.
- UHMC Website loads inline when its section is reached, with a loading message and a QR-code popup for phone access.
- College Jobs provides a QR code; Student Jobs provides the official live SECE search and a QR-code popup. Supplied URL filters are retained.
- Student Surveys offers approved clickable questions and a rotating one-question popup; submission remains unavailable.
- Kiosk Feedback uses all six usability questions from the survey document, with clickable answers, optional explanations, and written response areas. Answers clear on idle; submission remains unavailable.
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
    ├── programs.js      # Program data list and the code that builds the Programs section
    ├── kiosk.js         # Screen interactions and inactivity timers
    └── assets/          # Supplied UHMC logos, five slideshow photographs, and local QR SVGs
```

Image filenames contain spaces; references in the application handle those spaces. Keep filenames and capitalization consistent. The current interface uses `Branding Image 5.png`; the other supplied branding files are retained for later use.--- We will likley need to add underscores to the filenames later for easier handling in code.

## Add or change a program

Program content lives in the `departments` list near the top of `src/programs.js`; no HTML changes are needed.

- **Edit a program:** change its text in the list.
- **Add a program:** copy one program entry (from `{` to `},`) inside a department's `programs` list and update the text.
- **Add a department:** copy a whole department entry. A department with an empty `programs` list shows its `emptyMessage` instead of cards.

Text is inserted as plain text, so content entered in the list cannot run as code. If the kiosk later needs non-technical editing, this list could be moved to a separate data file or database without changing the page layout.

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
| Select each navigation card | The matching section appears; Programs shows four Business Department cards and an "Other UHMC Programs" notice. |
| Select Return to Home | The page returns to Home without reopening the welcome screen. |
| Leave the homepage untouched for 60 seconds | The idle slideshow appears. |
| Watch the slideshow for at least 40 seconds | All five photographs appear, changing every 8 seconds. |
| Touch or click the slideshow once | Slideshow closes and the homepage returns at the top. |
| Interact periodically for more than 60 seconds | Slideshow stays closed while the interface is being used. |
| Repeat inactivity and return at least three times | Each cycle works without refreshing or speeding up the slideshow. |
| Open Offer Feedback from the side menu | Six kiosk usability questions appear, separate from Student Surveys; Submit remains unavailable. |
| Select feedback answers, enter comments, then leave untouched for 60 seconds | The slideshow appears; all feedback radio selections and written responses clear. |
| Open Website, then select Scan QR code link | The site loads inline with a loading message; the QR popup closes without reloading it. |
| Resize the window and use keyboard Tab navigation | Content remains usable and focused links or buttons have a visible outline. |

### Checks completed during development

JavaScript syntax checks and automated headless Edge checks were completed at a simulated 1080 × 1920 viewport. The browser checks used a controlled clock to verify welcome persistence, entry, navigation, all five photo loads, activity resets, three idle/return cycles, and timer cleanup. The main navigation fit within the tested viewport, and captured layouts were visually reviewed.

These checks do not establish real elapsed-time reliability, physical touch accuracy, or compatibility with the actual kiosk. The temporary browser test harness is not included in this repository; the table above provides repeatable manual checks.

### Physical kiosk testing still required

The intended hardware is a 43-inch 4K touchscreen running Android 12.0. Native resolution is 3840 x 2160 (16:9); actual installation orientation, browser, and CSS viewport still require physical verification. The simulated viewport is a development reference, not a confirmed kiosk browser resolution. We will likley need to alter the styling and slideshow image sizes to fit the actual kiosk. 

## Not yet implemented

- Approved final program content, photos, or promotional material (current summaries are drafts).
- Verified building directory and room information.
- Physical kiosk verification of the embedded UHMC website (inline access and a phone QR are now implemented).
- Approved events and announcements; their section shell is present. Jobs uses official live boards and QR access as described below.
- Survey and kiosk feedback submission: the question interfaces are present, but Submit remains unavailable pending an approved response service.


## Security and deployment considerations-- the following needs to be verified before public deployment

The kiosk uses local search forms, temporary survey radio selections, and temporary kiosk feedback text without transmitting responses or using browser storage. Feedback instructions ask visitors to leave out names and personal details; all responses clear on idle. Its own code has no third-party runtime libraries. The embedded UHMC and SECE websites are external services that can set their own cookies, load additional resources, and provide account links; browser lockdown and session cleanup remain device responsibilities. College Jobs and Student Jobs QR codes allow phone access. Returning from the idle slideshow brings visitors to a neutral homepage; this is not a browser-session cleanup mechanism for future features.

Browser and operating-system lockdown, restrictions on leaving the application, approved hosting or local-file access, and recovery after interruptions require review before public deployment. The application alone cannot enforce kiosk lockdown. Security and kiosk compatibility have not been certified.

Confirm permission to distribute the supplied logos and photographs before publishing them in a public repository. No asset license or institutional branding approval is asserted here.


## Current kiosk shell increment

The original welcome interaction, five-image sequence, 60-second inactivity delay, 8-second slide interval, and `programs.js` content/rendering are retained. Changes are limited to `src/index.html`, `src/styles.css`, `src/kiosk.js`, and this README. The layout follows the supplied wireframes, with additional section spacing and one sticky blue header. All assets retain their filenames and contents. Branding reference: [UHMC Brand Toolkit](https://maui.hawaii.edu/brand-toolkit).

Search and Help share the destination list near the top of `kiosk.js`; edit those names and related terms there. Both search boxes search only existing sections and never store or send queries. The directory and events sections remain shells. Kiosk Feedback now includes the survey document's six usability questions, with temporary answers and unavailable submission. Job Opportunities now provides the two official boards described below. The UHMC Website section now loads the official homepage inline on access, with a Scan QR code link button for phone access. Supplied floor-plan assets are retained without asserting that their room details are verified.

`surveyQuestions` contains the four clickable Student Feedback questions (A2, A3, A4, A7) from `Survey_Questions.pdf`. Open-ended questions and optional written follow-ups are omitted. Each visitor is offered one question after 20 seconds; Help delays it until closed. Questions rotate between visitor sessions in memory and restart from the first question on page reload. Skip closes the pop-up; Offer Additional Feedback closes it and jumps to Student Surveys. Submit controls stay disabled and display Under Development. Choices, searches, and open panels clear when idle starts. No answers are transmitted or persisted, and no submission confirmation is shown.

Kiosk Feedback follows section B (Usability Surveys) of `Survey_Questions.pdf` and the feedback wireframe: six stacked prompts with answer areas, optional Why? fields for the first three questions, and written responses for questions 4 and 6. Unlike Student Surveys, these questions concern the kiosk itself. Feedback controls are in `src/index.html`, styling is scoped to `#feedback`, and `resetVisitor()` clears written responses as well as radio selections. No responses are sent or permanently stored. Submit stays disabled without a saved-response confirmation.

### GitHub Pages testing and deployment

Open `src/index.html` directly for local testing, or run `python -m http.server 8000 --directory src` from the repository and visit `http://localhost:8000`. No install or build is required.

After team approval, commit and push the reviewed changes. In GitHub repository Settings > Pages, choose Deploy from a branch, the intended branch, and `/ (root)`. With this retained structure, visit `https://OWNER.github.io/REPOSITORY/src/`. GitHub Pages does not offer `src` as a branch publishing folder. Keep all asset paths relative and retain filename capitalization. No push, publication, or repository settings change is performed by this increment.

### Physical 43-inch Android checklist (not yet verified)-- verified in DevTools, not on actual kiosk

- Confirm installation orientation, browser/version, CSS viewport, Android scaling, and zoom. Test the actual 16:9 display and any portrait installation.
- Check readable type and comfortable touch targets at standing distance; verify every section has balanced spacing without horizontal scrolling.
- Touch Begin once, scroll continuously, open/close the menu without losing position, and verify the single sticky header leaves every destination heading visible.
- Use every tile, menu destination, Return to Home link, both search boxes (including no results), and Help. Check keyboard focus and Escape where a keyboard is available.
- Select survey answers; check Skip, unavailable Submit, and Offer Additional Feedback routing to Student Surveys rather than Kiosk Feedback. Check that the background cannot be activated through a modal.
- Leave untouched for 60 seconds. Verify five complete photos at 8-second intervals; touch once to return Home without selecting a tile underneath. Repeat three cycles and confirm answers/searches clear and the next survey question rotates.
- Verify activity delays idle, browser tab/background recovery works, all local/GitHub Pages assets load, and the browser recovers after a restart or connectivity loss.

For the next Lean increment, prioritize customer review of program wording, verified directory content, review of embedded-site behavior, and observations from physical testing. Any future response collection requires an approved data-handling design before enabling Submit. Browser/Android lockdown, restrictions on leaving the site, and restart recovery require device configuration; this static application does not enforce them.


### Verification for this increment

JavaScript syntax checks passed. Headless Microsoft Edge checks with a controlled clock passed for welcome persistence, entry, original four program cards, both search locations, sticky heading offsets, menu scroll preservation, Help navigation, survey rotation/Skip/Student Surveys routing, idle clearing, and all five photo loads. Horizontal overflow checks passed at 3840 x 2160, 1920 x 1080, 1280 x 720, 1080 x 1920, and 390 x 844. These are simulated browser checks, not physical Android or real-time endurance verification. Home was visually reviewed in a desktop screenshot.


## Official Job Opportunities increment

College Jobs and Student Jobs open a large modal within the existing scrolling page. The `jobBoards` data in `src/kiosk.js` holds the exact supplied URLs as literal strings (College Jobs also encodes its URL in the local QR asset): no query rebuilding, parameter deletion, substitution, or generic homepage redirect is performed by the kiosk. Upstream sites may change their own URLs after visitors search or navigate. The [official UHMC jobs reference](https://maui.hawaii.edu/uhmcjobs) identifies SchoolJobs and SECE, but its current College Jobs location value differs from the requested value; the requested `UH%20Maui%20College%2C%20Maui%20County` value is deliberately preserved. Verify the board still recognizes that filter before public deployment.

Framing investigation on November 4, 2026 used GET responses from the full supplied URLs:

- **SchoolJobs:** HTTP 200, with a Content-Security-Policy `frame-ancestors` allowlist limited to the provider's domains (NEOGOV, NEOED, PowerDMS, Agency360, SchoolJobs, and GovernmentJobs). The kiosk/GitHub Pages origin is excluded, so College Jobs does not attempt an iframe. Its modal now displays a locally generated QR code for the exact filtered URL, allowing visitors to browse on their own phones.
- **SECE:** HTTP 200 without X-Frame-Options or Content-Security-Policy headers in the checked response. Headless Edge rendered the official Search Results page and search controls in a cross-origin iframe using the full supplied query, including `campuses=9` and both campus settings. This is an observed result, not a guarantee that all listing, login, or future pages permit embedding. The same exact URL is available through the Scan QR code link popup. Cross-origin load/error events cannot reliably diagnose framing denial.

SECE's iframe allows scripts, forms, and its own origin for site compatibility; it does not allow top-level navigation or pop-ups. Some provider actions may therefore require scanning the QR code and continuing on a personal phone. No listings are copied, scraped, cached by application code, or manually maintained. Third-party websites may set their own cookies and collect data under their own policies, unlike the kiosk's local survey controls.

Close Jobs or Escape from the main jobs modal removes the iframe entirely, closes its QR panel, restores page scrolling, and returns focus to the category. Idle reset uses that same close path before starting the original slideshow. Reopening Student Jobs creates a new frame starting at the exact supplied URL. Input within a cross-origin iframe cannot be observed by the kiosk's inactivity handler; the timer stays at 60 seconds, and the visible Keep browsing control restarts it. The survey pop-up waits while the jobs modal is open.

**Shared-device limitation:** removing an iframe discards its current document/history but cannot erase another origin's cookies, storage, or authenticated session. The kiosk offers phone QR access rather than new-tab links for these job boards. Do not sign in or apply from the shared kiosk until the device's managed browser policy provides session cleanup and approved external-navigation controls. Full anonymous visitor isolation cannot be supplied by static HTML/JavaScript alone.

Additional physical checks: verify SECE rendering/search/listing navigation in the actual Android browser and on GitHub Pages; confirm SchoolJobs recognizes the exact requested location; test QR phone access, Close, scrolling restoration, Keep browsing, iframe removal at idle, and a clean starting URL on reopen. Browser/device session cleanup needs separate verification. No backend, framework, deployment, or GitHub settings change is introduced.


Job increment verification: JavaScript syntax passed. Headless Edge confirmed the exact College and Student URLs, live SECE results with campus 9 and both on/off-campus controls selected, College Jobs fallback, focus return, Close/Escape, scrolling restoration, survey deferral, Keep browsing, removal at idle, and the exact starting URL on reopening. Close visibility and kiosk overflow were checked at 3840 x 2160, 1920 x 1080, 1280 x 720, and 390 x 844. The Student Jobs modal was visually reviewed. No page JavaScript errors occurred. Official listings were only viewed, with no applications, logins, or form submissions performed.


## Wireframe alignment, instructional Help, and College Jobs QR

Reviewed the supplied wireframes again, especially the navigation rail (page 4), six-tile Home/Programs layout (page 5), and directory/content layouts. Home now contains only Programs, Building Directory, UHMC Website, Job Opportunities, Surveys, and UHMC Events. Offer Feedback remains in the side menu and retains its separate kiosk feedback section. The left blue rail uses the wireframe labels: Home, Programs, Directory, Website, Job Board, Surveys, Event Info, Offer Feedback. A left-edge hamburger opens it, the tab at its right collapses it, and the circular question-mark control stays near the bottom left. Opening the rail does not move or scroll the page. The single sticky header and both search locations remain as previously requested. Border shapes, pale card backgrounds, subtle shadows, and two-column program cards follow the wireframe more closely; original program wording is unchanged.

Help now presents seven practical instruction topics, maintained in `helpTopics` in `src/kiosk.js`: scrolling, side menu, search, Home, jobs, surveys, and idle slideshow. Section shortcuts are below the instructions. Close Help remains visible while reading, and focus returns to the Help button.

College Jobs now displays `src/assets/college-jobs-qr.svg` in the existing modal instead of offering a kiosk browser tab. This static QR encodes the exact supplied SchoolJobs URL, including `location[0]=UH%20Maui%20College%2C%20Maui%20County&sort=PostingDate%7CDescending`. It uses a white four-module quiet zone and requires no external QR service, network request, or runtime library. If that approved URL changes, regenerate the SVG as well as updating `jobBoards.college.url`. The other job category retains its existing live SECE iframe and QR popup. No other website-access decision has been changed.

Verification: JavaScript syntax passed. Edge checks passed for the six Home tiles, exact side-menu labels, menu opening/closing without scrolling, menu search, Help instructions/focus, QR-only College Jobs, idle closing, and layouts at 3840 x 2160, 1920 x 1080, 1080 x 1920, and 390 x 844. An independent QR decoder read the browser-rendered image and matched the full URL exactly. Home, menu, Help, and QR modal screenshots were visually reviewed. A phone scan at the actual kiosk, viewing distance, glare, and Android-browser behavior still need physical testing. This update modifies the three existing interface files and README and adds only the local QR SVG asset; no project runtime dependency was introduced.


### Student Jobs QR popup

Student Jobs now offers **Scan QR code link** instead of the new-tab link. It opens a QR popup while retaining the current live SECE iframe underneath. Close QR Code or Escape returns to the search without reloading it; page scrolling stays locked. Idle reset closes both panels and removes the iframe. `src/assets/student-jobs-qr.svg` encodes the exact original Student Jobs URL, including all empty values and filters. Regenerate that SVG if the approved URL changes. No external QR service or runtime dependency is used.

Checks passed for independent decoding of the browser-rendered QR to the exact URL, popup focus/Tab/Close/Escape, iframe preservation, scroll locking, and idle cleanup. The SECE request was mocked for these local interaction checks; physical phone scanning still needs verification.


## Inline UHMC Website section

The Website section loads `https://maui.hawaii.edu/` automatically when reached through tiles, menu, search, Help, or scrolling. There is no Access Site button or external-tab link; the website itself stays inline, while phone QR access uses a separate popup. The frame is created once per visitor on section entry, not on welcome/startup; browsers without IntersectionObserver use a scroll visibility check. Idle reset removes the frame, and the next visit starts at the homepage again. The existing single sticky header and Return to Home remain available.

The local `src/assets/uhmc-website-qr.svg` opens through the Scan QR code link button, with the label Scan to Visit UHMC Website inside the popup. It links directly to the official homepage without an external QR service. The centered frame remains inside its section, with responsive width and a 70vh viewing area.

Investigation on November 4, 2026: the homepage returned HTTP 200 without X-Frame-Options or Content-Security-Policy framing restrictions in the checked response. Edge rendered its actual title and body inside a restricted cross-origin iframe; an iframe load event was not used as proof. The sandbox permits forms, scripts, and the site's origin while blocking top-level navigation and pop-ups. Some linked pages may restrict framing or need phone access. If the provider changes its framing policy, set `UHMC_WEBSITE_CAN_EMBED` to false in `kiosk.js` to display the QR-only layout. Cross-origin restrictions prevent reliable automatic detection of future frame denial; no security protections are bypassed or rewritten.

As with SECE, iframe interaction does not bubble to the kiosk inactivity timer. The original 60-second timeout remains in effect based on parent-kiosk activity; phone QR access is available for extended browsing. Removing an iframe discards the current document but cannot erase the external site's cookies or authentication. Managed browser session cleanup remains required before public deployment.

Verification passed: syntax, actual live title/body rendering in Edge, no frame at startup, automatic loading through navigation and scrolling, one frame per visitor, idle removal/re-entry, exact independent QR decoding, QR-only configuration, no extra section button/modal, sticky heading offset, and no kiosk horizontal overflow at 3840 x 2160, 1920 x 1080, 1080 x 1920, and 390 x 844. Physical Android browser behavior, phone scanning, and linked-page compatibility remain unverified. The change updates the existing HTML/CSS/JS and README and adds one local SVG asset, without a build system or project dependency.


### Website centering, QR popup, and loading state

The UHMC website frame now fills the available section width and stays centered. The visible **Scan QR code link** button opens the existing local homepage QR in a separate QR dialog; Close QR Code or Escape returns focus to the button without reloading the embedded website. The QR no longer occupies a side column. The embedded site remains centered when the QR popup closes.

A visible **Loading UHMC Website...** status covers the frame during its initial navigation and clears on its load event. This event only controls the loading display; it does not establish framing permission, which was independently investigated. A reported iframe error offers phone QR access; cross-origin framing/network errors are not always detectable by the parent. Idle reset closes the QR dialog and removes the website frame and loading state.

Deterministic Edge checks with a delayed/mocked external response passed for loading visibility and completion, popup Close/Escape/focus return, preserved iframe, centering/no kiosk overflow at 3840 x 2160, 1920 x 1080, and 390 x 844, and idle cleanup. No new assets or dependencies were required. Separate feedback checks passed for six question groups, five written-response fields, disabled Submit, no horizontal overflow at those three sizes, and radio/text clearing on idle. Physical touchscreen feedback entry remains unverified.
