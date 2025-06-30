// admin.js
import { saveAs } from "https://cdn.jsdelivr.net/npm/file-saver@2.0.5/+esm";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell } from "https://cdn.jsdelivr.net/npm/docx@7.7.0/+esm";

const airtableApiKey = "patzHLAT75PrYMFmp.44ea1c1498ed33513020e65b1fdf5e9ec4839804737275780347d53b9c9dbf3f";
const baseId = "appNQL4G3kqHBCJIk";
const tableName = "جدول الرحلات";

async function fetchAllFlights() {
  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
    headers: { Authorization: `Bearer ${airtableApiKey}` }
  });
  const data = await res.json();
  return data.records || [];
}

function generateAdminCard(flight) {
  const fields = flight.fields;
  const div = document.createElement("div");
  div.className = "admin-flight-card";
  div.innerHTML = `
    <p><strong>اسم المنسق:</strong> ${fields["اسم المنسق"] || "-"}</p>
    <p><strong>FLT.NO:</strong> ${fields["FLT.NO"] || "-"}</p>
    <p><strong>Date:</strong> ${fields["Date"] || "-"}</p>
    <p><strong>ملاحظات:</strong> ${fields["NOTES"] || "-"}</p>
    <button onclick="exportFlight('${flight.id}')">📄 تصدير الرحلة</button>
  `;
  return div;
}

async function exportFlight(recordId) {
  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/${recordId}`, {
    headers: { Authorization: `Bearer ${airtableApiKey}` }
  });
  const { fields } = await res.json();

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [new TextRun({ text: "تقرير الرحلة", bold: true, size: 28 })],
            alignment: "CENTER"
          }),
          new Table({
            rows: Object.entries(fields).map(([key, value]) =>
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(key)] }),
                  new TableCell({ children: [new Paragraph(value.toString())] })
                ]
              })
            )
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
  const container = document.getElementById("adminFlightsContainer");
  const logoutBtn = document.getElementById("logoutBtn");

  const flights = await fetchAllFlights();
  if (flights.length === 0) {
    container.innerHTML = "<p>لا توجد بيانات رحلات.</p>";
  } else {
    flights.forEach(flight => container.appendChild(generateAdminCard(flight)));
  }

  logoutBtn.onclick = () => {
    localStorage.clear();
    window.location.href = "index.html";
  };
};
