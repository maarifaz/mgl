import { sb } from "../../lib/supabase";

// =========================================================
// 0. TYPESCRIPT DEFINITIONS
// =========================================================
declare global {
  interface Window {
    switchTab: (tabName: string) => void;
    approveRequest: (id: string, bookId: string) => void;
    rejectRequest: (id: string) => void;
    returnBook: (id: string, bookId: string) => void;
    addStudent: () => void;
    addBook: () => void;
    handleImport: (type: "student" | "book", input: HTMLInputElement) => void;
    openModal: (id: string) => void;
    closeModal: (id: string) => void;
    approveReview: (id: string) => void;
    deleteReview: (id: string) => void;
    XLSX: any;
  }
}

const XLSX = window.XLSX;
let currentTab = "active";
let schoolId: string | null = null;

// UI Elements
const tableBody = document.getElementById("tableBody");
const badgePending = document.getElementById("badgePending");
const badgeReviews = document.getElementById("badgeReviews"); // Əgər HTML-də varsa
const schoolNameEl = document.getElementById("adminSchoolName");
const secretCodeDisplay = document.getElementById("secretCodeDisplay");

// =========================================================
// 1. TOAST NOTIFICATION (ALERT ƏVƏZİ)
// =========================================================
const showToast = (msg: string, type: "success" | "error") => {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const box = document.createElement("div");
  const colorClass =
    type === "success"
      ? "border-l-4 border-green-500 text-green-700"
      : "border-l-4 border-red-500 text-red-700";
  const icon = type === "success" ? "fa-check-circle" : "fa-exclamation-circle";

  box.className = `bg-white p-4 rounded shadow-lg flex items-center gap-3 min-w-[300px] animate-[slideIn_0.3s_ease-out] ${colorClass}`;
  box.innerHTML = `<i class="fas ${icon} text-xl"></i> <span class="font-bold text-sm">${msg}</span>`;

  container.appendChild(box);

  setTimeout(() => {
    box.style.opacity = "0";
    box.style.transition = "opacity 0.5s";
    setTimeout(() => box.remove(), 500);
  }, 3000);
};

// =========================================================
// 2. INIT
// =========================================================
document.addEventListener("DOMContentLoaded", async () => {
  const adminStr = localStorage.getItem("admin_user");
  schoolId = localStorage.getItem("school_id");

  if (!adminStr || !schoolId) {
    window.location.href = "/";
    return;
  }

  // Məktəb Adını Gətir (Safeguard ilə)
  try {
    if (schoolNameEl) schoolNameEl.innerText = "Yüklənir...";
    const { data: sc, error } = await sb
      .from("schools")
      .select("name")
      .eq("id", schoolId)
      .single();

    if (error) throw error;

    if (schoolNameEl && sc) {
      // Type casting to avoid TS errors
      const sData: any = sc;
      const realName =
        sData.name || (Array.isArray(sData) ? sData[0]?.name : "Məktəb");
      schoolNameEl.innerText = realName;
    }
  } catch (e) {
    console.error(e);
    if (schoolNameEl) schoolNameEl.innerText = "Panel";
  }

  updateBadges();
  window.switchTab("active");
});

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "/";
});

// =========================================================
// 3. TAB LOGIC
// =========================================================
window.switchTab = (tabName: string) => {
  currentTab = tabName;
  document.querySelectorAll('nav button[id^="tab-"]').forEach((btn) => {
    btn.classList.remove("bg-purple-50", "text-primary");
    btn.classList.add("text-gray-500", "hover:bg-gray-50");
  });
  document
    .getElementById(`tab-${tabName}`)
    ?.classList.add("bg-purple-50", "text-primary");
  document.getElementById(`tab-${tabName}`)?.classList.remove("text-gray-500");

  const titles: any = {
    active: "Aktiv Kitablar (10 Gün)",
    pending: "Gözləyən Sorğular",
    returned: "Arxiv",
    reviews: "Bütün Rəylər (İdarəetmə)",
  };
  const titleEl = document.getElementById("pageTitle");
  if (titleEl) titleEl.innerText = titles[tabName];

  loadData();
};

// =========================================================
// 4. LOAD DATA
// =========================================================
async function loadData() {
  if (!tableBody) return;
  tableBody.innerHTML =
    '<tr><td colspan="5" class="p-10 text-center"><i class="fas fa-spinner fa-spin text-2xl text-primary"></i></td></tr>';

  let query = sb
    .from("transactions")
    .select(
      `
            id, status, borrow_date, returned_date, secret_code, 
            review_text, rating, is_review_approved,
            students(full_name, class_name), 
            books(id, title)
        `
    )
    .eq("school_id", schoolId)
    .order("borrow_date", { ascending: false });

  // FİLTRLƏR
  if (currentTab === "pending") {
    query = query.eq("status", "pending");
  } else if (currentTab === "active") {
    query = query.eq("status", "active");
  } else if (currentTab === "returned") {
    query = query.eq("status", "returned").limit(50);
  } else if (currentTab === "reviews") {
    // DÜZƏLİŞ: Təsdiqlənmiş və ya Təsdiqlənməmiş FƏRQ ETMƏZ, hamısını gətir.
    // Yeganə şərt: Rəy mətni boş olmasın.
    query = query.not("review_text", "is", null);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    tableBody.innerHTML = `<tr><td colspan="5" class="p-5 text-center text-red-500">Xəta: ${error.message}</td></tr>`;
    return;
  }

  updateBadges();
  renderTable(data);
}

async function updateBadges() {
  // Pending Badge
  const { count } = await sb
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("school_id", schoolId)
    .eq("status", "pending");
  if (badgePending) {
    badgePending.innerText = (count || 0).toString();
    badgePending.classList.toggle("hidden", count === 0);
  }
}

// =========================================================
// 5. RENDER TABLE
// =========================================================
function renderTable(data: any[]) {
  if (!data || data.length === 0) {
    if (tableBody)
      tableBody.innerHTML =
        '<tr><td colspan="5" class="p-10 text-center text-gray-400 italic">Məlumat yoxdur</td></tr>';
    return;
  }

  let html = "";
  data.forEach((row) => {
    // Array/Object check
    const sData: any = row.students;
    const bData: any = row.books;
    const student = Array.isArray(sData) ? sData[0] : sData;
    const book = Array.isArray(bData) ? bData[0] : bData;

    const bookId = book ? book.id : "";
    const bookTitle = book ? book.title : "---";
    const studentName = student ? student.full_name : "---";
    const studentClass = student ? student.class_name : "";

    let statusHtml = "",
      actionHtml = "";

    // --- A. REVIEWS TAB UI ---
    if (currentTab === "reviews") {
      const stars = "⭐".repeat(row.rating || 0);
      let reviewBadge = "";
      let reviewAction = "";

      if (row.is_review_approved) {
        reviewBadge = `<span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold mr-2">Yayındadır</span>`;
        reviewAction = `<span class="text-xs text-gray-400 font-bold italic mr-2">Təsdiqlənib</span>`;
      } else {
        reviewBadge = `<span class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold mr-2">Gözləyir</span>`;
        reviewAction = `<button onclick="window.approveReview('${row.id}')" class="bg-green-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-600 shadow-sm transition">TƏSDİQLƏ</button>`;
      }

      html += `
            <tr class="hover:bg-yellow-50 border-b border-gray-50 transition">
                <td class="p-4">
                    <p class="font-bold text-gray-800">${studentName}</p>
                    <p class="text-xs text-gray-400">${studentClass}</p>
                </td>
                <td class="p-4 font-medium text-gray-600">${bookTitle}</td>
                <td class="p-4" colspan="2">
                    <div class="flex items-center mb-1">${reviewBadge} <span class="text-xs text-yellow-500">${stars}</span></div>
                    <p class="text-sm italic text-gray-600 bg-white p-2 rounded border border-gray-200">"${row.review_text}"</p>
                </td>
                <td class="p-4 text-right">
                    <div class="flex justify-end items-center gap-2">
                        <button onclick="window.deleteReview('${row.id}')" class="bg-white border border-red-200 text-red-500 p-2 rounded-lg hover:bg-red-50 transition" title="Rəyi Sil"><i class="fas fa-trash"></i></button>
                        ${reviewAction}
                    </div>
                </td>
            </tr>`;
      return; // Stop here for reviews
    }

    // --- B. STANDARD UI ---
    if (row.status === "pending") {
      statusHtml = `<span class="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">Təsdiq Gözləyir</span>`;
      actionHtml = `
                <button onclick="window.rejectRequest('${row.id}')" class="text-red-500 bg-red-50 p-2 rounded mr-2 hover:bg-red-100"><i class="fas fa-times"></i></button>
                <button onclick="window.approveRequest('${row.id}', '${bookId}')" class="bg-green-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-600">TƏSDİQLƏ</button>`;
    } else if (row.status === "active") {
      const daysLeft =
        10 -
        Math.ceil(
          Math.abs(new Date().getTime() - new Date(row.borrow_date).getTime()) /
            (1000 * 60 * 60 * 24)
        );
      const badgeClass =
        daysLeft >= 0
          ? daysLeft > 3
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700"
          : "bg-red-100 text-red-700";
      const label =
        daysLeft >= 0
          ? `${daysLeft} gün qalıb`
          : `${Math.abs(daysLeft)} gün gecikir!`;

      statusHtml = `<span class="${badgeClass} px-3 py-1 rounded-full text-xs font-bold">${label}</span>`;
      actionHtml = `<button onclick="window.returnBook('${row.id}', '${bookId}')" class="border border-primary text-primary px-3 py-1 rounded text-xs font-bold hover:bg-primary hover:text-white transition">QAYTAR</button>`;
    } else {
      // Returned
      statusHtml = `<div class="flex flex-col"><span class="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold w-fit">Bitib</span><span class="text-xs font-mono text-primary mt-1 font-bold">KOD: ${
        row.secret_code || "---"
      }</span></div>`;
      actionHtml = `<i class="fas fa-check-double text-green-500"></i>`;
    }

    html += `
        <tr class="hover:bg-gray-50 border-b border-gray-50">
            <td class="p-4"><p class="font-bold text-gray-800">${studentName}</p><p class="text-xs text-gray-400">${studentClass}</p></td>
            <td class="p-4 text-gray-600">${bookTitle}</td>
            <td class="p-4 text-xs text-gray-500">${new Date(
              row.borrow_date
            ).toLocaleDateString("az-AZ")}</td>
            <td class="p-4">${statusHtml}</td>
            <td class="p-4 text-right">${actionHtml}</td>
        </tr>`;
  });

  if (tableBody) tableBody.innerHTML = html;
}

// =========================================================
// 6. ACTIONS
// =========================================================
window.approveRequest = async (id, bookId) => {
  if (!bookId) return showToast("Kitab tapılmadı!", "error");
  const { data: b } = await sb
    .from("books")
    .select("quantity")
    .eq("id", bookId)
    .single();
  if (!b || b.quantity < 1) return showToast("Stokda yoxdur!", "error");

  await sb
    .from("books")
    .update({ quantity: b.quantity - 1 })
    .eq("id", bookId);
  await sb
    .from("transactions")
    .update({ status: "active", borrow_date: new Date() })
    .eq("id", id);
  showToast("Kitab verildi!", "success");
  loadData();
};

window.rejectRequest = async (id) => {
  if (!confirm("Silinsin?")) return;
  await sb.from("transactions").delete().eq("id", id);
  showToast("Silindi", "success");
  loadData();
};

window.returnBook = async (id, bookId) => {
  const code = Math.floor(10000 + Math.random() * 90000).toString();
  if (bookId) {
    const { data: b } = await sb
      .from("books")
      .select("quantity")
      .eq("id", bookId)
      .single();
    if (b)
      await sb
        .from("books")
        .update({ quantity: b.quantity + 1 })
        .eq("id", bookId);
  }
  await sb
    .from("transactions")
    .update({
      status: "returned",
      returned_date: new Date(),
      secret_code: code,
    })
    .eq("id", id);

  showToast(`Kitab Qaytarıldı! Kod: ${code}`, "success");
  if (secretCodeDisplay) secretCodeDisplay.innerText = code;
  window.openModal("codeModal");
  loadData();
};

// --- RƏY ƏMƏLİYYATLARI ---
window.approveReview = async (id) => {
  const { error } = await sb
    .from("transactions")
    .update({ is_review_approved: true })
    .eq("id", id);
  if (error) showToast("Xəta!", "error");
  else {
    showToast("Rəy paylaşıldı!", "success");
    loadData();
  }
};

window.deleteReview = async (id) => {
  if (!confirm("Rəy silinsin?")) return;
  const { error } = await sb
    .from("transactions")
    .update({ review_text: null, rating: null, is_review_approved: false })
    .eq("id", id);
  if (error) showToast("Xəta!", "error");
  else {
    showToast("Rəy silindi", "success");
    loadData();
  }
};

// =========================================================
// 7. DATA ENTRY
// =========================================================
window.addStudent = async () => {
  const name = (document.getElementById("newStudentName") as HTMLInputElement)
    .value;
  const cls = (document.getElementById("newStudentClass") as HTMLInputElement)
    .value;
  const code = (document.getElementById("newStudentCode") as HTMLInputElement)
    .value;
  if (!name || !code) return showToast("Məlumatları doldurun!", "error");
  const { error } = await sb.from("students").insert([
    {
      school_id: schoolId,
      full_name: name,
      class_name: cls,
      student_code: code,
    },
  ]);
  if (error) showToast("Xəta: " + error.message, "error");
  else {
    showToast("Əlavə edildi!", "success");
    window.closeModal("addStudentModal");
  }
};

window.addBook = async () => {
  const title = (document.getElementById("newBookTitle") as HTMLInputElement)
    .value;
  const auth = (document.getElementById("newBookAuthor") as HTMLInputElement)
    .value;
  const qty = (document.getElementById("newBookQty") as HTMLInputElement).value;
  if (!title) return showToast("Ad mütləqdir!", "error");
  const { error } = await sb.from("books").insert([
    {
      school_id: schoolId,
      title: title,
      author: auth,
      quantity: parseInt(qty) || 1,
    },
  ]);
  if (error) showToast("Xəta: " + error.message, "error");
  else {
    showToast("Əlavə edildi!", "success");
    window.closeModal("addBookModal");
  }
};

window.handleImport = async (type, input) => {
  if (!input.files?.length) return;
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      if (!json.length) return showToast("Excel boşdur!", "error");
      showToast("Yüklənir...", "success");

      let rows = json.map((r: any) =>
        type === "student"
          ? {
              school_id: schoolId,
              full_name: r["Ad Soyad"] || r["name"],
              class_name: r["Sinif"] || r["class"] || "",
              student_code: String(r["Kod"] || r["code"] || Math.random()),
            }
          : {
              school_id: schoolId,
              title: r["Kitab Adı"] || r["title"],
              author: r["Müəllif"] || r["author"] || "",
              quantity: r["Say"] || r["quantity"] || 1,
            }
      );

      const { error } = await sb
        .from(type === "student" ? "students" : "books")
        .insert(rows);
      if (error) throw error;
      showToast(`✅ ${rows.length} məlumat yükləndi!`, "success");
    } catch (err) {
      console.error(err);
      showToast("Import Xətası!", "error");
    }
    input.value = "";
  };
  reader.readAsArrayBuffer(file);
};

window.openModal = (id) =>
  document.getElementById(id)?.classList.remove("hidden");
window.closeModal = (id) =>
  document.getElementById(id)?.classList.add("hidden");
