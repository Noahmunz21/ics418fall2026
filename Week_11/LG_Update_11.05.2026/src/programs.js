/* Build the Programs section from the data below so content can grow without new HTML. */
(function () {
  "use strict";

  /*
    To add a program, copy one { ... } entry inside a department's "programs" list
    and change its text. To add a department, copy a whole department entry.
    A department with an empty "programs" list shows its "emptyMessage" instead.
    Draft Business content is summarized from maui.hawaii.edu and still needs review.
  */
  var departments = [
    {
      name: "Business Department",
      programs: [
        {
          name: "Business Administration",
          credentials: "Certificates of Competence · Certificate of Achievement · Associate in Applied Science (AAS)",
          description: "Build skills in entrepreneurship, accounting, and management to grow a business career or start your own small business. The AAS can transfer to bachelor’s programs at UHMC or UH West Oʻahu.",
          highlightLabel: "Career paths:",
          highlight: "business owner, manager, retail, sales, and marketing"
        },
        {
          name: "Hospitality & Tourism",
          credentials: "Associate in Applied Science (AAS)",
          description: "Prepare for leadership roles in hospitality, one of Hawaiʻi’s largest industries.",
          highlightLabel: "Highlight:",
          highlight: "accredited by the Accreditation Commission for Programs in Hospitality Administration (ACPHA)"
        },
        {
          name: "Accounting",
          credentials: "Associate in Applied Science (AAS) · Certificate of Achievement (CA)",
          description: "Every business needs accounting. Train for careers with small businesses, hotels, service industries, and other organizations on Maui and beyond.",
          highlightLabel: "Next step:",
          highlight: "with further education, graduates can advance to accountant or auditor roles"
        },
        {
          name: "Applied Business & Information Technology (ABIT)",
          credentials: "Bachelor of Applied Science (BAS)",
          description: "A hybrid bachelor’s degree combining business, entrepreneurship, and technology skills, with online and hybrid options.",
          highlightLabel: "Also offered:",
          highlight: "certificates in data science and cybersecurity"
        }
      ]
    },
    {
      name: "Other UHMC Programs",
      programs: [],
      emptyMessage: "Under development. Information about more UHMC programs will be added here."
    }
  ];

  /* Copy the card blueprint and fill it with one program's text. */
  function buildCard(template, program) {
    var card = template.content.cloneNode(true);
    /* textContent displays data as plain text, so it can never run as code. */
    card.querySelector(".program-name").textContent = program.name;
    card.querySelector(".program-credentials").textContent = program.credentials;
    card.querySelector(".program-description").textContent = program.description;
    if (program.highlight) {
      card.querySelector(".highlight-label").textContent = program.highlightLabel;
      card.querySelector(".highlight-text").textContent = program.highlight;
    } else {
      /* Drop the highlight line when a program does not have one. */
      var highlightLine = card.querySelector(".program-highlight");
      highlightLine.parentNode.removeChild(highlightLine);
    }
    return card;
  }

  /* Create one heading and card list per department after the page's HTML exists. */
  document.addEventListener("DOMContentLoaded", function () {
    var container = document.getElementById("program-groups");
    var template = document.getElementById("program-card-template");
    if (!container || !template) {
      return;
    }

    departments.forEach(function (department) {
      var group = document.createElement("section");
      group.className = "program-group";

      var heading = document.createElement("h3");
      heading.textContent = department.name;
      group.appendChild(heading);

      if (department.programs.length === 0) {
        var notice = document.createElement("p");
        notice.className = "program-group-empty";
        notice.textContent = department.emptyMessage || "Information coming soon.";
        group.appendChild(notice);
      } else {
        var list = document.createElement("div");
        list.className = "program-list";
        department.programs.forEach(function (program) {
          list.appendChild(buildCard(template, program));
        });
        group.appendChild(list);
      }

      container.appendChild(group);
    });
  });
}());
