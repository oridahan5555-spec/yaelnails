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
    { id: "service-3", category: "טיפולי ידיים", name: "הסרה לק ג'ל", price: 20, duration: 20 },
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
  sellerCalendarDate: todayDate(),
  sellerCalendarMonthKey: monthKey(new Date()),
  rejectUndoBookingId: null,
  rejectUndoPreviousStatus: null,
  rejectUndoTimeoutId: null
};

const ownerBrandName = document.getElementById("ownerBrandName");
const ownerBrandDescription = document.getElementById("ownerBrandDescription");
const ownerLoginGate = document.getElementById("ownerLoginGate");
const ownerLayout = document.getElementById("ownerLayout");
const ownerLoginForm = document.getElementById("ownerLoginForm");
const ownerLogoutButton = document.getElementById("ownerLogoutButton");
const ownerStatsGrid = document.getElementById("ownerStatsGrid");
const ownerTipsGrid = document.getElementById("ownerTipsGrid");

const sellerCalendarPrevButton = document.getElementById("sellerCalendarPrevButton");
const sellerCalendarNextButton = document.getElementById("sellerCalendarNextButton");
const sellerCalendarMonthLabel = document.getElementById("sellerCalendarMonthLabel");
const sellerCalendarGrid = document.getElementById("sellerCalendarGrid");
const sellerCalendarList = document.getElementById("sellerCalendarList");
const sellerBookingsList = document.getElementById("sellerBookingsList");

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

    loadedState.staff = normalizeStaff(loadedState.staff);
    loadedState.bookings = normalizeBookings(loadedState.bookings, loadedState.staff, loadedState.services);
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

function normalizeStaff() {
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

function normalizeInstagramUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed || trimmed === "https://instagram.com") {
    return "";
  }
  return trimmed;
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

function getPendingBookings() {
  return state.bookings.filter((booking) => booking.status === "pending");
}

function getTodayBookings() {
  return state.bookings.filter((booking) => booking.booking_date === todayDate() && ["pending", "approved"].includes(booking.status));
}

function getCancelledBookings() {
  return state.bookings.filter((booking) => booking.status === "cancelled");
}

function getRepeatCustomersCount() {
  const counter = state.bookings.reduce((map, booking) => {
    const customerKey = normalizePhoneNumber(booking.customer_phone) || String(booking.customer_email || "").trim().toLowerCase();
    if (!customerKey) {
      return map;
    }

    map[customerKey] = (map[customerKey] || 0) + 1;
    return map;
  }, {});

  return Object.values(counter).filter((count) => count > 1).length;
}

function getBookingsThisMonthCount() {
  const currentMonth = monthKey(new Date());
  return state.bookings.filter((booking) => booking.booking_date.startsWith(currentMonth)).length;
}

function getBusiestDayInfo() {
  const dayMap = {};

  state.bookings
    .filter((booking) => ["pending", "approved"].includes(booking.status))
    .forEach((booking) => {
      const dayOfWeek = new Date(`${booking.booking_date}T00:00:00`).getDay();
      const dayLabel = state.workingHours.find((item) => Number(item.day_of_week) === dayOfWeek)?.day_label || "יום לא ידוע";

      if (!dayMap[dayLabel]) {
        dayMap[dayLabel] = 0;
      }

      dayMap[dayLabel] += 1;
    });

  const entries = Object.entries(dayMap).sort((a, b) => b[1] - a[1]);
  if (!entries.length) {
    return null;
  }

  return {
    dayLabel: entries[0][0],
    count: entries[0][1]
  };
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

function renderHeader() {
  ownerBrandName.textContent = state.business.name;
  ownerBrandDescription.textContent = state.business.description || "ניהול העסק";
}

function renderOwnerStats() {
  const stats = [
    {
      value: getPendingBookings().length,
      title: "בקשות שמחכות לאישור",
      text: "ככל שמאשרים מהר יותר, קל יותר לסגור תורים."
    },
    {
      value: getTodayBookings().length,
      title: "תורים להיום",
      text: "כך רואים במבט אחד כמה לקוחות עוד צפויות היום."
    },
    {
      value: getCancelledBookings().length,
      title: "ביטולים",
      text: "טוב לבדוק אם כדאי להציע שעות חלופיות כשיש ביטולים."
    },
    {
      value: getRepeatCustomersCount(),
      title: "לקוחות חוזרות",
      text: "לקוחות שחזרו יותר מפעם אחת הן סימן שהעסק עובד טוב."
    }
  ];

  ownerStatsGrid.innerHTML = stats
    .map((stat) => `
      <article class="owner-stat-card">
        <span>${stat.title}</span>
        <strong>${stat.value}</strong>
        <span>${stat.text}</span>
      </article>
    `)
    .join("");
}

function renderOwnerTips() {
  const pendingCount = getPendingBookings().length;
  const cancelledCount = getCancelledBookings().length;
  const repeatCustomers = getRepeatCustomersCount();
  const busiestDay = getBusiestDayInfo();
  const bookingsThisMonth = getBookingsThisMonthCount();
  const tips = [];

  if (pendingCount > 0) {
    tips.push({
      title: "תורים שלא נסגרו",
      text: `יש כרגע ${pendingCount} בקשות שמחכות לך. שווה לעבור עליהן כדי שלא ילכו לאיבוד.`,
      anchor: "#ownerBookingsSection",
      link: "לפתוח את בקשות התור"
    });
  }

  if (busiestDay) {
    tips.push({
      title: "פעילות תורים",
      text: `היום הכי עמוס כרגע הוא ${busiestDay.dayLabel} עם ${busiestDay.count} תורים פעילים. אם זה קורה הרבה, אפשר לשקול לפתוח עוד זמן ביום הזה.`,
      anchor: "#ownerCalendarSection",
      link: "לראות ביומן"
    });
  }

  if (repeatCustomers > 0) {
    tips.push({
      title: "פעילות לקוחות",
      text: `יש לך ${repeatCustomers} לקוחות חוזרות. זה אומר שהלקוחות מרוצות ושווה לשמור על זמינות טובה בשבילן.`,
      anchor: "#ownerCalendarSection",
      link: "לבדוק תורים קרובים"
    });
  }

  if (cancelledCount > 0) {
    tips.push({
      title: "מקומות שהתפנו",
      text: `נרשמו ${cancelledCount} ביטולים. אם תרצי, אפשר להשתמש בשעות שהתפנו כדי להכניס לקוחות אחרות.`,
      anchor: "#ownerBookingsSection",
      link: "לעבור על התורים"
    });
  }

  if (!tips.length) {
    tips.push({
      title: "הכול מסודר",
      text: `כרגע אין משהו דחוף לטפל בו. החודש נכנסו ${bookingsThisMonth} תורים, והמערכת נראית נקייה ומסודרת.`,
      anchor: "#ownerCalendarSection",
      link: "לפתוח את היומן"
    });
  }

  ownerTipsGrid.innerHTML = tips
    .map((tip) => `
      <article class="owner-tip-card">
        <h3>${tip.title}</h3>
        <p>${tip.text}</p>
        <a class="owner-tip-link" href="${tip.anchor}">${tip.link}</a>
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
            : booking.status === "approved"
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
  businessForm.elements.name.value = state.business.name;
  businessForm.elements.description.value = state.business.description;
  businessForm.elements.address.value = state.business.address;
  businessForm.elements.phone.value = state.business.phone;
  businessForm.elements.instagramUrl.value = normalizeInstagramUrl(state.business.instagram_url);

  sellerCredentialsForm.elements.username.value = state.sellerCredentials.username;
  sellerCredentialsForm.elements.password.value = "";

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

  hoursEditor.innerHTML = `
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
          <input type="text" value="${row.opens_at || ""}" placeholder="10:00" data-hour-field="opens_at">
          <input type="text" value="${row.closes_at || ""}" placeholder="18:00" data-hour-field="closes_at">
          <input type="number" min="5" step="5" value="${row.slot_interval_minutes || 30}" data-hour-field="slot_interval_minutes">
          <button class="ghost-button toggle-hour-button ${row.is_closed ? "is-closed" : "is-open"}" type="button" data-hour-toggle="${row.id}">
            ${row.is_closed ? "היום סגור" : "היום פתוח"}
          </button>
        </div>
      `)
      .join("")}
  `;
}

function rerenderAll() {
  renderHeader();
  renderOwnerStats();
  renderOwnerTips();
  renderSellerCalendar();
  renderSellerBookings();
  renderEditors();
}

function showOwnerLayout() {
  ownerLogoutButton.classList.remove("is-hidden");
  ownerLoginGate.classList.add("is-hidden");
  ownerLayout.classList.remove("is-hidden");
  rerenderAll();
}

function showOwnerLogin() {
  ownerLogoutButton.classList.add("is-hidden");
  ownerLayout.classList.add("is-hidden");
  ownerLoginGate.classList.remove("is-hidden");
}

ownerLoginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(ownerLoginForm);
  const username = String(formData.get("username")).trim();
  const password = String(formData.get("password"));

  if (username !== state.sellerCredentials.username || password !== state.sellerCredentials.password) {
    alert("שם המשתמש או הסיסמה שגויים.");
    return;
  }

  sessionStorage.setItem(SELLER_SESSION_KEY, "1");
  showOwnerLayout();
});

ownerLogoutButton.addEventListener("click", () => {
  clearRejectUndo(false);
  sessionStorage.removeItem(SELLER_SESSION_KEY);
  window.location.href = "index.html";
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
  const target = event.target.closest(".remove-service-button");
  if (!target) {
    return;
  }

  const row = target.closest("[data-service-id]");
  if (!row) {
    return;
  }

  const serviceId = row.dataset.serviceId;
  state.services = state.services.filter((service) => service.id !== serviceId);
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

  const row = state.workingHours.find((item) => item.id === button.dataset.hourToggle);
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

if (sessionStorage.getItem(SELLER_SESSION_KEY) === "1") {
  showOwnerLayout();
} else {
  showOwnerLogin();
}
