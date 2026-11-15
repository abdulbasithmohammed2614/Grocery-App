const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase Client
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.REACT_APP_SUPABASE_URL ||
  "https://pmlqyypgixxffceyipze.supabase.co";

const supabaseKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbHF5eXBnaXh4ZmZjZXlpcHplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ2NjgxMTUsImV4cCI6MjExMDI0NDExNX0.1H1I5PJ0puigmWg3pUor03R4FkVAUsHXlY76kxdy9lk";

const supabase = createClient(supabaseUrl, supabaseKey);

// In-memory cache for fast lookups
const secretsCache = {};
let lastFetchedAt = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache TTL

/**
 * Fetch all secrets from Supabase app_secrets table
 */
async function loadSecretsFromSupabase(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && Object.keys(secretsCache).length > 0 && now - lastFetchedAt < CACHE_TTL_MS) {
    return secretsCache;
  }

  try {
    const { data, error } = await supabase.from("app_secrets").select("*");

    if (!error && Array.isArray(data) && data.length > 0) {
      data.forEach((row) => {
        secretsCache[row.id] = {
          value: row.secret_value,
          isPublic: Boolean(row.is_public),
          description: row.description,
        };

        // Also sync into process.env if not already set or if empty
        if (!process.env[row.id] || process.env[row.id].includes("YourRazorpayKeyId")) {
          process.env[row.id] = row.secret_value;
        }
      });

      lastFetchedAt = now;
      console.log(`[Secrets] Loaded ${data.length} secrets from Supabase 'app_secrets' table.`);
      return secretsCache;
    } else if (error) {
      // Table may not be created yet in Supabase
      console.log("[Secrets] Supabase 'app_secrets' table notice:", error.message || error.code);
    }
  } catch (err) {
    console.warn("[Secrets] Failed to connect to Supabase secrets table:", err.message);
  }

  return secretsCache;
}

/**
 * Get a secret by ID with fallback to process.env
 */
async function getSecret(key, defaultValue = "") {
  await loadSecretsFromSupabase();

  if (secretsCache[key] && secretsCache[key].value) {
    return secretsCache[key].value;
  }

  return process.env[key] || defaultValue;
}

/**
 * Return only public secrets safe for frontend use
 */
async function getPublicSecrets() {
  await loadSecretsFromSupabase();

  const publicSecrets = {};
  for (const [key, item] of Object.entries(secretsCache)) {
    if (item.isPublic) {
      publicSecrets[key] = item.value;
    }
  }

  // Fallbacks from env if table wasn't seeded yet
  if (!publicSecrets.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID) {
    publicSecrets.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
  }
  if (!publicSecrets.REACT_APP_RAZORPAY_KEY_ID && process.env.REACT_APP_RAZORPAY_KEY_ID) {
    publicSecrets.REACT_APP_RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID;
  }

  return publicSecrets;
}

/**
 * Update or save a secret to Supabase
 */
async function setSecret(key, value, description = "", isPublic = false) {
  try {
    const { data, error } = await supabase.from("app_secrets").upsert({
      id: key,
      secret_value: value,
      description: description,
      is_public: isPublic,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    secretsCache[key] = {
      value,
      isPublic,
      description,
    };
    process.env[key] = value;

    return { success: true, data };
  } catch (err) {
    console.error(`[Secrets] Error saving secret '${key}':`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  loadSecretsFromSupabase,
  getSecret,
  getPublicSecrets,
  setSecret,
};
