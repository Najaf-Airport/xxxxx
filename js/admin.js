// ✅ admin.js (للمشرف)
import { saveAs } from "https://cdn.jsdelivr.net/npm/file-saver@2.0.5/+esm";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType
} from "https://cdn.jsdelivr.net/npm/docx@8.0.0/+esm";

const airtableApiKey = "patzHLAT75PrYMFmp.44ea1c1498ed33513020e65b1fdf5e9ec4839804737275780347d53b9c9dbf3f";
const baseId = "appNQL4G3kqHBCJIk";
const tableName = "جدول الرحلات";

async function fetchAllFlights() {
  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
    headers: { Authorization: `Bearer ${airtableApiKey}` }
  });
  const data = await res.json();
  return data.records;
}

function generateAdminCard(flight) {
  const fields = flight.fields;
  const div = document.createElement("div");
  div.className = "admin-flight-card";
  div.innerHTML = `
    <p><strong>اسم المنسق:</strong> ${fields["اسم المنسق"] || "-"}</p>
    <p><strong>FLT.NO:</strong> ${fields["FLT.NO"] || "-"}</p>
    <p><strong>Time on Chocks:</strong> ${fields["Time on Chocks"] || "-"}</p>
    <p><strong>Time open Door:</strong> ${fields["Time open Door"] || "-"}</p>
    <p><strong>Time Start Cleaning:</strong> ${fields["Time Start Cleaning"] || "-"}</p>
    <p><strong>Time complete cleaning:</strong> ${fields["Time complete cleaning"] || "-"}</p>
    <p><strong>Time ready boarding:</strong> ${fields["Time ready boarding"] || "-"}</p>
    <p><strong>Time start boarding:</strong> ${fields["Time start boarding"] || "-"}</p>
    <p><strong>Boarding Complete:</strong> ${fields["Boarding Complete"] || "-"}</p>
    <p><strong>Time Close Door:</strong> ${fields["Time Close Door"] || "-"}</p>
    <p><strong>Time off Chocks:</strong> ${fields["Time off Chocks"] || "-"}</p>
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
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Najaf International Airport", bold: true, size: 32 })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Airside Operations Dept", italics: true, size: 26 })
            ]
          }),
          new Paragraph({ text: " " }),
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({ width: { size: 100, type: WidthType.PERCENTAGE }, children: [new Paragraph("FLT.NO")] }),
                  new TableCell({ width: { size: 100, type: WidthType.PERCENTAGE }, children: [new Paragraph(fields["FLT.NO"] || "-")] })
                ]
              }),
              ...Object.entries(fields).filter(([k, v]) => k !== "FLT.NO").map(([key, value]) =>
                new TableRow({
                  children: [
                    new TableCell({ width: { size: 100, type: WidthType.PERCENTAGE }, children: [new Paragraph(key)] }),
                    new TableCell({ width: { size: 100, type: WidthType.PERCENTAGE }, children: [new Paragraph(value.toString())] })
                  ]
                })
              )
            ]
          }),
          new Paragraph({ text: " " }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({ text: `اسم المنسق: ${fields["اسم المنسق"] || "-"}`, bold: true })
            ]
          })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `Flight_${fields["FLT.NO"] || "NoNumber"}.docx`;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

window.exportFlight = exportFlight;

window.onload = async () => {
  const container = document.getElementById("adminFlightsContainer");
  const logoutBtn = document.getElementById("logoutBtn");
  const flights = await fetchAllFlights();
  flights.forEach(flight => container.appendChild(generateAdminCard(flight)));

  logoutBtn.onclick = () => {
    localStorage.clear();
    window.location.href = "index.html";
  };
};
