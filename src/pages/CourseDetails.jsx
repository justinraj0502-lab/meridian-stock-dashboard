import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  PlayCircle,
  Sparkles,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  getCourseById,
  getCompletedLessons,
  getCourseProgress,
} from "../data/learningData";

import "./CourseDetails.css";

function CourseDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const course = getCourseById(id);

  const [completedLessons, setCompletedLessons] = useState([]);
  const [progress, setProgress] = useState({
    completedCount: 0,
    totalLessons: 0,
    percentage: 0,
    nextLesson: 1,
    completed: false,
  });

  const refreshProgress = () => {
    if (!course) return;

    setCompletedLessons(
      getCompletedLessons(course.id)
    );

    setProgress(
      getCourseProgress(course.id)
    );
  };

  useEffect(() => {
    refreshProgress();

    const handleStorage = () => refreshProgress();
    const handleFocus = () => refreshProgress();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, [course]);

  if (!course) {
    return (
      <main className="course-details-page course-not-found">
        <div className="course-not-found-card">
          <GraduationCap size={42} />

          <h1>Course not found</h1>

          <p>
            The course you're looking for could not be
            loaded.
          </p>

          <button
            onClick={() => navigate("/learn")}
          >
            <ArrowLeft size={17} />
            Back to Learning
          </button>
        </div>
      </main>
    );
  }

  const lessons = course.lessonsData;

  const nextLesson = progress.completed
    ? lessons.length
    : progress.nextLesson;

  const handleStart = () => {
    navigate(
      `/learn/course/${course.id}/lesson/${nextLesson}`
    );
  };

  const handleLessonClick = (lessonNumber) => {
    const previousLessonCompleted =
      lessonNumber === 1 ||
      completedLessons.includes(lessonNumber - 1);

    const lessonCompleted =
      completedLessons.includes(lessonNumber);

    if (
      lessonCompleted ||
      previousLessonCompleted
    ) {
      navigate(
        `/learn/course/${course.id}/lesson/${lessonNumber}`
      );
    }
  };

  return (
    <main className="course-details-page">
      <div className="course-details-orb course-details-orb-one" />
      <div className="course-details-orb course-details-orb-two" />

      {/* TOP BAR */}

      <header className="course-details-topbar">
        <button
          className="course-back-btn"
          onClick={() => navigate("/learn")}
        >
          <ArrowLeft size={17} />
          <span>Back to Learning</span>
        </button>

        <div className="course-topbar-label">
          <GraduationCap size={16} />
          <span>MERIDIAN LEARNING</span>
        </div>
      </header>

      {/* HERO */}

      <section className="course-details-hero">
        <div className="course-hero-content">
          <div className="course-hero-meta">
            <span className="course-hero-category">
              {course.category}
            </span>

            <span className="course-hero-dot" />

            <span>{course.level}</span>
          </div>

          <h1>{course.title}</h1>

          <p>{course.description}</p>

          <div className="course-hero-stats">
            <div>
              <BookOpen size={15} />
              <span>
                {lessons.length} lessons
              </span>
            </div>

            <div>
              <Clock3 size={15} />
              <span>{course.duration}</span>
            </div>

            <div>
              <Sparkles size={15} />
              <span>Self-paced</span>
            </div>
          </div>
        </div>

        <div className="course-hero-progress">
          <div
            className="course-progress-ring"
            style={{
              "--progress": progress.percentage,
            }}
          >
            <div className="course-progress-ring-inner">
              <strong>
                {progress.percentage}%
              </strong>

              <span>COMPLETE</span>
            </div>
          </div>

          <div className="course-progress-copy">
            <span>YOUR PROGRESS</span>

            <strong>
              {progress.completedCount}/
              {lessons.length} lessons
            </strong>

            <p>
              {progress.completed
                ? "You've completed this course."
                : progress.completedCount > 0
                ? `Continue with lesson ${progress.nextLesson}.`
                : "Start your learning journey."}
            </p>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}

      <section className="course-details-content">
        <div className="course-overview-column">
          <div className="course-section-heading">
            <span>COURSE OVERVIEW</span>
            <h2>Build your knowledge step by step.</h2>
            <p>
              Work through each lesson in sequence.
              Completed lessons stay saved in your
              Meridian learning progress.
            </p>
          </div>

          {/* ACTION */}

          <div className="course-action-card">
            <div className="course-action-icon">
              {progress.completed ? (
                <CheckCircle2 size={22} />
              ) : (
                <PlayCircle size={22} />
              )}
            </div>

            <div className="course-action-copy">
              <span>
                {progress.completed
                  ? "COURSE COMPLETE"
                  : progress.completedCount > 0
                  ? "READY TO CONTINUE"
                  : "READY TO START"}
              </span>

              <strong>
                {progress.completed
                  ? "Review the course"
                  : progress.completedCount > 0
                  ? `Continue with Lesson ${String(
                      progress.nextLesson
                    ).padStart(2, "0")}`
                  : "Begin your first lesson"}
              </strong>
            </div>

            <button
              className="course-primary-btn"
              onClick={handleStart}
            >
              {progress.completed
                ? "Review Course"
                : progress.completedCount > 0
                ? "Continue"
                : "Start Course"}

              <ArrowRight size={16} />
            </button>
          </div>

          {/* CURRICULUM */}

          <div className="course-curriculum">
            <div className="curriculum-heading">
              <div>
                <span>CURRICULUM</span>
                <h2>Course Lessons</h2>
              </div>

              <div className="curriculum-count">
                {progress.completedCount}/
                {lessons.length}
              </div>
            </div>

            <div className="curriculum-list">
              {lessons.map((lesson, index) => {
                const lessonNumber = index + 1;

                const isCompleted =
                  completedLessons.includes(
                    lessonNumber
                  );

                const isCurrent =
                  lessonNumber ===
                  progress.nextLesson;

                const isUnlocked =
                  lessonNumber === 1 ||
                  completedLessons.includes(
                    lessonNumber - 1
                  );

                return (
                  <button
                    key={lessonNumber}
                    className={`curriculum-item ${
                      isCompleted
                        ? "completed"
                        : ""
                    } ${
                      isCurrent && !isCompleted
                        ? "current"
                        : ""
                    } ${
                      !isUnlocked
                        ? "locked"
                        : ""
                    }`}
                    onClick={() =>
                      handleLessonClick(
                        lessonNumber
                      )
                    }
                    disabled={!isUnlocked}
                  >
                    <div className="curriculum-number">
                      {isCompleted ? (
                        <CheckCircle2 size={17} />
                      ) : (
                        String(
                          lessonNumber
                        ).padStart(2, "0")
                      )}
                    </div>

                    <div className="curriculum-info">
                      <span>
                        LESSON{" "}
                        {String(
                          lessonNumber
                        ).padStart(2, "0")}
                      </span>

                      <strong>
                        {lesson.title}
                      </strong>
                    </div>

                    <div className="curriculum-status">
                      {isCompleted ? (
                        <span className="lesson-done">
                          COMPLETED
                        </span>
                      ) : isCurrent ? (
                        <span className="lesson-next">
                          NEXT
                        </span>
                      ) : !isUnlocked ? (
                        <span className="lesson-locked">
                          LOCKED
                        </span>
                      ) : (
                        <ArrowRight size={16} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}

        <aside className="course-details-sidebar">
          <div className="course-sidebar-card">
            <div className="sidebar-card-icon">
              <GraduationCap size={21} />
            </div>

            <span className="sidebar-card-label">
              LEARNING PATH
            </span>

            <h3>
              Master the fundamentals.
            </h3>

            <p>
              Complete each lesson to build a
              structured understanding of the topic.
            </p>

            <div className="sidebar-progress">
              <div className="sidebar-progress-top">
                <span>Progress</span>

                <strong>
                  {progress.percentage}%
                </strong>
              </div>

              <div className="sidebar-progress-track">
                <div
                  className="sidebar-progress-fill"
                  style={{
                    width: `${progress.percentage}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="course-sidebar-note">
            <Sparkles size={16} />

            <p>
              Your progress is saved locally on this
              device so you can continue where you
              left off.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default CourseDetails;