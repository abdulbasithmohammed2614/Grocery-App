/**
 * Automated Test Suite for FreshCart Quick Commerce Grocery Backend
 * Tests all API endpoints, validations, Supabase DB operations, and status lifecycle.
 */

process.env.NODE_ENV = "test";

const http = require("http");
const app = require("../server/server");

const PORT = 5001; // Separate port for testing
let server;

// Helper to make HTTP requests
const request = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: "127.0.0.1",
      port: PORT,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
        ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let rawData = "";
      res.on("data", (chunk) => (rawData += chunk));
      res.on("end", () => {
        try {
          const parsed = rawData ? JSON.parse(rawData) : null;
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: rawData });
        }
      });
    });

    req.on("error", (err) => reject(err));
    if (data) req.write(data);
    req.end();
  });
};

// Test Suite Runner
const runTests = async () => {
  console.log("=================================================================");
  console.log("  FRESHCART QUICK-COMMERCE BACKEND TEST SUITE");
  console.log("=================================================================\n");

  const results = [];
  let createdOrderId = null;

  const test = async (name, testFn) => {
    process.stdout.write(`• Testing: ${name}... `);
    const start = Date.now();
    try {
      await testFn();
      const elapsed = Date.now() - start;
      console.log(`\x1b[32mPASSED\x1b[0m (${elapsed}ms)`);
      results.push({ name, status: "PASSED", elapsed, error: null });
    } catch (err) {
      const elapsed = Date.now() - start;
      console.log(`\x1b[31mFAILED\x1b[0m (${elapsed}ms)`);
      console.log(`   Error: ${err.message}`);
      results.push({ name, status: "FAILED", elapsed, error: err.message });
    }
  };

  const assert = (condition, msg) => {
    if (!condition) throw new Error(msg || "Assertion failed");
  };

  try {
    // Start test server
    await new Promise((resolve) => {
      server = app.listen(PORT, () => {
        console.log(`Test server running on http://127.0.0.1:${PORT}\n`);
        resolve();
      });
    });

    // -------------------------------------------------------------
    // 1. Health & DB Connectivity
    // -------------------------------------------------------------
    await test("1. API Health Check and Supabase DB Status", async () => {
      const res = await request("GET", "/api/health");
      assert(res.status === 200, `Expected 200 but got ${res.status}`);
      assert(res.body.status === "healthy", "Expected status to be healthy");
      assert(res.body.database.includes("Supabase"), "Expected database to be Supabase");
    });

    // -------------------------------------------------------------
    // 2. Authentication & Role Boundary Tests
    // -------------------------------------------------------------
    await test("2. Seller Auth: Allow registered store seller login", async () => {
      const res = await request("POST", "/api/auth/seller-login", {
        email: "seller@grocery.com",
        password: "storepassword123",
      });
      assert(res.status === 200, `Expected 200 but got ${res.status}`);
      assert(res.body.success === true, "Expected success to be true");
      assert(res.body.user.role === "seller", "Role must be seller");
      assert(res.body.user.isGuest === false, "Seller cannot be guest");
    });

    await test("3. Seller Auth: Reject invalid store credentials", async () => {
      const res = await request("POST", "/api/auth/seller-login", {
        email: "imposter@gmail.com",
        password: "wrongpassword",
      });
      assert(res.status === 401, `Expected 401 but got ${res.status}`);
      assert(res.body.success === false, "Expected success to be false");
    });

    await test("4. Customer Auth: Registered customer login", async () => {
      const res = await request("POST", "/api/auth/customer-login", {
        email: "customer@gmail.com",
        password: "customer123",
      });
      assert(res.status === 200, `Expected 200 but got ${res.status}`);
      assert(res.body.user.role === "customer", "Role must be customer");
      assert(res.body.user.isGuest === false, "Registered customer is not guest");
    });

    await test("5. Customer Auth: Instant Guest Login (Express Fast)", async () => {
      const res = await request("POST", "/api/auth/guest-login", {
        name: "Pooja Verma",
        phone: "9876543210",
      });
      assert(res.status === 200, `Expected 200 but got ${res.status}`);
      assert(res.body.user.role === "customer", "Guest must have customer role");
      assert(res.body.user.isGuest === true, "Guest flag must be true");
      assert(res.body.user.name === "Pooja Verma", "Guest name mismatch");
    });

    // -------------------------------------------------------------
    // 3. Input Validation Tests
    // -------------------------------------------------------------
    await test("6. Order Validation: Reject missing customer name", async () => {
      const res = await request("POST", "/api/orders", {
        customer_phone: "9876543210",
        house_flat_no: "Flat 101",
        apartment_area: "Indiranagar",
        pincode: "560038",
        items: [{ name: "Milk", price: 30, quantity: 1 }],
        total_amount: 30,
      });
      assert(res.status === 400, `Expected 400 but got ${res.status}`);
      assert(res.body.success === false, "Expected success to be false");
      assert(res.body.message.includes("name"), `Expected error about name, got: ${res.body.message}`);
    });

    await test("7. Order Validation: Reject missing phone number", async () => {
      const res = await request("POST", "/api/orders", {
        customer_name: "Rahul",
        house_flat_no: "Flat 101",
        apartment_area: "Indiranagar",
        pincode: "560038",
        items: [{ name: "Milk", price: 30, quantity: 1 }],
        total_amount: 30,
      });
      assert(res.status === 400, `Expected 400 but got ${res.status}`);
      assert(res.body.success === false, "Expected success to be false");
      assert(res.body.message.includes("phone"), `Expected error about phone, got: ${res.body.message}`);
    });

    await test("8. Order Validation: Reject missing delivery address", async () => {
      const res = await request("POST", "/api/orders", {
        customer_name: "Rahul",
        customer_phone: "9876543210",
        // house_flat_no and apartment_area missing
        pincode: "560038",
        items: [{ name: "Milk", price: 30, quantity: 1 }],
        total_amount: 30,
      });
      assert(res.status === 400, `Expected 400 but got ${res.status}`);
      assert(res.body.message.includes("address"), `Expected address error, got: ${res.body.message}`);
    });

    await test("9. Order Validation: Reject empty shopping cart", async () => {
      const res = await request("POST", "/api/orders", {
        customer_name: "Rahul",
        customer_phone: "9876543210",
        house_flat_no: "Flat 101",
        apartment_area: "Indiranagar",
        pincode: "560038",
        items: [],
        total_amount: 0,
      });
      assert(res.status === 400, `Expected 400 but got ${res.status}`);
      assert(res.body.message.includes("item"), `Expected item error, got: ${res.body.message}`);
    });

    // -------------------------------------------------------------
    // 4. Order Placement Flow (FreshCart 1-Page Checkout)
    // -------------------------------------------------------------
    await test("10. Place New Quick Order (Cash on Delivery)", async () => {
      const orderPayload = {
        customer_name: "Anita Sharma",
        customer_phone: "9812345678",
        house_flat_no: "A-204, 2nd Floor, Sunshine Apts",
        apartment_area: "100ft Road, Indiranagar",
        landmark: "Opposite Metro Station",
        city: "Bangalore",
        pincode: "560038",
        items: [
          { name: "Amul Taaza Fresh Milk", price: 27, quantity: 2, unit: "500 ml" },
          { name: "Brown Bread", price: 45, quantity: 1, unit: "400 g" },
          { name: "Farm Fresh Eggs", price: 60, quantity: 1, unit: "6 pcs" },
        ],
        item_count: 4,
        subtotal: 159,
        delivery_fee: 0,
        total_amount: 162,
        payment_method: "COD",
        payment_status: "PENDING",
      };

      const res = await request("POST", "/api/orders", orderPayload);
      assert(res.status === 201, `Expected 201 but got ${res.status}`);
      assert(res.body.success === true, "Expected success to be true");
      assert(res.body.order && res.body.order.id, "Expected valid order with ID");
      assert(res.body.order.order_status === "RECEIVED", "Initial status must be RECEIVED");
      assert(res.body.order.payment_method === "COD", "Payment method must be COD");
      assert(res.body.order.total_amount == 162, "Total amount mismatch");

      createdOrderId = res.body.order.id;
    });

    // -------------------------------------------------------------
    // 5. Seller & Customer Retrieval
    // -------------------------------------------------------------
    await test("11. Seller Dashboard: Fetch all incoming orders", async () => {
      const res = await request("GET", "/api/orders");
      assert(res.status === 200, `Expected 200 but got ${res.status}`);
      assert(res.body.success === true, "Expected success to be true");
      assert(Array.isArray(res.body.orders), "Orders should be an array");
      assert(res.body.orders.length > 0, "Orders array should not be empty");

      const match = res.body.orders.find((o) => o.id === createdOrderId);
      assert(match, "Created order should appear in seller orders feed");
    });

    await test("12. Customer Live Tracker: Fetch single order by ID", async () => {
      const res = await request("GET", `/api/orders/${createdOrderId}`);
      assert(res.status === 200, `Expected 200 but got ${res.status}`);
      assert(res.body.success === true, "Expected success to be true");
      assert(res.body.order.id === createdOrderId, "Order ID mismatch");
      assert(res.body.order.customer_name === "Anita Sharma", "Customer name mismatch");
      assert(res.body.order.house_flat_no.includes("Sunshine"), "Address mismatch");
    });

    // -------------------------------------------------------------
    // 6. Order Status Lifecycle Pipeline
    // -------------------------------------------------------------
    await test("13. Seller Pipeline Step 1: Accept Order (RECEIVED -> ACCEPTED)", async () => {
      const res = await request("PATCH", `/api/orders/${createdOrderId}/status`, {
        order_status: "ACCEPTED",
      });
      assert(res.status === 200, `Expected 200 but got ${res.status}`);
      assert(res.body.order.order_status === "ACCEPTED", "Status must update to ACCEPTED");
    });

    await test("14. Seller Pipeline Step 2: Start Packing (ACCEPTED -> PACKING)", async () => {
      const res = await request("PATCH", `/api/orders/${createdOrderId}/status`, {
        order_status: "PACKING",
      });
      assert(res.status === 200, `Expected 200 but got ${res.status}`);
      assert(res.body.order.order_status === "PACKING", "Status must update to PACKING");
    });

    await test("15. Seller Pipeline Step 3: Dispatch Rider (PACKING -> OUT_FOR_DELIVERY)", async () => {
      const res = await request("PATCH", `/api/orders/${createdOrderId}/status`, {
        order_status: "OUT_FOR_DELIVERY",
      });
      assert(res.status === 200, `Expected 200 but got ${res.status}`);
      assert(res.body.order.order_status === "OUT_FOR_DELIVERY", "Status must update to OUT_FOR_DELIVERY");
    });

    await test("16. Seller Pipeline Step 4: Complete Delivery (OUT_FOR_DELIVERY -> DELIVERED)", async () => {
      const res = await request("PATCH", `/api/orders/${createdOrderId}/status`, {
        order_status: "DELIVERED",
      });
      assert(res.status === 200, `Expected 200 but got ${res.status}`);
      assert(res.body.order.order_status === "DELIVERED", "Status must update to DELIVERED");
      assert(res.body.order.payment_status === "PAID", "Delivered COD order must mark payment as PAID");
    });

    await test("17. Seller Pipeline Validation: Reject invalid status value", async () => {
      const res = await request("PATCH", `/api/orders/${createdOrderId}/status`, {
        order_status: "SHIPPED_SOMEWHERE_UNKNOWN",
      });
      assert(res.status === 400, `Expected 400 but got ${res.status}`);
      assert(res.body.message.includes("Invalid status"), "Expected invalid status error message");
    });

    // -------------------------------------------------------------
    // 7. Payment API Validation
    // -------------------------------------------------------------
    await test("18. Payment API: Reject invalid order payment amount", async () => {
      const res = await request("POST", "/api/payment/create-order", { amount: -50 });
      assert(res.status === 400, `Expected 400 but got ${res.status}`);
      assert(res.body.message.includes("Invalid"), "Expected invalid amount error");
    });

    // -------------------------------------------------------------
    // 8. Frontend Tabs Catalog Endpoints (Supabase & Fallback Data)
    // -------------------------------------------------------------
    await test("19. Fetch Products Catalog for Grocery Tabs", async () => {
      const res = await request("GET", "/api/products");
      assert(res.status === 200, `Expected 200 but got ${res.status}`);
      assert(res.body.success === true, "Expected success to be true");
      assert(Array.isArray(res.body.products), "Products must be an array");
      assert(res.body.products.length > 0, "Products count must be > 0");
    });

    await test("20. Fetch Category Tabs List with Dynamic Database Counts", async () => {
      const res = await request("GET", "/api/categories");
      assert(res.status === 200, `Expected 200 but got ${res.status}`);
      assert(Array.isArray(res.body.categories), "Categories must be an array");
      assert(res.body.categories.length > 0, "Categories count must be > 0");
      assert(res.body.categories.every(c => typeof c.count === "number"), "Every category must have dynamic numeric count");
      const allCategory = res.body.categories.find(c => c.name === "All");
      assert(allCategory && allCategory.count > 0, "'All' category must exist with total product count");
    });

    await test("21. Fetch Stores Directory for Stores Tab", async () => {
      const res = await request("GET", "/api/stores");
      assert(res.status === 200, `Expected 200 but got ${res.status}`);
      assert(Array.isArray(res.body.stores), "Stores must be an array");
      assert(res.body.stores.length > 0, "Stores count must be > 0");
    });

    // -------------------------------------------------------------
    // 9. Cleanup Test Order
    // -------------------------------------------------------------
    await test("22. Cleanup: Delete test order from database", async () => {
      if (createdOrderId) {
        const res = await request("DELETE", `/api/orders/${createdOrderId}`);
        assert(res.status === 200, `Expected 200 but got ${res.status}`);
        assert(res.body.success === true, "Expected success to be true");
      }
    });

  } finally {
    // Close server
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  }

  // Print Summary
  console.log("\n=================================================================");
  console.log("                     TEST EXECUTION REPORT");
  console.log("=================================================================");
  const passed = results.filter((r) => r.status === "PASSED").length;
  const failed = results.filter((r) => r.status === "FAILED").length;
  const total = results.length;

  console.log(`Total Testcases : ${total}`);
  console.log(`Passed          : \x1b[32m${passed}\x1b[0m`);
  console.log(`Failed          : ${failed > 0 ? `\x1b[31m${failed}\x1b[0m` : `0`}`);
  console.log(`Success Rate    : ${Math.round((passed / total) * 100)}%`);
  console.log("=================================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runTests().catch((err) => {
  console.error("Unhandled test suite error:", err);
  process.exit(1);
});
