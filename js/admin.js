const API_KEY = "patQBXliPXWDCS60Q.40545a7b3ff6b6ebe3e001088c5ea9ba12e975e3eebfde59b8c132e5c675f0c8";
const BASE_ID = "appNQL4G3kqHBCJIk";
const FLIGHTS_TABLE = "جدول الرحلات";
const FLIGHTS_VIEW = "viwUdTgSNKTh1mMeq";

const username = localStorage.getItem("username");
const role = localStorage.getItem("role");
if (!username || role !== "admin") {
  window.location.href = "index.html";
}

const filterSelect = document.getElementById("filter-user");
const listDiv = document.getElementById("admin-flights-list");

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

async function loadAllFlights() {
  listDiv.innerHTML = "";
  try {
    const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(FLIGHTS_TABLE)}?view=${FLIGHTS_VIEW}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    const data = await res.json();
    
    // بناء قائمة المستخدمين وعدد رحلاتهم
    const counts = {};
    data.records.forEach(r => {
      const n = r.fields["اسم المنسق"];
      counts[n] = (counts[n] || 0) + 1;
    });
    
    // تعبئة Dropdown
    filterSelect.innerHTML = `<option value="">الكل</option>`;
    Object.keys(counts).forEach(n => {
      const o = document.createElement("option");
      o.value = n;
      o.textContent = `${n} (${counts[n]})`;
      filterSelect.appendChild(o);
    });
    
    // ترشيح السجلات
    const sel = filterSelect.value;
    const recs = data.records.filter(r => !sel || r.fields["اسم المنسق"] === sel);
    
    // عرض
    recs.forEach(r => {
      const f = r.fields;
      const el = document.createElement("div");
      el.className = "admin-flight-card";
      el.innerHTML = `
        <h4>${f["اسم المنسق"]} - رحلة ${f["FLT.NO"]||"-"}</h4>
        <p><strong>التاريخ:</strong> ${f["Date"]||"-"}</p>
        <p><strong>ملاحظات:</strong> ${f["NOTES"]||"-"}</p>
      `;
      listDiv.appendChild(el);
    });
    
    // زر تصدير عام
    const exportAll = document.createElement("button");
    exportAll.textContent = "تصدير الكل إلى Word";
    exportAll.onclick = () => exportAdmin(data.records);
    listDiv.prepend(exportAll);
    
  } catch (e) {
    listDiv.innerHTML = "<p>فشل تحميل البيانات.</p>";
    console.error(e);
  }
}

// دالة تصدير المسؤول
function exportAdmin(records) {
  const lines = [`تقارير شعبة تنسيق الطائرات`, ``];
  records.forEach(r => {
    const f = r.fields;
    lines.push(`المنسق: ${f["اسم المنسق"]||"-"}`, `رقم الرحلة: ${f["FLT.NO"]||"-"}`, `التاريخ: ${f["Date"]||"-"}`, `ملاحظات: ${f["NOTES"]||"-"}`, ``);
  });
  const blob = new Blob([lines.join("\n")], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `all-flights.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

window.onload = loadAllFlights;
