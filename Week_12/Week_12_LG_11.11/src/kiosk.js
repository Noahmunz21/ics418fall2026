/* Keep all behavior local to this file without adding names to other scripts. */
(function () {
  "use strict";

  /* Browser-safe publishable key. Database grants and RLS protect stored responses.
     Call the hosted REST API directly so GitHub Pages needs no SDK or build step. */
  var SURVEY_URL = "https://abkilndngudxalcaxauq.supabase.co/rest/v1/survey_responses";
  var SURVEY_KEY = "sb_publishable_rV35pFGjurCONHPNmYUP_Q_ej5fSjaS";
  var visitorGeneration = 0;
  var popupQuestionIndex = null;
  var campusAnswerKeys = ["campus_events_source", "business_program_interest", "campus_participation_interest", "career_opportunity_interest"];
  var submissions = {
    popup: { section: "survey-dialog", survey: "campus_engagement", label: "Submit", payload: null, controller: null },
    campus: { section: "surveys", survey: "campus_engagement", label: "Submit Survey", payload: null, controller: null },
    feedback: { section: "feedback", survey: "kiosk_feedback", label: "Submit Feedback", payload: null, controller: null }
  };

  function selectedAnswer(name) {
    var selected = document.querySelector('input[name="' + name + '"]:checked');
    return selected ? selected.value : null;
  }

  function writtenAnswer(id) {
    return document.getElementById(id).value.trim() || null;
  }

  function collectAnswers(kind) {
    if (kind === "popup") {
      var answer = {};
      if (popupQuestionIndex !== null) {
        answer[campusAnswerKeys[popupQuestionIndex]] = selectedAnswer("popup-answer");
      }
      return answer;
    }
    if (kind === "campus") {
      return {
        campus_events_source: selectedAnswer("student-0"),
        business_program_interest: selectedAnswer("student-1"),
        campus_participation_interest: selectedAnswer("student-2"),
        career_opportunity_interest: selectedAnswer("student-3")
      };
    }
    return {
      navigation_ease: selectedAnswer("kiosk-feedback-1"),
      navigation_comment: writtenAnswer("feedback-text-1"),
      visibility_interaction: selectedAnswer("kiosk-feedback-2"),
      visibility_comment: writtenAnswer("feedback-text-2"),
      information_found: selectedAnswer("kiosk-feedback-3"),
      information_found_comment: writtenAnswer("feedback-text-3"),
      improvements: writtenAnswer("feedback-text-4"),
      most_useful_information: selectedAnswer("kiosk-feedback-5"),
      additional_information: writtenAnswer("feedback-text-6")
    };
  }

  function surveyControls(kind) {
    return document.querySelectorAll("#" + submissions[kind].section + " input, #" + submissions[kind].section + " textarea");
  }

  function clearSubmission(kind) {
    var state = submissions[kind];
    if (state.controller) { state.controller.abort(); }
    state.controller = null;
    state.payload = null;
    surveyControls(kind).forEach(function (control) {
      control.disabled = false;
      if (control.type === "radio") { control.checked = false; }
      else { control.value = ""; }
    });
    var button = document.getElementById(kind + "-submit");
    button.disabled = false;
    button.textContent = state.label;
    button.removeAttribute("aria-busy");
    document.getElementById(kind + "-submit-status").textContent = "";
    document.getElementById(kind + "-submit-status").removeAttribute("data-state");
    if (kind === "popup") {
      document.getElementById("survey-skip").textContent = "Skip";
    }
  }

  async function submitSurvey(kind) {
    var state = submissions[kind];
    if (state.controller) { return; }
    var button = document.getElementById(kind + "-submit");
    var status = document.getElementById(kind + "-submit-status");
    status.setAttribute("data-state", "error");
    if (!state.payload) {
      var answers = collectAnswers(kind);
      if (!Object.keys(answers).some(function (key) { return answers[key] !== null; })) {
        status.textContent = "Please answer at least one question before submitting.";
        return;
      }
      if (Object.keys(answers).some(function (key) { return answers[key] !== null && answers[key].length > 800; })) {
        status.textContent = "Please keep each written response to 800 characters or fewer.";
        return;
      }
      if (!window.crypto || !window.crypto.randomUUID) {
        status.textContent = "Submission is unavailable in this browser. Please use the secure HTTPS kiosk website.";
        return;
      }
      state.payload = Object.assign({ id: window.crypto.randomUUID(), survey_id: state.survey, survey_version: 1 }, answers);
    }
    /* Freeze answers and ID until acknowledged or explicitly cleared. */
    var payload = state.payload;
    var generation = visitorGeneration;
    var controller = new AbortController();
    state.controller = controller;
    surveyControls(kind).forEach(function (control) { control.disabled = true; });
    button.disabled = true;
    button.textContent = "Submitting...";
    button.setAttribute("aria-busy", "true");
    status.textContent = "Saving your response...";
    status.setAttribute("data-state", "pending");
    var timeout = window.setTimeout(function () { controller.abort(); }, 15000);
    try {
      var response = await fetch(SURVEY_URL, {
        method: "POST",
        headers: { apikey: SURVEY_KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
        credentials: "omit",
        cache: "no-store",
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      if (!response.ok) {
        var error = await response.json().catch(function () { return {}; });
        /* A retry of this exact frozen UUID may already have been saved.
           Only the known primary-key constraint counts as acknowledgment. */
        if (!(response.status === 409 && error.code === "23505" &&
              String(error.message).indexOf("survey_responses_pkey") !== -1)) {
          throw new Error("Submission not acknowledged");
        }
      }
      if (generation !== visitorGeneration || state.payload !== payload || state.controller !== controller) { return; }
      clearSubmission(kind);
      status.textContent = "Thank you! Your response was saved. Your answers have been cleared for privacy.";
      status.setAttribute("data-state", "success");
      if (kind === "popup") {
        document.getElementById("survey-skip").textContent = "Close";
        button.disabled = true;
        surveyControls(kind).forEach(function (control) { control.disabled = true; });
      }
    } catch (error) {
      if (generation !== visitorGeneration || state.payload !== payload || state.controller !== controller) { return; }
      status.setAttribute("data-state", "error");
      status.textContent = "We could not confirm your submission. Your answers are held for retry. Touch Retry submission, or " + (kind === "popup" ? "Skip" : "Clear answers") + " to discard this screen's input. A response already received remains saved.";
      button.textContent = "Retry submission";
    } finally {
      window.clearTimeout(timeout);
      if (state.controller === controller) {
        state.controller = null;
        button.disabled = false;
        button.removeAttribute("aria-busy");
      }
    }
  }

  function setupSurveySubmission() {
    Object.keys(submissions).forEach(function (kind) {
      document.getElementById(kind + "-submit").addEventListener("click", function () { submitSurvey(kind); });
      var clearButton = document.getElementById(kind + "-clear");
      if (clearButton) { clearButton.addEventListener("click", function () { clearSubmission(kind); }); }
    });
  }

  /* Change these two values to adjust the kiosk timings, in milliseconds. */
  var INACTIVITY_DELAY = 60 * 1000;
  var SLIDE_DELAY = 8 * 1000;

  /* Use only the five supplied campus photographs. */
  var slides = [
    { file: "Slideshow_Image_1.jpg", description: "UHMC students on campus" },
    { file: "Slideshow_Image_2.jpg", description: "UHMC campus sign" },
    { file: "Slideshow_Image_3.jpg", description: "UHMC campus building" },
    { file: "Slideshow_Image_4.jpg", description: "UHMC graduation photograph" },
    { file: "Slideshow_Image_5.jpg", description: "Maui landscape" }
  ];

  /* Track just one inactivity timeout and one slideshow interval. */
  var idleTimer = null;
  var slideshowTimer = null;
  var currentSlide = 0;
  var isIdle = false;
  var hasEntered = false;
  /* Block a follow-up click from the same touch that dismisses the slideshow. */
  var ignoreClicksUntil = 0;
  var welcomeScreen = document.getElementById("welcome-screen");
  var idleScreen;
  var homepage;
  var slideshowImage;
  var slideshowError;

  /* Maintain navigation and help destinations together; no network search is used. */
  var destinations = [
    { id: "home", name: "Home", terms: "welcome start" },
    { id: "programs", name: "Programs", terms: "business administration hospitality tourism accounting abit degree" },
    { id: "directory", name: "Building Directory", terms: "room rooms location building ka lama kalama floor map directions office classroom" },
    { id: "website", name: "UHMC Website", terms: "web college site" },
    { id: "jobs", name: "Job Opportunities", terms: "job jobs board career employment work" },
    { id: "surveys", name: "Student Surveys", terms: "survey student campus questions" },
    { id: "events", name: "Calendar, Events & Special Occasions", terms: "event announcement occasion marketing calendar academic deadlines" },
    { id: "feedback", name: "Kiosk Feedback", terms: "offer feedback usability accessibility" }
  ];
  /* Wireframe menu labels are shorter than search destination names. */
  var menuLabels = ["Home", "Programs", "Directory", "Website", "Job Board", "Surveys", "Event Info", "Offer Feedback"];

  /* Keep visitor instructions easy to review and update without changing markup. */
  var helpTopics = [
    { title: "Explore the page", text: "Swipe up to move down the page and swipe down to move back up. Touch a Home tile to jump to a section." },
    { title: "Use the side menu", text: "Touch the three-line button on the left to open the menu. Choose a section, or touch the left arrow to close the menu. Offer Feedback opens feedback about this kiosk." },
    { title: "Search the kiosk", text: "Type a room number, program, or topic into Search on Home or in the menu, then touch a result to go straight there. You can also touch a shortcut under Search, such as Restrooms." },
    { title: "Find a room", text: "In Building Directory, type a room number on the keypad or tap a room on the map. A pulsing marker shows where it is, and the map switches to the right floor." },
    { title: "Return to Home", text: "Touch Return to Home at the end of a section, or choose Home in the side menu." },
    { title: "Explore job opportunities", text: "Choose College Jobs and scan its QR code with your phone camera. Student Jobs opens the official search here; touch Show QR Code to view it on your phone, Keep browsing to extend your time, or Close Jobs to return." },
    { title: "Use Student Surveys", text: "Choose any answers you like, then touch Submit Survey. Feedback also accepts optional written answers. Wait for confirmation that your response was saved. If the connection fails, touch Retry submission. Clear answers discards your current input; a response already received cannot be withdrawn here." },
    { title: "Return from the slideshow", text: "After 60 seconds without kiosk activity, campus photographs appear and temporary selections clear. Touch to Explore returns you to Home." }
  ];

  /* Survey_Questions.pdf, Student Feedback Survey A: only clickable answers are used.
     Optional campus free-text follow-ups are omitted. Submit sends selected answers to Supabase. */
  var surveyQuestions = [
    { question: "How do you typically learn about campus events and announcements?", answers: ["UHMC website", "Campus advertisements", "Other students", "Other"] },
    { question: "Which UHMC business programs would you like to learn more about?", answers: ["Business", "Hospitality", "Accounting", "ABIT", "None"] },
    { question: "Are you interested in increasing your participation in campus activities?", answers: ["Yes", "No", "Unsure"] },
    { question: "What types of career development opportunities would you like UHMC to offer more often?", answers: ["Career workshops", "Internships", "Networking events", "Job fairs", "Other"] }
  ];
  var surveyShown = false;
  var surveyTimer = null;
  var activeModal = null;
  var previousFocus = null;

  /* Preserve these user-supplied strings exactly, including empty values and order.
     Checked November 4, 2026: SchoolJobs CSP excludes our origin; SECE rendered
     in Edge and returned no X-Frame-Options or frame-ancestors restriction. */
  var jobBoards = {
    college: {
      name: "College Jobs",
      url: "https://www.schooljobs.com/careers/hawaiiedu?location[0]=UH%20Maui%20College%2C%20Maui%20County&sort=PostingDate%7CDescending",
      canEmbed: false
    },
    student: {
      name: "Student Jobs",
      url: "https://sece.its.hawaii.edu/sece/student/jobsearch/get?keywords=&keyMatch=any&onCampus=true&_onCampus=on&campuses=9&_campuses=1&_categories=1&offCampus=true&_offCampus=on&company=&_nonUhCategories=1&_islands=1&postSince=&specialClassification=&_program=1&jobNumber=&submitted=true&authUser=false",
      canEmbed: true
    }
  };

  /* November 4, 2026: the UHMC homepage returned no framing restrictions
     and rendered in an Edge iframe. Set false if the provider blocks it later;
     never infer embedding permission from an iframe load event. */
  var UHMC_WEBSITE_CAN_EMBED = true;

  /* Load once per visitor, on direct navigation or scrolling into the section. */
  function loadUhmcWebsite() {
    if (!hasEntered || isIdle) { return; }
    var container = document.getElementById("website-frame-container");
    container.parentNode.classList.toggle("qr-only", !UHMC_WEBSITE_CAN_EMBED);
    if (!UHMC_WEBSITE_CAN_EMBED || container.querySelector("iframe")) { return; }
    /* Announce loading before starting the external request. */
    var loading = document.createElement("p");
    loading.id = "website-loading";
    loading.setAttribute("role", "status");
    loading.textContent = "Loading UHMC Website...";
    container.setAttribute("aria-busy", "true");
    container.appendChild(loading);
    var frame = document.createElement("iframe");
    frame.id = "uhmc-website-frame";
    frame.title = "Official University of Hawaii Maui College website";
    frame.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms");
    frame.setAttribute("referrerpolicy", "no-referrer");
    /* Load only controls the loading message; it is not proof of iframe permission.
       Framing permission was checked independently before enabling this feature. */
    frame.addEventListener("load", function () {
      if (!frame.isConnected) { return; }
      loading.hidden = true;
      container.setAttribute("aria-busy", "false");
    });
    frame.addEventListener("error", function () {
      if (!frame.isConnected) { return; }
      loading.hidden = false;
      loading.textContent = "Website unavailable. Select Show QR Code to visit on your phone.";
      container.setAttribute("aria-busy", "false");
    });
    frame.src = "https://maui.hawaii.edu/";
    container.appendChild(frame);
  }

  /* Events state is separate from the other kiosk features. */
  var eventsSelected = null;
  var eventsRows = [];
  var eventsMonth = null;
  var eventsRequest = null;
  var eventsVersion = 0;
  var eventsVisited = false;

  /* Abort old requests and remove the external document on collapse or idle. */
  function resetEvents(preserveChoice) {
    /* Manual collapse/switch keeps the visitor's choice; idle restores defaults. */
    if (!preserveChoice) { eventsVisited = false; }
    eventsVersion += 1;
    if (eventsRequest) { eventsRequest.abort(); eventsRequest = null; }
    eventsSelected = null;
    eventsRows = [];
    eventsMonth = null;
    document.getElementById("events-calendar-panel").hidden = true;
    document.getElementById("events-calendar-content").textContent = "";
    document.querySelectorAll("[data-events-calendar]").forEach(function (tile) {
      tile.setAttribute("aria-expanded", "false");
    });
  }

  /* Read dates for filtering only. Display the source wording without corrections.
     Keep unrecognized dates visible instead of guessing or silently dropping them. */
  function academicRowMonths(label) {
    var names = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    var years = label.match(/\b20\d{2}\b/g);
    var months = label.toLowerCase().match(/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/g);
    if (!years || !months) { return null; }
    var first = Number(years[0]) * 12 + names.indexOf(months[0].slice(0, 3));
    var last = Number(years[years.length - 1]) * 12 + names.indexOf(months[months.length - 1].slice(0, 3));
    if (last < first && years.length === 1) { last += 12; }
    return { first: first, last: last };
  }

  /* Use an explicit month/day/year parser, avoiding browser-dependent date parsing.
     Ranges sort by their first day; invalid dates stay at the bottom. */
  function academicStartDate(label) {
    var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    var match = label.toLowerCase().match(/\b(jan[a-z]*|feb[a-z]*|mar[a-z]*|apr[a-z]*|may|jun[a-z]*|jul[a-z]*|aug[a-z]*|sep[a-z]*|oct[a-z]*|nov[a-z]*|dec[a-z]*)\.?\s+(\d{1,2})\b/);
    var year = label.match(/\b20\d{2}\b/);
    if (!match || !year) { return Infinity; }
    var month = months.indexOf(match[1].slice(0, 3));
    var day = Number(match[2]);
    var date = new Date(Number(year[0]), month, day);
    if (date.getMonth() !== month || date.getDate() !== day) { return Infinity; }
    return date.getTime();
  }

  /* Match the entire date and description; different same-day events remain. */
  function academicRowKey(date, description) {
    function normalize(text) { return text.replace(/\s+/g, " ").trim().toLowerCase(); }
    return JSON.stringify([normalize(date), normalize(description)]);
  }

  function renderAcademicMonth() {
    var content = document.getElementById("events-calendar-content");
    content.textContent = "";
    var selected = eventsMonth.getFullYear() * 12 + eventsMonth.getMonth();
    document.getElementById("events-month-label").textContent = eventsMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    var matching = eventsRows.filter(function (row) { return row.months && selected >= row.months.first && selected <= row.months.last; });
    var unknown = eventsRows.filter(function (row) { return !row.months; });
    document.getElementById("events-status").textContent = matching.length
      ? "Official UHMC academic deadlines for the selected month."
      : "No dates for this month found in official calendar.";
    matching.concat(unknown).forEach(function (row) {
      var card = document.createElement("div");
      card.className = "events-deadline";
      var date = document.createElement("strong");
      date.textContent = row.date;
      var description = document.createElement("p");
      description.textContent = row.description;
      card.appendChild(date);
      card.appendChild(description);
      if (!row.months) {
        var note = document.createElement("p");
        note.textContent = "Month could not be determined; shown for reference.";
        card.appendChild(note);
      }
      content.appendChild(card);
    });
  }

  function selectEventsCalendar(kind) {
    var collapse = eventsSelected === kind;
    resetEvents(true);
    eventsVisited = true;
    if (collapse) { return; }
    eventsSelected = kind;
    var version = eventsVersion;
    var title = kind === "academic" ? "Academic Calendar" : "Campus Events";
    document.getElementById("events-calendar-title").textContent = title;
    document.getElementById("events-calendar-panel").hidden = false;
    document.querySelector('[data-events-calendar="' + kind + '"]').setAttribute("aria-expanded", "true");
    document.getElementById("events-month-controls").hidden = true;
    var status = document.getElementById("events-status");
    var content = document.getElementById("events-calendar-content");
    if (kind === "campus") {
      status.textContent = "Loading Campus Events... If the calendar does not appear, please scan the QR code.";
      var frame = document.createElement("iframe");
      frame.title = "Official UHMC Campus Events calendar";
      frame.addEventListener("load", function () {
        if (version !== eventsVersion) { return; }
        status.textContent = "Official UHMC Campus Events. If the calendar does not appear, please scan the QR code.";
      });
      /* Headers checked November 5, 2026: no X-Frame-Options or CSP frame restriction.
         Allow the official calendar scripts, but block top navigation and pop-ups.
         Cross-origin rules prevent changing its styling or removing its own links.
         A load event cannot reliably distinguish success from blocked embedding. */
      frame.setAttribute("sandbox", "allow-scripts allow-same-origin");
      frame.setAttribute("referrerpolicy", "no-referrer");
      frame.src = "https://maui.hawaii.edu/events";
      content.appendChild(frame);
      return;
    }
    status.textContent = "Loading official academic deadlines...";
    eventsRequest = new AbortController();
    var controller = eventsRequest;
    var timeout = window.setTimeout(function () { controller.abort(); }, 20000);
    /* Public WordPress page endpoint: CORS verified, no keys or proxy needed.
       Fetch again on each selection; never keep a static copy of deadlines. */
    fetch("https://maui.hawaii.edu/wp-json/wp/v2/pages/13862?_fields=content", {
      cache: "no-store", credentials: "omit", signal: controller.signal
    }).then(function (response) {
      if (!response.ok) { throw new Error("Calendar request failed"); }
      return response.json();
    }).then(function (data) {
      if (version !== eventsVersion) { return; }
      /* Parse in a detached document; never insert remote HTML into the kiosk. */
      var source = new DOMParser().parseFromString(data.content.rendered, "text/html");
      var seen = new Set();
      source.querySelectorAll("table tr").forEach(function (row) {
        var cells = row.querySelectorAll("td");
        if (cells.length < 2) { return; }
        var date = cells[0].textContent.trim();
        var description = cells[1].textContent.trim();
        if (!date || /^(dates?|event description)$/i.test(date)) { return; }
        var key = academicRowKey(date, description);
        if (seen.has(key)) { return; }
        seen.add(key);
        var start = academicStartDate(date);
        eventsRows.push({ date: date, description: description,
          months: isFinite(start) ? academicRowMonths(date) : null, start: start });
      });
      eventsRows.sort(function (a, b) {
        return a.start === b.start ? 0 : (a.start < b.start ? -1 : 1);
      });
      if (!eventsRows.length) { throw new Error("Calendar format unavailable"); }
      var now = new Date();
      var hawaii = new Intl.DateTimeFormat("en-US", { timeZone: "Pacific/Honolulu", year: "numeric", month: "numeric" }).formatToParts(now);
      var year = Number(hawaii.filter(function (part) { return part.type === "year"; })[0].value);
      var month = Number(hawaii.filter(function (part) { return part.type === "month"; })[0].value);
      eventsMonth = new Date(year, month - 1, 1);
      document.getElementById("events-month-controls").hidden = false;
      renderAcademicMonth();
    }).catch(function () {
      if (version !== eventsVersion) { return; }
      content.textContent = "";
      status.textContent = "The live Academic Calendar is unavailable. Collapse and select it again to retry, or scan its QR code to read the official calendar on your phone.";
    }).finally(function () {
      window.clearTimeout(timeout);
      if (version === eventsVersion) { eventsRequest = null; }
    });
  }

  /* Auto-open once when Events is visible, without overriding manual choices. */
  function checkEventsVisibility() {
    if (eventsVisited || !hasEntered || isIdle || homepage.hidden || document.hidden) { return; }
    var bounds = document.getElementById("events").getBoundingClientRect();
    var header = document.querySelector(".page-header").offsetHeight;
    if (bounds.top < window.innerHeight && bounds.bottom > header) {
      selectEventsCalendar("academic");
    }
  }

  function setupEvents() {
    if (window.IntersectionObserver) {
      var observer = new IntersectionObserver(checkEventsVisibility);
      observer.observe(document.getElementById("events"));
    }
    /* Scroll/resize also cover older browsers and sections entering below the header. */
    window.addEventListener("scroll", checkEventsVisibility);
    window.addEventListener("resize", checkEventsVisibility);
    document.querySelectorAll("[data-events-calendar]").forEach(function (tile) {
      tile.addEventListener("click", function () { selectEventsCalendar(tile.getAttribute("data-events-calendar")); });
    });
    document.getElementById("events-collapse").addEventListener("click", function () {
      var tile = document.querySelector('[data-events-calendar="' + eventsSelected + '"]');
      resetEvents(true);
      tile.focus({ preventScroll: true });
    });
    function changeMonth(offset) {
      if (!eventsMonth) { return; }
      eventsMonth.setMonth(eventsMonth.getMonth() + offset);
      renderAcademicMonth();
    }
    document.getElementById("events-month-prev").addEventListener("click", function () { changeMonth(-1); });
    document.getElementById("events-month-next").addEventListener("click", function () { changeMonth(1); });
    document.getElementById("events-qr-open").addEventListener("click", function () {
      var name = eventsSelected === "academic" ? "Academic Calendar" : "Campus Events";
      document.getElementById("events-qr-heading").textContent = name + " QR Code";
      document.getElementById("events-qr-label").textContent = "Scan with your phone camera to open the official " + name + ".";
      var image = document.getElementById("events-qr-image");
      image.src = "assets/" + (eventsSelected === "academic" ? "academic_calendar_qr.svg" : "campus_events_qr.svg");
      image.alt = "QR code for the official UHMC " + name;
      openModal("events-qr-dialog");
    });
    document.getElementById("events-qr-close").addEventListener("click", closeModal);
  }

  /* The visibility fallback also supports browsers without IntersectionObserver. */
  function checkWebsiteVisibility() {
    if (!hasEntered || isIdle || homepage.hidden) { return; }
    var bounds = document.getElementById("website").getBoundingClientRect();
    if (bounds.top < window.innerHeight && bounds.bottom > document.querySelector(".page-header").offsetHeight) {
      loadUhmcWebsite();
    }
  }

  /* Observe actual entry into the section; welcome/startup never loads the site. */
  function setupWebsite() {
    if (window.IntersectionObserver) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { checkWebsiteVisibility(); }
        });
      });
      observer.observe(document.getElementById("website"));
    } else {
      window.addEventListener("scroll", checkWebsiteVisibility);
    }
    window.addEventListener("resize", checkWebsiteVisibility);
  }

  /* Only SECE is embedded; never proxy or bypass a board's framing policy. */
  function openJobBoard(key) {
    if (activeModal) { return; }
    var board = jobBoards[key];
    document.getElementById("jobs-dialog-heading").textContent = board.name;
    document.getElementById("jobs-qr-open").hidden = !board.canEmbed;
    document.getElementById("college-jobs-qr").hidden = board.canEmbed;
    document.querySelector("#jobs-dialog > .jobs-modal-card").classList.toggle("jobs-qr-only", !board.canEmbed);
    document.getElementById("jobs-status").textContent = board.canEmbed
      ? "Use the official search below. Select Keep browsing to extend your time; this window closes after 60 seconds without kiosk activity. Select Show QR Code to open the search on your phone."
      : "Scan the QR code to view UH Maui College opportunities on your phone, sorted by most recently posted.";
    document.getElementById("jobs-continue").hidden = !board.canEmbed;
    if (board.canEmbed) {
      var frame = document.createElement("iframe");
      frame.id = "jobs-frame";
      frame.title = "Official SECE Student Jobs search";
      /* Permit search forms and scripts, but prevent top navigation and pop-ups.
         This is a cross-origin document; do not sign in on the shared kiosk.
         Removing it clears the document, not the provider's cookies or sessions. */
      frame.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms");
      frame.setAttribute("referrerpolicy", "no-referrer");
      frame.src = board.url;
      document.getElementById("jobs-frame-container").appendChild(frame);
    }
    openModal("jobs-dialog");
    document.getElementById("jobs-close").focus();
    restartIdleTimer();
  }

  /* Use the QR panel as the focus boundary while it covers the live search. */
  function modalFocusPanel() {
    var qrPanel = document.getElementById("student-qr-dialog");
    return qrPanel.hidden ? activeModal : qrPanel;
  }

  /* Show the QR without reloading the live search or unlocking the page. */
  function showStudentQr() {
    var jobsCard = document.querySelector("#jobs-dialog > .jobs-modal-card");
    document.getElementById("student-qr-dialog").hidden = false;
    jobsCard.setAttribute("inert", "");
    jobsCard.setAttribute("aria-hidden", "true");
    document.getElementById("jobs-dialog").removeAttribute("aria-modal");
    document.getElementById("student-qr-close").focus();
  }

  /* Restore the live search panel; idle cleanup skips returning focus. */
  function closeStudentQr(restoreFocus) {
    document.getElementById("student-qr-dialog").hidden = true;
    var jobsCard = document.querySelector("#jobs-dialog > .jobs-modal-card");
    jobsCard.removeAttribute("inert");
    jobsCard.removeAttribute("aria-hidden");
    document.getElementById("jobs-dialog").setAttribute("aria-modal", "true");
    if (restoreFocus) { document.getElementById("jobs-qr-open").focus(); }
  }

  /* Build a native question group safely from approved static text. */
  function buildQuestion(question, name) {
    var fieldset = document.createElement("fieldset");
    fieldset.className = "survey-question";
    var legend = document.createElement("legend");
    legend.textContent = question.question;
    fieldset.appendChild(legend);
    var options = document.createElement("div");
    options.className = "answer-options";
    question.answers.forEach(function (answer) {
      var label = document.createElement("label");
      label.className = "answer-option";
      var input = document.createElement("input");
      input.type = "radio";
      input.name = name;
      input.value = answer;
      label.appendChild(input);
      label.appendChild(document.createTextNode(answer));
      options.appendChild(label);
    });
    fieldset.appendChild(options);
    return fieldset;
  }

  /* Keep the menu state explicit and preserve the visitor's current scroll position. */
  function closeMenu() {
    document.getElementById("navigation-panel").hidden = true;
    document.getElementById("menu-toggle").setAttribute("aria-expanded", "false");
    document.getElementById("menu-toggle").setAttribute("aria-label", "Open navigation menu");
    document.getElementById("menu-toggle").firstElementChild.textContent = "\u2630";
    homepage.classList.remove("menu-open");
  }

  /* Minimizing keeps the query; visitor reset clears it with the other search forms. */
  function closeHeaderSearch(restoreFocus) {
    document.getElementById("header-search-panel").hidden = true;
    var toggle = document.getElementById("header-search-toggle");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open search");
    if (restoreFocus) { toggle.focus({ preventScroll: true }); }
  }

  /* Measure wrapped header text so every destination remains below the sticky bar. */
  function updateHeaderOffset() {
    var headerHeight = document.querySelector(".page-header").offsetHeight;
    document.documentElement.style.setProperty("--header-offset", (headerHeight + 20) + "px");
    document.documentElement.style.setProperty("--header-height", headerHeight + "px");
  }

  /* Use the same destination behavior for tiles, search, menu, and help. */
  function navigateTo(id) {
    closeHeaderSearch(false);
    closeMenu();
    updateHeaderOffset();
    var section = document.getElementById(id);
    var heading = section.querySelector("h1, h2");
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
    section.scrollIntoView({ block: "start" });
    window.history.replaceState(null, "", "#" + id);
    if (id === "website") { loadUhmcWebsite(); }
  }

  /* Open one modal at a time and block background keyboard and pointer interactions. */
  function openModal(id) {
    if (activeModal) { return; }
    /* The timed survey temporarily covers search without changing its query or open state. */
    if (id !== "survey-dialog" && !document.getElementById("header-search-panel").hidden) { closeHeaderSearch(true); }
    previousFocus = document.activeElement;
    activeModal = document.getElementById(id);
    closeMenu();
    homepage.setAttribute("inert", "");
    homepage.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "hidden";
    activeModal.hidden = false;
    activeModal.querySelector("input, a[href]:not([hidden]), button:not([disabled]):not([hidden])").focus();
  }

  /* Close without submitting any answers or claiming they were saved. */
  function closeModal() {
    if (!activeModal) { return; }
    if (activeModal.id === "survey-dialog") {
      clearSubmission("popup");
      popupQuestionIndex = null;
      document.getElementById("popup-question").textContent = "";
    }
    /* Remove the external browsing document on both manual close and idle reset.
       Same-origin rules prevent clearing external cookies or observing frame input. */
    if (activeModal.id === "jobs-dialog") {
      document.getElementById("jobs-frame-container").textContent = "";
      closeStudentQr(false);
    }
    activeModal.hidden = true;
    activeModal = null;
    homepage.removeAttribute("inert");
    homepage.removeAttribute("aria-hidden");
    document.body.style.overflow = "";
    if (previousFocus && !homepage.hidden) { previousFocus.focus({ preventScroll: true }); }
  }

  /* Offer one random campus question, saved as its own partial submission. */
  function offerSurvey() {
    if (surveyShown || isIdle || !hasEntered || document.hidden) { return; }
    if (activeModal) { surveyTimer = window.setTimeout(offerSurvey, 5000); return; }
    surveyShown = true;
    clearSubmission("popup");
    popupQuestionIndex = Math.floor(Math.random() * surveyQuestions.length);
    var container = document.getElementById("popup-question");
    container.textContent = "";
    container.appendChild(buildQuestion(surveyQuestions[popupQuestionIndex], "popup-answer"));
    openModal("survey-dialog");
  }

  /* Discard all temporary choices, unfinished input, search terms, and panels on idle. */
  function resetVisitor() {
    closeHeaderSearch(false);
    visitorGeneration += 1;
    Object.keys(submissions).forEach(clearSubmission);
    window.clearTimeout(surveyTimer);
    closeModal();
    resetEvents();
    closeMenu();
    /* Discard the external page and browsing position for the next visitor.
       Cross-origin cookies/storage cannot be cleared by kiosk JavaScript. */
    document.getElementById("website-frame-container").textContent = "";
    document.getElementById("website-frame-container").removeAttribute("aria-busy");
    document.querySelectorAll("input").forEach(function (input) {
      if (input.type === "radio" || input.type === "checkbox") { input.checked = false; }
      else { input.value = ""; }
    });
    /* Offer Feedback free-text responses belong only to the current visitor. */
    document.querySelectorAll("#feedback textarea").forEach(function (response) {
      response.value = "";
    });
    document.querySelectorAll(".search-results").forEach(function (results) { results.textContent = ""; });
    clearFoundProgram();
    if (window.KioskDirectory) { window.KioskDirectory.reset(); }
    surveyShown = false;
    previousFocus = null;
  }

  /* Fill each navigation list from the small, manually maintained help data. */
  function fillLinks(container) {
    destinations.forEach(function (destination, index) {
      var link = document.createElement("a");
      link.href = "#" + destination.id;
      link.textContent = container.id === "menu-links" ? menuLabels[index] : destination.name;
      container.appendChild(link);
    });
  }

  /* One-tap shortcuts shown under Home search for common needs. */
  var quickFinds = [
    { label: "Restrooms", action: { kind: "facility", place: "restrooms" } },
    { label: "Elevator", action: { kind: "facility", place: "elevator" } },
    { label: "Academic calendar", action: { kind: "calendar", calendar: "academic" } },
    { label: "Campus events", action: { kind: "calendar", calendar: "campus" } },
    { label: "Student jobs", action: { kind: "jobs", board: "student" } },
    { label: "Kiosk feedback", action: { kind: "section", id: "feedback" } }
  ];

  /* Short descriptions shown under section results. */
  var sectionDetails = {
    programs: "Browse UHMC programs",
    directory: "Ka Lama floor maps and rooms",
    website: "Browse the college website",
    jobs: "College and student job boards",
    surveys: "Answer quick campus questions",
    events: "Academic calendar and campus events",
    feedback: "Tell us how the kiosk worked for you"
  };

  /* Words that do not help a search, ignored when other words are present. */
  var STOP_WORDS = ["a", "an", "the", "to", "of", "in", "on", "at", "is", "are", "where", "what", "how",
    "find", "i", "my", "do", "for", "me", "show", "room", "can", "get", "go", "need", "want"];
  /* Result types in display order when scores tie. */
  var TYPE_ORDER = ["Section", "Shortcut", "Program", "Place", "Room"];
  var MAX_RESULTS = 6;
  var searchItems = [];
  var foundTimer = null;

  /* Split text into lowercase words for matching. */
  function searchWords(text) {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  }

  /* Gather sections, shortcuts, programs, and Ka Lama places into one local search list. */
  function buildSearchItems() {
    destinations.forEach(function (destination) {
      if (destination.id === "home") { return; }
      searchItems.push({ type: "Section", label: destination.name, detail: sectionDetails[destination.id] || "",
        words: searchWords(destination.name + " " + destination.terms), action: { kind: "section", id: destination.id } });
    });
    [
      { label: "Academic Calendar", detail: "Deadlines and important dates", terms: "academic calendar deadlines dates semester registration", action: { kind: "calendar", calendar: "academic" } },
      { label: "Campus Events", detail: "What's happening on campus", terms: "campus events activities calendar happening", action: { kind: "calendar", calendar: "campus" } },
      { label: "College Jobs", detail: "UH Maui College job openings", terms: "college jobs employment staff faculty openings work career", action: { kind: "jobs", board: "college" } },
      { label: "Student Jobs", detail: "On-campus and off-campus student jobs", terms: "student jobs employment part time work career internship", action: { kind: "jobs", board: "student" } },
      { label: "Help", detail: "How to use this kiosk", terms: "help how use instructions lost", action: { kind: "help" } }
    ].forEach(function (shortcut) {
      searchItems.push({ type: "Shortcut", label: shortcut.label, detail: shortcut.detail,
        words: searchWords(shortcut.label + " " + shortcut.terms), action: shortcut.action });
    });
    (window.KioskPrograms || []).forEach(function (program) {
      searchItems.push({ type: "Program", label: program.name, detail: program.department,
        words: searchWords(program.keywords + " program programs degree major"), action: { kind: "program", id: program.id } });
    });
    ((window.KioskDirectory && window.KioskDirectory.places) || []).forEach(function (place) {
      if (place.type === "room") {
        searchItems.push({ type: "Room", label: place.label, detail: "Ka Lama, " + place.floorName,
          words: searchWords(place.id + " " + place.floorName + " ka lama kalama"), action: { kind: "room", id: place.id } });
      } else {
        searchItems.push({ type: "Place", label: place.label, detail: "Ka Lama, " + place.floorName,
          words: searchWords(place.keywords + " " + place.floorName + " ka lama kalama"), action: { kind: "facility", place: place.kind, floor: place.floor } });
      }
    });
  }

  /* Score one query word: exact word 3, start of a word 2, inside a longer word 1. */
  function wordScore(word, words) {
    var best = 0;
    words.forEach(function (candidate) {
      if (candidate === word) { best = Math.max(best, 3); }
      else if (candidate.indexOf(word) === 0) { best = Math.max(best, 2); }
      else if (word.length >= 3 && candidate.indexOf(word) !== -1) { best = Math.max(best, 1); }
    });
    return best;
  }

  /* Every meaningful query word must match; stronger matches rank higher. */
  function findMatches(query) {
    var words = searchWords(query);
    var meaningful = words.filter(function (word) { return STOP_WORDS.indexOf(word) === -1; });
    if (meaningful.length) { words = meaningful; }
    if (!words.length) { return []; }
    var scored = [];
    searchItems.forEach(function (item) {
      var total = 0;
      var labelWords = searchWords(item.label);
      for (var i = 0; i < words.length; i += 1) {
        var score = wordScore(words[i], item.words);
        if (!score) { return; }
        /* Matching the result's own name counts extra, so "accounting" finds the program first. */
        total += score + (wordScore(words[i], labelWords) >= 2 ? 2 : 0);
      }
      scored.push({ item: item, score: total });
    });
    scored.sort(function (a, b) {
      if (b.score !== a.score) { return b.score - a.score; }
      var order = TYPE_ORDER.indexOf(a.item.type) - TYPE_ORDER.indexOf(b.item.type);
      return order || a.item.label.localeCompare(b.item.label, "en", { numeric: true });
    });
    return scored.slice(0, MAX_RESULTS).map(function (entry) { return entry.item; });
  }

  /* Briefly outline a program card so the visitor sees what search found. */
  function highlightProgram(id) {
    var card = document.getElementById(id);
    if (!card) { return; }
    clearFoundProgram();
    card.classList.add("is-found");
    card.scrollIntoView({ block: "center" });
    foundTimer = window.setTimeout(clearFoundProgram, 4000);
  }

  function clearFoundProgram() {
    window.clearTimeout(foundTimer);
    document.querySelectorAll(".program-card.is-found").forEach(function (card) { card.classList.remove("is-found"); });
  }

  /* Carry out a search result or shortcut in as few touches as possible. */
  function runAction(action) {
    var directory = window.KioskDirectory;
    if (action.kind === "section") { navigateTo(action.id); }
    else if (action.kind === "program") { navigateTo("programs"); highlightProgram(action.id); }
    else if (action.kind === "room" && directory) { navigateTo("directory"); directory.showRoom(action.id); }
    else if (action.kind === "facility" && directory) { navigateTo("directory"); directory.showFacility(action.place, action.floor || directory.homeFloor); }
    else if (action.kind === "calendar") {
      navigateTo("events");
      if (eventsSelected !== action.calendar) { selectEventsCalendar(action.calendar); }
    }
    else if (action.kind === "jobs") { closeModal(); navigateTo("jobs"); openJobBoard(action.board); }
    else if (action.kind === "help") { closeMenu(); openModal("help-dialog"); }
  }

  /* Clear a search box after use so the on-screen keyboard closes. */
  function clearSearch(form) {
    var input = form.querySelector("input");
    input.value = "";
    input.blur();
    form.querySelector(".search-results").textContent = "";
  }

  /* Both search boxes share this matching and safe text output. */
  function showSearchResults(form) {
    var query = form.querySelector("input").value.trim();
    var results = form.querySelector(".search-results");
    results.textContent = "";
    if (!query) { return; }
    var matches = findMatches(query);
    matches.forEach(function (item) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "search-result";
      var label = document.createElement("strong");
      label.textContent = item.label;
      var detail = document.createElement("span");
      detail.className = "search-result-detail";
      detail.textContent = item.detail;
      var type = document.createElement("span");
      type.className = "search-result-type";
      type.textContent = item.type;
      button.appendChild(label);
      button.appendChild(detail);
      button.appendChild(type);
      button.addEventListener("click", function () {
        clearSearch(form);
        if (form.closest("#header-search-panel")) { closeHeaderSearch(true); }
        runAction(item.action);
      });
      results.appendChild(button);
    });
    if (!matches.length) {
      var empty = document.createElement("p");
      empty.className = "search-empty";
      empty.textContent = "Nothing matches \u201c" + query + "\u201d. Try a room number like 207, a program like accounting, or a word like calendar.";
      results.appendChild(empty);
    }
  }

  /* Build the one-tap shortcut buttons under Home search. */
  function setupQuickFinds() {
    var container = document.getElementById("quick-finds");
    if (!container) { return; }
    quickFinds.forEach(function (quick) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "quick-find";
      button.textContent = quick.label;
      button.addEventListener("click", function () { runAction(quick.action); });
      container.appendChild(button);
    });
  }

  /* Connect small navigation, search, help, and survey interactions once. */
  function setupNavigation() {
    setupSurveySubmission();
    document.getElementById("college-jobs").addEventListener("click", function () { openJobBoard("college"); });
    document.getElementById("student-jobs").addEventListener("click", function () { openJobBoard("student"); });
    document.getElementById("jobs-close").addEventListener("click", closeModal);
    document.getElementById("jobs-qr-open").addEventListener("click", showStudentQr);
    document.getElementById("student-qr-close").addEventListener("click", function () { closeStudentQr(true); });
    /* Cross-origin iframe actions do not reach recordActivity; this explicit
       parent-page control extends the unchanged inactivity countdown. */
    document.getElementById("jobs-continue").addEventListener("click", restartIdleTimer);
    fillLinks(document.getElementById("menu-links"));
    fillLinks(document.getElementById("help-links"));
    helpTopics.forEach(function (topic) {
      var section = document.createElement("section");
      var heading = document.createElement("h3");
      heading.textContent = topic.title;
      var instructions = document.createElement("p");
      instructions.textContent = topic.text;
      section.appendChild(heading);
      section.appendChild(instructions);
      document.getElementById("help-instructions").appendChild(section);
    });
    surveyQuestions.forEach(function (question, index) {
      document.getElementById("student-questions").appendChild(buildQuestion(question, "student-" + index));
    });
    buildSearchItems();
    setupQuickFinds();
    document.getElementById("header-search-toggle").addEventListener("click", function () {
      var panel = document.getElementById("header-search-panel");
      if (!panel.hidden) { closeHeaderSearch(true); return; }
      closeMenu();
      panel.hidden = false;
      this.setAttribute("aria-expanded", "true");
      this.setAttribute("aria-label", "Minimize search");
      document.getElementById("header-search-input").focus({ preventScroll: true });
    });
    document.getElementById("header-search-minimize").addEventListener("click", function () {
      closeHeaderSearch(true);
    });
    document.getElementById("menu-toggle").addEventListener("click", function () {
      closeHeaderSearch(false);
      var panel = document.getElementById("navigation-panel");
      panel.hidden = !panel.hidden;
      this.setAttribute("aria-expanded", String(!panel.hidden));
      this.setAttribute("aria-label", panel.hidden ? "Open navigation menu" : "Close navigation menu");
      this.firstElementChild.textContent = panel.hidden ? "\u2630" : "<";
      homepage.classList.toggle("menu-open", !panel.hidden);
    });
    document.querySelectorAll(".kiosk-search").forEach(function (form) {
      form.addEventListener("submit", function (event) { event.preventDefault(); showSearchResults(form); });
      form.querySelector("input").addEventListener("input", function () { showSearchResults(form); });
    });
    document.getElementById("help-toggle").addEventListener("click", function () { openModal("help-dialog"); });
    document.getElementById("help-close").addEventListener("click", closeModal);
    document.getElementById("survey-skip").addEventListener("click", closeModal);
    document.getElementById("survey-more").addEventListener("click", function () { closeModal(); navigateTo("surveys"); });
    document.addEventListener("click", function (event) {
      var link = event.target.closest("a[href^='#']");
      if (!link || !hasEntered || isIdle) { return; }
      var id = link.getAttribute("href").slice(1);
      if (destinations.some(function (destination) { return destination.id === id; })) {
        event.preventDefault();
        closeModal();
        navigateTo(id);
      }
    });
    /* Trap Tab for browsers without inert support; Escape always provides an exit. */
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        if (!document.getElementById("student-qr-dialog").hidden) { closeStudentQr(true); }
        else if (activeModal) { closeModal(); }
        else if (!document.getElementById("header-search-panel").hidden) { closeHeaderSearch(true); }
        else { closeMenu(); document.getElementById("menu-toggle").focus(); }
      }
      if (!activeModal || event.key !== "Tab") { return; }
      var controls = Array.from(modalFocusPanel().querySelectorAll("input:not([disabled]), a[href]:not([hidden]), button:not([disabled]):not([hidden]), iframe")).filter(function (control) {
        return control.getClientRects().length > 0;
      });
      var index = controls.indexOf(document.activeElement);
      var next = event.shiftKey ? index - 1 : index + 1;
      event.preventDefault();
      controls[(next + controls.length) % controls.length].focus();
    });
    /* Keep focus inside the modal even on browsers that do not support inert. */
    document.addEventListener("focusin", function (event) {
      if (activeModal && !modalFocusPanel().contains(event.target)) {
        modalFocusPanel().querySelector("input:not([disabled]), a[href]:not([hidden]), button:not([disabled]):not([hidden])").focus();
      }
    });
    window.addEventListener("resize", updateHeaderOffset);
  }

  /* Always clear the previous timeout before scheduling another idle period. */
  function restartIdleTimer() {
    window.clearTimeout(idleTimer);
    idleTimer = null;
    if (hasEntered && !isIdle && !document.hidden) {
      idleTimer = window.setTimeout(startSlideshow, INACTIVITY_DELAY);
    }
  }

  /* Display one full photograph and provide an honest message if it cannot load. */
  function showSlide() {
    slideshowError.hidden = true;
    slideshowImage.hidden = false;
    slideshowImage.alt = slides[currentSlide].description;
    slideshowImage.src = "assets/" + encodeURIComponent(slides[currentSlide].file);
  }

  /* Start at the first photo and hide the homepage from touch and keyboard use. */
  function startSlideshow() {
    window.clearTimeout(idleTimer);
    idleTimer = null;
    window.clearInterval(slideshowTimer);
    /* Ignore a stale callback if the visitor has not entered or the tab is hidden. */
    if (!hasEntered || document.hidden) {
      slideshowTimer = null;
      return;
    }
    resetVisitor();
    isIdle = true;
    currentSlide = 0;
    idleScreen.hidden = false;
    homepage.hidden = true;
    document.body.style.overflow = "hidden";
    showSlide();
    document.getElementById("explore-button").focus();
    slideshowTimer = window.setInterval(function () {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide();
    }, SLIDE_DELAY);
  }

  /* Stop slideshow work and return to a neutral homepage on the first touch. */
  function returnHome() {
    window.clearInterval(slideshowTimer);
    slideshowTimer = null;
    isIdle = false;
    hasEntered = true;
    welcomeScreen.hidden = true;
    homepage.hidden = false;
    idleScreen.hidden = true;
    document.body.style.overflow = "";
    window.location.replace("#home");
    window.scrollTo(0, 0);
    document.querySelector(".navigation-link").focus();
    window.scrollTo(0, 0);
    updateHeaderOffset();
    window.clearTimeout(surveyTimer);
    if (!surveyShown) { surveyTimer = window.setTimeout(offerSurvey, 20000); }
    restartIdleTimer();
  }

  /* Count deliberate actions; passive pointer jitter must not postpone the slideshow. */
  function recordActivity(event) {
    /* Count dragging or a moving touch, but ignore a pointer moving on its own. */
    if (event.type === "pointermove" && event.buttons === 0 && event.pointerType !== "touch") {
      return;
    }
    if (event.type === "click" && Date.now() < ignoreClicksUntil) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (isIdle || !hasEntered) {
      if (event.type === "pointermove" || event.type === "touchmove" || event.type === "scroll" || event.type === "wheel") {
        return;
      }
      if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") {
        return;
      }
      /* Cancel the activating gesture so it cannot also select a homepage link. */
      if (event.cancelable) {
        event.preventDefault();
      }
      event.stopPropagation();
      ignoreClicksUntil = Date.now() + 700;
      returnHome();
      return;
    }
    restartIdleTimer();
  }

  /* Connect the interface after its HTML exists, using older-browser event fallbacks. */
  document.addEventListener("DOMContentLoaded", function () {
    idleScreen = document.getElementById("idle-screen");
    homepage = document.getElementById("homepage");
    slideshowImage = document.getElementById("slideshow-image");
    slideshowError = document.getElementById("slideshow-error");

    setupNavigation();
    setupWebsite();
    setupEvents();
    document.getElementById("website-qr-open").addEventListener("click", function () { openModal("website-qr-dialog"); });
    document.getElementById("website-qr-close").addEventListener("click", closeModal);

    /* If a photo fails, keep the return button and remaining slideshow usable. */
    slideshowImage.addEventListener("error", function () {
      slideshowImage.hidden = true;
      slideshowError.hidden = false;
    });

    /* Pointer events cover modern touchscreens; touch and mouse cover older browsers. */
    var activityEvents = window.PointerEvent
      ? ["pointerdown", "pointermove", "click", "keydown", "scroll", "wheel"]
      : ["touchstart", "touchmove", "mousedown", "click", "keydown", "scroll", "wheel"];
    activityEvents.forEach(function (eventName) {
      /* Attach touch handlers to the page element so cancellation blocks follow-up clicks. */
      document.documentElement.addEventListener(eventName, recordActivity, true);
    });

    /* Stop timers in a hidden tab; returning begins a fresh inactivity period. */
    document.addEventListener("visibilitychange", function () {
      window.clearTimeout(idleTimer);
      idleTimer = null;
      if (isIdle) {
        returnHome();
      }
      restartIdleTimer();
    });

    /* Enable entry only after setup; no load event or timeout dismisses welcome. */
    var beginButton = document.getElementById("begin-button");
    beginButton.disabled = false;
    beginButton.textContent = "Touch to Begin";
    beginButton.focus();
  });
}());
