import { sb } from "../../lib/supabase";

// Helper: Məktəb adını təhlükəsiz çıxarmaq
function getSchoolName(data: any): string {
  if (!data) return "Məktəb";
  if (Array.isArray(data) && data.length > 0) return data[0].name;
  if (data.name) return data.name;
  return "Məktəb";
}

// 1. TOP STUDENTS
export async function loadTopStudents() {
  const listEl = document.getElementById("topStudentsList");
  if (!listEl) return;

  const { data, error } = await sb
    .from("students")
    .select("id, full_name, class_name, xp_points, schools(name)")
    .order("xp_points", { ascending: false })
    .limit(5);

  if (error) console.error("Students Error:", error);

  if (!data || data.length === 0) {
    listEl.innerHTML =
      '<p class="text-center text-gray-400 py-6">Məlumat yoxdur</p>';
    return;
  }

  let html = "";
  data.forEach((st: any, index: number) => {
    let rankColor =
      index === 0
        ? "text-yellow-500"
        : index === 1
        ? "text-gray-500"
        : index === 2
        ? "text-orange-500"
        : "text-blue-500";
    let icon = index === 0 ? "👑" : `#${index + 1}`;

    // GÜLLƏKEÇİRMƏZ MƏNTİQ
    const schoolName = getSchoolName(st.schools).split(" ")[0];

    // onclick əlavə edildi
    html += `
        <div onclick="window.openStudentDetails('${st.id}')" 
             class="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-yellow-50 hover:shadow-md transition cursor-pointer group border border-transparent hover:border-yellow-200">
            <div class="flex items-center gap-3">
                <span class="font-bold ${rankColor} w-6 text-center">${icon}</span>
                <div>
                    <p class="font-bold text-gray-800 text-sm group-hover:text-primary transition">${st.full_name}</p>
                    <p class="text-xs text-gray-500">${schoolName}</p>
                </div>
            </div>
            <div class="font-cinzel font-bold text-primary text-sm">${st.xp_points} XP</div>
        </div>`;
  });
  listEl.innerHTML = html;
}

// 2. TOP BOOKS
export async function loadTopBooks() {
  const listEl = document.getElementById("topBooksList");
  if (!listEl) return;

  const { data, error } = await sb
    .from("books")
    .select("id, title, author, borrow_count")
    .order("borrow_count", { ascending: false })
    .limit(5);

  if (error) console.error("Books Error:", error);

  if (!data || data.length === 0) {
    listEl.innerHTML =
      '<p class="text-center text-gray-400 py-6">Məlumat yoxdur</p>';
    return;
  }

  let html = "";
  data.forEach((book: any) => {
    html += `
        <div onclick="window.openBookDetails('${book.id}')"
             class="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-red-50 hover:shadow-md transition cursor-pointer group border border-transparent hover:border-red-200">
            <div class="flex items-center gap-3">
                <div class="w-8 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                    <i class="fas fa-book"></i>
                </div>
                <div>
                    <p class="font-bold text-gray-800 text-sm line-clamp-1 group-hover:text-red-600 transition">${
                      book.title
                    }</p>
                    <p class="text-xs text-gray-500">${
                      book.author || "Müəllif naməlum"
                    }</p>
                </div>
            </div>
            <div class="text-xs font-bold text-red-500 bg-red-100 px-2 py-1 rounded-lg">
                🔥 ${book.borrow_count}
            </div>
        </div>`;
  });
  listEl.innerHTML = html;
}

// 3. RECENT ACTIVITY
export async function loadRecentActivity() {
  const listEl = document.getElementById("recentActivityList");
  if (!listEl) return;

  const { data, error } = await sb
    .from("transactions")
    .select("status, borrow_date, students(full_name), books(title)")
    .order("borrow_date", { ascending: false })
    .limit(6);

  if (error) console.error("Activity Error:", error);

  if (!data || data.length === 0) {
    listEl.innerHTML =
      '<p class="text-center text-gray-400 py-6">Sakitlikdir...</p>';
    return;
  }

  let html = "";
  data.forEach((item: any) => {
    const isReturn = item.status === "returned";
    const icon = isReturn
      ? '<i class="fas fa-check-circle text-green-500"></i>'
      : '<i class="fas fa-book-open text-blue-500"></i>';
    const actionText = isReturn ? "qaytardı" : "götürdü";

    // Null check
    const stName = item.students
      ? Array.isArray(item.students)
        ? item.students[0]?.full_name
        : item.students.full_name
      : "Naməlum";
    const bkTitle = item.books
      ? Array.isArray(item.books)
        ? item.books[0]?.title
        : item.books.title
      : "Kitab";

    html += `
        <div class="flex items-start gap-3 p-3 border-b border-gray-100 last:border-0">
            <div class="mt-1">${icon}</div>
            <div>
                <p class="text-sm text-gray-700">
                    <span class="font-bold">${stName}</span> bir kitab ${actionText}.
                </p>
                <p class="text-xs text-gray-400 mt-1">"${bkTitle}"</p>
            </div>
        </div>`;
  });
  listEl.innerHTML = html;
}
