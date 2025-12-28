import { sb } from "../../lib/supabase";
import { importStudentsToSupabase } from "./importer";

console.log("🚀 Dashboard.ts işə düşdü!");

// 1. YADDAŞI OXUYURUQ
const adminStr = localStorage.getItem("admin_user");
const schoolId = localStorage.getItem("school_id");

console.log("🔍 Yaddaşda tapıldı:", { adminStr, schoolId });

// UI Elementləri
const schoolNameMain = document.getElementById("schoolNameMain");
const schoolNameSide = document.getElementById("schoolNameSide");
const adminNameDisplay = document.getElementById("adminNameDisplay");
const logoutBtn = document.getElementById("logoutBtn");
const fileInput = document.getElementById("excelInput") as HTMLInputElement;
const uploadBtn = document.getElementById("uploadBtn") as HTMLButtonElement;
const fileNameDisplay = document.getElementById("fileName");
const statusMsg = document.getElementById("statusMessage");

// 2. ƏGƏR LOGİN OLMAYIBSA - GİRİŞƏ QAYTAR
if (!adminStr || !schoolId) {
  alert("Giriş məlumatı tapılmadı! Zəhmət olmasa yenidən daxil olun.");
  window.location.href = "/";
} else {
  // Login olubsa, işə başla
  const adminUser = JSON.parse(adminStr);
  if (adminNameDisplay)
    adminNameDisplay.innerText = adminUser.full_name || "Admin";
  loadSchoolData();
}

// 3. MƏKTƏB ADINI BAZADAN GƏTİR
async function loadSchoolData() {
  if (!schoolId) return;

  try {
    const { data, error } = await sb
      .from("schools")
      .select("name")
      .eq("id", schoolId) // Şəkildəki ID ilə axtarır
      .single();

    if (error) throw error;

    if (data) {
      console.log("🏫 Məktəb tapıldı:", data.name);
      if (schoolNameMain) schoolNameMain.innerText = data.name;
      if (schoolNameSide) schoolNameSide.innerText = data.name;
    }
  } catch (err) {
    console.error("Məktəb adı gəlmədi:", err);
    if (schoolNameMain) schoolNameMain.innerText = "Xəta: Məktəb tapılmadı";
  }
}

// 4. EXCEL YÜKLƏMƏ
fileInput?.addEventListener("change", () => {
  if (fileInput.files?.[0] && fileNameDisplay) {
    fileNameDisplay.innerText = `Seçildi: ${fileInput.files[0].name}`;
    fileNameDisplay.style.color = "#16a34a"; // Yaşıl rəng
  }
});

uploadBtn?.addEventListener("click", async () => {
  if (!fileInput.files?.[0]) {
    alert("Fayl seçin!");
    return;
  }

  uploadBtn.disabled = true;
  uploadBtn.innerText = "Yüklənir...";

  if (statusMsg) {
    statusMsg.innerText = "Gözləyin...";
    statusMsg.classList.remove("hidden");
  }

  try {
    // İMPORT FUNKSİYASINI ÇAĞIRIRIQ
    const msg = await importStudentsToSupabase(fileInput.files[0], schoolId!);

    if (statusMsg) {
      statusMsg.innerText = "✅ " + msg;
      statusMsg.className = "mt-4 font-bold text-sm text-green-600";
    }
    alert(msg); // Ekrana da çıxaraq
  } catch (err: any) {
    console.error(err);
    if (statusMsg) {
      statusMsg.innerText = "❌ Xəta: " + err.message;
      statusMsg.className = "mt-4 font-bold text-sm text-red-600";
    }
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.innerText = "Bazaya Yaz";
  }
});

// 5. ÇIXIŞ DÜYMƏSİ
logoutBtn?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "/";
});
