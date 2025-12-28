import { read, utils } from "xlsx";

export interface ExcelStudent {
  "Ad Soyad": string;
  Sinif: string;
  Kod: string | number; // Şagirdin məktəb nömrəsi
}

export function parseExcel(file: File): Promise<ExcelStudent[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = read(data, { type: "array" });

        // İlk vərəqi götürürük
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // JSON-a çeviririk
        const jsonData = utils.sheet_to_json(sheet) as ExcelStudent[];
        resolve(jsonData);
      } catch (error) {
        reject("Excel faylı oxuna bilmədi. Formatı yoxlayın.");
      }
    };

    reader.onerror = () => reject("Fayl oxunarkən xəta baş verdi.");
    reader.readAsArrayBuffer(file);
  });
}
