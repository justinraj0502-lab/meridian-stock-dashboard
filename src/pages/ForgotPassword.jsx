import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
} from "../api/api";

import "./ForgotPassword.css";


function ForgotPassword() {
  const navigate = useNavigate();

  const otpInputRef = useRef(null);

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [countdown, setCountdown] =
    useState(0);


  /* =====================================================
     OTP COUNTDOWN
  ===================================================== */

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown((current) =>
        current > 0
          ? current - 1
          : 0
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);


  /* =====================================================
     FOCUS OTP
  ===================================================== */

  useEffect(() => {
    if (step === 2) {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 150);
    }
  }, [step]);


  /* =====================================================
     EMAIL VALIDATION
  ===================================================== */

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      value.trim()
    );
  };


  /* =====================================================
     PASSWORD STRENGTH
  ===================================================== */

  const getPasswordStrength = () => {
    if (!newPassword) {
      return {
        label: "",
        width: "0%",
        level: "",
      };
    }

    let score = 0;

    if (newPassword.length >= 6) {
      score++;
    }

    if (newPassword.length >= 10) {
      score++;
    }

    if (/[A-Z]/.test(newPassword)) {
      score++;
    }

    if (/[0-9]/.test(newPassword)) {
      score++;
    }

    if (/[^A-Za-z0-9]/.test(newPassword)) {
      score++;
    }

    if (score <= 2) {
      return {
        label: "Weak password",
        width: "35%",
        level: "weak",
      };
    }

    if (score <= 3) {
      return {
        label: "Good password",
        width: "65%",
        level: "medium",
      };
    }

    return {
      label: "Strong password",
      width: "100%",
      level: "strong",
    };
  };


  const passwordStrength =
    getPasswordStrength();


  /* =====================================================
     SEND RESET OTP
  ===================================================== */

  const handleSendOtp = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    try {
      setLoading(true);

      const data =
        await forgotPassword(
          cleanEmail
        );

      setEmail(
        data?.email ||
          cleanEmail
      );

      setMessage(
        "Verification code sent successfully."
      );

      setCountdown(60);

      setStep(2);
    } catch (err) {
      setError(
        err.message ||
          "Unable to send verification code."
      );
    } finally {
      setLoading(false);
    }
  };


  /* =====================================================
     VERIFY OTP
  ===================================================== */

  const handleVerifyOtp = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanOtp =
      otp.trim();

    if (cleanOtp.length !== 6) {
      setError(
        "Please enter the 6-digit verification code."
      );
      return;
    }

    try {
      setLoading(true);

      await verifyForgotPasswordOtp(
        email,
        cleanOtp
      );

      setMessage(
        "Code verified. Create your new password."
      );

      setStep(3);
    } catch (err) {
      setError(
        err.message ||
          "Invalid verification code."
      );
    } finally {
      setLoading(false);
    }
  };


  /* =====================================================
     RESET PASSWORD
  ===================================================== */

  const handleResetPassword =
    async (event) => {
      event.preventDefault();

      setError("");
      setMessage("");

      if (newPassword.length < 6) {
        setError(
          "Password must contain at least 6 characters."
        );
        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setError(
          "Passwords do not match."
        );
        return;
      }

      try {
        setLoading(true);

        await resetPassword(
          email,
          otp,
          newPassword
        );

        setStep(4);

        setMessage(
          "Your password has been reset successfully."
        );
      } catch (err) {
        setError(
          err.message ||
            "Unable to reset password."
        );
      } finally {
        setLoading(false);
      }
    };


  /* =====================================================
     RESEND
  ===================================================== */

  const handleResend = async () => {
    if (countdown > 0) {
      return;
    }

    setError("");
    setMessage("");

    try {
      setLoading(true);

      await forgotPassword(
        email
      );

      setCountdown(60);

      setMessage(
        "A new verification code has been sent."
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to resend verification code."
      );
    } finally {
      setLoading(false);
    }
  };


  /* =====================================================
     BACK
  ===================================================== */

  const handleBack = () => {
    setError("");
    setMessage("");

    if (step === 1) {
      navigate("/login");
      return;
    }

    if (step === 2) {
      setOtp("");
      setStep(1);
      return;
    }

    if (step === 3) {
      setNewPassword("");
      setConfirmPassword("");
      setStep(2);
    }
  };


  /* =====================================================
     OTP INPUT
  ===================================================== */

  const handleOtpChange = (
    event
  ) => {
    const value =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 6);

    setOtp(value);
  };


  return (
    <div className="forgot-page">

      {/* Background decoration */}

      <div className="forgot-orb forgot-orb-one" />

      <div className="forgot-orb forgot-orb-two" />

      <div className="forgot-grid" />


      {/* Main wrapper */}

      <main className="forgot-container">

        {/* Brand */}

        <div className="forgot-brand">

          <div className="forgot-brand-mark">
            M
          </div>

          <div>
            <div className="forgot-brand-name">
              MERIDIAN
            </div>

            <div className="forgot-brand-subtitle">
              STOCK MARKET DASHBOARD
            </div>
          </div>

        </div>


        {/* Card */}

        <section className="forgot-card">

          {/* Top glow */}

          <div className="forgot-card-glow" />


          {/* Progress */}

          <div className="forgot-progress">

            <div
              className={
                step >= 1
                  ? "forgot-progress-item active"
                  : "forgot-progress-item"
              }
            >
              <span>01</span>
              <small>Email</small>
            </div>


            <div
              className={
                step >= 2
                  ? "forgot-progress-line active"
                  : "forgot-progress-line"
              }
            />


            <div
              className={
                step >= 2
                  ? "forgot-progress-item active"
                  : "forgot-progress-item"
              }
            >
              <span>02</span>
              <small>Verify</small>
            </div>


            <div
              className={
                step >= 3
                  ? "forgot-progress-line active"
                  : "forgot-progress-line"
              }
            />


            <div
              className={
                step >= 3
                  ? "forgot-progress-item active"
                  : "forgot-progress-item"
              }
            >
              <span>03</span>
              <small>Reset</small>
            </div>

          </div>


          {/* =================================================
              STEP 1
          ================================================= */}

          {step === 1 && (
            <form
              className="forgot-form"
              onSubmit={handleSendOtp}
            >

              <div className="forgot-icon">
                <LockKeyhole size={25} />
              </div>


              <div className="forgot-heading">

                <div className="forgot-eyebrow">
                  ACCOUNT RECOVERY
                </div>

                <h1>
                  Forgot your password?
                </h1>

                <p>
                  Enter the email connected
                  to your Meridian account
                  and we'll send you a
                  secure verification code.
                </p>

              </div>


              <label className="forgot-label">
                Email address
              </label>


              <div className="forgot-input-wrap">

                <Mail
                  size={18}
                  className="forgot-input-icon"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                />

              </div>


              {error && (
                <div className="forgot-alert error">
                  {error}
                </div>
              )}


              {message && (
                <div className="forgot-alert success">
                  <Check size={15} />
                  {message}
                </div>
              )}


              <button
                type="submit"
                className="forgot-primary-button"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="forgot-spinner" />
                    Sending code...
                  </>
                ) : (
                  <>
                    Send verification code
                    <ArrowRight size={18} />
                  </>
                )}

              </button>


              <Link
                to="/login"
                className="forgot-back-link"
              >
                <ArrowLeft size={16} />
                Back to login
              </Link>

            </form>
          )}


          {/* =================================================
              STEP 2
          ================================================= */}

          {step === 2 && (
            <form
              className="forgot-form"
              onSubmit={handleVerifyOtp}
            >

              <div className="forgot-icon verify">
                <ShieldCheck size={25} />
              </div>


              <div className="forgot-heading">

                <div className="forgot-eyebrow">
                  EMAIL VERIFICATION
                </div>

                <h1>
                  Check your inbox
                </h1>

                <p>
                  We sent a 6-digit
                  verification code to
                  <strong>
                    {" "}
                    {email}
                  </strong>
                </p>

              </div>


              <label className="forgot-label">
                Verification code
              </label>


              <div className="forgot-input-wrap otp">

                <ShieldCheck
                  size={18}
                  className="forgot-input-icon"
                />

                <input
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="000000"
                  autoComplete="one-time-code"
                  maxLength={6}
                  disabled={loading}
                />

              </div>


              <div className="forgot-otp-hint">
                Enter the 6-digit code from
                the email sent by Meridian.
              </div>


              {error && (
                <div className="forgot-alert error">
                  {error}
                </div>
              )}


              {message && (
                <div className="forgot-alert success">
                  <Check size={15} />
                  {message}
                </div>
              )}


              <button
                type="submit"
                className="forgot-primary-button"
                disabled={
                  loading ||
                  otp.length !== 6
                }
              >

                {loading ? (
                  <>
                    <span className="forgot-spinner" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify code
                    <ArrowRight size={18} />
                  </>
                )}

              </button>


              <div className="forgot-resend">

                <span>
                  Didn't receive the code?
                </span>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={
                    loading ||
                    countdown > 0
                  }
                >
                  {countdown > 0
                    ? `Resend in ${countdown}s`
                    : "Resend code"}
                </button>

              </div>


              <button
                type="button"
                className="forgot-back-button"
                onClick={handleBack}
                disabled={loading}
              >
                <ArrowLeft size={16} />
                Change email
              </button>

            </form>
          )}


          {/* =================================================
              STEP 3
          ================================================= */}

          {step === 3 && (
            <form
              className="forgot-form"
              onSubmit={handleResetPassword}
            >

              <div className="forgot-icon reset">
                <LockKeyhole size={25} />
              </div>


              <div className="forgot-heading">

                <div className="forgot-eyebrow">
                  SECURE YOUR ACCOUNT
                </div>

                <h1>
                  Create new password
                </h1>

                <p>
                  Choose a strong password
                  that you haven't used
                  elsewhere.
                </p>

              </div>


              <label className="forgot-label">
                New password
              </label>


              <div className="forgot-input-wrap">

                <LockKeyhole
                  size={18}
                  className="forgot-input-icon"
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="forgot-eye"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current
                    )
                  }
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>


              {newPassword && (
                <div className="password-strength">

                  <div className="password-strength-track">

                    <div
                      className={`password-strength-fill ${passwordStrength.level}`}
                      style={{
                        width:
                          passwordStrength.width,
                      }}
                    />

                  </div>

                  <span
                    className={
                      passwordStrength.level
                    }
                  >
                    {passwordStrength.label}
                  </span>

                </div>
              )}


              <label className="forgot-label">
                Confirm new password
              </label>


              <div className="forgot-input-wrap">

                <LockKeyhole
                  size={18}
                  className="forgot-input-icon"
                />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="forgot-eye"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) =>
                        !current
                    )
                  }
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>


              {error && (
                <div className="forgot-alert error">
                  {error}
                </div>
              )}


              {message && (
                <div className="forgot-alert success">
                  <Check size={15} />
                  {message}
                </div>
              )}


              <button
                type="submit"
                className="forgot-primary-button"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="forgot-spinner" />
                    Updating password...
                  </>
                ) : (
                  <>
                    Update password
                    <ArrowRight size={18} />
                  </>
                )}

              </button>


              <div className="forgot-security-note">
                <ShieldCheck size={16} />

                <span>
                  Your password is securely
                  encrypted before being
                  stored.
                </span>
              </div>

            </form>
          )}


          {/* =================================================
              STEP 4
          ================================================= */}

          {step === 4 && (
            <div className="forgot-success">

              <div className="forgot-success-icon">
                <Check size={32} />
              </div>


              <div className="forgot-eyebrow">
                PASSWORD UPDATED
              </div>


              <h1>
                You're all set.
              </h1>


              <p>
                Your Meridian password has
                been successfully updated.
                You can now sign in with
                your new password.
              </p>


              <div className="forgot-success-security">

                <Sparkles size={18} />

                <span>
                  Your account is ready.
                </span>

              </div>


              <button
                type="button"
                className="forgot-primary-button"
                onClick={() =>
                  navigate("/login")
                }
              >
                Continue to login
                <ArrowRight size={18} />
              </button>

            </div>
          )}

        </section>


        {/* Footer */}

        <div className="forgot-footer">

          <span>
            © {new Date().getFullYear()} Meridian
          </span>

          <span className="forgot-footer-dot">
            •
          </span>

          <span>
            Secure account recovery
          </span>

        </div>

      </main>

    </div>
  );
}


export default ForgotPassword;