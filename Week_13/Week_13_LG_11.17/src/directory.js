/* Interactive Ka Lama building directory: digital floor maps, a room keypad, and highlighted locations.
   The maps are drawn as vector graphics from the data below, so they stay sharp at any screen size.
   Other scripts use window.KioskDirectory to search places and show one on the map. */
(function () {
  "use strict";

  /* Floor this kiosk stands on; the directory opens here. Set to 2 for the 2nd-floor kiosk. */
  var HOME_FLOOR = 1;

  /* Every shape below is positioned on this drawing area: [left, top, width, height]. */
  var MAP_WIDTH = 740;
  var MAP_HEIGHT = 520;
  var SVG_NS = "http://www.w3.org/2000/svg";

  var floors = {
    1: { name: "1st floor", label: "Ka Lama 1st floor map" },
    2: { name: "2nd floor", label: "Ka Lama 2nd floor map" }
  };

  /* The walkway between the wings, then the two wings, drawn behind the rooms. */
  var footprint = [
    [340, 206, 60, 88],
    [12, 127, 348, 386],
    [382, 4, 346, 374]
  ];

  /* Build a row or column of equal rooms, such as offices 130 to 135. */
  function series(ids, floor, x, y, w, h, direction) {
    return ids.map(function (id, index) {
      return {
        id: String(id),
        floor: floor,
        box: direction === "down" ? [x, y + index * h, w, h] : [x + index * w, y, w, h]
      };
    });
  }

  /* Room layout recreated from the Ka Lama floor plans. Room numbers come from those plans;
     the map is a simplified diagram and is not to scale. To move or resize a room, edit its box. */
  var rooms = [].concat(
    /* 1st floor, west wing */
    series([124, 123, 122, 121, 120, 119, 118, 117], 1, 20, 135, 58, 40, "down"),
    series([125, 126], 1, 98, 135, 60, 43, "down"),
    [
      { id: "127", floor: 1, box: [98, 221, 60, 44] },
      { id: "107", floor: 1, box: [158, 135, 94, 130] },
      { id: "109", floor: 1, box: [98, 300, 94, 132] },
      { id: "108", floor: 1, box: [192, 300, 96, 132] },
      { id: "106", floor: 1, box: [288, 300, 64, 96] },
      { id: "110", floor: 1, box: [288, 396, 64, 36] }
    ],
    series([116, 115, 114, 113, 112, 111], 1, 112, 461, 40, 44, "across"),
    /* 1st floor, east wing */
    series([130, 131, 132, 133, 134, 135], 1, 390, 12, 40, 44, "across"),
    [
      { id: "103A", floor: 1, box: [652, 56, 68, 24] },
      { id: "101", floor: 1, box: [390, 80, 72, 120], labelAt: [426, 118] },
      { id: "137", floor: 1, box: [426, 162, 36, 38] },
      { id: "A", floor: 1, box: [462, 80, 52, 40] },
      { id: "105", floor: 1, box: [462, 124, 52, 76] },
      { id: "103", floor: 1, box: [522, 80, 198, 120] },
      { id: "102", floor: 1, box: [448, 242, 76, 128] },
      { id: "104A", floor: 1, box: [524, 242, 118, 128] },
      { id: "104B", floor: 1, box: [642, 242, 78, 128] }
    ],
    /* 2nd floor, west wing */
    [
      { id: "209", floor: 2, box: [20, 135, 72, 130] },
      { id: "207", floor: 2, box: [92, 135, 188, 130] },
      { id: "208", floor: 2, box: [92, 300, 128, 132] },
      { id: "206", floor: 2, box: [226, 300, 126, 132] }
    ],
    series([221, 220, 219, 218, 217], 2, 20, 265, 52, 38, "down"),
    series([216, 215, 214, 213, 212, 211], 2, 112, 461, 40, 44, "across"),
    /* 2nd floor, east wing */
    series([230, 231, 232, 233, 234, 235], 2, 392, 12, 40, 44, "across"),
    [
      { id: "201", floor: 2, box: [390, 80, 146, 120] },
      { id: "203", floor: 2, box: [544, 80, 176, 120], labelAt: [644, 140] },
      { id: "203A", floor: 2, box: [544, 106, 24, 64], vertical: true },
      { id: "202", floor: 2, box: [448, 242, 138, 128] },
      { id: "204", floor: 2, box: [590, 242, 130, 128] }
    ]
  );

  /* Shared building features. Each entry can cover several shapes on a floor. */
  var facilities = [
    { id: "restrooms-1", kind: "restrooms", floor: 1, label: "Restrooms", keywords: "restroom restrooms bathroom bathrooms toilet men women",
      shapes: [{ box: [252, 135, 100, 63], text: "Men" }, { box: [252, 202, 100, 63], text: "Women" }] },
    { id: "restrooms-2", kind: "restrooms", floor: 2, label: "Restrooms", keywords: "restroom restrooms bathroom bathrooms toilet men women",
      shapes: [{ box: [280, 135, 54, 63], text: "Men" }, { box: [280, 202, 54, 63], text: "Women" }] },
    { id: "elevator-1", kind: "elevator", floor: 1, label: "Elevator", keywords: "elevator lift accessible wheelchair",
      shapes: [{ box: [390, 244, 40, 38] }] },
    { id: "elevator-2", kind: "elevator", floor: 2, label: "Elevator", keywords: "elevator lift accessible wheelchair",
      shapes: [{ box: [390, 244, 40, 38] }] },
    { id: "stairs-1", kind: "stairs", floor: 1, label: "Stairs", keywords: "stairs stairway stairwell steps",
      shapes: [{ box: [396, 296, 50, 74] }, { box: [652, 12, 68, 44] }, { box: [20, 461, 78, 44] }] },
    { id: "stairs-2", kind: "stairs", floor: 2, label: "Stairs", keywords: "stairs stairway stairwell steps",
      shapes: [{ box: [396, 296, 50, 74] }, { box: [652, 12, 68, 44] }, { box: [20, 461, 72, 44] }] }
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

  /* Small helper for creating map shapes. */
  function svg(name, attributes, parent) {
    var node = document.createElementNS(SVG_NS, name);
    Object.keys(attributes || {}).forEach(function (key) { node.setAttribute(key, attributes[key]); });
    if (parent) { parent.appendChild(node); }
    return node;
  }

  function rect(box, className, parent, radius) {
    return svg("rect", { x: box[0], y: box[1], width: box[2], height: box[3], rx: radius || 3, "class": className }, parent);
  }

  function label(text, x, y, className, parent) {
    var node = svg("text", { x: x, y: y, "class": className, "text-anchor": "middle", "dominant-baseline": "central" }, parent);
    node.textContent = text;
    return node;
  }

  /* Draw one tappable room with its number centered inside. */
  function drawRoom(room, layer) {
    var box = room.box;
    var group = svg("g", { "class": "map-room", role: "button", tabindex: "-1", "aria-label": roomLabel(room), "data-room": room.id }, layer);
    rect(box, "map-shape", group);
    var small = Math.min(box[2], box[3]) < 50;
    var at = room.labelAt || [box[0] + box[2] / 2, box[1] + box[3] / 2];
    var text = label(room.id, at[0], at[1], small ? "map-label map-label-small" : "map-label", group);
    if (room.vertical) { text.setAttribute("transform", "rotate(-90 " + at[0] + " " + at[1] + ")"); }
    group.addEventListener("click", function () { showRoom(room.id); });
  }

  /* Draw restrooms, the elevator, or stairs with a simple symbol. */
  function drawFacility(facility, layer) {
    facility.shapes.forEach(function (shape) {
      var box = shape.box;
      var centerX = box[0] + box[2] / 2;
      var centerY = box[1] + box[3] / 2;
      var group = svg("g", { "class": "map-facility map-" + facility.kind, role: "button", tabindex: "-1",
        "aria-label": facility.label + (shape.text ? ", " + shape.text : ""), "data-facility": facility.id }, layer);
      rect(box, "map-shape", group);
      if (facility.kind === "restrooms") {
        /* Narrow restroom shapes get slightly smaller text so the word stays inside. */
        label(shape.text, centerX, centerY, box[2] < 70 ? "map-label map-label-tiny" : "map-label map-label-small", group);
      } else if (facility.kind === "elevator") {
        /* Up and down arrows. */
        svg("path", { "class": "map-symbol", d: "M" + (centerX - 8) + " " + (centerY - 3) + "l5 -7l5 7z M" + (centerX - 2) + " " + (centerY + 3) + "l5 7l5 -7z" }, group);
      } else {
        /* Evenly spaced steps across the longer side. */
        var horizontal = box[2] >= box[3];
        var count = 6;
        for (var step = 1; step < count; step += 1) {
          if (horizontal) {
            var x = box[0] + (box[2] / count) * step;
            svg("line", { "class": "map-step", x1: x, y1: box[1] + 6, x2: x, y2: box[1] + box[3] - 6 }, group);
          } else {
            var y = box[1] + (box[3] / count) * step;
            svg("line", { "class": "map-step", x1: box[0] + 6, y1: y, x2: box[0] + box[2] - 6, y2: y }, group);
          }
        }
      }
      group.addEventListener("click", function () { showFacility(facility.kind, facility.floor); });
    });
  }

  /* Draw the chosen floor: building outline first, then places, then rooms. */
  function renderFloor(floor) {
    currentFloor = floor;
    elements.floorButtons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(Number(button.getAttribute("data-floor")) === floor));
    });
    elements.map.textContent = "";
    var drawing = svg("svg", { viewBox: "0 0 " + MAP_WIDTH + " " + MAP_HEIGHT, role: "group", "aria-label": floors[floor].label, "class": "floor-map" }, elements.map);
    footprint.forEach(function (box) { rect(box, "map-floor", drawing, 10); });
    var caption = label("Ka Lama · " + floors[floor].name, 560, 448, "map-caption", drawing);
    caption.setAttribute("aria-hidden", "true");
    facilities.forEach(function (facility) { if (facility.floor === floor) { drawFacility(facility, drawing); } });
    rooms.forEach(function (room) { if (room.floor === floor) { drawRoom(room, drawing); } });
    drawSelection();
  }

  /* Highlight the selected room or place if it is on the visible floor. */
  function drawSelection() {
    elements.map.querySelectorAll(".is-selected").forEach(function (node) { node.classList.remove("is-selected"); });
    if (!selected || selected.floor !== currentFloor) { return; }
    var selector = selected.type === "room"
      ? "[data-room='" + selected.item.id + "']"
      : "[data-facility='" + selected.item.id + "']";
    elements.map.querySelectorAll(selector).forEach(function (node) {
      node.classList.add("is-selected");
      /* Selected shapes are drawn last so their outline is never covered by a neighbor. */
      node.parentNode.appendChild(node);
    });
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
    setStatus(roomLabel(room) + " is on the " + floors[room.floor].name + ", highlighted on the map.");
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
    var count = facility.shapes.length;
    setStatus(facility.label + " on the " + floors[facility.floor].name + (count > 1 ? " are highlighted in " + count + " places." : " is highlighted on the map."));
    return true;
  }

  /* List rooms that start with the digits typed so far; select an exact match. */
  function updateEntry() {
    elements.display.textContent = entry;
    elements.matches.textContent = "";
    if (!entry) {
      setStatus("Type a room number, tap the map, or choose a place.");
      return;
    }
    var exact = findRoom(entry);
    if (exact) { showRoom(exact.id); return; }
    var partial = rooms.filter(function (room) { return room.id.indexOf(entry) === 0; });
    if (!partial.length) {
      setStatus("There is no room " + entry + " in Ka Lama. Check the number and try again.");
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
    if (!elements.map) { return; }
    elements.matches.textContent = "";
    renderFloor(HOME_FLOOR);
    updatePlaceButtons();
    updateEntry();
  }

  /* Build the keypad and connect controls once the page's HTML exists. */
  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("directory-app");
    if (!root) { return; }
    elements.map = document.getElementById("directory-map");
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
