import { useEffect, useState } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  Search,
  LineChart,
  Bell,
  BookOpen,
  TrendingUp,
  ChevronRight,
  Activity,
  Sparkles,
  LogOut,
  UserRound,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  getPortfolio,
  logout as logoutUser,
} from "../api/api";

function Sidebar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] =
    useState(true);
  const [loggingOut, setLoggingOut] =
    useState(false);

  const navItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: BarChart3,
    },
    {
      to: "/portfolio",
      label: "Portfolio",
      icon: BriefcaseBusiness,
    },
    {
      to: "/screener",
      label: "Screener",
      icon: Search,
    },
    {
      to: "/analytics",
      label: "Analytics",
      icon: LineChart,
    },
    {
      to: "/alerts",
      label: "Alerts",
      icon: Bell,
    },
    {
      to: "/learn",
      label: "Learn",
      icon: BookOpen,
    },
  ];

  /* =====================================================
     LOAD USER
  ===================================================== */

  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUser =
          localStorage.getItem("user");

        if (savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error(
          "Unable to load user:",
          error
        );

        setUser(null);
      }
    };

    loadUser();

    window.addEventListener(
      "meridian-auth-change",
      loadUser
    );

    window.addEventListener(
      "storage",
      loadUser
    );

    return () => {
      window.removeEventListener(
        "meridian-auth-change",
        loadUser
      );

      window.removeEventListener(
        "storage",
        loadUser
      );
    };
  }, []);

  /* =====================================================
     LOAD BALANCE
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    const loadBalance = async () => {
      try {
        const data = await getPortfolio();

        if (!mounted) {
          return;
        }

        setBalance(
          Number(data?.balance || 0)
        );
      } catch (error) {
        if (!mounted) {
          return;
        }

        console.error(
          "Unable to load account balance:",
          error
        );

        setBalance(0);
      } finally {
        if (mounted) {
          setLoadingBalance(false);
        }
      }
    };

    loadBalance();

    const interval = setInterval(
      loadBalance,
      30000
    );

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    logoutUser();

    navigate("/login", {
      replace: true,
      state: {
        message:
          "You have been signed out successfully.",
      },
    });
  };

  /* =====================================================
     HELPERS
  ===================================================== */

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  };

  const getInitials = () => {
    const name =
      user?.name?.trim() || "User";

    const parts = name.split(/\s+/);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`
        .toUpperCase();
    }

    return name
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <aside className="sidebar">

      {/* =================================================
          BRAND
      ================================================= */}

      <div className="brand">
        <div className="brand-logo">
          M
        </div>

        <div className="brand-content">
          <h1>MERIDIAN</h1>

          <p>
            MARKETS
            <span>•</span>
            PORTFOLIO
          </p>
        </div>
      </div>


      {/* =================================================
          MARKET STATUS
      ================================================= */}

      <div className="sidebar-market-status">

        <div className="sidebar-market-icon">
          <Activity
            size={14}
            strokeWidth={2}
          />
        </div>

        <div className="sidebar-market-info">
          <span>MARKETS</span>
          <strong>LIVE</strong>
        </div>

        <span className="sidebar-live-dot" />

      </div>


      {/* =================================================
          WORKSPACE
      ================================================= */}

      <div className="sidebar-section-label">
        <span>WORKSPACE</span>
      </div>


      {/* =================================================
          NAVIGATION
      ================================================= */}

      <nav className="sidebar-nav">

        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={
                item.to === "/dashboard"
              }
              className={({ isActive }) =>
                `sidebar-item ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >

              <span className="sidebar-item-icon">
                <Icon
                  size={18}
                  strokeWidth={1.9}
                />
              </span>

              <span className="sidebar-item-label">
                {item.label}
              </span>

              <ChevronRight
                className="sidebar-item-arrow"
                size={14}
                strokeWidth={2}
              />

            </NavLink>
          );
        })}

      </nav>


      {/* =================================================
          MARKET PULSE
      ================================================= */}

      <div className="sidebar-market-card">

        <div className="sidebar-market-card-glow" />

        <div className="sidebar-market-card-header">

          <div className="sidebar-market-card-icon">
            <Sparkles
              size={15}
              strokeWidth={1.8}
            />
          </div>

          <span>
            MARKET PULSE
          </span>

        </div>

        <div className="sidebar-market-card-value">

          <strong>
            Market Active
          </strong>

          <span>
            Live data monitoring
          </span>

        </div>

        <div className="sidebar-market-card-line">
          <span />
        </div>

      </div>


      {/* =================================================
          ACCOUNT
      ================================================= */}

      <div className="account-card">

        <div className="account-card-header">

          <span>
            ACCOUNT VALUE
          </span>

          <div className="account-status">
            <span />
            ACTIVE
          </div>

        </div>

        <strong className="account-value">
          {loadingBalance
            ? "Loading..."
            : formatCurrency(balance)}
        </strong>

        <small className="account-growth">

          <TrendingUp
            size={13}
          />

          <span>
            Available cash balance
          </span>

        </small>

      </div>


      {/* =================================================
          USER
      ================================================= */}

      <div className="sidebar-user-card">

        <div className="sidebar-user-avatar">
          {getInitials()}
        </div>

        <div className="sidebar-user-info">

          <strong>
            {user?.name ||
              "Meridian User"}
          </strong>

          <span>
            {user?.email ||
              "Authenticated user"}
          </span>

        </div>

        <UserRound
          className="sidebar-user-icon"
          size={15}
        />

      </div>


      {/* =================================================
          LOGOUT
      ================================================= */}

      <button
        type="button"
        className="sidebar-logout"
        onClick={handleLogout}
        disabled={loggingOut}
      >

        <span className="sidebar-logout-icon">
          <LogOut size={16} />
        </span>

        <span>
          {loggingOut
            ? "Signing out..."
            : "Sign out"}
        </span>

      </button>


      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="sidebar-footer">

        <div className="sidebar-footer-line" />

        <span>
          MERIDIAN TERMINAL
        </span>

        <small>
          v1.0
        </small>

      </div>

    </aside>
  );
}

export default Sidebar;