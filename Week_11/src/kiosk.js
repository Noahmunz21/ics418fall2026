/* Keep all behavior local to this file without adding names to other scripts. */
(function () {
  "use strict";

  /* Change these two values to adjust the kiosk timings, in milliseconds. */
  var INACTIVITY_DELAY = 60 * 1000;
  var SLIDE_DELAY = 8 * 1000;

  /* Use only the five supplied campus photographs. */
  var slides = [
    { file: "Slideshow Image 1.jpg", description: "UHMC students on campus" },
    { file: "Slideshow Image 2.jpg", description: "UHMC campus sign" },
    { file: "Slideshow Image 3.jpg", description: "UHMC campus building" },
    { file: "Slideshow Image 4.jpg", description: "UHMC graduation photograph" },
    { file: "Slideshow Image 5.jpg", description: "Maui landscape" }
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
