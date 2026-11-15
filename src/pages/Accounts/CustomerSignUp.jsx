import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import signupImg from "../../images/signup-g.svg";
import ScrollToTop from "../ScrollToTop";

const CustomerSignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { registerCustomer, sendVerificationCode, verifyCode, loginAsGuest, user, logout } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: true,
  });

  // 6-Digit Email Verification State
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [previewNotice, setPreviewNotice] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Preserve redirect destination (e.g. from /checkout)
  const redirectUrl = location.state?.from?.pathname || "/Shop";

  // Resend countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errorMsg) setErrorMsg("");

    // Reset verification status if email changes
    if (name === "email") {
      setIsVerified(false);
      setCodeSent(false);
      setVerificationCode("");
      setPreviewNotice("");
    }
  };

  // Send 6-Digit Verification Code
  const handleSendVerificationCode = async () => {
    const email = formData.email.trim();
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address first.");
      return;
    }

    setSendingCode(true);
    setErrorMsg("");

    try {
      const res = await sendVerificationCode(email, "customer");
      setSendingCode(false);

      if (res.success) {
        setCodeSent(true);
        setCountdown(30);
        if (res.previewCode) {
          setPreviewNotice(res.previewCode);
        }

        Swal.fire({
          icon: "info",
          title: "Code Dispatched!",
          text: `A 6-digit numeric verification code has been sent to ${email}.`,
          timer: 2500,
          showConfirmButton: false,
        });
      } else {
        setErrorMsg(res.message || "Unable to send verification code. Try again.");
      }
    } catch (err) {
      setSendingCode(false);
      setErrorMsg("Error dispatching code. Please try again.");
    }
  };

  // Verify Code Button
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
          text: "Your email address has been verified. You can now complete your registration.",
          timer: 1800,
          showConfirmButton: false,
        });
      } else {
        setErrorMsg(res.message || "Invalid verification code.");
      }
    } catch (err) {
      setVerifyingCode(false);
      setErrorMsg("Verification failed. Please try again.");
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;
    const code = verificationCode.trim();

    if (!name) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    if (!email || !email.includes("@")) {
      setErrorMsg("Email address is mandatory.");
      return;
    }

    if (!code) {
      setErrorMsg("The 6-digit email verification code is mandatory. Please request and enter your code.");
      return;
    }

    if (code.length < 6) {
      setErrorMsg("Please enter the full 6-digit numeric verification code.");
      return;
    }

    if (phone && phone.replace(/\D/g, "").length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter.");
      return;
    }

    if (!formData.agreeTerms) {
      setErrorMsg("You must agree to the Terms of Service to create an account.");
      return;
    }

    setLoading(true);

    try {
      const res = await registerCustomer({
        name,
        email,
        password,
        phone,
        code,
      });

      setLoading(false);

      if (res.success) {
        Swal.fire({
          icon: "success",
          title: "Account Created & Verified!",
          text: `Welcome to FreshCart, ${name}! Your account is ready.`,
          timer: 2000,
          showConfirmButton: false,
        });
        navigate(redirectUrl, { replace: true });
      } else {
        setErrorMsg(res.message || "Failed to create account. Please try again.");
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg("An unexpected error occurred. Please try again.");
    }
  };

  const handleFastGuest = () => {
    loginAsGuest({
      name: "Guest Customer",
      phone: "9876543210",
    });
    navigate(redirectUrl, { replace: true });
  };

  return (
    <div className="bg-light py-5" style={{ minHeight: "85vh" }}>
      <ScrollToTop />
      <div className="container" style={{ maxWidth: "1020px" }}>
        {user && (
          <div className="alert alert-info mb-4 rounded-4 shadow-sm d-flex justify-content-between align-items-center">
            <div>
              Signed in as: <strong>{user.name}</strong> ({user.isGuest ? "Guest" : user.role})
            </div>
            <button onClick={logout} className="btn btn-sm btn-outline-danger py-1 px-3">
              Sign Out
            </button>
          </div>
        )}

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="row g-0 align-items-center">
            {/* Left Graphic Banner */}
            <div
              className="col-lg-5 d-none d-lg-flex bg-success-subtle p-5 flex-column justify-content-between h-100 text-center"
              style={{ minHeight: "620px", backgroundColor: "#f0fdf4" }}
            >
              <div>
                <span className="badge bg-success mb-3 px-3 py-2 fs-6 rounded-pill">
                  ⚡ 10-15 Min Express Grocery
                </span>
                <h3 className="fw-bold text-dark mt-2">Verified Customer Access</h3>
                <p className="text-muted small">
                  Create a verified FreshCart account with mandatory email OTP validation to manage orders and fast-track checkout.
                </p>
              </div>

              <div className="my-auto py-4">
                <img
                  src={signupImg}
                  alt="FreshCart Sign Up"
                  className="img-fluid"
                  style={{ maxHeight: "260px" }}
                />
              </div>

              <div className="bg-white p-3 rounded-3 shadow-sm border border-success-subtle text-start">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <i className="fas fa-envelope-circle-check text-success fs-5"></i>
                  <span className="fw-bold small text-dark">Email Verification Mandatory</span>
                </div>
                <small className="text-muted" style={{ fontSize: "12px" }}>
                  A 6-digit numeric verification code protects your account against unauthorized access.
                </small>
              </div>
            </div>

            {/* Right Registration Form */}
            <div className="col-lg-7 p-4 p-md-5">
              <div className="mb-4">
                <h2 className="fw-bold text-dark mb-1">Create Account</h2>
                <p className="text-muted small">
                  Sign up with email verification to enjoy 15-minute grocery deliveries.
                </p>
              </div>

              {errorMsg && (
                <div className="alert alert-danger small py-2 px-3 rounded-3 mb-3" role="alert">
                  ⚠️ {errorMsg}
                </div>
              )}

              <form onSubmit={handleSignUp}>
                {/* Full Name */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="form-control py-2"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Mandatory Email with Send OTP Action */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-semibold text-muted mb-0">
                      Email Address (Mandatory) <span className="text-danger">*</span>
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
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isVerified}
                      required
                    />
                    <button
                      type="button"
                      onClick={handleSendVerificationCode}
                      disabled={sendingCode || countdown > 0 || isVerified}
                      className="btn btn-outline-success fw-semibold"
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
                </div>

                {/* 6-Digit Verification Code Input */}
                {codeSent && (
                  <div className="p-3 bg-light rounded-3 mb-3 border border-success-subtle">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label small fw-bold text-dark mb-0">
                        Enter 6-Digit Verification Code <span className="text-danger">*</span>
                      </label>
                      {previewNotice && (
                        <span className="badge bg-dark small" title="Placeholder sender development code">
                          Dev Code: <strong>{previewNotice}</strong>
                        </span>
                      )}
                    </div>

                    <div className="input-group">
                      <input
                        type="text"
                        maxLength="6"
                        pattern="\d*"
                        className={`form-control font-monospace fs-5 text-center fw-bold letter-spacing-2 ${isVerified ? "is-valid" : ""}`}
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
                          className="btn btn-success fw-bold px-3"
                        >
                          {verifyingCode ? "Verifying..." : "Verify Code"}
                        </button>
                      )}
                    </div>
                    <small className="text-muted d-block mt-1" style={{ fontSize: "11px" }}>
                      Check your email inbox or spam folder for the code from our verification sender.
                    </small>
                  </div>
                )}

                {/* Phone */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control py-2"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                {/* Password Fields */}
                <div className="row g-2 mb-3">
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

                {/* Terms agreement */}
                <div className="form-check mb-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="agreeTerms"
                    id="termsCheck"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                  />
                  <label className="form-check-label small text-muted" htmlFor="termsCheck">
                    I agree to the{" "}
                    <Link to="/AboutUs" className="text-success text-decoration-none fw-semibold">
                      Terms of Service
                    </Link>{" "}
                    &amp;{" "}
                    <Link to="/AboutUs" className="text-success text-decoration-none fw-semibold">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-success w-100 py-3 fw-bold rounded-3 shadow-sm mb-3"
                  style={{ backgroundColor: "#0aad0a", borderColor: "#0aad0a" }}
                >
                  {loading ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating &amp; Verifying User...
                    </span>
                  ) : (
                    "⚡ Verify & Create Customer Account"
                  )}
                </button>

                {/* Sign In Link */}
                <div className="text-center py-2">
                  <span className="text-muted small">
                    Already have an account?{" "}
                    <Link to="/customer-login" className="text-success fw-bold text-decoration-none">
                      Sign In here →
                    </Link>
                  </span>
                </div>

                {/* Express Guest Link */}
                <div className="d-flex align-items-center my-3">
                  <hr className="flex-grow-1" />
                  <span className="px-2 text-muted small">or</span>
                  <hr className="flex-grow-1" />
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleFastGuest}
                    className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1"
                  >
                    🚀 In a hurry? Continue as Guest
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSignUp;
