const API_BASE_URL = "http://localhost:5000/api";

/* =========================================================
   AUTH STORAGE
========================================================= */

export const getToken = () => {
  return localStorage.getItem("token");
};

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  return Boolean(getToken());
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.dispatchEvent(
    new Event("meridian-auth-change")
  );
};


/* =========================================================
   RESPONSE HANDLER
========================================================= */

const parseResponse = async (response) => {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;

    /*
      IMPORTANT:
      Do not automatically logout for every 401 during
      authentication requests. A wrong login password,
      for example, should not clear an existing session.
    */
    if (
      response.status === 401 &&
      !response.url.includes("/auth/")
    ) {
      logout();
    }

    const error = new Error(message);

    /*
      Preserve useful backend information so the frontend
      can react to OTP states such as cooldown and
      verification requirements.
    */
    error.status = response.status;
    error.code = data?.code;
    error.requiresVerification =
      data?.requiresVerification || false;
    error.requiresOtp =
      data?.requiresOtp || false;
    error.email = data?.email || null;

    throw error;
  }

  return data;
};


/* =========================================================
   GENERIC REQUEST
========================================================= */

const request = async (
  endpoint,
  options = {}
) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  /*
    Send JWT only when one actually exists.
  */
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        headers,
      }
    );
  } catch (error) {
    const networkError = new Error(
      "Unable to connect to Meridian server. Please make sure the backend is running."
    );

    networkError.code = "NETWORK_ERROR";

    throw networkError;
  }

  return parseResponse(response);
};


/* =========================================================
   AUTH — REGISTER
========================================================= */

/*
  Step 1:
  Create/update the account and request registration OTP.

  The backend intentionally does NOT return a JWT here.
  The JWT is issued only after OTP verification.
*/

export const register = async (
  name,
  email,
  password
) => {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });
};


/* =========================================================
   AUTH — VERIFY REGISTRATION OTP
========================================================= */

/*
  Step 2:
  Verify the registration OTP.

  Successful verification returns:
    token
    user
*/

export const verifyRegistrationOtp = async (
  email,
  otp
) => {
  const data = await request(
    "/auth/register/verify",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        otp,
      }),
    }
  );

  if (data?.token) {
    localStorage.setItem(
      "token",
      data.token
    );
  }

  if (data?.user) {
    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );
  }

  window.dispatchEvent(
    new Event("meridian-auth-change")
  );

  return data;
};


/* =========================================================
   AUTH — LOGIN
========================================================= */

/*
  Step 1:
  Validate email/password and request login OTP.

  The backend intentionally does NOT return a JWT here.
*/

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


/* =========================================================
   AUTH — VERIFY LOGIN OTP
========================================================= */

/*
  Step 2:
  Verify login OTP.

  Successful verification returns:
    token
    user
*/

export const verifyLoginOtp = async (
  email,
  otp
) => {
  const data = await request(
    "/auth/login/verify",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        otp,
      }),
    }
  );

  if (data?.token) {
    localStorage.setItem(
      "token",
      data.token
    );
  }

  if (data?.user) {
    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );
  }

  window.dispatchEvent(
    new Event("meridian-auth-change")
  );

  return data;
};


/* =========================================================
   AUTH — RESEND OTP
========================================================= */

export const resendOtp = async (
  email,
  purpose
) => {
  return request("/auth/otp/resend", {
    method: "POST",
    body: JSON.stringify({
      email,
      purpose,
    }),
  });
};


/* =========================================================
   STOCKS
========================================================= */

export const getStocks = async () => {
  const data = await request("/stocks");

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.stocks)) {
    return data.stocks;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};


export const getStock = async (
  symbol
) => {
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


/* =========================================================
   PORTFOLIO
========================================================= */

export const getPortfolio = async () => {
  return request("/portfolio");
};


export const getTransactions = async () => {
  const data = await request(
    "/portfolio/transactions"
  );

  if (Array.isArray(data)) {
    return data;
  }

  if (
    Array.isArray(
      data?.transactions
    )
  ) {
    return data.transactions;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};


/* =========================================================
   BUY / SELL
========================================================= */

export const buyStock = async (
  symbol,
  quantity,
  price
) => {
  return request(
    "/portfolio/buy",
    {
      method: "POST",
      body: JSON.stringify({
        symbol,
        quantity,
        price,
      }),
    }
  );
};


export const sellStock = async (
  symbol,
  quantity,
  price
) => {
  return request(
    "/portfolio/sell",
    {
      method: "POST",
      body: JSON.stringify({
        symbol,
        quantity,
        price,
      }),
    }
  );
};


/* =========================================================
   DEBUG HELPER
========================================================= */

export const debugAuth = () => {
  const token = getToken();
  const user = getCurrentUser();

  console.log(
    "========== MERIDIAN AUTH =========="
  );

  console.log(
    "Token exists:",
    Boolean(token)
  );

  console.log(
    "Token preview:",
    token
      ? `${token.substring(
          0,
          20
        )}...`
      : "NO TOKEN"
  );

  console.log(
    "User:",
    user
  );

  console.log(
    "==================================="
  );
};