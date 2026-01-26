/* booking.js */
document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const form = document.getElementById("bookingForm");
  const formError = document.getElementById("formError");
  const phoneInput = document.getElementById("phone");
  const dateInput = document.getElementById("date");
  const successMessage = document.getElementById("successMessage");
  const newBookingBtn = document.getElementById("newBookingBtn");

  if (!form || !phoneInput || !dateInput || !formError || !successMessage) return;

  // min date = today
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const localDate = `${yyyy}-${mm}-${dd}`;
  dateInput.min = localDate;
  if (!dateInput.value) dateInput.value = localDate;

  function normalizeTRPhone(raw) {
    let digits = String(raw || "").replace(/\D/g, "");
    if (digits.startsWith("90")) digits = digits.slice(2);
    if (digits.startsWith("0")) digits = digits.slice(1);
    return digits.slice(0, 10);
  }

  function formatTRPhone(digits10) {
    const d = (digits10 || "").slice(0, 10);
    const p1 = d.slice(0, 3);
    const p2 = d.slice(3, 6);
    const p3 = d.slice(6, 8);
    const p4 = d.slice(8, 10);
    let out = p1;
    if (p2) out += " " + p2;
    if (p3) out += " " + p3;
    if (p4) out += " " + p4;
    return out.trim();
  }

  function showError(msg) {
    formError.textContent = msg;
    formError.hidden = false;
    formError.style.display = "block";
    formError.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function clearError() {
    formError.textContent = "";
    formError.hidden = true;
    formError.style.display = "none";
  }

  function resetForm() {
    form.reset();
    phoneInput.value = "5";
    dateInput.value = localDate;
    successMessage.hidden = true;
    form.style.display = "block";
    clearError();

    if (typeof gtag !== "undefined") {
      gtag("event", "trial_form_reset", { event_category: "form_interaction" });
    }
  }

  if (newBookingBtn) newBookingBtn.addEventListener("click", resetForm);

  phoneInput.addEventListener("focus", (e) => {
    if (e.target.value === "5") {
      setTimeout(() => e.target.setSelectionRange(1, 1), 0);
    }
  });

  phoneInput.addEventListener("input", (e) => {
    const digits = normalizeTRPhone(e.target.value);
    e.target.value = formatTRPhone(digits);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearError();

    const name = document.getElementById("name")?.value.trim();
    const phoneDigits = normalizeTRPhone(phoneInput.value);
    const rawDate = dateInput.value;
    const time = document.getElementById("time")?.value;
    const service = document.getElementById("service")?.value;
    const consent = document.getElementById("consent")?.checked;

    if (!name || name.length < 3) return showError("Lütfen ad soyad alanını doğru girin (en az 3 karakter).");
    if (!phoneDigits || phoneDigits.length !== 10 || !phoneDigits.startsWith("5"))
      return showError("Lütfen 10 haneli, 5 ile başlayan cep telefonu numarası girin. Örn: 5XX XXX XX XX");
    if (!rawDate) return showError("Lütfen tarih seçin.");
    if (!time) return showError("Lütfen saat aralığı seçin.");
    if (!service) return showError("Lütfen ilgilendiğiniz hizmeti seçin.");
    if (!consent) return showError("Devam etmek için KVKK onayını işaretlemelisiniz.");

    const parts = rawDate.split("-");
    const formattedDate = (parts.length === 3) ? `${parts[2]}.${parts[1]}.${parts[0]}` : rawDate;
    const fullPhone = `+90 ${formatTRPhone(phoneDigits)}`;

    const text = `*ÜCRETSİZ DENEME RANDEVUSU*
Merhaba BLACK GYM, ücretsiz deneme için randevu almak istiyorum.

İsim: ${name}
Tel: ${fullPhone}
İlgilendiğim: ${service}
Tarih: ${formattedDate}
Saat Aralığı: ${time}`;

    if (typeof gtag !== "undefined") {
      gtag("event", "trial_booking_submitted", { event_category: "conversion", event_label: service, value: 1 });
    }

    const whatsappNumber = "905300789500";
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener");

    form.style.display = "none";
    successMessage.hidden = false;
    successMessage.scrollIntoView({ behavior: "smooth", block: "start" });

    if (typeof gtag !== "undefined") {
      gtag("event", "whatsapp_opened", { event_category: "engagement", event_label: "trial_booking" });
    }
  });

  if (typeof gtag !== "undefined") {
    gtag("event", "trial_page_view", { event_category: "page_view", event_label: "booking_form" });
  }
});
