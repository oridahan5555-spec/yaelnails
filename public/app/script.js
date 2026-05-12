const LOCAL_STORAGE_KEY = "booking_app_local_working_v2";
const SELLER_SESSION_KEY = "booking_app_seller_session_v1";
const REJECT_UNDO_WINDOW_MS = 5000;
const DEFAULT_OWNER_STAFF = {
  id: "staff-owner",
  name: "בעלת העסק",
  role: "נותנת השירות",
  initials: "ב",
  is_anyone: false
};

const DEFAULT_DATA = {
  business: {
    name: "Yael nails",
    description: "תיאור קצר של העסק.",
    address: "כתובת העסק",
    phone: "",
    instagram_url: ""
  },
  sellerCredentials: {
    username: "seller",
    password: "1234"
  },
  services: [
    { id: "service-1", category: "טיפולי ידיים", name: "בניה בטיפס הפוך", price: 230, duration: 120 },
    { id: "service-2", category: "טיפולי ידיים", name: "לק ג'ל + מבנה אנטומי", price: 110, duration: 90 },
    { id: "service-3", category: "טיפולי ידיים", name: "הסרה לק גל", price: 20, duration: 20 },
    { id: "service-4", category: "טיפולי ידיים", name: "ציור", price: 10, duration: 10 },
    { id: "service-5", category: "טיפולי ידיים", name: "פרנץ", price: 10, duration: 10 },
    { id: "service-6", category: "טיפולי ידיים", name: "השלמה", price: 10, duration: 30 }
  ],
  staff: [DEFAULT_OWNER_STAFF],
  workingHours: [
    { id: "hours-0", day_of_week: 0, day_label: "ראשון", opens_at: "17:00", closes_at: "20:00", slot_interval_minutes: 30, is_closed: false },
    { id: "hours-1", day_of_week: 1, day_label: "שני", opens_at: "15:40", closes_at: "20:00", slot_interval_minutes: 20, is_closed: false },
    { id: "hours-2", day_of_week: 2, day_label: "שלישי", opens_at: "15:00", closes_at: "20:00", slot_interval_minutes: 30, is_closed: false },
    { id: "hours-3", day_of_week: 3, day_label: "רביעי", opens_at: null, closes_at: null, slot_interval_minutes: 30, is_closed: true },
    { id: "hours-4", day_of_week: 4, day_label: "חמישי", opens_at: "15:30", closes_at: "20:00", slot_interval_minutes: 30, is_closed: false },
    { id: "hours-5", day_of_week: 5, day_label: "שישי", opens_at: null, closes_at: null, slot_interval_minutes: 30, is_closed: true },
    { id: "hours-6", day_of_week: 6, day_label: "שבת", opens_at: null, closes_at: null, slot_interval_minutes: 30, is_closed: true }
  ],
  bookings: [],
  users: []
};

const state = loadState();

const uiState = {
  wizardStep: 1,
  selectedServiceId: null,
  selectedStaffId: DEFAULT_OWNER_STAFF.id,
  selectedDate: "",
  selectedTime: "",
  selectedMonthKey: monthKey(new Date()),
  sellerCalendarDate: todayDate(),
  sellerCalendarMonthKey: monthKey(new Date()),
  rejectUndoBookingId: null,
  rejectUndoPreviousStatus: null,
  rejectUndoTimeoutId: null
};

const session = {
  role: null,
  customerPhone: null
};

const brandName = document.getElementById("brandName");
const businessName = document.getElementById("businessName");
const businessDescription = document.getElementById("businessDescription");
const businessAddress = document.getElementById("businessAddress");
const whatsAppLink = document.getElementById("whatsAppLink");
const phoneLink = document.getElementById("phoneLink");
const instagramLink = document.getElementById("instagramLink");


const wizardSteps = document.querySelectorAll("[data-step-indicator]");
const servicesStep = document.getElementById("servicesStep");
const staffStep = document.getElementById("staffStep");
const scheduleStep = document.getElementById("scheduleStep");
const detailsStep = document.getElementById("detailsStep");
const servicesCategories = document.getElementById("servicesCategories");
const staffCards = document.getElementById("staffCards");
const selectedSummary = document.getElementById("selectedSummary");
const calendarMonthLabel = document.getElementById("calendarMonthLabel");
const calendarGrid = document.getElementById("calendarGrid");
const calendarPrevButton = document.getElementById("calendarPrevButton");
const calendarNextButton = document.getElementById("calendarNextButton");
const timeGroups = document.getElementById("timeGroups");
const emptyTimesState = document.getElementById("emptyTimesState");
const todayAvailabilityText = document.getElementById("todayAvailabilityText");
const todaySlotsList = document.getElementById("todaySlotsList");
const bookingSummaryCard = document.getElementById("bookingSummaryCard");
const detailsNotice = document.getElementById("detailsNotice");
const bookingSuccessPanel = document.getElementById("bookingSuccessPanel");
const bookingSuccessSummary = document.getElementById("bookingSuccessSummary");
const bookingSuccessCalendarButton = document.getElementById("bookingSuccessCalendarButton");
const bookingSuccessIcsButton = document.getElementById("bookingSuccessIcsButton");
const bookingForm = document.getElementById("bookingForm");
const customerBookingsPanel = document.getElementById("customerBookingsPanel");
const myBookingsList = document.getElementById("myBookingsList");
const sellerPanel = document.getElementById("sellerPanel");
const sellerCalendarPrevButton = document.getElementById("sellerCalendarPrevButton");
const sellerCalendarNextButton = document.getElementById("sellerCalendarNextButton");
const sellerCalendarMonthLabel = document.getElementById("sellerCalendarMonthLabel");
const sellerCalendarGrid = document.getElementById("sellerCalendarGrid");
const sellerCalendarList = document.getElementById("sellerCalendarList");
const sellerBookingsList = document.getElementById("sellerBookingsList");

const openCustomerLogin = document.getElementById("openCustomerLogin");
const openSellerLogin = document.getElementById("openSellerLogin");
const logoutButton = document.getElementById("logoutButton");
const authModal = document.getElementById("authModal");
const closeModal = document.getElementById("closeModal");
const modalTabs = document.querySelectorAll(".modal-tab");
const customerLoginForm = document.getElementById("customerLoginForm");
const sellerLoginForm = document.getElementById("sellerLoginForm");

const goToStaffStep = document.getElementById("goToStaffStep");
const goToScheduleStep = document.getElementById("goToScheduleStep");
const goToDetailsStep = document.getElementById("goToDetailsStep");
const backToServicesStep = document.getElementById("backToServicesStep");
const backToStaffStep = document.getElementById("backToStaffStep");
const backToScheduleStep = document.getElementById("backToScheduleStep");

const businessForm = document.getElementById("businessForm");
const sellerCredentialsForm = document.getElementById("sellerCredentialsForm");
const servicesForm = document.getElementById("servicesForm");
const servicesEditor = document.getElementById("servicesEditor");
const addServiceButton = document.getElementById("addServiceButton");
const hoursForm = document.getElementById("hoursForm");
const hoursEditor = document.getElementById("hoursEditor");

function loadState() {
  const defaults = structuredClone(DEFAULT_DATA);

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem("booking_app_local_working_v1");
    if (!raw) {
      return defaults;
    }

    const parsed = JSON.parse(raw);
    const loadedState = {
      business: normalizeBusiness({ ...defaults.business, ...(parsed.business || {}) }),
      sellerCredentials: {
        ...defaults.sellerCredentials,
        ...(parsed.sellerCredentials || {})
      },
      services: Array.isArray(parsed.services) && parsed.services.length ? parsed.services : defaults.services,
      staff: Array.isArray(parsed.staff) && parsed.staff.length ? parsed.staff : defaults.staff,
      workingHours: Array.isArray(parsed.workingHours) && parsed.workingHours.length ? parsed.workingHours : defaults.workingHours,
      bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [],
      users: Array.isArray(parsed.users) ? parsed.users : []
    };

    loadedState.bookings = normalizeBookings(loadedState.bookings, loadedState.staff, loadedState.services);
    loadedState.staff = normalizeStaff(loadedState.staff);
    return loadedState;
  } catch (error) {
    return defaults;
  }
}

function saveState() {
  localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify({
      business: state.business,
      sellerCredentials: state.sellerCredentials,
      services: state.services,
      staff: state.staff,
      workingHours: state.workingHours,
      bookings: state.bookings,
      users: state.users
    })
  );
}

function normalizeBusiness(business) {
  const normalized = { ...business };

  if (!normalized.name || normalized.name === "שם העסק" || normalized.phone === "058-560-9500") {
    normalized.name = DEFAULT_DATA.business.name;
  }

  if (!normalized.description || normalized.description === "מניקור, ג'ל ובנייה באווירה נקייה, רגועה ומדויקת.") {
    normalized.description = DEFAULT_DATA.business.description;
  }

  if (!normalized.address || normalized.address === "נחל צלמון 12") {
    normalized.address = DEFAULT_DATA.business.address;
  }

  if (!normalized.phone || normalized.phone === "058-560-9500") {
    normalized.phone = DEFAULT_DATA.business.phone;
  }

  normalized.instagram_url = normalizeInstagramUrl(normalized.instagram_url);
  return normalized;
}

function normalizeStaff(staff) {
  return [{ ...DEFAULT_OWNER_STAFF }];
}

function normalizeBookings(bookings, staff, services) {
  const fallbackStaff = staff[0] || DEFAULT_OWNER_STAFF;

  return bookings.map((booking) => {
    const service = services.find((item) => item.id === booking.service_id);
    const assignedStaff = staff.find((member) => member.id === booking.staff_id) || fallbackStaff;
    return {
      ...booking,
      duration_minutes: Number(booking.duration_minutes || service?.duration || 30),
      staff_id: assignedStaff.id,
      staff_name: assignedStaff.name
    };
  });
}

function localDateValue(date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split("T")[0];
}

function todayDate() {
  return localDateValue(new Date());
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthDateFromKey(key) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function normalizePhoneNumber(value) {
  return String(value || "").replace(/[^\d+]/g, "");
}

function isSamePhone(left, right) {
  return normalizePhoneNumber(left) === normalizePhoneNumber(right);
}

function normalizeInstagramUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed || trimmed === "https://instagram.com") {
    return "";
  }
  return trimmed;
}

function formatPrice(price) {
  return `₪${Number(price)}`;
}

function formatStatus(status) {
  if (status === "approved") {
    return "אושר";
  }
  if (status === "rejected") {
    return "נדחה";
  }
  if (status === "cancelled") {
    return "בוטל";
  }
  return "ממתין לאישור";
}

function formatDisplayDate(dateValue) {
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
}

function parseTimeToMinutes(value) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatMinutesToTime(totalMinutes) {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatIcsDateTime(dateValue, timeValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours, minutes] = String(timeValue).slice(0, 5).split(":").map(Number);

  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
    "T",
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    "00"
  ].join("");
}

function getBookingEndTime(booking) {
  const startMinutes = parseTimeToMinutes(String(booking.booking_time).slice(0, 5));
  return formatMinutesToTime(startMinutes + Number(booking.duration_minutes || 30));
}

function buildGoogleCalendarUrl(booking) {
  const businessTitle = String(state.business.name || DEFAULT_DATA.business.name).trim() || DEFAULT_DATA.business.name;
  const customerName = [booking.customer_first_name, booking.customer_last_name].filter(Boolean).join(" ").trim();
  const descriptionLines = [
    `שירות: ${booking.service_name}`,
    `סטטוס: ${formatStatus(booking.status)}`,
    customerName ? `לקוחה: ${customerName}` : "",
    booking.customer_phone ? `טלפון: ${booking.customer_phone}` : "",
    booking.notes ? `הערות: ${booking.notes}` : ""
  ].filter(Boolean);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${businessTitle} - ${booking.service_name}`,
    dates: `${formatIcsDateTime(booking.booking_date, booking.booking_time)}/${formatIcsDateTime(booking.booking_date, getBookingEndTime(booking))}`,
    details: descriptionLines.join("\n"),
    location: state.business.address || ""
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function openGoogleCalendarForBooking(booking) {
  if (!booking) {
    return;
  }

  const calendarUrl = buildGoogleCalendarUrl(booking);
  const popup = window.open(calendarUrl, "_blank", "noopener");

  if (!popup) {
    window.location.href = calendarUrl;
  }
}

function buildIcsForBooking(booking) {
  const businessTitle = String(state.business.name || DEFAULT_DATA.business.name).trim() || DEFAULT_DATA.business.name;
  const customerName = [booking.customer_first_name, booking.customer_last_name].filter(Boolean).join(" ").trim();
  const descriptionLines = [
    `שירות: ${booking.service_name}`,
    `סטטוס: ${formatStatus(booking.status)}`,
    customerName ? `לקוחה: ${customerName}` : "",
    booking.customer_phone ? `טלפון: ${booking.customer_phone}` : "",
    booking.notes ? `הערות: ${booking.notes}` : ""
  ].filter(Boolean).join("\\n");
  const dtStart = formatIcsDateTime(booking.booking_date, booking.booking_time);
  const dtEnd = formatIcsDateTime(booking.booking_date, getBookingEndTime(booking));
  const dtStamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const uid = `booking-${booking.id}@yaelnails`;
  const escapeText = (s) => String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//YaelNails//Booking//HE",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeText(`${businessTitle} - ${booking.service_name}`)}`,
    `DESCRIPTION:${escapeText(descriptionLines)}`,
    `LOCATION:${escapeText(state.business.address || "")}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}

function downloadIcsForBooking(booking) {
  if (!booking) return;
  const ics = buildIcsForBooking(booking);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `appointment-${booking.booking_date}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function findBookingById(bookingId) {
  return state.bookings.find((booking) => booking.id === bookingId) || null;
}

function clearRejectUndo(shouldRerender = false) {
  if (uiState.rejectUndoTimeoutId) {
    clearTimeout(uiState.rejectUndoTimeoutId);
  }

  uiState.rejectUndoBookingId = null;
  uiState.rejectUndoPreviousStatus = null;
  uiState.rejectUndoTimeoutId = null;

  if (shouldRerender) {
    rerenderAll();
  }
}

function startRejectUndo(bookingId, previousStatus) {
  clearRejectUndo(false);
  uiState.rejectUndoBookingId = bookingId;
  uiState.rejectUndoPreviousStatus = previousStatus;
  uiState.rejectUndoTimeoutId = setTimeout(() => {
    clearRejectUndo(true);
  }, REJECT_UNDO_WINDOW_MS);
}

function isRejectUndoActiveForBooking(bookingId) {
  return uiState.rejectUndoBookingId === bookingId;
}

function getSelectedService() {
  return state.services.find((service) => service.id === uiState.selectedServiceId) || null;
}

function getSelectedStaff() {
  return state.staff.find((staff) => staff.id === uiState.selectedStaffId) || state.staff[0];
}

function getRealStaffMembers() {
  return state.staff.filter((staff) => !staff.is_anyone);
}

function getCurrentCustomer() {
  if (!session.customerPhone) {
    return null;
  }
  return state.users.find((user) => isSamePhone(user.phone, session.customerPhone)) || null;
}

function parseFullName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return { firstName: "", lastName: "" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  return {
    firstName: parts.shift(),
    lastName: parts.join(" ")
  };
}

function hideBookingSuccess() {
  bookingSuccessPanel.classList.add("is-hidden");
  bookingSuccessSummary.innerHTML = "";
  bookingSuccessCalendarButton.classList.add("is-hidden");
  bookingSuccessIcsButton.classList.add("is-hidden");
  delete bookingSuccessCalendarButton.dataset.bookingId;
  delete bookingSuccessIcsButton.dataset.bookingId;
}

function showBookingSuccess(booking) {
  bookingSuccessSummary.innerHTML = `
    <div class="summary-row"><span>שירות</span><strong>${booking.service_name}</strong></div>
    <div class="summary-row"><span>אשת צוות</span><strong>${booking.staff_name}</strong></div>
    <div class="summary-row"><span>תאריך</span><strong>${formatDisplayDate(booking.booking_date)}</strong></div>
    <div class="summary-row"><span>שעה</span><strong>${booking.booking_time}</strong></div>
  `;
  bookingSuccessCalendarButton.dataset.bookingId = booking.id;
  bookingSuccessCalendarButton.classList.remove("is-hidden");
  bookingSuccessIcsButton.dataset.bookingId = booking.id;
  bookingSuccessIcsButton.classList.remove("is-hidden");
  bookingSuccessPanel.classList.remove("is-hidden");
}

function updateContactLinks() {
  const phoneNumber = (state.business.phone || "").replace(/[^0-9+]/g, "");
  const instagramUrl = normalizeInstagramUrl(state.business.instagram_url);

  whatsAppLink.href = phoneNumber ? `https://wa.me/${phoneNumber}` : "#";
  phoneLink.href = phoneNumber ? `tel:${phoneNumber}` : "#";
  

  instagramLink.classList.toggle("is-hidden", !instagramUrl);
  if (instagramUrl) {
    instagramLink.href = instagramUrl;
    instagramLink.target = "_blank";
    instagramLink.rel = "noreferrer";
  } else {
    instagramLink.removeAttribute("href");
    instagramLink.removeAttribute("target");
    instagramLink.removeAttribute("rel");
  }
}

function renderBusiness() {
  brandName.textContent = state.business.name;
  businessName.textContent = state.business.name;
  businessDescription.textContent = state.business.description;
  businessAddress.textContent = state.business.address;
  updateContactLinks();
}

function renderWizardSteps() {
  wizardSteps.forEach((step) => {
    const stepNumber = Number(step.dataset.stepIndicator);
    step.classList.toggle("is-active", stepNumber === uiState.wizardStep);
    step.classList.toggle("is-complete", stepNumber < uiState.wizardStep);
  });
}

function showWizardStep(stepNumber) {
  uiState.wizardStep = stepNumber;
  servicesStep.classList.toggle("is-active", stepNumber === 1);
  staffStep.classList.toggle("is-active", stepNumber === 2);
  scheduleStep.classList.toggle("is-active", stepNumber === 3);
  detailsStep.classList.toggle("is-active", stepNumber === 4);
  renderWizardSteps();
}

function groupedServices() {
  return state.services.reduce((groups, service) => {
    if (!groups[service.category]) {
      groups[service.category] = [];
    }
    groups[service.category].push(service);
    return groups;
  }, {});
}

function renderServices() {
  servicesCategories.innerHTML = Object.entries(groupedServices())
    .map(([category, services]) => `
      <section class="category-block">
        <h3 class="category-title">${category}</h3>
        <div class="services-grid">
          ${services.map((service) => `
            <button class="service-card ${service.id === uiState.selectedServiceId ? "is-selected" : ""}" type="button" data-service-id="${service.id}">
              <div class="service-card-head">
                <strong>${service.name}</strong>
                <span class="service-card-check" aria-hidden="true"></span>
              </div>
              <div class="service-card-meta">
                <span>${formatPrice(service.price)} | ${service.duration} דקות</span>
              </div>
            </button>
          `).join("")}
        </div>
      </section>
    `)
    .join("");
}

function renderStaff() {
  staffCards.innerHTML = state.staff
    .map((staff) => `
      <button class="staff-card ${staff.id === uiState.selectedStaffId ? "is-selected" : ""}" type="button" data-staff-id="${staff.id}">
        <div class="staff-avatar" aria-hidden="true">${staff.initials}</div>
        <strong>${staff.name}</strong>
        <span>${staff.role}</span>
      </button>
    `)
    .join("");
}

function renderSelectedSummary() {
  const service = getSelectedService();
  const staff = getSelectedStaff();

  if (!service) {
    selectedSummary.innerHTML = "";
    return;
  }

  selectedSummary.innerHTML = `
    <div class="selected-summary-row"><span>שירות</span><strong>${service.name}</strong></div>
    <div class="selected-summary-row"><span>מחיר</span><strong>${formatPrice(service.price)}</strong></div>
    <div class="selected-summary-row"><span>משך</span><strong>${service.duration} דקות</strong></div>
    <div class="selected-summary-row"><span>צוות</span><strong>${staff.name}</strong></div>
  `;
}

function renderBookingSummary() {
  const service = getSelectedService();
  const staff = getSelectedStaff();
  const dateText = uiState.selectedDate ? formatDisplayDate(uiState.selectedDate) : "-";
  const timeText = uiState.selectedTime || "-";

  bookingSummaryCard.innerHTML = `
    <div class="summary-row"><span>שירות</span><strong>${service ? service.name : "-"}</strong></div>
    <div class="summary-row"><span>אשת צוות</span><strong>${staff ? staff.name : "-"}</strong></div>
    <div class="summary-row"><span>תאריך</span><strong>${dateText}</strong></div>
    <div class="summary-row"><span>שעה</span><strong>${timeText}</strong></div>
  `;
}

function findWorkingHoursForDate(dateValue) {
  const dayOfWeek = new Date(`${dateValue}T00:00:00`).getDay();
  return state.workingHours.find((entry) => Number(entry.day_of_week) === dayOfWeek) || null;
}

function isPastDate(dateValue) {
  return dateValue < todayDate();
}

function isPastTime(dateValue, timeValue) {
  const now = new Date();
  const slot = new Date(`${dateValue}T${timeValue}:00`);
  return slot.getTime() <= now.getTime();
}

function bookingOverlaps(booking, startMinutes, durationMinutes) {
  const bookingStart = parseTimeToMinutes(String(booking.booking_time).slice(0, 5));
  const bookingEnd = bookingStart + Number(booking.duration_minutes);
  const candidateEnd = startMinutes + durationMinutes;
  return startMinutes < bookingEnd && bookingStart < candidateEnd;
}

function getActiveBookingsForDate(dateValue) {
  return state.bookings.filter((booking) => booking.booking_date === dateValue && ["pending", "approved"].includes(booking.status));
}

function getAssignableStaffIds(dateValue, startMinutes, durationMinutes) {
  const activeBookings = getActiveBookingsForDate(dateValue);
  return getRealStaffMembers()
    .filter((staff) => !activeBookings.some((booking) => booking.staff_id === staff.id && bookingOverlaps(booking, startMinutes, durationMinutes)))
    .map((staff) => staff.id);
}

function getAvailableSlots(dateValue, serviceId = uiState.selectedServiceId, staffId = uiState.selectedStaffId) {
  const service = state.services.find((item) => item.id === serviceId);
  const workDay = findWorkingHoursForDate(dateValue);

  if (!service || !workDay || workDay.is_closed || !workDay.opens_at || !workDay.closes_at || isPastDate(dateValue)) {
    return [];
  }

  const openMinutes = parseTimeToMinutes(workDay.opens_at.slice(0, 5));
  const closeMinutes = parseTimeToMinutes(workDay.closes_at.slice(0, 5));
  const interval = Number(workDay.slot_interval_minutes || 30);
  const slots = [];

  for (let start = openMinutes; start + Number(service.duration) <= closeMinutes; start += interval) {
    const slotTime = formatMinutesToTime(start);

    if (dateValue === todayDate() && isPastTime(dateValue, slotTime)) {
      continue;
    }

    const assignableStaffIds = getAssignableStaffIds(dateValue, start, Number(service.duration));
    if (assignableStaffIds.includes(staffId)) {
      slots.push(slotTime);
    }
  }

  return slots;
}

function hasAvailabilityOnDate(dateValue) {
  return getAvailableSlots(dateValue).length > 0;
}

function renderTodayAvailability() {
  const service = getSelectedService();

  if (!service) {
    todayAvailabilityText.textContent = "בחרי שירות כדי לראות שעות פנויות להיום.";
    todaySlotsList.innerHTML = "";
    return;
  }

  const slots = getAvailableSlots(todayDate(), service.id, uiState.selectedStaffId).slice(0, 6);
  if (!slots.length) {
    todayAvailabilityText.textContent = `אין שעות פנויות היום עבור ${service.name}.`;
    todaySlotsList.innerHTML = "";
    return;
  }

  todayAvailabilityText.textContent = `השעות הקרובות הפנויות היום עבור ${service.name}:`;
  todaySlotsList.innerHTML = slots
    .map((time) => `<button class="today-slot-chip" type="button" data-today-time="${time}">${time}</button>`)
    .join("");
}

function buildCalendarDays(monthDate) {
  const firstOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const firstVisible = new Date(firstOfMonth);
  firstVisible.setDate(firstVisible.getDate() - firstOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstVisible);
    date.setDate(firstVisible.getDate() + index);
    const value = localDateValue(date);
    return {
      value,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === monthDate.getMonth(),
      isPast: isPastDate(value),
      isAvailable: hasAvailabilityOnDate(value)
    };
  });
}

function buildSellerCalendarDays(monthDate) {
  const firstOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const firstVisible = new Date(firstOfMonth);
  firstVisible.setDate(firstVisible.getDate() - firstOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstVisible);
    date.setDate(firstVisible.getDate() + index);
    const value = localDateValue(date);
    const hasBookings = state.bookings.some(
      (booking) => booking.booking_date === value && booking.status !== "cancelled"
    );

    return {
      value,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === monthDate.getMonth(),
      hasBookings
    };
  });
}

function renderCalendar() {
  const monthDate = monthDateFromKey(uiState.selectedMonthKey);
  calendarMonthLabel.textContent = monthDate.toLocaleDateString("he-IL", {
    month: "long",
    year: "numeric"
  });

  calendarGrid.innerHTML = buildCalendarDays(monthDate)
    .map((day) => {
      if (!day.isCurrentMonth) {
        return '<div class="calendar-day is-outside" aria-hidden="true"></div>';
      }

      const disabled = day.isPast || !day.isAvailable;
      const classes = [
        "calendar-day",
        day.isAvailable ? "is-available" : "",
        disabled ? "is-disabled" : "",
        uiState.selectedDate === day.value ? "is-selected" : ""
      ].filter(Boolean).join(" ");

      return `
        <button class="${classes}" type="button" data-calendar-date="${day.value}" ${disabled ? "disabled" : ""}>
          ${day.dayNumber}
        </button>
      `;
    })
    .join("");
}

function groupTimes(times) {
  const groups = {
    בוקר: [],
    צהריים: [],
    ערב: []
  };

  times.forEach((time) => {
    const hour = Number(time.split(":")[0]);
    if (hour < 12) {
      groups["בוקר"].push(time);
    } else if (hour < 17) {
      groups["צהריים"].push(time);
    } else {
      groups["ערב"].push(time);
    }
  });

  return groups;
}

function renderTimeOptions() {
  const availableTimes = uiState.selectedDate ? getAvailableSlots(uiState.selectedDate) : [];
  const grouped = groupTimes(availableTimes);

  if (!availableTimes.includes(uiState.selectedTime)) {
    uiState.selectedTime = "";
  }

  timeGroups.innerHTML = Object.entries(grouped)
    .filter(([, values]) => values.length > 0)
    .map(([title, values]) => `
      <section class="time-group">
        <h4>${title}</h4>
        <div class="time-slots-grid">
          ${values.map((time) => `
            <button class="time-slot-button ${time === uiState.selectedTime ? "is-selected" : ""}" type="button" data-time-value="${time}">
              ${time}
            </button>
          `).join("")}
        </div>
      </section>
    `)
    .join("");

  emptyTimesState.classList.toggle("is-hidden", availableTimes.length > 0);
}

function renderDetailsForm() {
  const currentCustomer = getCurrentCustomer();
  const fullName = currentCustomer
    ? [currentCustomer.firstName, currentCustomer.lastName].filter(Boolean).join(" ")
    : "";

  bookingForm.elements.fullName.value = fullName;
  bookingForm.elements.phone.value = currentCustomer?.phone || "";

  const isLoggedIn = session.role === "customer";
  detailsNotice.textContent = isLoggedIn
    ? "הפרטים נמשכו מהחשבון שלך. אפשר לעדכן אותם לפני אישור."
    : "כדי לאשר תור צריך להתחבר כלקוחה. בלי התחברות אי אפשר לשמור הזמנה.";

  Array.from(bookingForm.elements).forEach((element) => {
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLButtonElement)) {
      return;
    }

    if (element.type === "submit") {
      element.disabled = !isLoggedIn;
    } else {
      element.disabled = !isLoggedIn;
    }
  });
}

function renderCustomerBookings() {
  if (session.role !== "customer") {
    myBookingsList.innerHTML = '<div class="notice-box">התחברי כלקוחה כדי לראות את התורים שלך.</div>';
    return;
  }

  const bookings = state.bookings
    .filter((booking) => isSamePhone(booking.customer_phone, session.customerPhone))
    .sort((a, b) => `${a.booking_date} ${a.booking_time}`.localeCompare(`${b.booking_date} ${b.booking_time}`));

  if (!bookings.length) {
    myBookingsList.innerHTML = '<div class="notice-box">עדיין אין תורים על החשבון הזה.</div>';
    return;
  }

  myBookingsList.innerHTML = bookings
    .map((booking) => `
      <article class="booking-card status-card-${booking.status}">
        <div class="booking-card-head">
          <strong>${booking.service_name}</strong>
          <span class="status-pill status-${booking.status}">${formatStatus(booking.status)}</span>
        </div>
        <div class="booking-meta">
          <span>${formatDisplayDate(booking.booking_date)}</span>
          <span>${booking.booking_time}</span>
          <span>${booking.staff_name}</span>
        </div>
        ${booking.notes ? `<div class="booking-note">הערה: ${booking.notes}</div>` : ""}
        ${
          ["pending", "approved"].includes(booking.status)
            ? `
              <div class="booking-card-actions">
                <button class="ghost-button google-calendar-button" type="button" data-booking-id="${booking.id}">Google Calendar</button>
                <button class="danger-button cancel-booking-button" type="button" data-booking-id="${booking.id}">ביטול תור</button>
              </div>
            `
            : ""
        }
      </article>
    `)
    .join("");
}

function renderSellerCalendar() {
  const monthDate = monthDateFromKey(uiState.sellerCalendarMonthKey);
  sellerCalendarMonthLabel.textContent = monthDate.toLocaleDateString("he-IL", {
    month: "long",
    year: "numeric"
  });

  const days = buildSellerCalendarDays(monthDate);

  if (!days.some((day) => day.value === uiState.sellerCalendarDate && day.isCurrentMonth)) {
    uiState.sellerCalendarDate = localDateValue(monthDate);
  }

  sellerCalendarGrid.innerHTML = days
    .map((day) => {
      if (!day.isCurrentMonth) {
        return '<div class="calendar-day is-outside" aria-hidden="true"></div>';
      }

      const classes = [
        "calendar-day",
        day.hasBookings ? "has-bookings" : "is-available",
        uiState.sellerCalendarDate === day.value ? "is-selected" : ""
      ].filter(Boolean).join(" ");

      return `
        <button class="${classes}" type="button" data-seller-date="${day.value}">
          ${day.dayNumber}
        </button>
      `;
    })
    .join("");

  const dailyBookings = state.bookings
    .filter((booking) => booking.booking_date === uiState.sellerCalendarDate && booking.status !== "cancelled")
    .sort((a, b) => a.booking_time.localeCompare(b.booking_time));

  if (!dailyBookings.length) {
    sellerCalendarList.innerHTML = '<div class="notice-box">אין תורים ביום הזה.</div>';
    return;
  }

  sellerCalendarList.innerHTML = dailyBookings
    .map((booking) => `
      <article class="booking-card status-card-${booking.status}">
        <div class="booking-card-head">
          <strong>${booking.booking_time}</strong>
          <span class="status-pill status-${booking.status}">${formatStatus(booking.status)}</span>
        </div>
        <div class="booking-meta">
          <span>${booking.customer_first_name} ${booking.customer_last_name}</span>
          <span>${booking.service_name}</span>
          <span>${booking.staff_name}</span>
        </div>
        ${booking.notes ? `<div class="booking-note">הערה: ${booking.notes}</div>` : ""}
        ${
          ["pending", "approved"].includes(booking.status)
            ? `
              <div class="booking-card-actions">
                <button class="ghost-button google-calendar-button" type="button" data-booking-id="${booking.id}">Google Calendar</button>
              </div>
            `
            : ""
        }
      </article>
    `)
    .join("");
}

function renderSellerBookings() {
  if (!state.bookings.length) {
    sellerBookingsList.innerHTML = '<div class="notice-box">עדיין אין בקשות תור.</div>';
    return;
  }

  sellerBookingsList.innerHTML = [...state.bookings]
    .sort((a, b) => `${b.booking_date} ${b.booking_time}`.localeCompare(`${a.booking_date} ${a.booking_time}`))
    .map((booking) => `
      <article class="booking-card status-card-${booking.status}">
        <div class="booking-card-head">
          <strong>${booking.customer_first_name} ${booking.customer_last_name}</strong>
          <span class="status-pill status-${booking.status}">${formatStatus(booking.status)}</span>
        </div>
        <div class="booking-meta">
          <span>${booking.service_name}</span>
          <span>${formatDisplayDate(booking.booking_date)}</span>
          <span>${booking.booking_time}</span>
          <span>${booking.staff_name}</span>
        </div>
        ${booking.notes ? `<div class="booking-note">הערה: ${booking.notes}</div>` : ""}
        ${
          booking.status === "pending"
            ? `
              <div class="seller-actions">
                <button class="primary-button approve-booking-button" type="button" data-booking-id="${booking.id}">אישור תור</button>
                <button class="danger-button reject-booking-button" type="button" data-booking-id="${booking.id}">דחיית תור</button>
                <button class="ghost-button google-calendar-button" type="button" data-booking-id="${booking.id}">Google Calendar</button>
              </div>
            `
            : ["approved"].includes(booking.status)
              ? `
                <div class="seller-actions">
                  <button class="ghost-button google-calendar-button" type="button" data-booking-id="${booking.id}">Google Calendar</button>
                </div>
              `
              : ""
        }
        ${
          booking.status === "rejected" && isRejectUndoActiveForBooking(booking.id)
            ? `
              <div class="undo-strip">
                <span>התור נדחה. אפשר לבטל את הדחייה במשך כמה שניות.</span>
                <button class="ghost-button undo-reject-button" type="button" data-booking-id="${booking.id}">ביטול דחייה</button>
              </div>
            `
            : ""
        }
      </article>
    `)
    .join("");
}

function renderEditors() {
  servicesEditor.innerHTML = state.services
    .map((service) => `
      <div class="editor-row" data-service-id="${service.id}">
        <input type="text" value="${service.name}" data-service-field="name">
        <input type="text" value="${service.category}" data-service-field="category">
        <input type="number" min="0" value="${service.price}" data-service-field="price">
        <input type="number" min="5" step="5" value="${service.duration}" data-service-field="duration">
        <button class="danger-button remove-service-button" type="button">מחיקה</button>
      </div>
    `)
    .join("");

  hoursEditor.innerHTML = [...state.workingHours]
    ? `
      <div class="editor-row editor-row-labels" aria-hidden="true">
        <span>יום</span>
        <span>פתיחה</span>
        <span>סגירה</span>
        <span>מרווח בין תורים</span>
        <span>מצב יום</span>
      </div>
      ${[...state.workingHours]
        .sort((a, b) => a.day_of_week - b.day_of_week)
        .map((row) => `
          <div class="editor-row editor-row-hours" data-hour-id="${row.id}">
            <input type="text" value="${row.day_label}" placeholder="יום" data-hour-field="day_label">
            <input type="text" value="${row.opens_at || ""}" placeholder="שעת פתיחה, למשל 10:00" data-hour-field="opens_at">
            <input type="text" value="${row.closes_at || ""}" placeholder="שעת סגירה, למשל 18:00" data-hour-field="closes_at">
            <input type="number" min="5" step="5" value="${row.slot_interval_minutes || 30}" title="מספר הדקות בין תחילת תור אחד לתחילת התור הבא" placeholder="דקות בין תורים" data-hour-field="slot_interval_minutes">
            <button class="ghost-button toggle-hour-button ${row.is_closed ? "is-closed" : "is-open"}" type="button" data-hour-toggle="${row.id}">
              ${row.is_closed ? "היום סגור" : "היום פתוח"}
            </button>
          </div>
        `)
        .join("")}
    `
    : "";

  businessForm.elements.name.value = state.business.name;
  businessForm.elements.description.value = state.business.description;
  businessForm.elements.address.value = state.business.address;
  businessForm.elements.phone.value = state.business.phone;
  businessForm.elements.instagramUrl.value = normalizeInstagramUrl(state.business.instagram_url);

  sellerCredentialsForm.elements.username.value = state.sellerCredentials.username;
  sellerCredentialsForm.elements.password.value = "";
}

function updateSessionUi() {
  const customerLoggedIn = session.role === "customer";
  const sellerLoggedIn = session.role === "seller";

  logoutButton.classList.toggle("is-hidden", !session.role);
  openCustomerLogin.classList.toggle("is-hidden", customerLoggedIn);
  openSellerLogin.classList.toggle("is-hidden", sellerLoggedIn);
  customerBookingsPanel.classList.toggle("is-hidden", !customerLoggedIn);
  sellerPanel.classList.toggle("is-hidden", !sellerLoggedIn);
}

function rerenderAll() {
  renderBusiness();
  renderWizardSteps();
  renderServices();
  renderStaff();
  renderSelectedSummary();
  renderCalendar();
  renderTodayAvailability();
  renderTimeOptions();
  renderBookingSummary();
  renderDetailsForm();
  renderCustomerBookings();
  renderSellerCalendar();
  renderSellerBookings();
  renderEditors();
  updateSessionUi();
}

function goToStep(stepNumber) {
  showWizardStep(stepNumber);
  renderBookingSummary();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function ensureServiceSelected() {
  if (getSelectedService()) {
    return true;
  }
  alert("צריך לבחור שירות לפני שממשיכים.");
  goToStep(1);
  return false;
}

function ensureStaffSelected() {
  if (getSelectedStaff()) {
    return true;
  }
  alert("צריך לבחור אשת צוות לפני שממשיכים.");
  goToStep(2);
  return false;
}

function ensureScheduleSelected() {
  if (uiState.selectedDate && uiState.selectedTime) {
    return true;
  }
  alert("צריך לבחור יום ושעה לפני שממשיכים.");
  goToStep(3);
  return false;
}

function openAuthModal(role) {
  authModal.classList.remove("is-hidden");
  showAuthTab(role);
}

function closeAuthModal() {
  authModal.classList.add("is-hidden");
}

function showAuthTab(tabName) {
  modalTabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.authTab === tabName);
  });

  customerLoginForm.classList.toggle("is-active", tabName === "customer");
  sellerLoginForm.classList.toggle("is-active", tabName === "seller");
}

function updateCurrentCustomer(fullName, phone) {
  const customer = getCurrentCustomer();
  if (!customer) {
    return;
  }

  const nameParts = parseFullName(fullName);
  customer.firstName = nameParts.firstName;
  customer.lastName = nameParts.lastName;
  customer.phone = phone;
  session.customerPhone = phone;
}

function resolveAssignedStaff(dateValue, timeValue, service) {
  const startMinutes = parseTimeToMinutes(timeValue);
  const assignableStaffIds = getAssignableStaffIds(dateValue, startMinutes, Number(service.duration));

  return getRealStaffMembers().find((staff) => staff.id === uiState.selectedStaffId && assignableStaffIds.includes(staff.id)) || null;
}

function resetBookingSelection() {
  uiState.selectedServiceId = null;
  uiState.selectedStaffId = DEFAULT_OWNER_STAFF.id;
  uiState.selectedDate = "";
  uiState.selectedTime = "";
  uiState.selectedMonthKey = monthKey(new Date());
  showWizardStep(1);
}

openCustomerLogin.addEventListener("click", () => openAuthModal("customer"));
openSellerLogin.addEventListener("click", () => openAuthModal("seller"));
closeModal.addEventListener("click", closeAuthModal);

logoutButton.addEventListener("click", () => {
  clearRejectUndo(false);
  session.role = null;
  session.customerPhone = null;
  rerenderAll();
});

bookingSuccessCalendarButton.addEventListener("click", () => {
  const booking = findBookingById(bookingSuccessCalendarButton.dataset.bookingId);
  openGoogleCalendarForBooking(booking);
});

bookingSuccessIcsButton.addEventListener("click", () => {
  const booking = findBookingById(bookingSuccessIcsButton.dataset.bookingId);
  downloadIcsForBooking(booking);
});

modalTabs.forEach((tab) => {
  tab.addEventListener("click", () => showAuthTab(tab.dataset.authTab));
});

servicesCategories.addEventListener("click", (event) => {
  const card = event.target.closest("[data-service-id]");
  if (!card) {
    return;
  }

  uiState.selectedServiceId = card.dataset.serviceId;
  uiState.selectedDate = "";
  uiState.selectedTime = "";
  uiState.selectedMonthKey = monthKey(new Date());
  hideBookingSuccess();
  rerenderAll();
});

staffCards.addEventListener("click", (event) => {
  const card = event.target.closest("[data-staff-id]");
  if (!card) {
    return;
  }

  uiState.selectedStaffId = card.dataset.staffId;
  uiState.selectedDate = "";
  uiState.selectedTime = "";
  hideBookingSuccess();
  rerenderAll();
});

todaySlotsList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-today-time]");
  if (!button || !ensureServiceSelected()) {
    return;
  }

  uiState.selectedDate = todayDate();
  uiState.selectedTime = button.dataset.todayTime;
  uiState.selectedMonthKey = monthKey(new Date());
  hideBookingSuccess();
  rerenderAll();
  goToStep(4);
});

calendarGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-calendar-date]");
  if (!button) {
    return;
  }

  uiState.selectedDate = button.dataset.calendarDate;
  uiState.selectedTime = "";
  hideBookingSuccess();
  rerenderAll();
});

timeGroups.addEventListener("click", (event) => {
  const button = event.target.closest("[data-time-value]");
  if (!button) {
    return;
  }

  uiState.selectedTime = button.dataset.timeValue;
  hideBookingSuccess();
  rerenderAll();
});

calendarPrevButton.addEventListener("click", () => {
  const monthDate = monthDateFromKey(uiState.selectedMonthKey);
  monthDate.setMonth(monthDate.getMonth() - 1);
  uiState.selectedMonthKey = monthKey(monthDate);
  rerenderAll();
});

calendarNextButton.addEventListener("click", () => {
  const monthDate = monthDateFromKey(uiState.selectedMonthKey);
  monthDate.setMonth(monthDate.getMonth() + 1);
  uiState.selectedMonthKey = monthKey(monthDate);
  rerenderAll();
});

goToStaffStep.addEventListener("click", () => {
  if (!ensureServiceSelected()) {
    return;
  }
  goToStep(2);
});

backToServicesStep.addEventListener("click", () => goToStep(1));

goToScheduleStep.addEventListener("click", () => {
  if (!ensureServiceSelected() || !ensureStaffSelected()) {
    return;
  }
  goToStep(3);
});

backToStaffStep.addEventListener("click", () => goToStep(2));

goToDetailsStep.addEventListener("click", () => {
  if (!ensureServiceSelected() || !ensureStaffSelected() || !ensureScheduleSelected()) {
    return;
  }
  goToStep(4);
});

backToScheduleStep.addEventListener("click", () => goToStep(3));

customerLoginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(customerLoginForm);
  const password = String(formData.get("password"));
  const firstName = String(formData.get("firstName")).trim();
  const lastName = String(formData.get("lastName")).trim();
  const phone = String(formData.get("phone")).trim();
  const normalizedPhone = normalizePhoneNumber(phone);

  if (!normalizedPhone) {
    alert("צריך למלא טלפון תקין.");
    return;
  }

  const existingUser = state.users.find((user) => isSamePhone(user.phone, normalizedPhone));
  if (existingUser) {
    if (existingUser.password !== password) {
      alert("הטלפון או הסיסמה לא נכונים.");
      return;
    }
    existingUser.firstName = firstName || existingUser.firstName;
    existingUser.lastName = lastName || existingUser.lastName;
    existingUser.phone = phone || existingUser.phone;
  } else {
    state.users.push({ firstName, lastName, phone, password });
  }

  session.role = "customer";
  session.customerPhone = normalizedPhone;
  saveState();
  closeAuthModal();
  rerenderAll();
});

sellerLoginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(sellerLoginForm);
  const username = String(formData.get("username")).trim();
  const password = String(formData.get("password"));

  if (username !== state.sellerCredentials.username || password !== state.sellerCredentials.password) {
    alert("שם המשתמש או הסיסמה שגויים.");
    return;
  }

  sessionStorage.setItem(SELLER_SESSION_KEY, "1");
  window.location.href = "owner.html";
});

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (session.role !== "customer") {
    openAuthModal("customer");
    return;
  }

  if (!ensureServiceSelected() || !ensureStaffSelected() || !ensureScheduleSelected()) {
    return;
  }

  const service = getSelectedService();
  const fullName = String(bookingForm.elements.fullName.value).trim();
  const phone = String(bookingForm.elements.phone.value).trim();
  const notes = String(bookingForm.elements.notes.value).trim();

  if (!fullName || !phone) {
    alert("צריך למלא שם מלא וטלפון.");
    return;
  }

  const assignedStaff = resolveAssignedStaff(uiState.selectedDate, uiState.selectedTime, service);
  if (!assignedStaff) {
    alert("השעה שנבחרה כבר לא זמינה. בחרי שעה אחרת.");
    uiState.selectedTime = "";
    rerenderAll();
    goToStep(3);
    return;
  }

  updateCurrentCustomer(fullName, phone);

  const nameParts = parseFullName(fullName);
  const newBooking = {
    id: `booking-${Date.now()}`,
    service_id: service.id,
    service_name: service.name,
    staff_id: assignedStaff.id,
    staff_name: assignedStaff.name,
    customer_first_name: nameParts.firstName,
    customer_last_name: nameParts.lastName,
    customer_phone: phone,
    notes,
    booking_date: uiState.selectedDate,
    booking_time: uiState.selectedTime,
    duration_minutes: service.duration,
    status: "pending"
  };

  state.bookings.push(newBooking);
  saveState();
  bookingForm.elements.notes.value = "";
  rerenderAll();
  showWizardStep(4);
  showBookingSuccess(newBooking);
  window.scrollTo({ top: 0, behavior: "smooth" });
});

businessForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.business = {
    ...state.business,
    name: String(businessForm.elements.name.value).trim(),
    description: String(businessForm.elements.description.value).trim(),
    address: String(businessForm.elements.address.value).trim(),
    phone: String(businessForm.elements.phone.value).trim(),
    instagram_url: normalizeInstagramUrl(businessForm.elements.instagramUrl.value)
  };
  saveState();
  rerenderAll();
});

sellerCredentialsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = String(sellerCredentialsForm.elements.username.value).trim();
  const password = String(sellerCredentialsForm.elements.password.value);

  if (!username) {
    alert("שם משתמש לא יכול להיות ריק.");
    return;
  }

  state.sellerCredentials.username = username;
  if (password.trim()) {
    state.sellerCredentials.password = password;
  }

  saveState();
  sellerCredentialsForm.elements.password.value = "";
  rerenderAll();
});

addServiceButton.addEventListener("click", () => {
  state.services.push({
    id: `service-${Date.now()}`,
    category: "טיפולי ידיים",
    name: "שירות חדש",
    price: 0,
    duration: 30
  });
  saveState();
  rerenderAll();
});

servicesEditor.addEventListener("click", (event) => {
  const target = event.target;
  if (!target.classList.contains("remove-service-button")) {
    return;
  }

  const row = target.closest("[data-service-id]");
  if (!row) {
    return;
  }

  const serviceId = row.dataset.serviceId;
  state.services = state.services.filter((service) => service.id !== serviceId);

  if (uiState.selectedServiceId === serviceId) {
    uiState.selectedServiceId = null;
    uiState.selectedDate = "";
    uiState.selectedTime = "";
  }

  saveState();
  rerenderAll();
});

servicesForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.services = Array.from(servicesEditor.querySelectorAll("[data-service-id]")).map((row) => ({
    id: row.dataset.serviceId,
    name: String(row.querySelector('[data-service-field="name"]').value).trim(),
    category: String(row.querySelector('[data-service-field="category"]').value).trim(),
    price: Number(row.querySelector('[data-service-field="price"]').value),
    duration: Number(row.querySelector('[data-service-field="duration"]').value)
  }));
  saveState();
  rerenderAll();
});

hoursEditor.addEventListener("click", (event) => {
  const button = event.target.closest("[data-hour-toggle]");
  if (!button) {
    return;
  }

  const hourId = button.dataset.hourToggle;
  const row = state.workingHours.find((item) => item.id === hourId);
  if (!row) {
    return;
  }

  row.is_closed = !row.is_closed;
  if (row.is_closed) {
    row.opens_at = null;
    row.closes_at = null;
  } else {
    row.opens_at ||= "10:00";
    row.closes_at ||= "18:00";
  }

  saveState();
  rerenderAll();
});

hoursForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.workingHours = Array.from(hoursEditor.querySelectorAll("[data-hour-id]")).map((row, index) => {
    const opensAt = String(row.querySelector('[data-hour-field="opens_at"]').value).trim();
    const closesAt = String(row.querySelector('[data-hour-field="closes_at"]').value).trim();
    return {
      id: row.dataset.hourId,
      day_of_week: index,
      day_label: String(row.querySelector('[data-hour-field="day_label"]').value).trim(),
      opens_at: opensAt || null,
      closes_at: closesAt || null,
      slot_interval_minutes: Number(row.querySelector('[data-hour-field="slot_interval_minutes"]').value || 30),
      is_closed: !opensAt || !closesAt
    };
  });
  saveState();
  rerenderAll();
});

sellerCalendarGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-seller-date]");
  if (!button) {
    return;
  }

  uiState.sellerCalendarDate = button.dataset.sellerDate;
  renderSellerCalendar();
});

sellerCalendarPrevButton.addEventListener("click", () => {
  const monthDate = monthDateFromKey(uiState.sellerCalendarMonthKey);
  monthDate.setMonth(monthDate.getMonth() - 1);
  uiState.sellerCalendarMonthKey = monthKey(monthDate);
  renderSellerCalendar();
});

sellerCalendarNextButton.addEventListener("click", () => {
  const monthDate = monthDateFromKey(uiState.sellerCalendarMonthKey);
  monthDate.setMonth(monthDate.getMonth() + 1);
  uiState.sellerCalendarMonthKey = monthKey(monthDate);
  renderSellerCalendar();
});

sellerCalendarList.addEventListener("click", (event) => {
  const target = event.target.closest(".google-calendar-button");
  if (!target) {
    return;
  }

  openGoogleCalendarForBooking(findBookingById(target.dataset.bookingId));
});

sellerBookingsList.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) {
    return;
  }

  const bookingId = target.dataset.bookingId;
  if (!bookingId) {
    return;
  }

  const booking = findBookingById(bookingId);
  if (!booking) {
    return;
  }

  if (target.classList.contains("google-calendar-button")) {
    openGoogleCalendarForBooking(booking);
    return;
  }

  if (target.classList.contains("undo-reject-button")) {
    booking.status = uiState.rejectUndoPreviousStatus || "pending";
    saveState();
    clearRejectUndo(false);
    rerenderAll();
    return;
  }

  if (target.classList.contains("approve-booking-button")) {
    clearRejectUndo(false);
    booking.status = "approved";
  }

  if (target.classList.contains("reject-booking-button")) {
    const previousStatus = booking.status;
    booking.status = "rejected";
    startRejectUndo(booking.id, previousStatus);
  }

  saveState();
  rerenderAll();
});

myBookingsList.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) {
    return;
  }

  if (target.classList.contains("google-calendar-button")) {
    openGoogleCalendarForBooking(findBookingById(target.dataset.bookingId));
    return;
  }

  if (!target.classList.contains("cancel-booking-button")) {
    return;
  }

  const bookingId = target.dataset.bookingId;
  const booking = findBookingById(bookingId);
  if (!booking || !isSamePhone(booking.customer_phone, session.customerPhone)) {
    return;
  }

  if (!["pending", "approved"].includes(booking.status)) {
    return;
  }

  if (!window.confirm("האם לבטל את התור הזה?")) {
    return;
  }

  booking.status = "cancelled";
  saveState();
  rerenderAll();
});

rerenderAll();
showWizardStep(1);
