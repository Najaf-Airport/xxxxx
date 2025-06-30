// flights.js
import.meta.env;

const API_KEY       = import.meta.env.VITE_AIRTABLE_API_KEY;
const BASE_ID       = import.meta.env.VITE_AIRTABLE_BASE_ID;
const FLIGHTS_TBL   = encodeURIComponent("جدول الرحلات");
const LINKED_FIELD  = "اسم المنسق"; // حقل الربط في جدول الرحلات

const headers = {
  "Authorization": `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

async function fetchFlights() {
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  if (!user || !user.name) {
    alert("رجاءً سجّل الدخول أولاً");
    return [];
  }

  // إذا دور المستخدم admin خلي الفلتر فاضي، وإلا فلتر على اسمه:
  let filterFormula = "";
  if (user.role !== "admin") {
    // صيغة Airtable: {اسم المنسق} = 'الاسم'
    filterFormula = `?filterByFormula=({${LINKED_FIELD}}='${user.name}')`;
  }

  const resp = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${FLIGHTS_TBL}${filterFormula}`,
    { headers }
  );
  const { records } = await resp.json();
  return records.map(r => ({
    id:     r.id,
    fields: r.fields
  }));
}

function renderTable(rows) {
  const tbody = document.querySelector("#flightsTable tbody");
  tbody.innerHTML = "";
  rows.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.fields.Date || ""}</td>
      <td>${r.fields["FLT.NO"] || ""}</td>
      <td>${r.fields["Time on Chocks"] || ""}</td>
      <!-- زد هنا بقية الأعمدة حسب الجدول -->
    `;
    tbody.append(tr);
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  const flights = await fetchFlights();
  renderTable(flights);

  document.getElementById("exportBtn").addEventListener("click", () => {
    // مثال بسيط: تحويل الجدول إلى HTML وفتح نافذة طباعة
    const newWin = window.open("", "", "width=800,height=600");
    newWin.document.write("<h1>تقرير الرحلات</h1>");
    newWin.document.write(document.getElementById("flightsTable").outerHTML);
    newWin.document.close();
    newWin.print();
  });
});