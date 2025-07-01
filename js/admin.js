// admin.js
import { saveAs } from "https://cdn.jsdelivr.net/npm/file-saver@2.0.5/+esm";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell
} from "https://cdn.jsdelivr.net/npm/docx@7.7.0/+esm";

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

function generateCard(flight) {
  const f = flight.fields;
  const div = document.createElement("div");
  div.className = "admin-flight-card";
  div.innerHTML = `
    <p><strong>اسم المنسق:</strong> ${f["اسم المنسق"] || "-"}</p>
    <p><strong>FLT.NO:</strong> ${f["FLT.NO"] || "-"}</p>
    <p><strong>Date:</strong> ${f["Date"] || "-"}</p>
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
    <button onclick="exportFlight('${flight.id}')">📄 تصدير</button>
  `;
  return div;
}

async function exportFlight(recordId) {
  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/${recordId}`, {
    headers: { Authorization: `Bearer ${airtableApiKey}` }
  });
  const { fields } = await res.json();

  const rows = Object.entries(fields).map(([key, value]) =>
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph(key)] }),
        new TableCell({ children: [new Paragraph(value.toString())] })
      ]
    })
  );

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            alignment: "CENTER",
            children: [new TextRun({ text: "تقرير الرحلة", bold: true, size: 28 })]
          }),
          new Table({ rows })
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
  const userFilter = document.getElementById("userFilter");

  const flights = await fetchAllFlights();

  const users = [...new Set(flights.map(f => f.fields["اسم المنسق"]).filter(Boolean))];
  users.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    userFilter.appendChild(opt);
  });

  function renderFiltered(name = "") {
    container.innerHTML = "";
    const filtered = name ? flights.filter(f => f.fields["اسم المنسق"] === name) : flights;
    if (filtered.length === 0) {
      container.innerHTML = "<p>لا توجد رحلات.</p>";
    } else {
      filtered.forEach(flight => container.appendChild(generateCard(flight)));
    }
  }

  renderFiltered();

  userFilter.onchange = () => {
    renderFiltered(userFilter.value);
  };

  logoutBtn.onclick = () => {
    localStorage.clear();
    window.location.href = "index.html";
  };
};
