import { sb } from "./lib/supabase";
import {
  loadTopStudents,
  loadTopBooks,
  loadRecentActivity,
} from "./modules/global/stats";
import {
  verifySchoolCode,
  initBookSearch,
  initStudentSearch,
  submitOrder,
} from "./modules/student/borrow";
import { openStudentDetails, openBookDetails } from "./modules/global/details";
import {
  verifyReviewCode,
  submitReview,
  setRating,
} from "./modules/student/review";

console.log("🚀 Main System Loaded");

// ================= GLOBAL EXPORTS =================
declare global {
  interface Window {
    openStudentDetails: (id: string) => void;
    openBookDetails: (id: string) => void;
    showToast: (msg: string, type: "success" | "error") => void;
    openModal: (id: string) => void;
    closeModal: (id: string) => void;
    openBorrowModal: () => void;
    verifyReviewCode: () => void;
    submitReview: () => void;
    setRating: (n: number) => void;
  }
}

window.openStudentDetails = openStudentDetails;
window.openBookDetails = openBookDetails;
window.verifyReviewCode = verifyReviewCode;
window.submitReview = submitReview;
window.setRating = setRating;

// Helper Functions
window.showToast = (msg, type) => {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const box = document.createElement("div");
  box.className = `toast ${type}`;
  box.innerHTML = `<i class="fas fa-${
    type === "success" ? "check-circle" : "exclamation-circle"
  }"></i> ${msg}`;
  container.appendChild(box);
  setTimeout(() => box.remove(), 3000);
};

window.openModal = (id) =>
  document.getElementById(id)?.classList.remove("hidden", "flex") ||
  document.getElementById(id)?.classList.add("flex");
window.closeModal = (id) =>
  document.getElementById(id)?.classList.add("hidden");

window.openBorrowModal = () => {
  window.openModal("borrowModal");
  document.getElementById("step1")?.classList.remove("hidden");
  document.getElementById("step2")?.classList.add("hidden");
  (document.getElementById("schoolCodeInput") as HTMLInputElement).value = "";
};

// ================= EVENT LISTENERS (FIXED) =================
// Bütün düymələri burada "tuturuq"
document.addEventListener("DOMContentLoaded", () => {
  // 1. Load Data
  loadTopStudents();
  loadTopBooks();
  loadRecentActivity();
  initBookSearch();
  initStudentSearch();

  // 2. Main Buttons (Giriş Ekranı)
  document
    .getElementById("btnBorrowBook")
    ?.addEventListener("click", window.openBorrowModal);

  // --- FIX: RƏY YAZ DÜYMƏSİ ---
  const btnReview = document.getElementById("btnWriteReview");
  if (btnReview) {
    btnReview.addEventListener("click", () => window.openModal("reviewModal"));
    console.log("✅ Rəy düyməsi aktivdir");
  } else {
    console.error("❌ Rəy düyməsi tapılmadı (ID yoxlayın)");
  }

  document
    .getElementById("btnAdminLogin")
    ?.addEventListener("click", () => window.openModal("teacherModal"));

  // 3. Modal Close Buttons
  document
    .getElementById("closeBorrowModal")
    ?.addEventListener("click", () => window.closeModal("borrowModal"));
  document
    .getElementById("closeReviewModal")
    ?.addEventListener("click", () => window.closeModal("reviewModal"));
  document
    .getElementById("closeTeacherModal")
    ?.addEventListener("click", () => window.closeModal("teacherModal"));
  document
    .getElementById("closeStudentDetails")
    ?.addEventListener("click", () => window.closeModal("studentDetailsModal"));
  document
    .getElementById("closeBookDetails")
    ?.addEventListener("click", () => window.closeModal("bookDetailsModal"));

  // 4. Logic Buttons
  document
    .getElementById("verifyCodeBtn")
    ?.addEventListener("click", verifySchoolCode);
  document
    .getElementById("submitOrderBtn")
    ?.addEventListener("click", submitOrder);

  // Review Logic
  document
    .getElementById("verifyReviewBtn")
    ?.addEventListener("click", verifyReviewCode);
  document
    .getElementById("submitReviewBtn")
    ?.addEventListener("click", submitReview);

  // Star UI
  document.querySelectorAll("#starContainer span").forEach((span, i) => {
    span.addEventListener("click", () => setRating(i + 1));
  });

  // 5. Admin Login Logic
  document
    .getElementById("adminLoginForm")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = (document.getElementById("email") as HTMLInputElement)
        .value;
      const pass = (document.getElementById("password") as HTMLInputElement)
        .value;
      const btn = document.getElementById("loginBtn") as HTMLButtonElement;

      btn.innerText = "YOXLANILIR...";
      btn.disabled = true;

      try {
        const { data, error } = await sb
          .from("admins")
          .select("*")
          .eq("email", email)
          .eq("password", pass)
          .single();
        if (error || !data) {
          window.showToast("Yanlış məlumat!", "error");
          btn.innerText = "Daxil Ol";
          btn.disabled = false;
        } else {
          localStorage.setItem("admin_user", JSON.stringify(data));
          localStorage.setItem("school_id", data.school_id);
          window.location.href = "./admin.html";
        }
      } catch {
        window.showToast("Sistem xətası", "error");
        btn.disabled = false;
      }
    });
});
