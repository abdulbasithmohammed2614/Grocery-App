/**
 * Supabase Secrets Seed & Verification Script
 * Run: node scripts/seed-secrets.js
 */

const { createClient } = require("@supabase/supabase-js");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
if (!process.env.SUPABASE_URL) {
  require("dotenv").config({ path: path.resolve(__dirname, "../server/.env") });
}

const supabaseUrl =
  process.env.SUPABASE_URL || "https://pmlqyypgixxffceyipze.supabase.co";
const supabaseKey =
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbHF5eXBnaXh4ZmZjZXlpcHplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ2NjgxMTUsImV4cCI6MjExMDI0NDExNX0.1H1I5PJ0puigmWg3pUor03R4FkVAUsHXlY76kxdy9lk";

const supabase = createClient(supabaseUrl, supabaseKey);

const DEFAULT_SECRETS = [
  {
    id: "RAZORPAY_KEY_ID",
    secret_value: process.env.RAZORPAY_KEY_ID || "rzp_test_YourRazorpayKeyIdHere",
    description: "Razorpay Public Key ID",
    is_public: true,
  },
  {
    id: "RAZORPAY_KEY_SECRET",
    secret_value: process.env.RAZORPAY_KEY_SECRET || "YourRazorpayKeySecretHere",
    description: "Razorpay API Key Secret (Server Only)",
    is_public: false,
  },
  {
    id: "REACT_APP_RAZORPAY_KEY_ID",
    secret_value: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_YourRazorpayKeyIdHere",
    description: "Public Razorpay Checkout Key",
    is_public: true,
  },
  {
    id: "SELLER_EMAIL",
    secret_value: process.env.SELLER_EMAIL || "seller@grocery.com",
    description: "Store Merchant Login Email",
    is_public: false,
  },
  {
    id: "SELLER_PASSWORD",
    secret_value: process.env.SELLER_PASSWORD || "storepassword123",
    description: "Store Merchant Login Password",
    is_public: false,
  },
  {
    id: "DEFAULT_DELIVERY_TIME",
    secret_value: "10-15 mins",
    description: "FreshCart express delivery promise",
    is_public: true,
  },
  {
    id: "FREE_DELIVERY_THRESHOLD",
    secret_value: "499",
    description: "Cart amount for free delivery in INR",
    is_public: true,
  },
];

async function seedSecrets() {
  console.log("=================================================");
  console.log("   SUPABASE SECRETS TABLE SYNC & VERIFICATION    ");
  console.log("=================================================\n");

  console.log(`Connecting to Supabase at: ${supabaseUrl}`);

  // Test if table exists
  const { data: existing, error } = await supabase.from("app_secrets").select("id");

  if (error) {
    console.error("\n❌ Table 'public.app_secrets' does not exist yet in Supabase.");
    console.log("\nTo create it in 30 seconds:");
    console.log("1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/pmlqyypgixxffceyipze");
    console.log("2. Click 'SQL Editor' -> 'New Query'");
    console.log("3. Copy and run the SQL from: 'supabase_secrets_schema.sql'");
    console.log("4. Then run this script again: 'node scripts/seed-secrets.js'\n");
    process.exit(1);
  }

  console.log(`✓ Table 'app_secrets' is accessible. Found ${existing.length} existing secret(s).`);

  console.log("\nUpserting application secrets...");
  for (const item of DEFAULT_SECRETS) {
    const { error: upsertErr } = await supabase.from("app_secrets").upsert({
      ...item,
      updated_at: new Date().toISOString(),
    });

    if (upsertErr) {
      console.error(`  ❌ Failed to save ${item.id}:`, upsertErr.message);
    } else {
      console.log(`  ✓ Saved ${item.id} (${item.is_public ? "Public" : "Private"})`);
    }
  }

  console.log("\n🎉 All secrets synchronized in Supabase!");
}

seedSecrets();
