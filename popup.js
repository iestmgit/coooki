const toggle = document.getElementById("toggle");
const panel = document.getElementById("panel");
const uploadSection = document.getElementById("upload-section");
const fontBtns = document.querySelectorAll(".font-btn");
const fontFile = document.getElementById("font-file");
const fileName = document.getElementById("file-name");
const weight = document.getElementById("weight");
const weightVal = document.getElementById("weight-val");
const resetBtn = document.getElementById("reset");

const weightLabels = {
  100: "نازک", 200: "خیلی سبک", 300: "سبک", 400: "نرمال",
  500: "متوسط", 600: "نیمه‌ضخیم", 700: "ضخیم",
  800: "خیلی ضخیم", 900: "سیاه"
};

// بارگذاری تنظیمات
async function load() {
  const s = await chrome.storage.local.get([
    "enabled", "fontFamily", "fontName", "fontData", "fontWeight"
  ]);

  toggle.checked = s.enabled !== false;
  panel.classList.toggle("disabled", s.enabled === false);

  weight.value = s.fontWeight || 400;
  updateWeightLabel();

  if (s.fontName && s.fontData) {
    fontBtns.forEach(b => b.classList.remove("active"));
    document.querySelector('[data-font="custom"]').classList.add("active");
    uploadSection.style.display = "block";
    fileName.textContent = `✅ ${s.fontName}`;
  } else {
    document.querySelector('[data-font="Vazirmatn"]').classList.add("active");
  }
}

function updateWeightLabel() {
  weightVal.textContent = `${weight.value} (${weightLabels[weight.value] || ""})`;
}

// فعال/غیرفعال
toggle.addEventListener("change", async () => {
  await chrome.storage.local.set({ enabled: toggle.checked });
  panel.classList.toggle("disabled", !toggle.checked);
});

// انتخاب نوع فونت
fontBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    fontBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    if (btn.dataset.font === "custom") {
      uploadSection.style.display = "block";
    } else {
      uploadSection.style.display = "none";
      chrome.storage.local.remove(["fontData", "fontName"]);
    }
  });
});

// آپلود فونت
fontFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert("حجم فونت نباید بیشتر از ۵ مگابایت باشد");
    return;
  }

  const reader = new FileReader();
  reader.onload = async (ev) => {
    await chrome.storage.local.set({
      fontData: ev.target.result,
      fontName: file.name
    });
    fileName.textContent = `✅ ${file.name}`;
    fontBtns.forEach(b => b.classList.remove("active"));
    document.querySelector('[data-font="custom"]').classList.add("active");
    uploadSection.style.display = "block";
  };
  reader.readAsDataURL(file);
});

// تغییر ضخامت
weight.addEventListener("input", async () => {
  updateWeightLabel();
  await chrome.storage.local.set({ fontWeight: weight.value });
});

// ریست
resetBtn.addEventListener("click", async () => {
  await chrome.storage.local.clear();
  await chrome.storage.local.set({ enabled: true, fontWeight: 400 });
  load();
  fileName.textContent = "";
  fontFile.value = "";
});

load();
