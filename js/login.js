const airtableApiKey = "patzHLAT75PrYMFmp.44ea1c1498ed33513020e65b1fdf5e9ec4839804737275780347d53b9c9dbf3f";
const baseId = "appNQL4G3kqHBCJIk";
const tableName = "المستخدمين";

document.addEventListener("DOMContentLoaded", async () => {
  const nameSelect = document.getElementById("userSelect");
  const passwordInput = document.getElementById("passwordInput");
  const loginBtn = document.getElementById("loginBtn");

  async function loadNames() {
    try {
      const res = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`, {
        headers: {
          Authorization: `Bearer ${airtableApiKey}`
        }
      });
      const data = await res.json();
      nameSelect.innerHTML = '<option value="">-- اختر --</option>';
      data.records.forEach(record => {
        const name = record.fields["اسم المنسق"];
        if (name) {
          const option = document.createElement("option");
          option.value = name;
          option.textContent = name;
          nameSelect.appendChild(option);
        }
      });
    } catch (err) {
      alert("فشل تحميل الأسماء");
    }
  }

  loginBtn.addEventListener("click", async () => {
    const selectedName = nameSelect.value;
    const password = passwordInput.value.trim();
    if (!selectedName || !password) return alert("يرجى إدخال جميع الحقول");

    try {
      const res = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?filterByFormula={اسم المنسق}="${selectedName}"`, {
        headers: {
          Authorization: `Bearer ${airtableApiKey}`
        }
      });
      const data = await res.json();
      const record = data.records[0];
      if (!record) return alert("المستخدم غير موجود");

      const userPassword = record.fields["الرمز السري"];
      const userRole = record.fields["الدور"];
      const userName = record.fields["اسم المنسق"];

      if (password !== userPassword) return alert("الرمز السري غير صحيح");

      localStorage.setItem("username", userName);
      localStorage.setItem("role", userRole);

      if (userRole === "مسؤول") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "flights.html";
      }
    } catch (err) {
      alert("فشل تسجيل الدخول");
    }
  });

  loadNames();
});
