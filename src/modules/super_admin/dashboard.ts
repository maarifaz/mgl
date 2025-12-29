import { sb } from "../../lib/supabase";

// Global Leaflet (CDN-dən gəlir)
declare const L: any;

let map: any;
let schoolsData: any[] = [];
let markers: any[] = [];

// ================= HELPER: TOAST =================
const showToast = (msg: string, type: "success" | "error") => {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const box = document.createElement("div");
  box.className = `p-4 rounded shadow-lg text-white font-bold text-sm animate-[slideIn_0.3s] ${
    type === "success" ? "bg-green-600" : "bg-red-500"
  }`;
  box.innerText = msg;
  container.appendChild(box);
  setTimeout(() => box.remove(), 3000);
};

// ================= 1. INIT =================
document.addEventListener("DOMContentLoaded", async () => {
  // Auth Check
  //const role = localStorage.getItem("admin_user");
  // if(role !== "super_admin") window.location.href = "/"; // Güvənlik üçün açarsan

  initMap();
  await loadSchools();

  // Axtarış
  document
    .getElementById("schoolSearch")
    ?.addEventListener("input", (e: any) => {
      const term = e.target.value.toLowerCase();
      const filtered = schoolsData.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.country.toLowerCase().includes(term) ||
          s.city.toLowerCase().includes(term)
      );
      renderList(filtered);
    });

  // Logout
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "/";
  });
});

// ================= 2. MAP LOGIC =================
function initMap() {
  // Xəritə mərkəzi (İstanbul/Bakı arası)
  map = L.map("map", { zoomControl: false }).setView([40.0, 45.0], 4);

  // Dark Theme Tiles (CartoDB)
  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    {
      maxZoom: 19,
    }
  ).addTo(map);

  L.control.zoom({ position: "topright" }).addTo(map);

  // Xəritəyə Klikləyəndə -> Yeni Məktəb Modalı açılır
  map.on("click", (e: any) => {
    const { lat, lng } = e.latlng;
    (window as any).openAddModal(lat, lng);
  });
}

// ================= 3. LOAD DATA =================
async function loadSchools() {
  const { data, error } = await sb.from("schools").select("*").order("country");
  if (error) return showToast("Data xətası!", "error");

  schoolsData = data || [];
  updateStats();
  renderMapMarkers(schoolsData);
  renderList(schoolsData);
}

function updateStats() {
  document.getElementById("statSchools")!.innerText =
    schoolsData.length.toString();
  const countries = new Set(schoolsData.map((s) => s.country)).size;
  document.getElementById("statCountries")!.innerText = countries.toString();
  const students = schoolsData.reduce(
    (acc, curr) => acc + (curr.student_count || 0),
    0
  );
  document.getElementById("statStudents")!.innerText =
    students.toLocaleString();
}

// ================= 4. RENDER MARKERS =================
function renderMapMarkers(schools: any[]) {
  // Köhnə markerləri sil
  markers.forEach((m) => map.removeLayer(m));
  markers = [];

  schools.forEach((school) => {
    if (!school.lat || !school.lng) return;

    // Rəng: Aktiv = Göy, Passiv = Qırmızı
    const color = school.is_active ? "#2563eb" : "#ef4444";

    // Custom Icon (CSS ilə)
    const icon = L.divIcon({
      className: "custom-pin",
      html: `<div style="background:${color}; width:12px; height:12px; border-radius:50%; border:2px solid white; box-shadow:0 0 10px ${color}; position:relative;">
                    <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:${color}; opacity:0.5; animation:pulse-ring 2s infinite;"></div>
                   </div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });

    const marker = L.marker([school.lat, school.lng], { icon }).addTo(map);

    // POPUP Dizaynı
    const popupContent = `
            <div class="min-w-[220px] font-sans">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-gray-800 text-sm leading-tight pr-2">${
                      school.name
                    }</h3>
                    <span class="text-[10px] px-1.5 py-0.5 rounded ${
                      school.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    } font-bold">
                        ${school.is_active ? "AKTİV" : "PASSİV"}
                    </span>
                </div>
                <p class="text-xs text-gray-500 mb-3"><i class="fas fa-map-pin mr-1"></i> ${
                  school.city
                }, ${school.country}</p>
                
                <div class="grid grid-cols-2 gap-2 mb-3">
                    <div class="bg-gray-50 p-1.5 rounded text-center">
                        <span class="block font-bold text-blue-600">${
                          school.student_count
                        }</span>
                        <span class="text-[9px] text-gray-400 uppercase">Şagird</span>
                    </div>
                    <div class="bg-gray-50 p-1.5 rounded text-center">
                        <span class="block font-bold text-purple-600">${
                          school.book_count
                        }</span>
                        <span class="text-[9px] text-gray-400 uppercase">Kitab</span>
                    </div>
                </div>

                <div class="space-y-1">
                    <button onclick="(window as any).enterSchool('${
                      school.id
                    }')" class="w-full bg-blue-600 text-white text-xs py-1.5 rounded hover:bg-blue-700 font-bold transition">
                        <i class="fas fa-external-link-alt mr-1"></i> İDARƏ ET
                    </button>
                    <div class="flex gap-1">
                        <button onclick="(window as any).openAdminModal('${
                          school.id
                        }', '${
      school.name
    }')" class="flex-1 bg-gray-100 text-gray-600 text-[10px] py-1.5 rounded hover:bg-gray-200 font-bold">
                            <i class="fas fa-user-shield"></i> Admin
                        </button>
                        <button onclick="(window as any).toggleStatus('${
                          school.id
                        }', ${
      school.is_active
    })" class="flex-1 bg-gray-100 text-${
      school.is_active ? "red-500" : "green-500"
    } text-[10px] py-1.5 rounded hover:bg-gray-200 font-bold">
                            <i class="fas fa-power-off"></i> ${
                              school.is_active ? "Dayandır" : "Aç"
                            }
                        </button>
                    </div>
                </div>
            </div>
        `;

    marker.bindPopup(popupContent);
    markers.push(marker);
  });
}

// ================= 5. RENDER LIST =================
function renderList(list: any[]) {
  const container = document.getElementById("schoolList");
  if (!container) return;
  container.innerHTML = "";

  list.forEach((school) => {
    const div = document.createElement("div");
    div.className =
      "p-3 bg-white border border-gray-100 rounded-lg hover:shadow-md transition cursor-pointer group";
    div.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <h4 class="font-bold text-sm text-gray-700 group-hover:text-blue-600 truncate max-w-[180px]">${
                      school.name
                    }</h4>
                    <p class="text-xs text-gray-400">${school.country}</p>
                </div>
                <div class="text-right">
                    <span class="block font-bold text-xs ${
                      school.is_active ? "text-green-500" : "text-red-400"
                    }">●</span>
                </div>
            </div>
        `;
    div.onclick = () => {
      map.flyTo([school.lat, school.lng], 10, { duration: 1.5 });
      // Marker tap və popup aç
      // (Sadəlik üçün burada buraxırıq, xəritədə klikləmək kifayətdir)
    };
    container.appendChild(div);
  });
}

// ================= 6. ACTIONS (GLOBAL) =================

// A. Shadow Login (Məktəbə Daxil Olmaq)
(window as any).enterSchool = (id: string) => {
  localStorage.setItem("school_id", id);
  localStorage.setItem("admin_user", "super_admin_shadow");
  window.location.href = "/admin.html"; // Admin panelə atır
};

// B. Məktəbi Aktiv/Passiv etmək
(window as any).toggleStatus = async (id: string, currentStatus: boolean) => {
  const { error } = await sb
    .from("schools")
    .update({ is_active: !currentStatus })
    .eq("id", id);
  if (error) showToast("Xəta!", "error");
  else {
    showToast(
      currentStatus ? "Məktəb deaktiv edildi" : "Məktəb aktiv edildi",
      "success"
    );
    loadSchools(); // Yenilə
  }
};

// C. Yeni Məktəb Əlavə Etmək
(window as any).openAddModal = (lat?: number, lng?: number) => {
  document.getElementById("addSchoolModal")?.classList.remove("hidden");
  document.getElementById("addSchoolModal")?.classList.add("flex");

  if (lat && lng) {
    (document.getElementById("inpLat") as HTMLInputElement).value =
      lat.toFixed(6);
    (document.getElementById("inpLng") as HTMLInputElement).value =
      lng.toFixed(6);
    showToast("Koordinatlar seçildi!", "success");
  }
};

(window as any).saveNewSchool = async () => {
  const name = (document.getElementById("inpName") as HTMLInputElement).value;
  const country = (document.getElementById("inpCountry") as HTMLInputElement)
    .value;
  const city = (document.getElementById("inpCity") as HTMLInputElement).value;
  const lat = (document.getElementById("inpLat") as HTMLInputElement).value;
  const lng = (document.getElementById("inpLng") as HTMLInputElement).value;

  if (!name || !lat) return showToast("Ad və Koordinat mütləqdir!", "error");

  const { error } = await sb.from("schools").insert([
    {
      name,
      country,
      city,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      student_count: 0,
      book_count: 0,
      is_active: true,
    },
  ]);

  if (error) showToast("Xəta: " + error.message, "error");
  else {
    showToast("Məktəb yaradıldı!", "success");
    (window as any).closeModal("addSchoolModal");
    loadSchools();
  }
};

// D. Admin Yaratmaq
(window as any).openAdminModal = (schoolId: string, schoolName: string) => {
  (document.getElementById("adminSchoolId") as HTMLInputElement).value =
    schoolId;
  document.getElementById("adminModalSchoolName")!.innerText = schoolName;
  document.getElementById("adminModal")?.classList.remove("hidden");
  document.getElementById("adminModal")?.classList.add("flex");
};

(window as any).createLocalAdmin = async () => {
  const schoolId = (
    document.getElementById("adminSchoolId") as HTMLInputElement
  ).value;
  const email = (document.getElementById("adminEmail") as HTMLInputElement)
    .value;
  const pass = (document.getElementById("adminPass") as HTMLInputElement).value;

  if (!email || !pass) return showToast("Email və şifrə yazın!", "error");

  const { error } = await sb.from("admins").insert([
    {
      school_id: schoolId,
      email: email,
      password: pass, // Real layihədə hash-lənməlidir!
      role: "admin",
    },
  ]);

  if (error) showToast("Xəta: " + error.message, "error");
  else {
    showToast("Admin təyin edildi!", "success");
    (window as any).closeModal("adminModal");
  }
};

// Modalları bağlamaq üçün helper
(window as any).closeModal = (id: string) => {
  document.getElementById(id)?.classList.add("hidden");
  document.getElementById(id)?.classList.remove("flex");
};
