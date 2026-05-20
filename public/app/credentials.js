// Secure credentials storage for the admin (seller) login.
// Stores username + PBKDF2-derived password hash with a per-install random salt
// in its own localStorage key (separate from app state).
// Plaintext passwords are never persisted.

(function () {
  const STORAGE_KEY = "booking_app_credentials_v2";
  const LEGACY_STATE_KEYS = [
    "booking_app_local_working_v2",
    "booking_app_local_working_v1"
  ];
  const PBKDF2_ITERATIONS = 150000;
  const SALT_BYTES = 16;
  const HASH_BYTES = 32;

  const DEFAULTS = { username: "admin", password: "1234" };

  function toHex(bytes) {
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  function fromHex(hex) {
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
    return out;
  }

  async function derive(password, saltBytes) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: saltBytes, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
      keyMaterial,
      HASH_BYTES * 8
    );
    return new Uint8Array(bits);
  }

  function read() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.username !== "string" || typeof parsed.salt !== "string" || typeof parsed.hash !== "string") {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  function write(record) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  }

  async function build(username, password) {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    const hash = await derive(password, salt);
    return {
      username: String(username || "").trim() || DEFAULTS.username,
      salt: toHex(salt),
      hash: toHex(hash),
      iterations: PBKDF2_ITERATIONS,
      updated_at: new Date().toISOString()
    };
  }

  function timingSafeEqual(a, b) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    return diff === 0;
  }

  function readLegacyCredentials() {
    for (const key of LEGACY_STATE_KEYS) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        const creds = parsed && parsed.sellerCredentials;
        if (creds && typeof creds.password === "string") {
          return {
            username: typeof creds.username === "string" && creds.username.trim() ? creds.username.trim() : DEFAULTS.username,
            password: creds.password
          };
        }
      } catch { /* ignore */ }
    }
    return null;
  }

  function scrubLegacyCredentials() {
    for (const key of LEGACY_STATE_KEYS) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (parsed && parsed.sellerCredentials) {
          delete parsed.sellerCredentials;
          localStorage.setItem(key, JSON.stringify(parsed));
        }
      } catch { /* ignore */ }
    }
  }

  async function ensureInitialized() {
    let record = read();
    if (record) {
      scrubLegacyCredentials();
      return record;
    }
    const legacy = readLegacyCredentials();
    const seed = legacy || DEFAULTS;
    record = await build(seed.username, seed.password);
    write(record);
    scrubLegacyCredentials();
    return record;
  }

  async function verify(username, password) {
    const record = await ensureInitialized();
    const inputUser = String(username || "").trim();
    if (inputUser !== record.username) return false;
    const salt = fromHex(record.salt);
    const expected = fromHex(record.hash);
    const actual = await derive(String(password || ""), salt);
    return timingSafeEqual(expected, actual);
  }

  async function setPassword(newPassword) {
    const record = await ensureInitialized();
    const updated = await build(record.username, newPassword);
    write(updated);
    return updated;
  }

  async function setUsername(newUsername) {
    const record = await ensureInitialized();
    const trimmed = String(newUsername || "").trim();
    if (!trimmed) throw new Error("שם משתמש לא יכול להיות ריק.");
    record.username = trimmed;
    record.updated_at = new Date().toISOString();
    write(record);
    return record;
  }

  async function updateCredentials({ currentPassword, newUsername, newPassword }) {
    const ok = await verify((await ensureInitialized()).username, currentPassword);
    if (!ok) {
      const err = new Error("הסיסמה הנוכחית לא נכונה.");
      err.code = "INVALID_CURRENT_PASSWORD";
      throw err;
    }
    if (typeof newUsername === "string" && newUsername.trim()) {
      await setUsername(newUsername);
    }
    if (typeof newPassword === "string" && newPassword.trim()) {
      await setPassword(newPassword);
    }
    return read();
  }

  async function getUsername() {
    const record = await ensureInitialized();
    return record.username;
  }

  function resetToDefaults() {
    localStorage.removeItem(STORAGE_KEY);
    scrubLegacyCredentials();
  }

  window.BookingCredentials = {
    verify,
    setPassword,
    setUsername,
    updateCredentials,
    getUsername,
    ensureInitialized,
    resetToDefaults,
    DEFAULTS
  };
})();
