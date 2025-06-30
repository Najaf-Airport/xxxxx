// flights.js (مُحدث)
import { saveAs } from "https://cdn.jsdelivr.net/npm/file-saver@2.0.5/+esm";
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell
} from "https://cdn.jsdelivr.net/npm/docx@7.7.0/+esm";

const airtableApiKey = "patzHLAT75PrYMFmp.44ea1c1498ed33513020e65b1fdf5e9ec4839804737275780347d53b9c9dbf3f";
const baseId = "appNQL4G3kqHBCJIk";
const tableName = "جدول الرحلات";
const username = localStorage.getItem("username");

async function fetchUserFlights() {
  const url = `https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula=${encodeURIComponent(`{اسم المنسق} = '${username}'`)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${airtableApiKey}` }
  });
  const data = await res.json();
  return data.records || [];
}

function generateCard(flight) {
  const f = flight.fields;
  const div = document.createElement("div");
  div.className = "flight-card";
  div.innerHTML = `
    <p><strong>FLT.NO:</strong> ${f["FLT.NO"] || "-"}</p>
    <p><strong>تاريخ:</strong> ${f["Date"] || "-"}</p>
    <p><strong>Time on Chocks:</strong> ${f["Time on Chocks"] || "-"}</p>
    <p><strong>Time open Door:</strong> ${f["Time open Door"] || "-"}</p>
    <p><strong>Time Start Cleaning:</strong> ${f["Time Start Cleaning"] || "-"}</p>
    <p><strong>Time complete cleaning:</strong> ${f["Time complete cleaning"] || "-"}</p>
    <p><strong>Time ready boarding:</strong> ${f["Time ready boarding"] || "-"}</p>
    <p><strong>Time start boarding:</strong> ${f["Time start boarding"] || "-"}</p>
    <p><strong>Boarding Complete:</strong> ${f["Boarding Complete"] || "-"}</p>
    <p><strong>Time Close Door:</strong> ${f["Time Close Door"] || "-"}</p>
    <p><strong>Time off Chocks:</strong> ${f["Time off Chocks"] || "-"}</p>
    <p><strong>ملاحظات:</strong> ${f["NOTES"] || "-"}</p>
    <p><strong>اسم المنسق:</strong> ${f["اسم المنسق"] || "-"}</p>
    <button onclick="exportFlight('${flight.id}')">📄 تصدير</button>
  `;
  return div;
}

async function exportFlight(recordId) {
  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/${recordId}`, {
    headers: { Authorization: `Bearer ${airtableApiKey}` }
  });
  const { fields } = await res.json();

  const fieldNames = [
    "Date", "FLT.NO", "Time on Chocks", "Time open Door", "Time Start Cleaning",
    "Time complete cleaning", "Time ready boarding", "Time start boarding",
    "Boarding Complete", "Time Close Door", "Time off Chocks", "NOTES", "اسم المنسق"
  ];

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [new TextRun({ text: "تقرير الرحلة", bold: true, size: 28 })],
            alignment: "CENTER"
          }),
          new Table({
            rows: fieldNames.map(field => new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: field })] }),
                new TableCell({ children: [new Paragraph({ text: fields[field] || "-" })] })
              ]
            }))
          })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `رحلة-${fields["FLT.NO"] || "بدون-رقم"}.docx`);
}

window.exportFlight = exportFlight;

window.onload = async () => {
  const container = document.getElementById("saved-flights");
  const logoutBtn = document.getElementById("logoutBtn");

  const flights = await fetchUserFlights();
  if (flights.length === 0) {
    container.innerHTML = "<p>لا توجد رحلات مسجلة.</p>";
  } else {
    flights.forEach(flight => container.appendChild(generateCard(flight)));
  }

  logoutBtn.onclick = () => {
    localStorage.clear();
    window.location.href = "index.html";
  };
};
