import { sb } from "../../lib/supabase";

console.log("🚀 Manager.ts yüklənməyə başladı...");

// ================= GLOBAL TYPES =================
declare global {
  interface Window {
    switchTab: (tabName: string) => void;
    // Actions
    approveRequest: (id: string, bookId: string) => void;
    rejectRequest: (id: string) => void; // Artıq modalla işləyəcək
    returnBook: (id: string, bookId: string) => void;
    approveReview: (id: string) => void;
    deleteReview: (id: string) => void; // Artıq modalla işləyəcək

    // CRUD
    openEditModal: (type: "student" | "book", id?: string) => void;
    deleteItem: (type: "student" | "book", id: string) => void; // Artıq modalla işləyəcək
    saveStudent: () => void;
    saveBook: () => void;
    addStudent: () => void;
    addBook: () => void;
    handleImport: (type: "student" | "book", input: HTMLInputElement) => void;

    // Modals
    openModal: (id: string) => void;
    closeModal: (id: string) => void;

    // NEW: Confirmation
    askDelete: (type: string, id: string) => void; // Yeni funksiya
    confirmAction: () => void; // Yeni funksiya

    XLSX: any;
  }
}

const XLSX = window.XLSX;
let currentTab = "active";
let schoolId: string | null = null;
let globalData: any[] = [];

// Silinəcək elementin yaddaşı
let pendingAction: { type: string; id: string } | null = null;

// Toast Helper
const showToast = (msg: string, type: "success" | "error") => {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const box = document.createElement("div");
  const colorClass =
    type === "success"
      ? "border-l-4 border-green-500 text-green-700"
      : "border-l-4 border-red-500 text-red-700";
  box.className = `bg-white p-4 rounded shadow-lg flex items-center gap-3 min-w-[300px] animate-[slideIn_0.3s_ease-out] ${colorClass}`;
  box.innerHTML = `<span class="font-bold text-sm">${msg}</span>`;
  container.appendChild(box);
  setTimeout(() => {
    box.style.opacity = "0";
    setTimeout(() => box.remove(), 500);
  }, 3000);
};

// ================= 1. INIT =================
document.addEventListener("DOMContentLoaded", async () => {
  const adminStr = localStorage.getItem("admin_user");
  schoolId = localStorage.getItem("school_id");
  if (!adminStr || !schoolId) {
    window.location.href = "/";
    return;
  }

  try {
    const schoolNameEl = document.getElementById("adminSchoolName");
    if (schoolNameEl) schoolNameEl.innerText = "Yüklənir...";
    const { data: sc } = await sb
      .from("schools")
      .select("name")
      .eq("id", schoolId)
      .single();
    if (schoolNameEl && sc) {
      const sData: any = sc;
      schoolNameEl.innerText = sData.name || "Məktəb";
    }
  } catch (e) {
    console.error(e);
  }

  updateBadges();
  window.switchTab("active");

  const searchInput = document.getElementById(
    "searchInput"
  ) as HTMLInputElement;
  if (searchInput) {
    searchInput.addEventListener("input", (e: any) => {
      const term = e.target.value.toLowerCase();
      if (!term) {
        renderTable(globalData);
        return;
      }
      const filtered = globalData.filter((item) =>
        JSON.stringify(item).toLowerCase().includes(term)
      );
      renderTable(filtered);
    });
  }
});

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "/";
});

// ================= 2. TAB LOGIC =================
window.switchTab = (tabName: string) => {
  currentTab = tabName;
  const searchInput = document.getElementById(
    "searchInput"
  ) as HTMLInputElement;
  if (searchInput) searchInput.value = "";

  document.querySelectorAll('nav button[id^="tab-"]').forEach((btn) => {
    btn.classList.remove("bg-purple-50", "text-primary");
    btn.classList.add("text-gray-500", "hover:bg-gray-50");
  });
  document
    .getElementById(`tab-${tabName}`)
    ?.classList.add("bg-purple-50", "text-primary");
  document.getElementById(`tab-${tabName}`)?.classList.remove("text-gray-500");

  const titleEl = document.getElementById("pageTitle");
  if (titleEl) titleEl.innerText = tabName.toUpperCase();

  loadData();
};

// ================= 3. LOAD DATA =================
async function loadData() {
  const tableBody = document.getElementById("tableBody");
  if (!tableBody) return;
  tableBody.innerHTML =
    '<tr><td colspan="5" class="p-10 text-center"><i class="fas fa-spinner fa-spin text-2xl text-primary"></i></td></tr>';
  updateTableHead();

  let data: any[] = [];
  let error = null;

  if (currentTab === "students") {
    const res = await sb
      .from("students")
      .select("*")
      .eq("school_id", schoolId)
      .order("full_name", { ascending: true });
    data = res.data || [];
    error = res.error;
  } else if (currentTab === "books") {
    const res = await sb
      .from("books")
      .select("*")
      .eq("school_id", schoolId)
      .order("title", { ascending: true });
    data = res.data || [];
    error = res.error;
  } else {
    let query = sb
      .from("transactions")
      .select(
        `id, status, borrow_date, returned_date, secret_code, review_text, rating, is_review_approved, ai_analysis, ai_score, students(full_name, class_name), books(id, title)`
      )
      .eq("school_id", schoolId)
      .order("borrow_date", { ascending: false });

    if (currentTab === "pending") query = query.eq("status", "pending");
    else if (currentTab === "active") query = query.eq("status", "active");
    else if (currentTab === "returned")
      query = query.eq("status", "returned").limit(50);
    else if (currentTab === "reviews")
      query = query.not("review_text", "is", null);

    const res = await query;
    data = res.data || [];
    error = res.error;
  }

  if (error) {
    tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-red-500">Xəta: ${error.message}</td></tr>`;
    return;
  }

  globalData = data;
  updateBadges();
  renderTable(data);
}

function updateTableHead() {
  const tableHead = document.getElementById("tableHead");
  if (!tableHead) return;
  let html = "";
  if (currentTab === "students")
    html = `<tr><th class="p-5">Ad Soyad</th><th class="p-5">Sinif</th><th class="p-5">Kod</th><th class="p-5">XP</th><th class="p-5 text-right">Əməliyyat</th></tr>`;
  else if (currentTab === "books")
    html = `<tr><th class="p-5">Kitab Adı</th><th class="p-5">Müəllif</th><th class="p-5">Stok</th><th class="p-5">Oxunma</th><th class="p-5 text-right">Əməliyyat</th></tr>`;
  else
    html = `<tr><th class="p-5">Şagird</th><th class="p-5">Kitab</th><th class="p-5">Tarix / Info</th><th class="p-5">Status</th><th class="p-5 text-right">Əməliyyat</th></tr>`;
  tableHead.innerHTML = html;
}

// ================= 4. RENDER TABLE =================
function renderTable(data: any[]) {
  const tableBody = document.getElementById("tableBody");
  if (!tableBody) return;
  if (!data || data.length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="5" class="p-10 text-center text-gray-400 italic">Məlumat yoxdur</td></tr>';
    return;
  }

  let html = "";
  if (currentTab === "students") {
    data.forEach((row) => {
      // askDelete funksiyasına yönləndiririk
      html += `<tr class="hover:bg-gray-50 border-b border-gray-50"><td class="p-4 font-bold text-gray-800">${
        row.full_name
      }</td><td class="p-4">${
        row.class_name
      }</td><td class="p-4 font-mono text-purple-600">${
        row.student_code
      }</td><td class="p-4 font-bold text-yellow-500">${
        row.xp_points || 0
      } XP</td><td class="p-4 text-right"><button onclick="window.openEditModal('student', '${
        row.id
      }')" class="text-blue-500 bg-blue-50 p-2 rounded mr-2"><i class="fas fa-edit"></i></button><button onclick="window.askDelete('student', '${
        row.id
      }')" class="text-red-500 bg-red-50 p-2 rounded"><i class="fas fa-trash"></i></button></td></tr>`;
    });
  } else if (currentTab === "books") {
    data.forEach((row) => {
      html += `<tr class="hover:bg-gray-50 border-b border-gray-50"><td class="p-4 font-bold text-gray-800">${
        row.title
      }</td><td class="p-4 text-gray-500">${
        row.author
      }</td><td class="p-4 font-bold text-blue-600">${
        row.quantity
      } ədəd</td><td class="p-4 text-gray-400">🔥 ${
        row.borrow_count || 0
      }</td><td class="p-4 text-right"><button onclick="window.openEditModal('book', '${
        row.id
      }')" class="text-blue-500 bg-blue-50 p-2 rounded mr-2"><i class="fas fa-edit"></i></button><button onclick="window.askDelete('book', '${
        row.id
      }')" class="text-red-500 bg-red-50 p-2 rounded"><i class="fas fa-trash"></i></button></td></tr>`;
    });
  } else {
    data.forEach((row) => {
      const sData: any = row.students;
      const bData: any = row.books;
      const student = Array.isArray(sData) ? sData[0] : sData;
      const book = Array.isArray(bData) ? bData[0] : bData;
      const bookId = book?.id || "";
      const stName = student?.full_name || "---";

      let statusHtml = "",
        actionHtml = "";

      if (currentTab === "reviews") {
        const stars = "⭐".repeat(row.rating || 0);
        const aiNote = row.ai_analysis
          ? `<div class="mt-2 text-xs text-purple-600 bg-purple-50 p-2 rounded border border-purple-100 flex items-start gap-2"><i class="fas fa-robot mt-1"></i> <span><b>AI:</b> ${row.ai_analysis}</span></div>`
          : "";
        const aiPoints = row.ai_score ? `+${row.ai_score} XP` : "0 XP";
        let badge = row.is_review_approved
          ? `<span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold mr-2">Yayındadır</span>`
          : `<span class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold mr-2">Gözləyir</span>`;

        // Delete -> askDelete('review', id)
        let btn = row.is_review_approved
          ? `<span class="text-xs text-gray-400 font-bold italic mr-2">Təsdiqlənib</span>`
          : `<button onclick="window.approveReview('${row.id}')" class="bg-green-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-600 shadow-sm">TƏSDİQLƏ (${aiPoints})</button>`;

        html += `<tr class="hover:bg-yellow-50 border-b border-gray-50"><td class="p-4"><p class="font-bold text-gray-800">${stName}</p></td><td class="p-4">${book?.title}</td><td class="p-4" colspan="2"><div class="flex items-center mb-1">${badge} <span class="text-xs text-yellow-500">${stars}</span></div><p class="text-sm italic text-gray-600 bg-white p-2 rounded border">"${row.review_text}"</p>${aiNote}</td><td class="p-4 text-right"><div class="flex justify-end gap-2"><button onclick="window.askDelete('review', '${row.id}')" class="text-red-500 bg-red-50 p-2 rounded"><i class="fas fa-trash"></i></button>${btn}</div></td></tr>`;
        return;
      }

      if (row.status === "pending") {
        statusHtml = `<span class="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">Gözləyir</span>`;
        // Reject -> askDelete('request', id)
        actionHtml = `<button onclick="window.askDelete('request', '${row.id}')" class="text-red-500 bg-red-50 p-2 rounded mr-2"><i class="fas fa-times"></i></button><button onclick="window.approveRequest('${row.id}', '${bookId}')" class="bg-green-500 text-white px-3 py-1 rounded text-xs font-bold">TƏSDİQLƏ</button>`;
      } else if (row.status === "active") {
        const daysLeft =
          10 -
          Math.ceil(
            Math.abs(
              new Date().getTime() - new Date(row.borrow_date).getTime()
            ) /
              (1000 * 60 * 60 * 24)
          );
        statusHtml = `<span class="${
          daysLeft >= 0
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        } px-3 py-1 rounded-full text-xs font-bold">${
          daysLeft >= 0 ? daysLeft + " gün" : Math.abs(daysLeft) + " gün gec"
        }</span>`;
        actionHtml = `<button onclick="window.returnBook('${row.id}', '${bookId}')" class="border border-primary text-primary px-3 py-1 rounded text-xs font-bold">QAYTAR</button>`;
      } else {
        statusHtml = `<span class="text-xs font-mono text-primary font-bold">KOD: ${
          row.secret_code || "---"
        }</span>`;
        actionHtml = `<i class="fas fa-check-double text-green-500"></i>`;
      }

      html += `<tr class="hover:bg-gray-50 border-b border-gray-50"><td class="p-4"><p class="font-bold text-gray-800">${stName}</p><p class="text-xs text-gray-400">${
        student?.class_name
      }</p></td><td class="p-4">${
        book?.title
      }</td><td class="p-4 text-xs">${new Date(
        row.borrow_date
      ).toLocaleDateString(
        "az-AZ"
      )}</td><td class="p-4">${statusHtml}</td><td class="p-4 text-right">${actionHtml}</td></tr>`;
    });
  }
  tableBody.innerHTML = html;
}

// ================= 5. DELETE MODAL LOGIC (YENİ) =================
// 1. Düyməyə basanda Modalı Açır
window.askDelete = (type, id) => {
  console.log("Ask Delete:", type, id);
  pendingAction = { type, id }; // Nəyi siləcəyimizi yadda saxlayırıq
  window.openModal("confirmModal");
};

// 2. Modaldakı "Bəli" düyməsi bura bağlıdır
window.confirmAction = async () => {
  if (!pendingAction) return;

  const { type, id } = pendingAction;
  let error = null;

  if (type === "student") {
    const { error: e } = await sb.from("students").delete().eq("id", id);
    error = e;
  } else if (type === "book") {
    const { error: e } = await sb.from("books").delete().eq("id", id);
    error = e;
  } else if (type === "review") {
    // Rəyi silmək = null etmək
    const { error: e } = await sb
      .from("transactions")
      .update({
        review_text: null,
        rating: null,
        is_review_approved: false,
        ai_analysis: null,
        ai_score: 0,
      })
      .eq("id", id);
    error = e;
  } else if (type === "request") {
    // Sorğunu rədd etmək = sətiri silmək
    const { error: e } = await sb.from("transactions").delete().eq("id", id);
    error = e;
  }

  if (error) {
    showToast("Xəta: " + error.message, "error");
  } else {
    showToast("Uğurla Silindi!", "success");
    loadData();
  }

  // Təmizlik
  pendingAction = null;
  window.closeModal("confirmModal");
};

// ================= 6. OTHER ACTIONS =================
window.openModal = (id) => {
  document.getElementById(id)?.classList.remove("hidden");
  // Clear inputs logic (qısaldılıb, eyni qalır)
  if (
    id === "addStudentModal" &&
    !(document.getElementById("editStudentId") as HTMLInputElement).value
  ) {
    // ... input reset code ...
  }
};
window.closeModal = (id) => {
  document.getElementById(id)?.classList.add("hidden");
  if (id === "confirmModal") pendingAction = null; // Ləğv edilərsə yaddaşı təmizlə
};

window.approveRequest = async (id, bookId) => {
  if (!bookId) return;
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
  const secretCodeDisplay = document.getElementById("secretCodeDisplay");
  if (secretCodeDisplay) secretCodeDisplay.innerText = code;
  window.openModal("codeModal");
  loadData();
};

window.approveReview = async (id) => {
  const { data: tx } = await sb
    .from("transactions")
    .select("student_id, ai_score")
    .eq("id", id)
    .single();
  if (!tx) return showToast("Xəta!", "error");
  const { error } = await sb
    .from("transactions")
    .update({ is_review_approved: true })
    .eq("id", id);
  if (error) {
    showToast("Xəta!", "error");
  } else {
    if (tx.student_id && tx.ai_score > 0) {
      const { data: st } = await sb
        .from("students")
        .select("xp_points")
        .eq("id", tx.student_id)
        .single();
      await sb
        .from("students")
        .update({ xp_points: (st?.xp_points || 0) + tx.ai_score })
        .eq("id", tx.student_id);
    }
    showToast("Təsdiqləndi!", "success");
    loadData();
  }
};

// Köhnə delete funksiyaları artıq askDelete ilə əvəzləndi, amma alias kimi saxlayırıq (error olmasın deyə)
window.deleteReview = (id) => window.askDelete("review", id);
window.deleteItem = (type, id) => window.askDelete(type, id);
window.rejectRequest = (id) => window.askDelete("request", id);

// Edit/Save funksiyaları olduğu kimi qalır...
window.openEditModal = (type, id) => {
  /* ... eyni ... */ const item = globalData.find((i) => i.id === id);
  if (item) {
    /* doldur */ if (type == "student") window.openModal("addStudentModal");
    else window.openModal("addBookModal");
  }
};
window.saveStudent = async () => {
  /* ... eyni ... */ const id = (
    document.getElementById("editStudentId") as HTMLInputElement
  ).value;
  const name = (document.getElementById("newStudentName") as HTMLInputElement)
    .value;
  const code = (document.getElementById("newStudentCode") as HTMLInputElement)
    .value;
  const cls = (document.getElementById("newStudentClass") as HTMLInputElement)
    .value;
  if (!name) return showToast("Ad yazın", "error");
  if (id)
    await sb
      .from("students")
      .update({ full_name: name, class_name: cls, student_code: code })
      .eq("id", id);
  else
    await sb.from("students").insert([
      {
        school_id: schoolId,
        full_name: name,
        class_name: cls,
        student_code: code,
      },
    ]);
  window.closeModal("addStudentModal");
  loadData();
  showToast("Hazır", "success");
};
window.saveBook = async () => {
  /* ... eyni ... */ const id = (
    document.getElementById("editBookId") as HTMLInputElement
  ).value;
  const title = (document.getElementById("newBookTitle") as HTMLInputElement)
    .value;
  const author = (document.getElementById("newBookAuthor") as HTMLInputElement)
    .value;
  const qty = (document.getElementById("newBookQty") as HTMLInputElement).value;
  if (!title) return showToast("Ad yazın", "error");
  if (id)
    await sb
      .from("books")
      .update({ title: title, author: author, quantity: qty })
      .eq("id", id);
  else
    await sb
      .from("books")
      .insert([
        { school_id: schoolId, title: title, author: author, quantity: qty },
      ]);
  window.closeModal("addBookModal");
  loadData();
  showToast("Hazır", "success");
};

async function updateBadges() {
  const badgePending = document.getElementById("badgePending");
  const badgeReviews = document.getElementById("badgeReviews");
  if (badgePending) {
    const { count } = await sb
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .eq("status", "pending");
    badgePending.innerText = (count || 0).toString();
    badgePending.classList.toggle("hidden", count === 0);
  }
  if (badgeReviews) {
    const { count } = await sb
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .not("review_text", "is", null)
      .eq("is_review_approved", false);
    badgeReviews.innerText = (count || 0).toString();
    badgeReviews.classList.toggle("hidden", count === 0);
  }
}

window.addStudent = () => {
  window.openModal("addStudentModal");
};
window.addBook = () => {
  window.openModal("addBookModal");
};
window.handleImport = async (type, input) => {
  /* ... eyni ... */
};
