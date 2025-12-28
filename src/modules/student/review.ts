import { sb } from "../../lib/supabase";
import { analyzeReview } from "../../lib/ai";

let currentTxId: string | null = null;

// Helper: Toast mesajı göstərmək üçün
const showToast = (msg: string, type: "success" | "error") => {
  // @ts-ignore
  if (window.showToast) window.showToast(msg, type);
  else alert(msg);
};

// 1. KODU YOXLAMAQ
export async function verifyReviewCode() {
  const input = document.getElementById("reviewCodeInput") as HTMLInputElement;
  const code = input.value.trim();

  if (code.length !== 5) return showToast("Kod 5 rəqəmli olmalıdır!", "error");

  try {
    const { data, error } = await sb
      .from("transactions")
      .select(
        "id, student_id, status, review_text, students(full_name), books(title)"
      )
      .eq("secret_code", code)
      .single();

    if (error || !data) return showToast("Kod yanlışdır!", "error");
    if (data.status !== "returned")
      return showToast("Bu kitab hələ qaytarılmayıb!", "error");
    if (data.review_text)
      return showToast("Bu kodla artıq rəy yazılıb!", "error");

    currentTxId = data.id;

    // UI Doldur (Array check ilə təhlükəsiz)
    const sData: any = data.students;
    const bData: any = data.books;
    const stName =
      (Array.isArray(sData) ? sData[0]?.full_name : sData?.full_name) ||
      "Şagird";
    const bkTitle =
      (Array.isArray(bData) ? bData[0]?.title : bData?.title) || "Kitab";

    const nameEl = document.getElementById("revStudentName");
    const titleEl = document.getElementById("revBookTitle");

    if (nameEl) nameEl.innerText = stName;
    if (titleEl) titleEl.innerText = bkTitle;

    document.getElementById("reviewStep1")?.classList.add("hidden");
    document.getElementById("reviewStep2")?.classList.remove("hidden");
  } catch (e) {
    console.error(e);
    showToast("Sistem xətası", "error");
  }
}

// 2. ULDUZ VERMƏK (Bu funksiya əskik idi!)
export function setRating(n: number) {
  const stars = document.querySelectorAll("#starContainer span");
  stars.forEach((s, i) => {
    if (i < n) s.classList.add("text-yellow-400");
    else s.classList.remove("text-yellow-400");
  });
  const ratingInput = document.getElementById(
    "reviewRating"
  ) as HTMLInputElement;
  if (ratingInput) ratingInput.value = n.toString();
}

// 3. RƏYİ GÖNDƏRMƏK (AI İnteqrasiyası ilə)
export async function submitReview() {
  const textEl = document.getElementById("reviewText") as HTMLInputElement;
  const ratingEl = document.getElementById("reviewRating") as HTMLInputElement;
  const btn = document.getElementById("submitReviewBtn") as HTMLButtonElement;

  const text = textEl.value.trim();
  const rating = ratingEl.value;
  const bookTitle =
    document.getElementById("revBookTitle")?.innerText || "Kitab";

  if (!text) return showToast("Rəy yazın!", "error");
  if (rating === "0") return showToast("Ulduz seçin!", "error");

  if (btn) {
    btn.innerText = "AI YOXLAYIR...";
    btn.disabled = true;
  }

  try {
    // 1. AI Təhlili
    const aiResult = await analyzeReview(bookTitle, text);

    // 2. SÖYÜŞ VARSA -> STOP 🛑
    if (!aiResult.approved) {
      showToast(`⛔ ${aiResult.feedback}`, "error");
      if (btn) {
        btn.innerText = "GÖNDƏR";
        btn.disabled = false;
      }
      return;
    }

    // 3. TƏMİZDİRSƏ -> BAZAYA YAZIRIQ (approved = false)
    const { error } = await sb
      .from("transactions")
      .update({
        review_text: text,
        rating: parseInt(rating),
        is_review_approved: false, // Admin gözləyirik
        ai_analysis: aiResult.analysis, // Müəllim görəcək
        ai_score: aiResult.score, // Təsdiqlənəndə veriləcək xal
      })
      .eq("id", currentTxId);

    if (error) throw error;

    showToast(
      `✅ Rəy göndərildi! Müəllim təsdiq edəndə +${aiResult.score} XP qazanacaqsınız.`,
      "success"
    );

    // Modalı bağla
    // @ts-ignore
    if (window.closeModal) window.closeModal("reviewModal");

    // Reset
    const codeInp = document.getElementById(
      "reviewCodeInput"
    ) as HTMLInputElement;
    if (codeInp) codeInp.value = "";
    textEl.value = "";
    setRating(0); // Reset rating
    document.getElementById("reviewStep1")?.classList.remove("hidden");
    document.getElementById("reviewStep2")?.classList.add("hidden");
  } catch (e) {
    console.error(e);
    showToast("Xəta baş verdi", "error");
  } finally {
    if (btn) {
      btn.innerText = "GÖNDƏR";
      btn.disabled = false;
    }
  }
}
