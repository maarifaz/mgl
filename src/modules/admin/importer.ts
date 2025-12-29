import { sb } from "../../lib/supabase";
import { parseExcel } from "../../lib/excel";

export async function importStudentsToSupabase(file: File, schoolId: string) {
  // 1. Excel-i oxuyuruq
  const rawData = await parseExcel(file);

  if (rawData.length === 0) throw new Error("Excel faylı boşdur!");

  // 2. Məlumatı bazaya uyğunlaşdırırıq
  // Bazadakı sütun adları: full_name, class_name, student_code, school_id
  const formattedData = rawData.map((row) => ({
    school_id: schoolId,
    full_name: row["Ad Soyad"],
    class_name: row["Sinif"] ? String(row["Sinif"]) : "",
    student_code: String(row["Kod"]), // Kodu həmişə mətnə çeviririk ki, problem olmasın
    xp_points: 0, // Başlanğıc xalı
  }));

  // 3. Supabase-ə hamısını birdən vururuq (Bulk Insert)
  const { error } = await sb.from("students").insert(formattedData);

  if (error) {
    console.error("Supabase Error:", error);
    throw new Error("Bazaya yazarkən xəta oldu: " + error.message);
  }

  return `${formattedData.length} şagird uğurla bazaya əlavə edildi!`;
}
