import { sb } from "../../lib/supabase";

// Helper
const showToast = (msg: string) => {
  // @ts-ignore
  if (window.showToast) window.showToast(msg, "error");
  else alert(msg);
};

// ================= 1. ŞAGİRD DETALLARI =================
export async function openStudentDetails(studentId: string) {
  const modal = document.getElementById("studentDetailsModal");
  const list = document.getElementById("studentHistoryList");
  const nameEl = document.getElementById("detailStudentName");
  const schoolEl = document.getElementById("detailStudentSchool");

  modal?.classList.remove("hidden");
  modal?.classList.add("flex");
  if (list)
    list.innerHTML =
      '<div class="text-center py-10"><i class="fas fa-spinner fa-spin text-3xl text-primary"></i></div>';

  try {
    // 1. Şagird Məlumatı
    const { data: student, error: stError } = await sb
      .from("students")
      .select("full_name, class_name, schools(name)")
      .eq("id", studentId)
      .single();

    if (stError || !student) throw new Error("Şagird tapılmadı");

    if (nameEl) nameEl.innerText = student.full_name;

    // Məktəb adı (Array check)
    const sData: any = student.schools;
    const schoolName =
      (Array.isArray(sData) ? sData[0]?.name : sData?.name) || "Məktəb";
    if (schoolEl) schoolEl.innerText = `${schoolName} • ${student.class_name}`;

    // 2. Oxuduğu kitablar (DÜZƏLİŞ BURADA: review_text və approved check)
    const { data: logs } = await sb
      .from("transactions")
      .select(
        "rating, review_text, borrow_date, returned_date, is_review_approved, books(title, author)"
      )
      .eq("student_id", studentId)
      .eq("status", "returned")
      .order("returned_date", { ascending: false });

    if (list) {
      list.innerHTML = "";
      if (!logs || logs.length === 0) {
        list.innerHTML =
          '<div class="text-center text-gray-400 py-4">Bu şagird hələ kitab bitirməyib.</div>';
        return;
      }

      logs.forEach((log: any) => {
        const stars = "⭐".repeat(log.rating || 0);
        const bTitle =
          (Array.isArray(log.books) ? log.books[0]?.title : log.books?.title) ||
          "Kitab";

        // Rəy varmı və təsdiqlənibmi?
        let reviewHtml = "";
        if (log.review_text && log.is_review_approved) {
          reviewHtml = `<p class="text-sm text-gray-600 italic bg-white p-3 rounded-lg border border-gray-100 mt-2">"${log.review_text}"</p>`;
        } else if (log.review_text && !log.is_review_approved) {
          reviewHtml = `<p class="text-xs text-yellow-600 bg-yellow-50 p-2 rounded mt-2">Rəy yoxlanılır...</p>`;
        }

        list.innerHTML += `
                <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div class="flex justify-between items-start mb-1">
                        <h5 class="font-bold text-gray-800 text-sm">${bTitle}</h5>
                        <span class="text-xs text-yellow-500">${stars}</span>
                    </div>
                    ${reviewHtml}
                    <p class="text-xs text-gray-400 mt-2 text-right">${new Date(
                      log.returned_date
                    ).toLocaleDateString("az-AZ")}</p>
                </div>`;
      });
    }
  } catch (e: any) {
    console.error(e);
    showToast("Xəta oldu.");
    modal?.classList.add("hidden");
  }
}

// ================= 2. KİTAB DETALLARI =================
export async function openBookDetails(bookId: string) {
  const modal = document.getElementById("bookDetailsModal");
  const list = document.getElementById("bookReviewsList");
  const titleEl = document.getElementById("detailBookTitle");
  const ratingEl = document.getElementById("detailBookRating");
  const starsEl = document.getElementById("detailBookStars");

  modal?.classList.remove("hidden");
  modal?.classList.add("flex");
  if (list)
    list.innerHTML =
      '<div class="text-center py-10"><i class="fas fa-spinner fa-spin text-3xl text-red-500"></i></div>';

  try {
    const { data: book } = await sb
      .from("books")
      .select("title")
      .eq("id", bookId)
      .single();
    if (titleEl && book) titleEl.innerText = book.title;

    // 2. Rəylər (DÜZƏLİŞ: yalnız approved olanlar)
    const { data: reviews } = await sb
      .from("transactions")
      .select("rating, review_text, returned_date, students(full_name)")
      .eq("book_id", bookId)
      .eq("is_review_approved", true) // YALNIZ TƏSDİQLƏNMİŞ
      .not("review_text", "is", null)
      .order("rating", { ascending: false });

    if (list && reviews) {
      list.innerHTML = "";

      // Ortalama
      let totalRating = 0;
      reviews.forEach((r: any) => (totalRating += r.rating || 0));
      const avg =
        reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : "0.0";

      if (ratingEl) ratingEl.innerText = avg;
      if (starsEl) {
        const roundAvg = Math.round(Number(avg));
        starsEl.innerHTML =
          "⭐".repeat(roundAvg) +
          "<span class='text-gray-300'>" +
          "⭐".repeat(5 - roundAvg) +
          "</span>";
      }

      if (reviews.length === 0) {
        list.innerHTML =
          '<div class="text-center text-gray-400 py-4">Hələ təsdiqlənmiş rəy yoxdur.</div>';
        return;
      }

      reviews.forEach((r: any) => {
        const rStars = "⭐".repeat(r.rating || 0);
        const sName =
          (Array.isArray(r.students)
            ? r.students[0]?.full_name
            : r.students?.full_name) || "Anonim";

        list.innerHTML += `
                <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div class="flex justify-between items-center mb-2">
                        <div class="flex items-center gap-2">
                            <div class="w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                                ${sName.charAt(0)}
                            </div>
                            <span class="font-bold text-gray-700 text-sm">${sName}</span>
                        </div>
                        <span class="text-xs text-yellow-500">${rStars}</span>
                    </div>
                    <p class="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100">"${
                      r.review_text
                    }"</p>
                </div>`;
      });
    }
  } catch (e) {
    console.error(e);
    showToast("Məlumat yüklənmədi.");
    modal?.classList.add("hidden");
  }
}
