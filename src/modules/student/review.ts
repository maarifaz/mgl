import { sb } from "../../lib/supabase";
import { analyzeReview } from "../../lib/ai";

let currentTxId: string | null = null;

// Helper
const showToast = (msg: string, type: "success" | "error") => {
  // @ts-ignore
  if (window.showToast) window.showToast(msg, type);
  else alert(msg);
};

// =========================================================
// 1. EVENT LISTENERS (YENİ HİSSƏ) ⚡
// =========================================================
// Bu hissə səhifə yüklənən kimi işə düşür və inputları izləyir
document.addEventListener("DOMContentLoaded", () => {
  // A. Simvol Sayğacı (0/100)
  const textEl = document.getElementById("reviewText") as HTMLTextAreaElement;
  const countEl = document.getElementById("charCount");

  if (textEl && countEl) {
    textEl.addEventListener("input", () => {
      const len = textEl.value.length;
      countEl.innerText = len.toString();

      // 100-ə çatanda qızarsın
      if (len >= 100) countEl.classList.add("text-red-500", "font-bold");
      else countEl.classList.remove("text-red-500", "font-bold");
    });
  }

  // B. Enter Düyməsi (Kod Girişi üçün)
  const codeInp = document.getElementById("reviewCodeInput");
  if (codeInp) {
    codeInp.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault(); // Səhifə yenilənməsin
        verifyReviewCode();
      }
    });
  }
});

// =========================================================
// 2. KODU YOXLAMAQ
// =========================================================
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

    // Keçid
    document.getElementById("reviewStep1")?.classList.add("hidden");
    document.getElementById("reviewStep2")?.classList.remove("hidden");
  } catch (e) {
    console.error(e);
    showToast("Sistem xətası", "error");
  }
}

// =========================================================
// 3. ULDUZ VERMƏK
// =========================================================
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

// =========================================================
// 4. RƏYİ GÖNDƏRMƏK (AI)
// =========================================================
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
    const aiResult = await analyzeReview(bookTitle, text);

    if (!aiResult.approved) {
      showToast(`⛔ ${aiResult.feedback}`, "error");
      if (btn) {
        btn.innerText = "GÖNDƏR";
        btn.disabled = false;
      }
      return;
    }

    const { error } = await sb
      .from("transactions")
      .update({
        review_text: text,
        rating: parseInt(rating),
        is_review_approved: false,
        ai_analysis: aiResult.analysis,
        ai_score: aiResult.score,
      })
      .eq("id", currentTxId);

    if (error) throw error;

    showToast(
      `✅ Rəy göndərildi! Müəllim təsdiq edəndə +${aiResult.score} XP qazanacaqsınız.`,
      "success"
    );

    // @ts-ignore
    if (window.closeModal) window.closeModal("reviewModal");

    // Reset
    const codeInp = document.getElementById(
      "reviewCodeInput"
    ) as HTMLInputElement;
    if (codeInp) codeInp.value = "";
    textEl.value = "";
    const countEl = document.getElementById("charCount");
    if (countEl) countEl.innerText = "0"; // Sayğacı sıfırla

    setRating(0);
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
