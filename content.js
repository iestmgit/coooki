(async () => {
  // گرفتن تنظیمات از storage
  const settings = await chrome.storage.local.get([
    "enabled",
    "fontData",      // dataURL فونت آپلودشده
    "fontName",      // اسم فونت آپلودشده
    "fontWeight",
    "fontFamily"
  ]);

  if (settings.enabled === false) return;

  const familyName = settings.fontName ? `CustomFont_${settings.fontName.replace(/\s/g, "")}` : "Vazirmatn";
  const weight = settings.fontWeight || "400";
  const family = settings.fontFamily || "Vazirmatn";

  // اگر کاربر فونت آپلود کرده، از اون استفاده کن
  let fontFaceRule = "";
  if (settings.fontData && settings.fontName) {
    fontFaceRule = `
      @font-face {
        font-family: "${familyName}";
        src: url("${settings.fontData}");
        font-weight: 100 900;
        font-style: normal;
        font-display: swap;
      }
    `;
  } else {
    // استفاده از Vazirmatn از CDN
    fontFaceRule = `
      @font-face {
        font-family: "Vazirmatn";
        src: url("https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn-Regular.woff2") format("woff2");
        font-weight: 400;
        font-display: swap;
      }
      @font-face {
        font-family: "Vazirmatn";
        src: url("https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn-Bold.woff2") format("woff2");
        font-weight: 700;
        font-display: swap;
      }
    `;
  }

  // استایل نهایی
  const style = document.createElement("style");
  style.id = "font-changer-style";
  style.textContent = `
    ${fontFaceRule}

    html, body,
    *:not(i):not(.fa):not(.fas):not(.far):not(.fab):not([class*="icon"]):not([class*="fa-"]) {
      font-family: "${settings.fontData ? familyName : family}" !important;
      font-weight: ${weight} !important;
    }

    /* حفظ آیکون‌ها */
    i, .fa, .fas, .far, .fab, [class*="icon-"], [class^="icon-"] {
      font-family: inherit !important;
    }
  `;

  // حذف استایل قبلی اگر وجود داشت
  const existing = document.getElementById("font-changer-style");
  if (existing) existing.remove();

  document.documentElement.appendChild(style);

  // گوش دادن به تغییرات (فعال/غیرفعال)
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled || changes.fontData || changes.fontName || changes.fontWeight || changes.fontFamily) {
      location.reload();
    }
  });
})();
