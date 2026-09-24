import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Portfolio from "./pages/Portfolio";
import Screener from "./pages/Screener";
import Analytics from "./pages/Analytics";
import Alerts from "./pages/Alerts";
import Learn from "./pages/Learn";
import CourseDetails from "./pages/CourseDetails";
import Lesson from "./pages/Lesson";

function isAuthenticated() {
  return Boolean(localStorage.getItem("token"));
}

/* =====================================================
   PROTECTED ROUTE
   ===================================================== */

function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          message:
            "Please sign in to access your Meridian workspace.",
        }}
      />
    );
  }

  return children;
}

/* =====================================================
   APP ROUTES
   ===================================================== */

function AppRoutes() {
  const [authVersion, setAuthVersion] = useState(0);

  useEffect(() => {
    const handleAuthChange = () => {
      setAuthVersion((current) => current + 1);
    };

    window.addEventListener(
      "meridian-auth-change",
      handleAuthChange
    );

    window.addEventListener(
      "storage",
      handleAuthChange
    );

    return () => {
      window.removeEventListener(
        "meridian-auth-change",
        handleAuthChange
      );

      window.removeEventListener(
        "storage",
        handleAuthChange
      );
    };
  }, []);

  return (
    <Routes key={authVersion}>

      {/* =================================================
          AUTH ROUTES
          These pages are always accessible.
          ================================================= */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* =================================================
          ROOT
          ================================================= */}

      <Route
        path="/"
        element={
          <Navigate
            to={
              isAuthenticated()
                ? "/dashboard"
                : "/login"
            }
            replace
          />
        }
      />

      {/* =================================================
          DASHBOARD
          ================================================= */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* =================================================
          PORTFOLIO
          ================================================= */}

      <Route
        path="/portfolio"
        element={
          <ProtectedRoute>
            <Portfolio />
          </ProtectedRoute>
        }
      />

      {/* =================================================
          SCREENER
          ================================================= */}

      <Route
        path="/screener"
        element={
          <ProtectedRoute>
            <Screener />
          </ProtectedRoute>
        }
      />

      {/* =================================================
          ANALYTICS
          ================================================= */}

      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />

      {/* =================================================
          ALERTS
          ================================================= */}

      <Route
        path="/alerts"
        element={
          <ProtectedRoute>
            <Alerts />
          </ProtectedRoute>
        }
      />

      {/* =================================================
          LEARNING
          ================================================= */}

      <Route
        path="/learn"
        element={
          <ProtectedRoute>
            <Learn />
          </ProtectedRoute>
        }
      />

      <Route
        path="/learn/course/:id"
        element={
          <ProtectedRoute>
            <CourseDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/learn/course/:courseId/lesson/:lessonId"
        element={
          <ProtectedRoute>
            <Lesson />
          </ProtectedRoute>
        }
      />

      {/* =================================================
          UNKNOWN ROUTES
          ================================================= */}

      <Route
        path="*"
        element={
          <Navigate
            to={
              isAuthenticated()
                ? "/dashboard"
                : "/login"
            }
            replace
          />
        }
      />

    </Routes>
  );
}

/* =====================================================
   APP
   ===================================================== */

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;