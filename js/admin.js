// admin.js

const airtableApiKey = "patzHLAT75PrYMFmp.44ea1c1498ed33513020e65b1fdf5e9ec4839804737275780347d53b9c9dbf3f";
const baseId = "appNQL4G3kqHBCJIk";
const flightsTable = "جدول الرحلات";
const usersTable = "المستخدمين";

const flightContainer = document.getElementById("flightsContainer");
const logoutBtn = document.getElementById("logoutBtn");

const exportToWord = async (flight) => {
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } = docx;

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Najaf International Airport",
                bold: true,
                size: 28,
              }),
            ],
            alignment: "center",
          }),
          new Paragraph({ text: "Airside Operations Dept", alignment: "right" }),
          new Paragraph({ text: "Aircraft Coordination Unit", alignment: "right" }),
          new Paragraph({ text: " " }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: Object.entries(flight).map(([key, value]) =>
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: key })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: value || "" })],
                  }),
                ],
              })
            ),
          }),
          new Paragraph({ text: " " }),
          new Paragraph({
            children: [
              new TextRun({ text: "اسم المنسق: " + (flight["اسم المنسق"] || ""), bold: true }),
            ],
          }),
          new Paragraph({ text: "ملاحظات: " + (flight["NOTES"] || "") }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `رحلة_${flight["FLT.NO"] || ""}_${flight["Date"] || ""}.docx`;
  saveAs(blob, fileName);
};

async function fetchFlights() {
  try {
    const res = await fetch(`https://api.airtable.com/v0/${baseId}/${flightsTable}?pageSize=100`, {
      headers: { Authorization: `Bearer ${airtableApiKey}` },
    });
    const data = await res.json();
    const records = data.records;

    const grouped = {};
    records.forEach((rec) => {
      const name = rec.fields["اسم المنسق"] || "غير معروف";
      if (!grouped[name]) grouped[name] = [];
      grouped[name].push(rec.fields);
    });

    flightContainer.innerHTML = "";
    for (const name in grouped) {
      const groupDiv = document.createElement("div");
      groupDiv.innerHTML = `<h3>${name} (${grouped[name].length})</h3>`;

      grouped[name].forEach((flight, index) => {
        const card = document.createElement("div");
        card.className = "flight-card";
        card.innerHTML = `
          <p><strong>FLT.NO:</strong> ${flight["FLT.NO"] || ""}</p>
          <p><strong>Date:</strong> ${flight["Date"] || ""}</p>
          <p><strong>NOTES:</strong> ${flight["NOTES"] || ""}</p>
          <button class="export-btn" data-index="${index}" data-name="${name}">تصدير إلى Word</button>
        `;
        groupDiv.appendChild(card);
      });

      flightContainer.appendChild(groupDiv);
    }

    document.querySelectorAll(".export-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const name = e.target.getAttribute("data-name");
        const index = e.target.getAttribute("data-index");
        exportToWord(grouped[name][index]);
      });
    });
  } catch (err) {
    alert("فشل تحميل الرحلات");
  }
}

logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
});

document.addEventListener("DOMContentLoaded", fetchFlights);
