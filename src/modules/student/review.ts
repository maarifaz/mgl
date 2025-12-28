import { sb } from "../../lib/supabase";

let currentTxId: string | null = null;
let currentStudentId: string | null = null; // Şagirdin ID-sini yadda saxlayırıq

// UI Helpers
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

    // ID-ləri yadda saxla
    currentTxId = data.id;
    currentStudentId = data.student_id;

    // UI Doldur
    const sData: any = data.students;
    const bData: any = data.books;
    const stName =
      (Array.isArray(sData) ? sData[0]?.full_name : sData?.full_name) ||
      "Şagird";
    const bkTitle =
      (Array.isArray(bData) ? bData[0]?.title : bData?.title) || "Kitab";

    document.getElementById("revStudentName")!.innerText = stName;
    document.getElementById("revBookTitle")!.innerText = bkTitle;

    // Ekranı dəyiş
    document.getElementById("reviewStep1")?.classList.add("hidden");
    document.getElementById("reviewStep2")?.classList.remove("hidden");
  } catch (e) {
    console.error(e);
    showToast("Sistem xətası", "error");
  }
}

// 2. ULDUZ VERMƏK
export function setRating(n: number) {
  const stars = document.querySelectorAll("#starContainer span");
  stars.forEach((s, i) => {
    if (i < n) s.classList.add("text-yellow-400");
    else s.classList.remove("text-yellow-400");
  });
  (document.getElementById("reviewRating") as HTMLInputElement).value =
    n.toString();
}

// 3. RƏYİ GÖNDƏRMƏK (+ XP ARTIRMAQ)
export async function submitReview() {
  const text = (
    document.getElementById("reviewText") as HTMLInputElement
  ).value.trim();
  const rating = (document.getElementById("reviewRating") as HTMLInputElement)
    .value;

  if (!text) return showToast("Rəy yazın!", "error");
  if (rating === "0") return showToast("Ulduz seçin!", "error");

  // 1. Rəyi yaz
  const { error } = await sb
    .from("transactions")
    .update({
      review_text: text,
      rating: parseInt(rating),
      is_review_approved: false, // Admin təsdiqi lazımdır
    })
    .eq("id", currentTxId);

  if (error) {
    showToast("Xəta baş verdi", "error");
  } else {
    // 2. Şagirdə Xal Ver (XP Logic)
    // Gələcəkdə bura AI Balı gələcək. Hələlik +10 Standart.
    if (currentStudentId) {
      await addXpToStudent(currentStudentId, 10);
    }

    showToast("Rəy qəbul olundu! +10 XP qazandınız! 🎉", "success");

    // Modalı bağla
    // @ts-ignore
    if (window.closeModal) window.closeModal("reviewModal");

    // Reset
    (document.getElementById("reviewCodeInput") as HTMLInputElement).value = "";
    (document.getElementById("reviewText") as HTMLInputElement).value = "";
    setRating(0);
    document.getElementById("reviewStep1")?.classList.remove("hidden");
    document.getElementById("reviewStep2")?.classList.add("hidden");
  }
}

// XP Artırma Funksiyası (Helper)
async function addXpToStudent(studentId: string, amount: number) {
  try {
    // Hazırkı balı al
    const { data } = await sb
      .from("students")
      .select("xp_points")
      .eq("id", studentId)
      .single();
    if (data) {
      const newXp = (data.xp_points || 0) + amount;
      // Yenilə
      await sb
        .from("students")
        .update({ xp_points: newXp })
        .eq("id", studentId);
    }
  } catch (e) {
    console.error("XP artırıla bilmədi:", e);
  }
}
