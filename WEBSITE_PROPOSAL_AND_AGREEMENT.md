# WEBSITE DEVELOPMENT PROPOSAL & COMMERCIAL SERVICE AGREEMENT

**Document Reference:** PROP/WEB-DEV/2026/089-FINAL  
**Date of Issuance:** November 15, 2026  
**Governing Laws:** Indian Contract Act, 1872 | Information Technology Act, 2000 | Indian Penal Code (IPC) / Bharatiya Nyaya Sanhita, 2023 (BNS)

---

## 1. PARTIES TO THE AGREEMENT

This Website Development Proposal and Binding Service Agreement (the **"Agreement"**) is entered into by and between:

* **DEVELOPER / SERVICE PROVIDER:**  
  **FreshCart Solutions & Development Team**  
  *(Hereinafter referred to as the "Agency/Developer", which expression shall include its successors, designees, and permitted assigns)*

* **CLIENT / PROMOTER:**  
  **[Client Business / Individual Name]**  
  Represented by: [Authorized Signatory Name]  
  Business Address: [Registered Commercial Address]  
  Contact Email: [Client Email] | Phone: [Client Phone]  
  *(Hereinafter referred to as the "Client", which expression shall include its representatives, administrators, and permitted assigns)*

---

## 2. SCOPE OF WORK & SYSTEM SPECIFICATIONS

The Agency agrees to engineer, configure, and deploy a production-ready **FreshCart Quick Commerce Grocery & Fulfillment Web Platform**, covering the following modules:

```
+-----------------------------------------------------------------------------------+
|                           CUSTOMER STOREFRONT & WEB APP                           |
|  - Dynamic Product Catalog (Dairy, Produce, Snacks, Bakery, Atta & Dal)           |
|  - Real-Time Search Bar & Category Filter                                         |
|  - Location / Pincode Selector (10-15 Min Express Verification)                   |
|  - Persistent Basket & Saved Wishlist                                             |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                         1-CLICK QUICK CHECKOUT & PAYMENT                          |
|  - Address Input, Delivery Instructions & Rider Tip Selection                     |
|  - Dual Mode: Cash on Delivery (COD) + Razorpay Online Gateway                    |
|  - Cryptographic HMAC-SHA256 Signature Verification                               |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                        5-STAGE REAL-TIME ORDER TRACKER                            |
|  RECEIVED  -->  ACCEPTED  -->  PACKING  -->  OUT FOR DELIVERY  -->  DELIVERED     |
|  - Audio Chimes on Status Transitions & Live Delivery Time Countdown              |
+-----------------------------------------------------------------------------------+
                                          ^
                                          |
+-----------------------------------------------------------------------------------+
|                        MERCHANT / DARKSTORE SELLER PORTAL                         |
|  - Role-Based Protected Login (/seller/login)                                     |
|  - Real-Time Live Order Stream with Sound Alerts                                  |
|  - Order Fulfillment Actions (Accept, Pack, Dispatch, Deliver)                    |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                             BACKEND & DATA LAYER                                  |
|  - RESTful Express Server (CRUD, Payment APIs, Auth Endpoints)                    |
|  - Supabase PostgreSQL Database with In-Memory Resilient Fallback                 |
+-----------------------------------------------------------------------------------+
```

---

## 3. COMMERCIAL TERMS & PAYMENT MILESTONES

| Milestone | Deliverables & Phase Description | Percentage | Amount (INR) |
| :--- | :--- | :---: | :--- |
| **Milestone 1 (Immediate)** | **Mobilization & Commitment Advance (Earnest Retainer)** | **40%** | **₹ [Advance Amount]** |
| **Milestone 2** | UI/UX Delivery, Live Search, Category System & Cart | **30%** | **₹ [Stage 2 Amount]** |
| **Milestone 3** | Merchant Portal, Payment Verification & Supabase Integration | **20%** | **₹ [Stage 3 Amount]** |
| **Milestone 4** | Final UAT Testing, Live Domain Deployment & Handover | **10%** | **₹ [Final Balance]** |
| **Total Project Value** | | **100%** | **₹ [Total Value]** |

---

## 4. STRICT NON-REFUNDABLE COMMITMENT ADVANCE POLICY

### 4.1 Irrevocable Nature of Commitment Fee
Upon payment of **Milestone 1 (Commitment Advance)**:
1. The Agency immediately allocates dedicated software engineering hours, locks architect schedules, reserves cloud instances, and begins codebase architecture.
2. **Under no circumstances will the commitment advance be refunded, transferred, or returned to the Client.**
3. Changes of business mind, internal company delays, loss of project viability, or failure to provide content/assets by the Client shall **not** be grounds for refund demands.

### 4.2 Legal Characterization under Contract Law
* **Earnest Money Deposit:** The advance constitutes legitimate earnest money under **Section 74 of the Indian Contract Act, 1872**.
* **Pre-Estimated Liquidated Damages:** Should the Client abandon, delay indefinitely, or unilaterally cancel the project after paying Milestone 1, the advance shall stand fully forfeited as pre-estimated compensation for allocated developer hours and commercial opportunity loss.

---

## 5. SUPPORT, MAINTENANCE & SCOPE EXPANSION POLICY

### 5.1 Free Support Period (Year 1)
* **Duration:** **One (1) Full Year (12 months)** of complimentary technical support starting from the date of final deployment.
* **Covered Scope:**
  * Resolution of code defects, software bugs, or unexpected runtime crashes within the original scope.
  * Ensuring connectivity between frontend, Express server, and Supabase database.
  * Dependency security checks and framework compatibility fixes.

### 5.2 Annual Maintenance Contract (Year 2 Onwards)
* **Annual Renewal Charge:** **₹20,000/- (Rupees Twenty Thousand Only) per year**.
* **Billing Schedule:** Payable in advance at the start of each renewal year.
* **Inclusions:** Platform uptime audits, database vacuuming/optimization, minor configuration tweaks, and continued bug monitoring.

### 5.3 Additional / New Requirements Billing
* **Scope Creep Policy:** Any functionality, design revision, payment provider addition, custom reporting, or workflow not explicitly stated in Section 2 is classified as a **New Requirement**.
* **Extra Invoicing:** New requirements will be documented via a formal **Change Request (CR)** note and billed separately based on estimated engineering hours or an agreed fixed quotation prior to implementation.

---

## 6. EXCLUSIONS & THIRD-PARTY SUBSCRIPTION EXPENSES

The development fee covers technical programming and integration labor only. The following ongoing third-party services are **strictly excluded** from this proposal and must be procured directly by the Client:

1. **Domain Registration & Annual Renewal:** Domain registration (`.com`, `.in`, etc.) through GoDaddy, Namecheap, or other registrars.
2. **Cloud Server & Database Hosting:** Monthly or annual hosting subscription costs for cloud infrastructure (e.g., AWS, Vercel Pro, Supabase Compute/Storage plans).
3. **Payment Gateway Merchant & Transaction Charges:** Setup fees and per-transaction processing charges (Merchant Discount Rate / TDR, typically 1.95%–2% + GST) levied by payment processors (Razorpay, Paytm, Stripe, Cashfree).
4. **Third-Party APIs:** External SMS OTP gateways (Twilio, MSG91), WhatsApp Business APIs, or transactional email services.

---

## 7. STATUTORY GOVERNING LAWS & LEGAL PROVISIONS

This Agreement is executed in accordance with the laws of the Republic of India. Both parties acknowledge their civil and penal liabilities under the following statutory enactments:

### 7.1 Civil & Contractual Statutes
* **The Indian Contract Act, 1872:**
  * **Section 10:** Contracts entered into with free consent for lawful consideration are legally binding and enforceable.
  * **Section 73 & Section 74:** Recognizes the right to damages for breach of contract and the forfeiture of earnest deposits upon default.
* **The Information Technology Act, 2000 (Amended 2008):**
  * **Section 10A:** Recognizes digital contracts, email negotiations, and online approvals as valid and admissible evidence in Indian courts.
  * **Section 43 & Section 66:** Imposes strict criminal and civil penalties for unauthorized extraction of computer code, unauthorized source downloads, or tampering with database systems.

### 7.2 Penal Provisions (Indian Penal Code & Bharatiya Nyaya Sanhita, 2023)

*(Effective July 1, 2024, the Indian Penal Code has been updated to the Bharatiya Nyaya Sanhita - BNS. Both references are cited below for clarity).*

| Violation / Unlawful Act | Indian Penal Code (IPC) | Bharatiya Nyaya Sanhita (BNS) | Legal Consequence & Liability |
| :--- | :--- | :--- | :--- |
| **Cheating & Dishonest Inducement** | **Section 415 & Section 420 IPC** | **Section 318(4) BNS** | Inducing the Agency to perform services or deliver code with a fraudulent intention of not clearing dues, or attempting fraudulent bank chargebacks after work has begun, constitutes criminal cheating punishable with imprisonment up to 7 years and a fine. |
| **Criminal Breach of Trust** | **Section 405 & Section 406 IPC** | **Section 316 BNS** | Misappropriation, unauthorized commercial deployment, or tampering with entrusted source code, intellectual property, or server credentials before completing contract payments constitutes criminal breach of trust (punishable with imprisonment up to 3 years or fine). |
| **Extortion & Unlawful Coercion** | **Section 383 & Section 384 IPC** | **Section 308 BNS** | Coercing, intimidating, or threatening developers with unlawful repercussions to force refunds against agreed non-refundable terms constitutes criminal extortion. |
| **Defamation & Malicious Harm** | **Section 499 & Section 500 IPC** | **Section 356 BNS** | Publishing defamatory, false, or damaging reviews or notices on social media/forums to compel non-contractual concessions attracts criminal defamation proceedings. |

---

## 8. INTELLECTUAL PROPERTY & CODE TRANSFER

1. **Retention of Title:** All source code, application architectures, deployment configurations, and design assets remain the **exclusive intellectual property of the Agency** until all milestone payments (100% of the project fee) are cleared.
2. **Right to Suspend:** The Agency reserves the right to suspend staging environments, take down live deployments, and withhold final production credentials if milestone payments remain unpaid beyond seven (7) business days from invoicing.

---

## 9. DISPUTE RESOLUTION & ARBITRATION

* **Amicable Discussion:** Any operational or commercial disputes shall first be addressed through written discussion within fifteen (15) days.
* **Arbitration:** Unresolved disputes shall be submitted to a sole arbitrator appointed under the **Arbitration and Conciliation Act, 1996**. The arbitration proceedings shall be held in English.
* **Jurisdiction:** Courts in **[Insert City, e.g., Bengaluru, Karnataka]** shall have exclusive jurisdiction over all matters arising out of this Agreement.

---

## 10. ACCEPTANCE & SIGN-OFF EXECUTION

By signing below or transferring the **Milestone 1 Commitment Advance**, the Client confirms having carefully read, understood, and agreed to all provisions of this proposal, specifically consenting to the **Non-Refundable Advance Policy**, **1-Year Support & ₹20,000/yr AMC**, **Third-Party Exclusions**, and the applicable legal remedies.

```
Accepted and Agreed by CLIENT:              Accepted and Agreed by AGENCY:

_______________________________________     _______________________________________
Authorized Signatory                        Authorized Signatory
Name:                                       Name:
Designation:                                Designation:
Company Name:                               Agency: FreshCart Development
Date:                                       Date:
```
