import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth, DEMO_ADMIN } from "../../context/AuthContext";
import ScrollToTop from "../ScrollToTop";

const VendorRegister = () => {
  const navigate = useNavigate();
  const { registerVendor, sendVerificationCode, verifyCode, user, logout } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    storeName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // 6-digit Verification Code state
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [previewCode, setPreviewCode] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Countdown timer for resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg("");

    // Reset code state if email changes
    if (e.target.name === "email") {
      setIsVerified(false);
      setCodeSent(false);
      setVerificationCode("");
      setPreviewCode("");
    }
  };

  // Send 6-digit code to authorized store email
  const handleSendVerificationCode = async () => {
    const email = formData.email.trim();
    if (!email || !email.includes("@")) {
      setErrorMsg("Please provide your authorized store email address first.");
      return;
    }

    setSendingCode(true);
    setErrorMsg("");

    try {
      const res = await sendVerificationCode(email, "vendor");
      setSendingCode(false);

      if (res.success) {
        setCodeSent(true);
        setCountdown(30);
        if (res.previewCode) {
          setPreviewCode(res.previewCode);
        }

        Swal.fire({
          icon: "info",
          title: "Verification Code Sent!",
          text: `A 6-digit code was sent to ${email}.`,
          timer: 2500,
          showConfirmButton: false,
        });
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setSendingCode(false);
      setErrorMsg("Unable to dispatch verification code. Try again.");
    }
  };

  // Verify 6-digit code button
  const handleVerifyOtp = async () => {
    const cleanCode = verificationCode.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    setVerifyingCode(true);
    setErrorMsg("");

    try {
      const res = await verifyCode(formData.email.trim(), cleanCode);
      setVerifyingCode(false);

      if (res.success) {
        setIsVerified(true);
        Swal.fire({
          icon: "success",
          title: "Email Verified! ✓",
          text: "Authorized vendor email verified. You can now complete registration.",
          timer: 1800,
          showConfirmButton: false,
        });
      } else {
        setErrorMsg(res.message || "Invalid verification code.");
      }
    } catch (err) {
      setVerifyingCode(false);
      setErrorMsg("Verification check failed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const email = formData.email.trim();
    const code = verificationCode.trim();

    if (!email || !email.includes("@")) {
      setErrorMsg("Authorized store email is mandatory.");
      return;
    }

    if (!code) {
      setErrorMsg("Email verification is mandatory. Please request and enter the 6-digit code sent to your store email.");
      return;
    }

    if (code.length < 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    const res = await registerVendor({
      name: formData.name.trim(),
      storeName: formData.storeName.trim(),
      email,
      password: formData.password,
      phone: formData.phone.trim(),
      code,
    });

    setLoading(false);

    if (res.success) {
      Swal.fire({
        icon: "success",
        title: "Vendor Verified & Onboarded!",
        text: res.message || "Your vendor account has been verified and activated.",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/seller/dashboard", { replace: true });
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="bg-light py-5" style={{ minHeight: "85vh" }}>
      <ScrollToTop />
      <div className="container" style={{ maxWidth: "600px" }}>
        {user && (
          <div className="alert alert-secondary mb-4 rounded-3 d-flex justify-content-between align-items-center">
            <small>
              Currently signed in as: <strong>{user.name}</strong> ({user.role})
            </small>
            <button onClick={logout} className="btn btn-sm btn-outline-danger py-0 px-2">
              Sign Out
            </button>
          </div>
        )}

        <div className="card border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white">
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center bg-dark text-white rounded-circle mb-3 shadow"
              style={{ width: "64px", height: "64px", fontSize: "2rem" }}
            >
              🏪
            </div>
            <h3 className="fw-bold mb-1">Vendor Store Registration</h3>
            <p className="text-muted small">
              Onboard your darkstore or merchant account with mandatory email verification
            </p>

            {/* Security Notice Pill */}
            <div className="alert alert-warning py-2 px-3 small rounded-3 mt-3 text-start">
              <strong>🔒 Strict Admin Whitelist:</strong> Only stores and individuals authorized by platform <strong>Administrators</strong> are permitted to register as vendors.
            </div>
          </div>

          {errorMsg && (
            <div className="alert alert-danger small py-3 px-3 rounded-3 mb-4" role="alert">
              <strong>⚠️ Access Error:</strong> {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Mandatory Store Email with Send OTP */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-semibold text-muted mb-0">
                  Authorized Store Email (Mandatory) <span className="text-danger">*</span>
                </label>
                {isVerified && (
                  <span className="badge bg-success-subtle text-success small fw-bold">
                    ✓ Email Verified
                  </span>
                )}
              </div>

              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  className={`form-control py-2 ${isVerified ? "is-valid" : ""}`}
                  placeholder="e.g. seller@grocery.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isVerified}
                  required
                />
                <button
                  type="button"
                  onClick={handleSendVerificationCode}
                  disabled={sendingCode || countdown > 0 || isVerified}
                  className="btn btn-outline-dark fw-semibold"
                >
                  {sendingCode ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                      Sending...
                    </span>
                  ) : countdown > 0 ? (
                    `Resend (${countdown}s)`
                  ) : codeSent ? (
                    "Resend Code"
                  ) : (
                    "📩 Send 6-Digit Code"
                  )}
                </button>
              </div>
              <small className="text-muted d-block mt-1" style={{ fontSize: "11px" }}>
                Must match an email previously whitelisted by an Admin.
              </small>
            </div>

            {/* 6-Digit Code Input Section */}
            {codeSent && (
              <div className="p-3 bg-light rounded-3 mb-3 border border-dark-subtle">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label small fw-bold text-dark mb-0">
                    Enter 6-Digit Verification Code <span className="text-danger">*</span>
                  </label>
                  {previewCode && (
                    <span className="badge bg-dark small" title="Placeholder sender development code">
                      Dev Code: <strong>{previewCode}</strong>
                    </span>
                  )}
                </div>

                <div className="input-group">
                  <input
                    type="text"
                    maxLength="6"
                    pattern="\d*"
                    className={`form-control font-monospace fs-5 text-center fw-bold ${isVerified ? "is-valid" : ""}`}
                    style={{ letterSpacing: "4px" }}
                    placeholder="••••••"
                    value={verificationCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setVerificationCode(val);
                      if (errorMsg) setErrorMsg("");
                    }}
                    disabled={isVerified}
                    required
                  />
                  {!isVerified && (
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={verifyingCode || verificationCode.length < 6}
                      className="btn btn-dark fw-bold px-3"
                    >
                      {verifyingCode ? "Verifying..." : "Verify Code"}
                    </button>
                  )}
                </div>
                <small className="text-muted d-block mt-1" style={{ fontSize: "11px" }}>
                  Enter the 6-digit numeric verification code sent to your store email address.
                </small>
              </div>
            )}

            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">
                  Store / Brand Name
                </label>
                <input
                  type="text"
                  name="storeName"
                  className="form-control py-2"
                  placeholder="e.g. Green Valley Organics"
                  value={formData.storeName}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">
                  Store Manager Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control py-2"
                  placeholder="e.g. Priya Patel"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">
                Contact Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                className="form-control py-2"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="row g-2 mb-4">
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">
                  Password <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  className="form-control py-2"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">
                  Confirm Password <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control py-2"
                  placeholder="Re-type password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-dark w-100 py-3 fw-bold rounded-3 shadow-sm mb-3"
            >
              {loading ? "Verifying & Activating..." : "🚀 Verify Whitelist & Register Vendor"}
            </button>

            <div className="text-center py-2">
              <span className="text-muted small">
                Already registered as a vendor?{" "}
                <Link to="/seller/login" className="text-dark fw-bold text-decoration-none">
                  Sign In to Vendor Portal →
                </Link>
              </span>
            </div>
          </form>

          {/* Admin Contact Help */}
          <div className="mt-4 pt-3 border-top text-center text-muted small">
            Need to get your store onboarded? Contact the Administrator at{" "}
            <strong className="text-dark">{DEMO_ADMIN.email}</strong>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorRegister;
