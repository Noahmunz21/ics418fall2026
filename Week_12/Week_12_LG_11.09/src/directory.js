/* Interactive Ka Lama building directory: floor maps, a room keypad, and highlighted locations.
   Other scripts use window.KioskDirectory to search places and show one on the map. */
(function () {
  "use strict";

  /* Floor this kiosk stands on; the directory opens here. Set to 2 for the 2nd-floor kiosk. */
  var HOME_FLOOR = 1;

  /* Floor plan images and display names. */
  var floors = {
    1: { name: "1st floor", image: "assets/Kalama1stfloor.png", alt: "Ka Lama 1st floor plan" },
    2: { name: "2nd floor", image: "assets/Kalama2ndfloor.png", alt: "Ka Lama 2nd floor plan" }
  };

  /* Room positions are percentages of each floor plan image (left, top), measured from the drawings.
     Room numbers come from the floor plans; room names and uses still need verification. */
  var rooms = [
    { id: "101", floor: 1, x: 55.4, y: 23.5 }, { id: "102", floor: 1, x: 63.6, y: 57.8 },
    { id: "103", floor: 1, x: 79.5, y: 25.0 }, { id: "103A", floor: 1, x: 90.1, y: 13.1 },
    { id: "104A", floor: 1, x: 76.8, y: 57.8 }, { id: "104B", floor: 1, x: 90.1, y: 56.8 },
    { id: "105", floor: 1, x: 64.9, y: 31.8 }, { id: "106", floor: 1, x: 41.1, y: 67.1 },
    { id: "107", floor: 1, x: 26.5, y: 38.2 }, { id: "108", floor: 1, x: 30.9, y: 69.0 },
    { id: "109", floor: 1, x: 17.9, y: 68.4 }, { id: "110", floor: 1, x: 42.1, y: 79.0 },
    { id: "111", floor: 1, x: 43.7, y: 92.1 }, { id: "112", floor: 1, x: 39.1, y: 92.1 },
    { id: "113", floor: 1, x: 34.7, y: 92.1 }, { id: "114", floor: 1, x: 28.1, y: 92.1 },
    { id: "115", floor: 1, x: 23.8, y: 92.1 }, { id: "116", floor: 1, x: 17.9, y: 92.1 },
    { id: "117", floor: 1, x: 6.0, y: 83.4 }, { id: "118", floor: 1, x: 6.0, y: 75.7 },
    { id: "119", floor: 1, x: 6.0, y: 68.4 }, { id: "120", floor: 1, x: 6.0, y: 60.3 },
    { id: "121", floor: 1, x: 6.0, y: 52.4 }, { id: "122", floor: 1, x: 6.0, y: 44.9 },
    { id: "123", floor: 1, x: 6.0, y: 38.0 }, { id: "124", floor: 1, x: 6.0, y: 30.4 },
    { id: "125", floor: 1, x: 16.2, y: 30.4 }, { id: "126", floor: 1, x: 16.2, y: 38.5 },
    { id: "127", floor: 1, x: 16.2, y: 45.7 }, { id: "130", floor: 1, x: 54.3, y: 6.2 },
    { id: "131", floor: 1, x: 60.0, y: 6.2 }, { id: "132", floor: 1, x: 65.3, y: 6.2 },
    { id: "133", floor: 1, x: 70.2, y: 6.2 }, { id: "134", floor: 1, x: 75.2, y: 6.2 },
    { id: "135", floor: 1, x: 80.3, y: 6.2 }, { id: "137", floor: 1, x: 57.9, y: 35.1 },
    { id: "A", floor: 1, x: 63.6, y: 18.7 },
    { id: "201", floor: 2, x: 63.8, y: 26.9 }, { id: "202", floor: 2, x: 70.1, y: 56.5 },
    { id: "203", floor: 2, x: 84.9, y: 25.0 }, { id: "203A", floor: 2, x: 75.1, y: 25.9 },
    { id: "204", floor: 2, x: 86.2, y: 55.6 }, { id: "206", floor: 2, x: 39.7, y: 66.7 },
    { id: "207", floor: 2, x: 27.1, y: 37.0 }, { id: "208", floor: 2, x: 21.8, y: 67.6 },
    { id: "209", floor: 2, x: 9.3, y: 36.1 }, { id: "211", floor: 2, x: 46.0, y: 89.4 },
    { id: "212", floor: 2, x: 41.0, y: 89.4 }, { id: "213", floor: 2, x: 35.4, y: 89.4 },
    { id: "214", floor: 2, x: 30.7, y: 89.4 }, { id: "215", floor: 2, x: 23.8, y: 89.4 },
    { id: "216", floor: 2, x: 19.6, y: 89.4 }, { id: "217", floor: 2, x: 7.9, y: 80.0 },
    { id: "218", floor: 2, x: 7.9, y: 73.1 }, { id: "219", floor: 2, x: 7.9, y: 65.7 },
    { id: "220", floor: 2, x: 7.9, y: 59.3 }, { id: "221", floor: 2, x: 7.9, y: 50.4 },
    { id: "230", floor: 2, x: 57.1, y: 7.8 }, { id: "231", floor: 2, x: 61.9, y: 7.8 },
    { id: "232", floor: 2, x: 66.8, y: 7.8 }, { id: "233", floor: 2, x: 72.5, y: 7.8 },
    { id: "234", floor: 2, x: 78.0, y: 7.8 }, { id: "235", floor: 2, x: 83.3, y: 7.8 }
  ];

  /* Shared building features; one entry can mark several spots on a floor. */
  var facilities = [
    { id: "restrooms-1", kind: "restrooms", floor: 1, label: "Restrooms", keywords: "restroom restrooms bathroom bathrooms toilet men women", points: [[38.4, 32.8], [38.4, 46.2]] },
    { id: "restrooms-2", kind: "restrooms", floor: 2, label: "Restrooms", keywords: "restroom restrooms bathroom bathrooms toilet men women", points: [[42.6, 31.9], [42.6, 43.0]] },
    { id: "elevator-1", kind: "elevator", floor: 1, label: "Elevator", keywords: "elevator lift accessible wheelchair", points: [[53.6, 51.1]] },
    { id: "elevator-2", kind: "elevator", floor: 2, label: "Elevator", keywords: "elevator lift accessible wheelchair", points: [[56.2, 49.1]] },
    { id: "stairs-1", kind: "stairs", floor: 1, label: "Stairs", keywords: "stairs stairway stairwell steps", points: [[54.3, 63.6], [90.7, 7.7], [7.9, 94.0]] },
    { id: "stairs-2", kind: "stairs", floor: 2, label: "Stairs", keywords: "stairs stairway stairwell steps", points: [[58.2, 60.2], [91.9, 8.3], [9.9, 90.7]] }
  ];

  /* Keypad keys in display order; letters cover rooms such as 103A and 104B. */
  var keypadKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "0", "B"];
  var MAX_ENTRY = 4;

  var currentFloor = HOME_FLOOR;
  var entry = "";
  var selected = null;
  var elements = {};

  function roomLabel(room) {
    return "Room " + room.id;
  }

  function findRoom(id) {
    var wanted = String(id).toUpperCase();
    return rooms.filter(function (room) { return room.id === wanted; })[0] || null;
  }

  function findFacility(id) {
    return facilities.filter(function (facility) { return facility.id === id; })[0] || null;
  }

  /* Draw one marker on the map at a percentage position. */
  function addMarker(x, y, text) {
    var marker = document.createElement("span");
    marker.className = "map-marker";
    marker.style.left = x + "%";
    marker.style.top = y + "%";
    if (text) {
      var tag = document.createElement("span");
      tag.className = "map-marker-tag";
      tag.textContent = text;
      marker.appendChild(tag);
    }
    elements.markers.appendChild(marker);
  }

  /* Show the chosen floor's image and its tappable room spots. */
  function renderFloor(floor) {
    currentFloor = floor;
    elements.image.src = floors[floor].image;
    elements.image.alt = floors[floor].alt;
    elements.floorButtons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(Number(button.getAttribute("data-floor")) === floor));
    });
    elements.hotspots.textContent = "";
    rooms.forEach(function (room) {
      if (room.floor !== floor) { return; }
      var spot = document.createElement("button");
      spot.type = "button";
      spot.className = "map-hotspot";
      /* Keyboard users reach rooms through the keypad and list instead of every map spot. */
      spot.tabIndex = -1;
      spot.style.left = room.x + "%";
      spot.style.top = room.y + "%";
      spot.setAttribute("aria-label", roomLabel(room));
      spot.addEventListener("click", function () { showRoom(room.id); });
      elements.hotspots.appendChild(spot);
    });
    drawSelection();
  }

  /* Mark the selected room or facility if it is on the visible floor. */
  function drawSelection() {
    elements.markers.textContent = "";
    if (!selected || selected.floor !== currentFloor) { return; }
    if (selected.type === "room") {
      addMarker(selected.item.x, selected.item.y, selected.item.id);
    } else {
      selected.item.points.forEach(function (point) { addMarker(point[0], point[1], ""); });
    }
  }

  function setStatus(text) {
    elements.status.textContent = text;
  }

  function updatePlaceButtons() {
    elements.placeButtons.forEach(function (button) {
      var active = selected && selected.type === "facility" && selected.item.kind === button.getAttribute("data-place");
      button.setAttribute("aria-pressed", String(Boolean(active)));
    });
  }

  /* Select a room, switch to its floor, and describe where it is. */
  function showRoom(id) {
    var room = findRoom(id);
    if (!room) { return false; }
    selected = { type: "room", item: room, floor: room.floor };
    entry = room.id;
    elements.display.textContent = entry;
    elements.matches.textContent = "";
    renderFloor(room.floor);
    updatePlaceButtons();
    setStatus(roomLabel(room) + " is on the " + floors[room.floor].name + ". Look for the pulsing marker.");
    return true;
  }

  /* Select restrooms, elevator, or stairs on a given floor (current floor by default). */
  function showFacility(kind, floor) {
    var facility = findFacility(kind + "-" + (floor || currentFloor));
    if (!facility) { return false; }
    selected = { type: "facility", item: facility, floor: facility.floor };
    entry = "";
    elements.display.textContent = "";
    elements.matches.textContent = "";
    renderFloor(facility.floor);
    updatePlaceButtons();
    var count = facility.points.length;
    setStatus(facility.label + " on the " + floors[facility.floor].name + (count > 1 ? " are marked at " + count + " spots." : " is marked on the map."));
    return true;
  }

  /* List rooms that start with the digits typed so far; select an exact match. */
  function updateEntry() {
    elements.display.textContent = entry;
    elements.matches.textContent = "";
    if (!entry) {
      setStatus("Enter a room number, or choose a place below.");
      return;
    }
    var exact = findRoom(entry);
    if (exact) { showRoom(exact.id); return; }
    var partial = rooms.filter(function (room) { return room.id.indexOf(entry) === 0; });
    if (!partial.length) {
      setStatus("There is no room " + entry + " on these floor plans. Check the number and try again.");
      return;
    }
    setStatus("Keep typing, or choose a room.");
    partial.slice(0, 8).forEach(function (room) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "room-match";
      button.textContent = roomLabel(room) + " (" + floors[room.floor].name + ")";
      button.addEventListener("click", function () { showRoom(room.id); });
      elements.matches.appendChild(button);
    });
  }

  function pressKey(key) {
    if (selected && selected.type === "room") { entry = ""; selected = null; drawSelection(); }
    if (entry.length >= MAX_ENTRY) { return; }
    entry += key;
    updateEntry();
  }

  /* Return the directory to its starting state for the next visitor. */
  function reset() {
    entry = "";
    selected = null;
    if (!elements.image) { return; }
    elements.matches.textContent = "";
    renderFloor(HOME_FLOOR);
    updatePlaceButtons();
    updateEntry();
  }

  /* Build the keypad and connect controls once the page's HTML exists. */
  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("directory-app");
    if (!root) { return; }
    elements.image = document.getElementById("directory-map-image");
    elements.hotspots = document.getElementById("directory-hotspots");
    elements.markers = document.getElementById("directory-markers");
    elements.display = document.getElementById("room-entry");
    elements.matches = document.getElementById("room-matches");
    elements.status = document.getElementById("directory-status");
    elements.floorButtons = Array.prototype.slice.call(root.querySelectorAll("[data-floor]"));
    elements.placeButtons = Array.prototype.slice.call(root.querySelectorAll("[data-place]"));

    var keypad = document.getElementById("room-keypad");
    keypadKeys.forEach(function (key) {
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = key;
      button.setAttribute("aria-label", "Type " + key);
      button.addEventListener("click", function () { pressKey(key); });
      keypad.appendChild(button);
    });

    document.getElementById("room-delete").addEventListener("click", function () {
      if (selected && selected.type === "room") { selected = null; drawSelection(); }
      entry = entry.slice(0, -1);
      updateEntry();
    });
    document.getElementById("room-clear").addEventListener("click", function () {
      selected = null;
      entry = "";
      drawSelection();
      updatePlaceButtons();
      updateEntry();
    });
    elements.floorButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var floor = Number(button.getAttribute("data-floor"));
        /* Keep restrooms, elevator, or stairs selected when switching floors. */
        if (selected && selected.type === "facility") { showFacility(selected.item.kind, floor); }
        else { renderFloor(floor); }
      });
    });
    elements.placeButtons.forEach(function (button) {
      button.addEventListener("click", function () { showFacility(button.getAttribute("data-place")); });
    });
    reset();
  });

  /* Read-only place list and actions for kiosk search. */
  window.KioskDirectory = {
    places: rooms.map(function (room) {
      return { id: room.id, type: "room", label: roomLabel(room), floor: room.floor, floorName: floors[room.floor].name };
    }).concat(facilities.map(function (facility) {
      return { id: facility.id, kind: facility.kind, type: "facility", label: facility.label, floor: facility.floor, floorName: floors[facility.floor].name, keywords: facility.keywords };
    })),
    homeFloor: HOME_FLOOR,
    showRoom: showRoom,
    showFacility: showFacility,
    reset: reset
  };
}());
