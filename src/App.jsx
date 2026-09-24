import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Screener from "./pages/Screener";
import Analytics from "./pages/Analytics";
import Alerts from "./pages/Alerts";
import Learn from "./pages/Learn";
import CourseDetails from "./pages/CourseDetails";
import Lesson from "./pages/Lesson";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import {
  isAuthenticated,
} from "./api/api";

import "./App.css";


/* =========================================================
   PROTECTED ROUTE
========================================================= */

function ProtectedRoute({
  children,
}) {
  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}


/* =========================================================
   PUBLIC ROUTE
========================================================= */

function PublicRoute({
  children,
}) {
  if (isAuthenticated()) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}


/* =========================================================
   APP LAYOUT
   Pages using the main sidebar
========================================================= */

function AppLayout({
  children,
}) {
  return (
    <div className="app-layout">

      <Sidebar />

      <main className="main-content">
        {children}
      </main>

    </div>
  );
}


/* =========================================================
   STANDALONE PAGE
   Full-width page without sidebar
========================================================= */

function StandalonePage({
  children,
}) {
  return (
    <main className="standalone-page">
      {children}
    </main>
  );
}


/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =================================================
            PUBLIC AUTH ROUTES
        ================================================= */}

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />


        {/* =================================================
            DASHBOARD
            SIDEBAR ENABLED
        ================================================= */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />


        {/* =================================================
            PORTFOLIO
            SIDEBAR ENABLED
        ================================================= */}

        <Route
          path="/portfolio"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Portfolio />
              </AppLayout>
            </ProtectedRoute>
          }
        />


        {/* =================================================
            SCREENER
            STANDALONE — NO SIDEBAR
        ================================================= */}

        <Route
          path="/screener"
          element={
            <ProtectedRoute>
              <StandalonePage>
                <Screener />
              </StandalonePage>
            </ProtectedRoute>
          }
        />


        {/* =================================================
            ANALYTICS
            STANDALONE — NO SIDEBAR
        ================================================= */}

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <StandalonePage>
                <Analytics />
              </StandalonePage>
            </ProtectedRoute>
          }
        />


        {/* =================================================
            ALERTS
            STANDALONE — NO SIDEBAR
        ================================================= */}

        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <StandalonePage>
                <Alerts />
              </StandalonePage>
            </ProtectedRoute>
          }
        />


        {/* =================================================
            LEARN
            STANDALONE — NO SIDEBAR
        ================================================= */}

        <Route
          path="/learn"
          element={
            <ProtectedRoute>
              <StandalonePage>
                <Learn />
              </StandalonePage>
            </ProtectedRoute>
          }
        />


        {/* =================================================
            COURSE DETAILS
            STANDALONE — NO SIDEBAR
        ================================================= */}

        <Route
          path="/learn/course/:id"
          element={
            <ProtectedRoute>
              <StandalonePage>
                <CourseDetails />
              </StandalonePage>
            </ProtectedRoute>
          }
        />


        {/* =================================================
            LESSON
            STANDALONE — NO SIDEBAR
        ================================================= */}

        <Route
          path="/learn/course/:courseId/lesson/:lessonId"
          element={
            <ProtectedRoute>
              <StandalonePage>
                <Lesson />
              </StandalonePage>
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
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;