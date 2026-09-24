import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Activity,
  Sparkles,
  KeyRound,
  RotateCcw,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  login,
  verifyLoginOtp,
  resendOtp,
} from "../api/api";

import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [otp, setOtp] = useState("");
  const [verificationEmail, setVerificationEmail] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [step, setStep] =
    useState("login");

  const [loading, setLoading] =
    useState(false);

  const [resending, setResending] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(
      location.state?.message || ""
    );

  const [resendCooldown, setResendCooldown] =
    useState(0);

  /* =========================================================
     CLEAR NAVIGATION MESSAGE FROM URL HISTORY
  ========================================================= */

  useEffect(() => {
    if (location.state?.message) {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );
    }
  }, [location.state]);

  /* =========================================================
     RESEND COOLDOWN
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
     LOGIN
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError(
        "Please enter your email and password."
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

    try {
      setLoading(true);

      const data = await login(
        cleanEmail,
        password
      );

      /*
        Backend sends the login OTP here.
        JWT is NOT stored until OTP verification.
      */

      setVerificationEmail(
        data?.email || cleanEmail
      );

      setEmail(
        data?.email || cleanEmail
      );

      setOtp("");

      setStep("otp");

      setSuccess(
        "Login verification code sent to your email."
      );

      startResendCooldown();
    } catch (err) {
      /*
        If the account exists but has not verified
        its registration email, backend returns
        requiresVerification: true.

        Send the user to the registration
        verification flow.
      */

      if (
        err?.requiresVerification &&
        err?.email
      ) {
        setVerificationEmail(
          err.email
        );

        setEmail(err.email);

        setError(
          "Please verify your email before logging in."
        );

        /*
          Give the user a clear route to finish
          registration verification.
        */
        return;
      }

      setError(
        err?.message ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     VERIFY LOGIN OTP
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

      await verifyLoginOtp(
        verificationEmail,
        cleanOtp
      );

      setSuccess(
        "Login verified successfully. Opening your terminal..."
      );

      setTimeout(() => {
        navigate("/dashboard", {
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
     RESEND LOGIN OTP
  ========================================================= */

  const handleResendOtp = async () => {
    if (
      resendCooldown > 0 ||
      resending ||
      loading ||
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
        "login"
      );

      setOtp("");

      setSuccess(
        "A new login verification code has been sent."
      );

      startResendCooldown();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to resend the verification code."
      );

      /*
        Backend may return 429 when the server-side
        60-second OTP cooldown is still active.
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
     BACK TO LOGIN
  ========================================================= */

  const handleBackToLogin = () => {
    setStep("login");

    setOtp("");

    setError("");

    setSuccess("");
  };

  /* =========================================================
     RENDER
  ========================================================= */

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


      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="auth-layout">

        {/* =================================================
            BRAND / VISUAL SIDE
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

              {step === "login"
                ? "PERSONAL MARKET TERMINAL"
                : "SECURE LOGIN VERIFICATION"}
            </div>


            <h1>
              {step === "login" ? (
                <>
                  Your market.
                  <br />
                  <span>
                    Your decisions.
                  </span>
                </>
              ) : (
                <>
                  One more step.
                  <br />
                  <span>
                    Secure access.
                  </span>
                </>
              )}
            </h1>


            <p>
              {step === "login"
                ? "A focused workspace for tracking markets, managing your portfolio, analysing positions and learning the fundamentals of investing."
                : "We've sent a secure one-time verification code to your email. Confirm the code to continue into your Meridian workspace."}
            </p>


            {/* =================================================
                MARKET VISUAL
            ================================================= */}

            <div className="auth-terminal-card">

              <div className="auth-terminal-header">

                <div>
                  <span>
                    MERIDIAN TERMINAL
                  </span>

                  <strong>
                    MARKET WORKSPACE
                  </strong>
                </div>

                <Activity
                  size={18}
                />

              </div>


              <div className="auth-chart">

                <div className="chart-line chart-line-one" />
                <div className="chart-line chart-line-two" />
                <div className="chart-line chart-line-three" />

                <svg
                  viewBox="0 0 500 150"
                  preserveAspectRatio="none"
                  className="auth-chart-svg"
                >
                  <defs>

                    <linearGradient
                      id="meridianChartFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#20d493"
                        stopOpacity="0.24"
                      />

                      <stop
                        offset="100%"
                        stopColor="#20d493"
                        stopOpacity="0"
                      />

                    </linearGradient>

                  </defs>


                  <path
                    d="
                      M0 118
                      C35 112 50 126 82 105
                      S130 82 158 98
                      S205 55 232 75
                      S275 92 302 57
                      S340 68 365 42
                      S408 65 432 28
                      S468 43 500 18
                    "
                    fill="none"
                    stroke="#20d493"
                    strokeWidth="3"
                    vectorEffect="non-scaling-stroke"
                  />


                  <path
                    d="
                      M0 118
                      C35 112 50 126 82 105
                      S130 82 158 98
                      S205 55 232 75
                      S275 92 302 57
                      S340 68 365 42
                      S408 65 432 28
                      S468 43 500 18
                      L500 150
                      L0 150
                      Z
                    "
                    fill="url(#meridianChartFill)"
                  />

                </svg>

              </div>


              <div className="auth-terminal-footer">

                <div>
                  <span>
                    WORKSPACE
                  </span>

                  <strong>
                    READY
                  </strong>
                </div>

                <div>
                  <span>
                    DATA
                  </span>

                  <strong>
                    MONITORING
                  </strong>
                </div>

                <div className="terminal-status">
                  <span />
                  CONNECTED
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
              Built for focused investing
            </span>

          </div>

        </section>


        {/* =================================================
            LOGIN PANEL
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

                {step === "login" ? (
                  <LockKeyhole
                    size={19}
                  />
                ) : (
                  <KeyRound
                    size={19}
                  />
                )}

              </div>


              <div className="auth-form-heading">

                <span>
                  {step === "login"
                    ? "WELCOME BACK"
                    : "EMAIL VERIFICATION"}
                </span>


                <h2>
                  {step === "login"
                    ? "Sign in to Meridian"
                    : "Verify your login"}
                </h2>


                <p>
                  {step === "login"
                    ? "Access your market workspace."
                    : "Enter the 6-digit code sent to your inbox."}
                </p>

              </div>

            </div>


            {/* =================================================
                STATUS
            ================================================= */}

            {error && (
              <div className="auth-message auth-message-error">
                <span />
                {error}
              </div>
            )}


            {success && !error && (
              <div className="auth-message auth-message-success">
                <span />
                {success}
              </div>
            )}


            {/* =================================================
                LOGIN FORM
            ================================================= */}

            {step === "login" && (
              <form
                className="auth-form"
                onSubmit={handleSubmit}
              >

                {/* EMAIL */}

                <div className="auth-field">

                  <label htmlFor="login-email">
                    EMAIL ADDRESS
                  </label>


                  <div className="auth-input-wrapper">

                    <Mail
                      className="auth-input-icon"
                      size={17}
                    />


                    <input
                      id="login-email"
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

                    <label htmlFor="login-password">
                      PASSWORD
                    </label>

                    <span>
                      SECURED
                    </span>

                  </div>


                  <div className="auth-input-wrapper">

                    <LockKeyhole
                      className="auth-input-icon"
                      size={17}
                    />


                    <input
                      id="login-password"
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
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={loading}
                    />


                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() =>
                        setShowPassword(
                          (value) =>
                            !value
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

                  <label htmlFor="login-otp">
                    VERIFICATION CODE
                  </label>


                  <div className="auth-input-wrapper">

                    <KeyRound
                      className="auth-input-icon"
                      size={17}
                    />


                    <input
                      id="login-otp"
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
                      color:
                        "rgba(255,255,255,0.52)",
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


                {/* VERIFY */}

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
                      : "Verify and sign in"}
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


                {/* RESEND */}

                <button
                  type="button"
                  onClick={
                    handleResendOtp
                  }
                  disabled={
                    resending ||
                    resendCooldown > 0 ||
                    loading
                  }
                  style={{
                    width: "100%",
                    border:
                      "1px solid rgba(255,255,255,0.08)",
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


                {/* BACK */}

                <button
                  type="button"
                  onClick={
                    handleBackToLogin
                  }
                  disabled={loading}
                  style={{
                    border: "none",
                    background:
                      "transparent",
                    color:
                      "rgba(255,255,255,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "7px",
                    margin:
                      "2px auto 0",
                    cursor: loading
                      ? "not-allowed"
                      : "pointer",
                    fontSize: "12px",
                  }}
                >

                  <ArrowLeft size={14} />

                  Back to sign in

                </button>

              </form>
            )}


            {/* =================================================
                REGISTER
            ================================================= */}

            <div className="auth-switch">

              <span>
                Don't have a Meridian account?
              </span>


              <Link to="/register">

                Create account

                <ArrowRight
                  size={14}
                />

              </Link>

            </div>


            {/* =================================================
                SECURITY
            ================================================= */}

            <div className="auth-security">

              <ShieldCheck size={14} />

              <span>
                {step === "login"
                  ? "Your credentials are transmitted through the authenticated Meridian API."
                  : "Your one-time verification code is required to complete secure access."}
              </span>

            </div>

          </div>


          <div className="auth-copyright">

            MERIDIAN TERMINAL

            <span>
              •
            </span>

            v1.0

          </div>

        </section>

      </main>

    </div>
  );
}

export default Login;