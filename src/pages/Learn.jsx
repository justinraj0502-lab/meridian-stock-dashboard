import {
  BookOpen,
  TrendingUp,
  Search,
  ArrowRight,
  Clock3,
  PlayCircle,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  GraduationCap,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import {
  COURSES,
  CATEGORIES,
  getCourseProgress,
} from "../data/learningData";

import "./Learn.css";

function Learn() {
  const navigate = useNavigate();

  const [courseProgress, setCourseProgress] =
    useState({});
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  /* =====================================================
     PROGRESS
     ===================================================== */

  const updateProgress = () => {
    const progressData = {};

    COURSES.forEach((course) => {
      progressData[course.id] =
        getCourseProgress(course.id);
    });

    setCourseProgress(progressData);
  };

  useEffect(() => {
    updateProgress();

    const handleStorage = () => updateProgress();
    const handleFocus = () => updateProgress();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );

      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, []);

  /* =====================================================
     FILTER COURSES
     ===================================================== */

  const filteredCourses = useMemo(() => {
    const normalizedSearch =
      search.toLowerCase().trim();

    return COURSES.filter((course) => {
      const matchesSearch =
        !normalizedSearch ||
        course.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        course.description
          .toLowerCase()
          .includes(normalizedSearch) ||
        course.category
          .toLowerCase()
          .includes(normalizedSearch) ||
        course.level
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesCategory =
        selectedCategory === "All" ||
        course.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  /* =====================================================
     OVERALL STATS
     ===================================================== */

  const completedCourses = COURSES.filter(
    (course) =>
      courseProgress[course.id]?.completed
  ).length;

  const inProgressCourses = COURSES.filter(
    (course) => {
      const progress =
        courseProgress[course.id];

      return (
        progress &&
        progress.completedCount > 0 &&
        !progress.completed
      );
    }
  ).length;

  const totalCompletedLessons =
    COURSES.reduce(
      (total, course) =>
        total +
        (courseProgress[course.id]
          ?.completedCount || 0),
      0
    );

  const totalLessons = COURSES.reduce(
    (total, course) =>
      total + course.lessonsData.length,
    0
  );

  const overallProgress =
    totalLessons > 0
      ? Math.round(
          (totalCompletedLessons /
            totalLessons) *
            100
        )
      : 0;

  /* =====================================================
     CONTINUE COURSE
     ===================================================== */

  const continueCourse =
    COURSES.find((course) => {
      const progress =
        courseProgress[course.id];

      return (
        progress &&
        progress.completedCount > 0 &&
        !progress.completed
      );
    }) ||
    COURSES.find(
      (course) =>
        !courseProgress[course.id]?.completed
    );

  const continueProgress = continueCourse
    ? courseProgress[continueCourse.id]
    : null;

  const handleContinue = () => {
    if (
      !continueCourse ||
      !continueProgress
    ) {
      return;
    }

    navigate(
      `/learn/course/${continueCourse.id}/lesson/${continueProgress.nextLesson}`
    );
  };

  /* =====================================================
     RENDER
     ===================================================== */

  return (
    <main className="learn-page">

      {/* =================================================
          HEADER
          ================================================= */}

      <header className="learn-header">
        <div className="learn-heading-content">
          <div className="learn-title-row">

            <div className="learn-title-icon">
              <GraduationCap size={20} />
            </div>

            <div>
              <p className="page-label">
                KNOWLEDGE CENTER
              </p>

              <h1>Learn</h1>
            </div>

          </div>

          <p className="page-subtitle">
            Build your market knowledge and make
            more informed decisions.
          </p>
        </div>

        <button
          className="learn-dashboard-btn"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </button>
      </header>

      {/* =================================================
          HERO
          ================================================= */}

      <section className="learn-hero">

        <div className="hero-content">

          <span className="hero-badge">
            <Sparkles size={13} />
            MERIDIAN LEARNING
          </span>

          <h2>
            Learn the market.
            <br />

            <span>
              Understand your decisions.
            </span>
          </h2>

          <p className="hero-description">
            Build practical knowledge across
            investing, technical analysis and risk
            management through structured lessons.
          </p>

          {/* HERO ACTIONS */}

          <div className="hero-actions">

            <button
              className="start-learning-btn"
              onClick={() =>
                document
                  .getElementById(
                    "course-library"
                  )
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              <span>Start Learning</span>
              <ArrowRight size={16} />
            </button>

            {continueCourse && (
              <button
                className="continue-learning-btn"
                onClick={handleContinue}
              >
                <PlayCircle size={16} />

                <span>
                  {continueProgress
                    ?.completedCount > 0
                    ? `Continue Lesson ${String(
                        continueProgress.nextLesson
                      ).padStart(2, "0")}`
                    : "Explore Courses"}
                </span>
              </button>
            )}

          </div>

          {/* HERO PROGRESS */}

          <div className="hero-progress">

            <div className="hero-progress-item">

              <span className="hero-progress-label">
                Your learning progress
              </span>

              <strong className="hero-progress-value">
                {totalCompletedLessons} /{" "}
                {totalLessons} lessons
              </strong>

            </div>

            <div className="hero-progress-bar">
              <div
                className="hero-progress-fill"
                style={{
                  width: `${overallProgress}%`,
                }}
              />
            </div>

            <div className="hero-progress-summary">

              <div className="hero-progress-item">
                <span className="hero-progress-label">
                  Overall completion
                </span>

                <strong className="hero-progress-value">
                  {overallProgress}%
                </strong>
              </div>

              <div className="hero-progress-item">
                <span className="hero-progress-label">
                  Courses completed
                </span>

                <strong className="hero-progress-value">
                  {completedCourses}{" "}
                  {completedCourses === 1
                    ? "course"
                    : "courses"}
                </strong>
              </div>

            </div>

          </div>
        </div>

        {/* HERO VISUAL */}

        <div className="hero-visual">

          <div className="hero-glow" />

          <div className="chart-card">

            <div className="chart-top">

              <div>
                <span>
                  MARKET KNOWLEDGE
                </span>

                <strong>
                  Learning Progress
                </strong>
              </div>

              <div className="chart-icon">
                <TrendingUp size={17} />
              </div>

            </div>

            <div className="chart-bars">
              <span style={{ height: "35%" }} />
              <span style={{ height: "52%" }} />
              <span style={{ height: "43%" }} />
              <span style={{ height: "68%" }} />
              <span style={{ height: "61%" }} />
              <span style={{ height: "82%" }} />
              <span style={{ height: "74%" }} />
              <span style={{ height: "94%" }} />
            </div>

            <div className="chart-label">
              <span>FOUNDATION</span>

              <div className="chart-line" />

              <span>ADVANCED</span>
            </div>

          </div>
        </div>

      </section>

      {/* =================================================
          STATS
          ================================================= */}

      <section className="learning-stats">

        <div className="learning-stat">

          <div className="learning-stat-icon">
            <BookOpen size={17} />
          </div>

          <div className="learning-stat-content">

            <span>
              Available Courses
            </span>

            <strong>
              {COURSES.length}
            </strong>

          </div>
        </div>

        <div className="learning-stat">

          <div className="learning-stat-icon">
            <PlayCircle size={17} />
          </div>

          <div className="learning-stat-content">

            <span>
              In Progress
            </span>

            <strong>
              {inProgressCourses}
            </strong>

          </div>
        </div>

        <div className="learning-stat">

          <div className="learning-stat-icon">
            <CheckCircle2 size={17} />
          </div>

          <div className="learning-stat-content">

            <span>
              Completed
            </span>

            <strong>
              {completedCourses}
            </strong>

          </div>
        </div>

        <div className="learning-stat">

          <div className="learning-stat-icon">
            <TrendingUp size={17} />
          </div>

          <div className="learning-stat-content">

            <span>
              Overall Progress
            </span>

            <strong>
              {overallProgress}%
            </strong>

          </div>
        </div>

      </section>

      {/* =================================================
          COURSE LIBRARY
          ================================================= */}

      <section
        className="course-library"
        id="course-library"
      >

        <div className="library-header">

          <div className="library-heading">

            <span className="library-eyebrow">
              CURATED CURRICULUM
            </span>

            <h2>
              Course Library
            </h2>

            <p>
              Structured lessons designed to build
              your market knowledge step by step.
            </p>

          </div>

          <div className="learn-search">

            <Search size={16} />

            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

            {search && (
              <button
                className="search-clear"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
              >
                ×
              </button>
            )}

          </div>

        </div>

        {/* CATEGORY FILTER */}

        <div className="category-filter">

          {CATEGORIES.map((category) => (
            <button
              key={category}
              className={
                selectedCategory === category
                  ? "category-active"
                  : ""
              }
              onClick={() =>
                setSelectedCategory(category)
              }
            >
              {category}
            </button>
          ))}

        </div>

        {/* COURSE GRID */}

        <div className="course-grid">

          {filteredCourses.length === 0 ? (
            <div className="no-courses">

              <div className="no-courses-icon">
                <Search size={24} />
              </div>

              <h3>
                No courses found
              </h3>

              <p>
                Try another search term or
                choose a different category.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory(
                    "All"
                  );
                }}
              >
                Clear Filters
              </button>

            </div>
          ) : (
            filteredCourses.map((course) => {

              const CourseIcon =
                course.icon;

              const progress =
                courseProgress[
                  course.id
                ] || {
                  completedCount: 0,
                  percentage: 0,
                  nextLesson: 1,
                  completed: false,
                };

              return (
                <article
                  className={`course-card ${
                    progress.completed
                      ? "course-completed"
                      : ""
                  }`}
                  key={course.id}
                >

                  {/* CARD HEADER */}

                  <div className="course-card-header">

                    <div className="course-icon">
                      <CourseIcon size={20} />
                    </div>

                    {progress.completed && (
                      <span className="completed-badge">
                        <CheckCircle2 size={12} />
                        <span>
                          Completed
                        </span>
                      </span>
                    )}

                  </div>

                  {/* CATEGORY / LEVEL */}

                  <div className="course-card-top">

                    <span className="course-category">
                      {course.category}
                    </span>

                    <span className="course-level">
                      {course.level}
                    </span>

                  </div>

                  {/* TITLE */}

                  <h3>
                    {course.title}
                  </h3>

                  <p className="course-description">
                    {course.description}
                  </p>

                  {/* META */}

                  <div className="course-meta">

                    <span>
                      <BookOpen size={13} />

                      <span>
                        {course.lessonsData.length}{" "}
                        lessons
                      </span>
                    </span>

                    <span>
                      <Clock3 size={13} />

                      <span>
                        {course.duration}
                      </span>
                    </span>

                  </div>

                  {/* COURSE PROGRESS */}

                  {progress.completedCount >
                    0 && (
                    <div className="course-progress">

                      <div className="progress-info">

                        <span className="progress-label">
                          {progress.completed
                            ? "Completed"
                            : "Your progress"}
                        </span>

                        <strong className="progress-percentage">
                          {progress.percentage}%
                        </strong>

                      </div>

                      <div className="progress-track">

                        <div
                          className="progress-fill"
                          style={{
                            width: `${progress.percentage}%`,
                          }}
                        />

                      </div>

                      <div className="course-progress-meta">

                        <span className="lesson-count">
                          {progress.completedCount}
                          {" / "}
                          {course.lessonsData.length}
                          {" lessons"}
                        </span>

                        {!progress.completed && (
                          <span className="next-lesson">
                            Next: Lesson{" "}
                            {String(
                              progress.nextLesson
                            ).padStart(
                              2,
                              "0"
                            )}
                          </span>
                        )}

                      </div>

                    </div>
                  )}

                  {/* ACTION */}

                  <button
                    className="course-btn"
                    onClick={() => {

                      if (
                        progress.completed
                      ) {
                        navigate(
                          `/learn/course/${course.id}`
                        );

                        return;
                      }

                      if (
                        progress.completedCount >
                        0
                      ) {
                        navigate(
                          `/learn/course/${course.id}/lesson/${progress.nextLesson}`
                        );

                        return;
                      }

                      navigate(
                        `/learn/course/${course.id}`
                      );
                    }}
                  >

                    <span>
                      {progress.completed
                        ? "Review Course"
                        : progress.completedCount >
                          0
                        ? "Continue Learning"
                        : "Start Course"}
                    </span>

                    <ArrowRight size={15} />

                  </button>

                </article>
              );
            })
          )}

        </div>

      </section>
    </main>
  );
}

export default Learn;