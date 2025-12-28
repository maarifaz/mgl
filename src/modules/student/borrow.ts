import { sb } from "../../lib/supabase";

// Qlobal dəyişən (Yalnız bu faylda qalır)
let CURRENT_SCHOOL_ID: string | null = null;

// UI Elementləri
const modal = document.getElementById("borrowModal");
const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const codeInput = document.getElementById(
  "schoolCodeInput"
) as HTMLInputElement;
const schoolNameEl = document.getElementById("selectedSchoolName");
const bookInput = document.getElementById("orderBookTitle") as HTMLInputElement;
const bookList = document.getElementById("bookSuggestions");
const studentInput = document.getElementById(
  "orderStudentName"
) as HTMLInputElement;
const studentList = document.getElementById("studentSuggestions");
const classInput = document.getElementById("orderClass") as HTMLInputElement;

// Helper: Toast mesajı
function showToast(msg: string, type: "success" | "error") {
  const box = document.createElement("div");
  box.className = `toast ${type}`;
  box.innerHTML = `<i class="fas fa-${
    type === "success" ? "check-circle" : "exclamation-circle"
  }"></i> ${msg}`;
  document.getElementById("toast-container")?.appendChild(box);
  setTimeout(() => box.remove(), 3000);
}

// 1. MƏKTƏB KODUNU YOXLA
export async function verifySchoolCode() {
  const code = codeInput.value.trim();
  if (!code) return showToast("Məktəb kodunu yazın!", "error");

  try {
    // Demo üçün 'name' ilə axtarırıq. Realda 'code' sütunu olacaq.
    const { data, error } = await sb
      .from("schools")
      .select("id, name")
      .ilike("name", `%${code}%`)
      .single();

    if (error || !data) {
      showToast("Məktəb tapılmadı!", "error");
      codeInput.classList.add("border-red-500");
      setTimeout(() => codeInput.classList.remove("border-red-500"), 1000);
    } else {
      // Uğurlu!
      CURRENT_SCHOOL_ID = data.id;
      if (schoolNameEl) schoolNameEl.innerText = data.name;

      step1?.classList.add("hidden");
      step2?.classList.remove("hidden");
      showToast(`Məktəb tapıldı: ${data.name}`, "success");
    }
  } catch (e) {
    console.error(e);
  }
}

// 2. KİTAB AXTARIŞI
let bookTimer: any;
export function initBookSearch() {
  bookInput?.addEventListener("input", (e: any) => {
    const query = e.target.value;
    if (query.length < 2) {
      if (bookList) bookList.style.display = "none";
      return;
    }

    clearTimeout(bookTimer);
    bookTimer = setTimeout(async () => {
      const { data } = await sb
        .from("books")
        .select("id, title, quantity")
        .eq("school_id", CURRENT_SCHOOL_ID) // Yalnız bu məktəb!
        .ilike("title", `%${query}%`)
        .limit(5);

      if (bookList) {
        bookList.innerHTML = "";
        if (data && data.length) {
          bookList.style.display = "block";
          data.forEach((bk: any) => {
            const div = document.createElement("div");
            div.className = "suggestion-item";
            div.innerHTML = `${bk.title} <span class="text-xs font-bold ${
              bk.quantity > 0 ? "text-green-600" : "text-red-500"
            } float-right">${bk.quantity} ədəd</span>`;
            div.onclick = () => {
              bookInput.value = bk.title;
              bookInput.dataset.id = bk.id;
              bookList.style.display = "none";
            };
            bookList.appendChild(div);
          });
        } else bookList.style.display = "none";
      }
    }, 300);
  });
}

// 3. ŞAGİRD AXTARIŞI
let stTimer: any;
export function initStudentSearch() {
  studentInput?.addEventListener("input", (e: any) => {
    const query = e.target.value;
    if (query.length < 2) {
      if (studentList) studentList.style.display = "none";
      return;
    }

    clearTimeout(stTimer);
    stTimer = setTimeout(async () => {
      const { data } = await sb
        .from("students")
        .select("id, full_name, class_name")
        .eq("school_id", CURRENT_SCHOOL_ID) // Yalnız bu məktəb!
        .ilike("full_name", `%${query}%`)
        .limit(5);

      if (studentList) {
        studentList.innerHTML = "";
        if (data && data.length) {
          studentList.style.display = "block";
          data.forEach((st: any) => {
            const div = document.createElement("div");
            div.className = "suggestion-item";
            div.innerText = `${st.full_name} (${st.class_name})`;
            div.onclick = () => {
              studentInput.value = st.full_name;
              studentInput.dataset.id = st.id;
              classInput.value = st.class_name;
              studentList.style.display = "none";
            };
            studentList.appendChild(div);
          });
        } else studentList.style.display = "none";
      }
    }, 300);
  });
}

// 4. SİFARİŞİ GÖNDƏR
export async function submitOrder() {
  const sId = studentInput.dataset.id;
  const bId = bookInput.dataset.id;

  if (!sId || !bId) return showToast("Zəhmət olmasa siyahıdan seçin!", "error");

  const { error } = await sb.from("transactions").insert([
    {
      school_id: CURRENT_SCHOOL_ID,
      student_id: sId,
      book_id: bId,
      status: "pending",
      borrow_date: new Date(),
    },
  ]);

  if (error) showToast("Xəta: " + error.message, "error");
  else {
    showToast("Sifariş göndərildi! Müəllim təsdiqini gözləyin.", "success");
    modal?.classList.add("hidden");
    modal?.classList.remove("flex");

    // Reset
    bookInput.value = "";
    studentInput.value = "";
    classInput.value = "";
    step1?.classList.remove("hidden");
    step2?.classList.add("hidden");
  }
}
