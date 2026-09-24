const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "https://meridian-stock-backend.onrender.com/api");

// ============================================================
// AUTH STORAGE
// ============================================================

export const getToken = () => {
  return localStorage.getItem("meridian-token");
};

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem("meridian-user");

    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Failed to read current user:", error);
    return null;
  }
};

export const isAuthenticated = () => {
  return Boolean(getToken());
};

export const setAuthData = (
  token,
  user
) => {
  if (token) {
    localStorage.setItem(
      "meridian-token",
      token
    );
  }

  if (user) {
    localStorage.setItem(
      "meridian-user",
      JSON.stringify(user)
    );
  }
};

export const clearAuthData = () => {
  localStorage.removeItem("meridian-token");
  localStorage.removeItem("meridian-user");

  // Older auth keys
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const logout = () => {
  clearAuthData();
};

// ============================================================
// GENERIC REQUEST
// ============================================================

const request = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(
      data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`
    );

    error.status = response.status;
    error.code = data?.code;
    error.data = data;

    throw error;
  }

  return data;
};

// ============================================================
// REGISTER
// ============================================================

export const registerUser = async ({
  name,
  email,
  password,
}) => {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });
};

// Compatibility name
export const register = registerUser;

// ============================================================
// REGISTRATION OTP
// ============================================================

export const verifyRegistrationOtp = async ({
  email,
  otp,
}) => {
  return request("/auth/register/verify", {
    method: "POST",
    body: JSON.stringify({
      email,
      otp,
    }),
  });
};

// Compatibility name
export const verifyRegisterOtp =
  verifyRegistrationOtp;

// ============================================================
// LOGIN
// ============================================================

export const login = async (
  email,
  password
) => {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
};

// Keep the newer name available too
export const loginUser = async ({
  email,
  password,
}) => {
  return login(email, password);
};

// ============================================================
// LOGIN OTP
// ============================================================

export const verifyLoginOtp = async (
  email,
  otp
) => {
  const response = await request(
    "/auth/login/verify",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        otp,
      }),
    }
  );

  // Save authentication immediately after
  // successful OTP verification
  if (response?.token) {
    setAuthData(
      response.token,
      response.user
    );
  }

  return response;
};

export const verifyOtp = verifyLoginOtp;

// ============================================================
// FORGOT PASSWORD
// ============================================================

export const forgotPassword = async ({
  email,
}) => {
  return request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
  });
};

export const verifyForgotPasswordOtp =
  async ({
    email,
    otp,
  }) => {
    return request(
      "/auth/forgot-password/verify",
      {
        method: "POST",
        body: JSON.stringify({
          email,
          otp,
        }),
      }
    );
  };

export const resetPassword = async ({
  email,
  otp,
  newPassword,
}) => {
  return request(
    "/auth/forgot-password/reset",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        otp,
        newPassword,
      }),
    }
  );
};

// ============================================================
// RESEND OTP
// ============================================================

export const resendOtp = async (
  email,
  purpose = "login"
) => {
  return request("/auth/otp/resend", {
    method: "POST",
    body: JSON.stringify({
      email,
      purpose,
    }),
  });
};

// ============================================================
// STOCKS
// ============================================================

export const getStocks = async () => {
  return request("/stocks");
};

export const getStock = async (symbol) => {
  return request(
    `/stocks/${encodeURIComponent(symbol)}`
  );
};

export const getStockHistory = async (
  symbol,
  interval = "1day"
) => {
  return request(
    `/stocks/${encodeURIComponent(
      symbol
    )}/history?interval=${encodeURIComponent(
      interval
    )}`
  );
};

// ============================================================
// PORTFOLIO
// ============================================================

export const getPortfolio = async () => {
  return request("/portfolio");
};

export const getPortfolioHistory = async (
  interval = "3M"
) => {
  return request(
    `/portfolio/history?interval=${encodeURIComponent(
      interval
    )}`
  );
};

export const buyStock = async ({
  symbol,
  quantity,
}) => {
  return request("/portfolio/buy", {
    method: "POST",
    body: JSON.stringify({
      symbol,
      quantity,
    }),
  });
};

export const sellStock = async ({
  symbol,
  quantity,
}) => {
  return request("/portfolio/sell", {
    method: "POST",
    body: JSON.stringify({
      symbol,
      quantity,
    }),
  });
};

export const getTransactions = async () => {
  return request("/portfolio/transactions");
};

// ============================================================
// ALERTS
// ============================================================

export const getAlerts = async () => {
  return request("/alerts");
};

export const createAlert = async ({
  symbol,
  type,
  target,
}) => {
  return request("/alerts", {
    method: "POST",
    body: JSON.stringify({
      symbol,
      type,
      target,
    }),
  });
};

export const refreshAlerts = async () => {
  return request("/alerts/refresh", {
    method: "POST",
  });
};

export const deleteAlert = async (
  alertId
) => {
  return request(
    `/alerts/${encodeURIComponent(alertId)}`,
    {
      method: "DELETE",
    }
  );
};

// ============================================================
// DEBUG
// ============================================================

export const debugAuth = () => {
  const token = getToken();
  const user = getCurrentUser();

  return {
    authenticated: Boolean(token),
    hasToken: Boolean(token),
    user,
    apiBaseUrl: API_BASE_URL,
  };
};

export const getApiBaseUrl = () => {
  return API_BASE_URL;
};