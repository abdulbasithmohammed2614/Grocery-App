process.env.NODE_ENV = "test";
const http = require("http");
const app = require("../server/server");

const PORT = 5003;
let server;

const request = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: PORT,
        path,
        method,
        headers: {
          "Content-Type": "application/json",
          ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch (e) {
            parsed = raw;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.on("error", (err) => reject(err));
    if (data) req.write(data);
    req.end();
  });
};

const assert = (condition, msg) => {
  if (!condition) throw new Error(msg || "Assertion failed");
};

async function run() {
  console.log("=================================================================");
  console.log("  VENDOR WHITELIST & 6-DIGIT EMAIL VERIFICATION TEST");
  console.log("=================================================================\n");

  await new Promise((resolve) => {
    server = app.listen(PORT, () => {
      console.log(`Test server running on http://127.0.0.1:${PORT}\n`);
      resolve();
    });
  });

  try {
    // -----------------------------------------------------------------
    // 1. Mandatory Email OTP Verification for Customer Sign Up
    // -----------------------------------------------------------------
    console.log("• Test 1: Reject customer registration without 6-digit verification code...");
    const customerNoCode = await request("POST", "/api/auth/register", {
      name: "Sneha Reddy",
      email: "sneha.reddy@example.com",
      password: "securepassword123",
      phone: "9876543220",
    });
    assert(customerNoCode.status === 400, `Expected 400 but got ${customerNoCode.status}`);
    assert(customerNoCode.body.success === false, "Registration must fail without verification code");
    console.log("  PASSED: Customer registration blocked without 6-digit code.\n");

    console.log("• Test 2: Dispatch 6-digit numeric verification code to customer email...");
    const customerSendOtp = await request("POST", "/api/auth/send-verification-code", {
      email: "sneha.reddy@example.com",
      type: "customer",
    });
    assert(customerSendOtp.status === 200, `Expected 200 OK but got ${customerSendOtp.status}`);
    assert(customerSendOtp.body.success === true, "Send OTP must succeed");
    const customerOtp = customerSendOtp.body.previewCode;
    assert(customerOtp && customerOtp.length === 6, `Expected 6-digit numeric code, got ${customerOtp}`);
    console.log(`  PASSED: 6-digit verification code (${customerOtp}) generated for customer.\n`);

    console.log("• Test 3: Reject customer registration with incorrect OTP...");
    const customerBadOtp = await request("POST", "/api/auth/register", {
      name: "Sneha Reddy",
      email: "sneha.reddy@example.com",
      password: "securepassword123",
      phone: "9876543220",
      code: "000000", // wrong code
    });
    assert(customerBadOtp.status === 400, "Expected 400 for incorrect OTP");
    assert(customerBadOtp.body.success === false, "Registration must fail with wrong OTP");
    console.log("  PASSED: Wrong OTP rejected.\n");

    console.log("• Test 4: Successfully verify email & register customer with valid 6-digit code...");
    const customerValidRegister = await request("POST", "/api/auth/register", {
      name: "Sneha Reddy",
      email: "sneha.reddy@example.com",
      password: "securepassword123",
      phone: "9876543220",
      code: customerOtp,
    });
    assert(customerValidRegister.status === 200, `Expected 200 OK but got ${customerValidRegister.status}`);
    assert(customerValidRegister.body.success === true, "Registration must succeed with valid OTP");
    assert(customerValidRegister.body.user.email === "sneha.reddy@example.com", "Email matches");
    console.log("  PASSED: Customer successfully registered upon valid email OTP verification.\n");

    // -----------------------------------------------------------------
    // 2. Vendor Whitelist & Mandatory Email OTP Verification
    // -----------------------------------------------------------------
    console.log("• Test 5: Reject sending verification code to non-whitelisted vendor email...");
    const unapprovedOtpRes = await request("POST", "/api/auth/send-verification-code", {
      email: "random.imposter@gmail.com",
      type: "vendor",
    });
    assert(unapprovedOtpRes.status === 403, `Expected 403 Forbidden but got ${unapprovedOtpRes.status}`);
    assert(unapprovedOtpRes.body.success === false, "Expected failure for non-whitelisted vendor");
    console.log("  PASSED: Non-whitelisted prospective vendor blocked from requesting OTP.\n");

    console.log("• Test 6: Non-admin tries to add a vendor to whitelist -> MUST BE REJECTED...");
    const nonAdminAdd = await request("POST", "/api/vendors", {
      name: "New Store",
      storeName: "Unauthorized Store",
      email: "newstore@grocery.com",
      adminEmail: "random.user@gmail.com", // not admin
    });
    assert(nonAdminAdd.status === 403, `Expected 403 Forbidden but got ${nonAdminAdd.status}`);
    assert(nonAdminAdd.body.success === false, "Expected failure for non-admin");
    console.log("  PASSED: Non-admin strictly blocked from adding vendors.\n");

    console.log("• Test 7: Admin authorizes new vendor to the approved whitelist...");
    const adminAdd = await request("POST", "/api/vendors", {
      name: "Vikram Mehta",
      storeName: "Mehta Supermart Indiranagar",
      email: "vikram.mehta@grocery.com",
      phone: "9876543233",
      password: "mehtapassword123",
      adminEmail: "admin@grocery.com", // valid admin
    });
    assert(adminAdd.status === 200, `Expected 200 OK but got ${adminAdd.status}`);
    assert(adminAdd.body.success === true, "Expected vendor authorization success");
    console.log("  PASSED: Admin successfully whitelisted new vendor.\n");

    console.log("• Test 8: Dispatch 6-digit verification code to authorized whitelisted vendor email...");
    const vendorSendOtp = await request("POST", "/api/auth/send-verification-code", {
      email: "vikram.mehta@grocery.com",
      type: "vendor",
    });
    assert(vendorSendOtp.status === 200, `Expected 200 OK but got ${vendorSendOtp.status}`);
    const vendorOtp = vendorSendOtp.body.previewCode;
    assert(vendorOtp && vendorOtp.length === 6, `Expected 6-digit OTP, got ${vendorOtp}`);
    console.log(`  PASSED: 6-digit code (${vendorOtp}) sent to authorized vendor.\n`);

    console.log("• Test 9: Complete vendor registration with 6-digit code & whitelist verification...");
    const vendorRegister = await request("POST", "/api/auth/vendor-register", {
      name: "Vikram Mehta",
      storeName: "Mehta Supermart Indiranagar",
      email: "vikram.mehta@grocery.com",
      password: "mehtapassword123",
      phone: "9876543233",
      code: vendorOtp,
    });
    assert(vendorRegister.status === 200, `Expected 200 but got ${vendorRegister.status}`);
    assert(vendorRegister.body.success === true, "Expected successful vendor registration");
    assert(vendorRegister.body.user.role === "vendor", "Role must be vendor");
    console.log("  PASSED: Whitelisted vendor successfully verified via OTP and activated.\n");

    console.log("• Test 10: Vendor logs in to Vendor Portal...");
    const vendorLogin = await request("POST", "/api/auth/seller-login", {
      email: "vikram.mehta@grocery.com",
      password: "mehtapassword123",
    });
    assert(vendorLogin.status === 200, `Expected 200 but got ${vendorLogin.status}`);
    assert(vendorLogin.body.user.role === "vendor", "Role must be vendor");
    console.log("  PASSED: Vendor successfully logged in with role 'vendor'.\n");

    console.log("• Test 11: Platform SuperAdmin logs in...");
    const adminLogin = await request("POST", "/api/auth/seller-login", {
      email: "admin@grocery.com",
      password: "adminpassword123",
    });
    assert(adminLogin.status === 200, `Expected 200 but got ${adminLogin.status}`);
    assert(adminLogin.body.user.role === "admin", "Role must be admin");
    console.log("  PASSED: Platform SuperAdmin successfully logged in with role 'admin'.\n");

    console.log("=================================================================");
    console.log("  ALL VENDOR WHITELIST & EMAIL VERIFICATION TESTS PASSED! (11/11)");
    console.log("=================================================================");
  } finally {
    if (server) server.close();
  }
}

run().catch((err) => {
  console.error("Test failed:", err);
  if (server) server.close();
  process.exit(1);
});
