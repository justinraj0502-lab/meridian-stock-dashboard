import { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  ShieldCheck,
  Check,
  Sparkles,
  KeyRound,
  RotateCcw,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  register,
  verifyRegistrationOtp,
  resendOtp,
} from "../api/api";

import "./Auth.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [verificationEmail, setVerificationEmail] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [step, setStep] = useState("register");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [resendCooldown, setResendCooldown] =
    useState(0);

  const passwordStrength =
    password.length >= 10
      ? "strong"
      : password.length >= 6
      ? "medium"
      : "weak";

  /* =========================================================
     RESEND COUNTDOWN
  ========================================================= */

  const startResendCooldown = () => {
    setResendCooldown(60);

    const interval = setInterval(() => {
      setResendCooldown((current) => {
        if (current <= 1) {
          clearInterval(interval);
          return 0;
        }

        return current - 1;
      });
    }, 1000);
  };

  /* =========================================================
     REGISTER
  ========================================================= */

  const handleRegister = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanName) {
      setError(
        "Please enter your full name."
      );
      return;
    }

    if (!cleanEmail) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail
      )
    ) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const data = await register(
        cleanName,
        cleanEmail,
        password
      );

      setVerificationEmail(
        data?.email || cleanEmail
      );

      setEmail(
        data?.email || cleanEmail
      );

      setStep("otp");

      setOtp("");

      setSuccess(
        "Verification code sent to your email."
      );

      startResendCooldown();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to create your account. Please try again."
      );

      /*
        If the backend says the OTP was recently sent,
        still move the user to OTP verification.
      */
      if (
        err?.requiresVerification &&
        err?.email
      ) {
        setVerificationEmail(
          err.email
        );

        setEmail(err.email);
        setStep("otp");
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     VERIFY REGISTRATION OTP
  ========================================================= */

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanOtp =
      otp.trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      setError(
        "Please enter the 6-digit verification code."
      );
      return;
    }

    try {
      setLoading(true);

      const data =
        await verifyRegistrationOtp(
          verificationEmail,
          cleanOtp
        );

      /*
        JWT is stored by api.js only after successful
        OTP verification.
      */

      setSuccess(
        "Email verified successfully. Opening your workspace..."
      );

      /*
        Small delay gives the user feedback before
        moving into Meridian.
      */
      setTimeout(() => {
        navigate("/", {
          replace: true,
        });
      }, 700);

    } catch (err) {
      setError(
        err?.message ||
          "Unable to verify the code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     RESEND OTP
  ========================================================= */

  const handleResendOtp = async () => {
    if (
      resendCooldown > 0 ||
      resending ||
      !verificationEmail
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      setResending(true);

      await resendOtp(
        verificationEmail,
        "register"
      );

      setOtp("");

      setSuccess(
        "A new verification code has been sent."
      );

      startResendCooldown();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to resend the verification code."
      );

      /*
        Backend cooldown is 60 seconds.
        Keep the UI synchronized if a resend is
        attempted too early.
      */
      if (
        err?.status === 429 ||
        err?.code === "OTP_COOLDOWN"
      ) {
        startResendCooldown();
      }
    } finally {
      setResending(false);
    }
  };

  /* =========================================================
     BACK TO REGISTER
  ========================================================= */

  const handleBackToRegister = () => {
    setStep("register");
    setOtp("");
    setError("");
    setSuccess("");
  };

  return (
    <div className="auth-page">

      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="auth-background">
        <div className="auth-grid" />

        <div className="auth-orb auth-orb-one" />
        <div className="auth-orb auth-orb-two" />
        <div className="auth-orb auth-orb-three" />

        <div className="auth-particle auth-particle-one" />
        <div className="auth-particle auth-particle-two" />
        <div className="auth-particle auth-particle-three" />
        <div className="auth-particle auth-particle-four" />
      </div>

      <main className="auth-layout">

        {/* =================================================
            SHOWCASE
        ================================================= */}

        <section className="auth-showcase">

          <div className="auth-brand">

            <div className="auth-brand-logo">
              M
            </div>

            <div>
              <strong>
                MERIDIAN
              </strong>

              <span>
                MARKETS • PORTFOLIO
              </span>
            </div>

          </div>

          <div className="auth-showcase-content">

            <div className="auth-eyebrow">
              <span className="auth-eyebrow-dot" />

              {step === "register"
                ? "BUILD YOUR WORKSPACE"
                : "VERIFY YOUR IDENTITY"}
            </div>

            <h1>
              {step === "register" ? (
                <>
                  Start your
                  <br />
                  <span>
                    Meridian journey.
                  </span>
                </>
              ) : (
                <>
                  Secure your
                  <br />
                  <span>
                    Meridian account.
                  </span>
                </>
              )}
            </h1>

            <p>
              {step === "register"
                ? "Create your account and bring your market workspace, portfolio and learning tools together in one focused terminal."
                : "A secure verification code has been sent to your email. Confirm it to activate your Meridian workspace."}
            </p>

            <div className="auth-feature-list">

              <div className="auth-feature">

                <div className="auth-feature-icon">
                  <Check size={15} />
                </div>

                <div>
                  <strong>
                    Portfolio workspace
                  </strong>

                  <span>
                    Track holdings and available cash.
                  </span>
                </div>

              </div>

              <div className="auth-feature">

                <div className="auth-feature-icon">
                  <Check size={15} />
                </div>

                <div>
                  <strong>
                    Market tools
                  </strong>

                  <span>
                    Explore stocks through your dashboard.
                  </span>
                </div>

              </div>

              <div className="auth-feature">

                <div className="auth-feature-icon">
                  <Check size={15} />
                </div>

                <div>
                  <strong>
                    Secure access
                  </strong>

                  <span>
                    Email verification protects your account.
                  </span>
                </div>

              </div>

            </div>

          </div>

          <div className="auth-showcase-footer">

            <span>
              <ShieldCheck size={14} />
              Secure authentication
            </span>

            <span>
              <Sparkles size={14} />
              Personal workspace
            </span>

          </div>

        </section>

        {/* =================================================
            FORM SECTION
        ================================================= */}

        <section className="auth-form-section">

          <div className="auth-form-card">

            <div className="auth-form-top">

              <div className="auth-mobile-brand">

                <div className="auth-brand-logo">
                  M
                </div>

                <strong>
                  MERIDIAN
                </strong>

              </div>

              <div className="auth-form-icon">
                {step === "register" ? (
                  <UserRound size={19} />
                ) : (
                  <KeyRound size={19} />
                )}
              </div>

              <div className="auth-form-heading">

                <span>
                  {step === "register"
                    ? "NEW ACCOUNT"
                    : "EMAIL VERIFICATION"}
                </span>

                <h2>
                  {step === "register"
                    ? "Create your account"
                    : "Verify your email"}
                </h2>

                <p>
                  {step === "register"
                    ? "Set up your Meridian workspace."
                    : "Enter the 6-digit code sent to your inbox."}
                </p>

              </div>

            </div>

            {/* =================================================
                MESSAGES
            ================================================= */}

            {error && (
              <div className="auth-message auth-message-error">
                <span />
                {error}
              </div>
            )}

            {success && (
              <div className="auth-message auth-message-success">
                <span />
                {success}
              </div>
            )}

            {/* =================================================
                REGISTER FORM
            ================================================= */}

            {step === "register" && (
              <form
                className="auth-form"
                onSubmit={handleRegister}
              >

                {/* NAME */}

                <div className="auth-field">

                  <label htmlFor="register-name">
                    FULL NAME
                  </label>

                  <div className="auth-input-wrapper">

                    <UserRound
                      className="auth-input-icon"
                      size={17}
                    />

                    <input
                      id="register-name"
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(
                          event.target.value
                        )
                      }
                      placeholder="Your full name"
                      autoComplete="name"
                      disabled={loading}
                    />

                  </div>

                </div>

                {/* EMAIL */}

                <div className="auth-field">

                  <label htmlFor="register-email">
                    EMAIL ADDRESS
                  </label>

                  <div className="auth-input-wrapper">

                    <Mail
                      className="auth-input-icon"
                      size={17}
                    />

                    <input
                      id="register-email"
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

                </div>

                {/* PASSWORD */}

                <div className="auth-field">

                  <div className="auth-label-row">

                    <label htmlFor="register-password">
                      PASSWORD
                    </label>

                    <span>
                      MIN. 6 CHARACTERS
                    </span>

                  </div>

                  <div className="auth-input-wrapper">

                    <LockKeyhole
                      className="auth-input-icon"
                      size={17}
                    />

                    <input
                      id="register-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      placeholder="Create a password"
                      autoComplete="new-password"
                      disabled={loading}
                    />

                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>

                  </div>

                  {/* PASSWORD STRENGTH */}

                  {password.length > 0 && (
                    <div className="password-strength">

                      <div className="password-strength-bars">

                        <span
                          className={
                            passwordStrength ===
                              "weak" ||
                            passwordStrength ===
                              "medium" ||
                            passwordStrength ===
                              "strong"
                              ? "filled"
                              : ""
                          }
                        />

                        <span
                          className={
                            passwordStrength ===
                              "medium" ||
                            passwordStrength ===
                              "strong"
                              ? "filled"
                              : ""
                          }
                        />

                        <span
                          className={
                            passwordStrength ===
                              "strong"
                              ? "filled"
                              : ""
                          }
                        />

                      </div>

                      <span>
                        {passwordStrength ===
                        "strong"
                          ? "Strong password"
                          : passwordStrength ===
                            "medium"
                          ? "Good password"
                          : "Use at least 6 characters"}
                      </span>

                    </div>
                  )}

                </div>

                {/* SUBMIT */}

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={loading}
                >

                  <span>
                    {loading
                      ? "Sending verification..."
                      : "Continue to verification"}
                  </span>

                  {!loading && (
                    <ArrowRight
                      size={17}
                    />
                  )}

                  {loading && (
                    <span className="auth-spinner" />
                  )}

                </button>

              </form>
            )}

            {/* =================================================
                OTP FORM
            ================================================= */}

            {step === "otp" && (
              <form
                className="auth-form"
                onSubmit={handleVerifyOtp}
              >

                <div className="auth-field">

                  <label htmlFor="register-otp">
                    VERIFICATION CODE
                  </label>

                  <div className="auth-input-wrapper">

                    <KeyRound
                      className="auth-input-icon"
                      size={17}
                    />

                    <input
                      id="register-otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(event) => {
                        const value =
                          event.target.value.replace(
                            /\D/g,
                            ""
                          );

                        setOtp(
                          value.slice(0, 6)
                        );
                      }}
                      placeholder="Enter 6-digit code"
                      autoComplete="one-time-code"
                      disabled={loading}
                      autoFocus
                    />

                  </div>

                  <div
                    style={{
                      marginTop: "10px",
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.52)",
                      lineHeight: "1.6",
                    }}
                  >
                    Code sent to{" "}
                    <strong
                      style={{
                        color:
                          "rgba(255,255,255,0.82)",
                      }}
                    >
                      {verificationEmail}
                    </strong>
                  </div>

                </div>

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={
                    loading ||
                    otp.length !== 6
                  }
                >

                  <span>
                    {loading
                      ? "Verifying..."
                      : "Verify email"}
                  </span>

                  {!loading && (
                    <ArrowRight
                      size={17}
                    />
                  )}

                  {loading && (
                    <span className="auth-spinner" />
                  )}

                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={
                    resending ||
                    resendCooldown > 0 ||
                    loading
                  }
                  style={{
                    width: "100%",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background:
                      "rgba(255,255,255,0.025)",
                    color:
                      resendCooldown > 0
                        ? "rgba(255,255,255,0.35)"
                        : "rgba(255,255,255,0.72)",
                    borderRadius: "10px",
                    minHeight: "46px",
                    cursor:
                      resendCooldown > 0 ||
                      resending ||
                      loading
                        ? "not-allowed"
                        : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    transition:
                      "all 0.25s ease",
                  }}
                >
                  {resending ? (
                    <>
                      <span className="auth-spinner" />
                      Sending new code...
                    </>
                  ) : resendCooldown > 0 ? (
                    <>
                      <RotateCcw size={14} />
                      Resend available in{" "}
                      {resendCooldown}s
                    </>
                  ) : (
                    <>
                      <RotateCcw size={14} />
                      Resend verification code
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBackToRegister}
                  disabled={loading}
                  style={{
                    border: "none",
                    background: "transparent",
                    color:
                      "rgba(255,255,255,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "7px",
                    margin: "2px auto 0",
                    cursor: loading
                      ? "not-allowed"
                      : "pointer",
                    fontSize: "12px",
                  }}
                >
                  <ArrowLeft size={14} />
                  Change registration details
                </button>

              </form>
            )}

            {/* =================================================
                LOGIN SWITCH
            ================================================= */}

            {step === "register" && (
              <div className="auth-switch">

                <span>
                  Already have an account?
                </span>

                <Link to="/login">
                  Sign in
                  <ArrowRight size={14} />
                </Link>

              </div>
            )}

            {step === "otp" && (
              <div className="auth-switch">

                <span>
                  Already have an account?
                </span>

                <Link to="/login">
                  Sign in
                  <ArrowRight size={14} />
                </Link>

              </div>
            )}

            <div className="auth-security">

              <ShieldCheck size={14} />

              <span>
                Your account is protected by
                authenticated API access.
              </span>

            </div>

          </div>

          <div className="auth-copyright">
            MERIDIAN TERMINAL
            <span>•</span>
            v1.0
          </div>

        </section>

      </main>

    </div>
  );
}

export default Register;