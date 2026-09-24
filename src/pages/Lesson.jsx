import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock3,
  Lightbulb,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import {
  getCourseById,
  getCompletedLessons,
} from "../data/learningData";

import "./Lesson.css";

function Lesson() {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();

  const course = getCourseById(courseId);
  const lessonNumber = Number(lessonId);

  const [completedLessons, setCompletedLessons] = useState([]);

  const lessons = course?.lessonsData || [];

  const index = lessonNumber - 1;

  const lesson =
    index >= 0 && index < lessons.length
      ? lessons[index]
      : null;

  const refreshCompletion = () => {
    if (!course) return;

    setCompletedLessons(
      getCompletedLessons(course.id)
    );
  };

  useEffect(() => {
    refreshCompletion();

    const handleStorage = () =>
      refreshCompletion();

    const handleFocus = () =>
      refreshCompletion();

    window.addEventListener(
      "storage",
      handleStorage
    );

    window.addEventListener(
      "focus",
      handleFocus
    );

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
  }, [courseId]);

  const completed = completedLessons.includes(
    lessonNumber
  );

  const progress =
    lessons.length > 0
      ? Math.round(
          ((index + 1) / lessons.length) * 100
        )
      : 0;

  const completedCount =
    completedLessons.length;

  const nextLesson =
    lessons.findIndex(
      (_, lessonIndex) =>
        !completedLessons.includes(
          lessonIndex + 1
        )
    ) + 1;

  const isFinalLesson =
    index === lessons.length - 1;

  const handleComplete = () => {
    if (!course || !lesson) return;

    const savedLessons =
      getCompletedLessons(course.id);

    if (!savedLessons.includes(lessonNumber)) {
      savedLessons.push(lessonNumber);
    }

    localStorage.setItem(
      `meridian-course-${course.id}-completed`,
      JSON.stringify(savedLessons)
    );

    refreshCompletion();
  };

  const goNext = () => {
    if (!completed || !lesson) return;

    if (!isFinalLesson) {
      navigate(
        `/learn/course/${course.id}/lesson/${
          lessonNumber + 1
        }`
      );
    } else {
      navigate(
        `/learn/course/${course.id}`
      );
    }
  };

  const goPrevious = () => {
    if (lessonNumber > 1) {
      navigate(
        `/learn/course/${course.id}/lesson/${
          lessonNumber - 1
        }`
      );
    } else {
      navigate(
        `/learn/course/${course.id}`
      );
    }
  };

  const handleLessonNavigation = (
    targetLesson
  ) => {
    if (
      targetLesson === lessonNumber
    ) {
      return;
    }

    const targetCompleted =
      completedLessons.includes(
        targetLesson
      );

    const previousCompleted =
      targetLesson === 1 ||
      completedLessons.includes(
        targetLesson - 1
      );

    if (
      targetCompleted ||
      previousCompleted
    ) {
      navigate(
        `/learn/course/${course.id}/lesson/${targetLesson}`
      );
    }
  };

  if (!course || !lesson) {
    return (
      <main className="lesson-page lesson-not-found">
        <div className="lesson-not-found-card">
          <BookOpen size={42} />

          <h1>Lesson not found</h1>

          <p>
            This lesson could not be loaded.
            Return to the course and choose
            another lesson.
          </p>

          <button
            onClick={() =>
              navigate(
                course
                  ? `/learn/course/${course.id}`
                  : "/learn"
              )
            }
          >
            <ArrowLeft size={17} />
            Back to Course
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="lesson-page">
      <div className="lesson-orb lesson-orb-one" />
      <div className="lesson-orb lesson-orb-two" />

      {/* TOP BAR */}

      <header className="lesson-topbar">
        <button
          className="lesson-back-btn"
          onClick={() =>
            navigate(
              `/learn/course/${course.id}`
            )
          }
        >
          <ArrowLeft size={17} />

          <span>
            Back to Course
          </span>
        </button>

        <div className="lesson-topbar-progress">
          <div className="lesson-topbar-label">
            <span>
              {course.title}
            </span>

            <strong>
              {completedCount}/
              {lessons.length}
            </strong>
          </div>

          <div className="lesson-progress-track">
            <div
              className="lesson-progress-fill"
              style={{
                width: `${Math.round(
                  (completedCount /
                    lessons.length) *
                    100
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="lesson-status">
          <span
            className={`lesson-status-dot ${
              completed
                ? "completed"
                : ""
            }`}
          />

          {completed
            ? "Completed"
            : "In Progress"}
        </div>
      </header>

      {/* MAIN */}

      <section className="lesson-layout">
        <article className="lesson-main">
          {/* HEADING */}

          <div className="lesson-heading">
            <div className="lesson-heading-meta">
              <span className="lesson-label">
                LESSON{" "}
                {String(
                  lessonNumber
                ).padStart(2, "0")}
              </span>

              <span className="lesson-dot-separator" />

              <span>
                {lessons.length} lessons
              </span>

              <span className="lesson-dot-separator" />

              <span>
                {course.category}
              </span>
            </div>

            <h1>
              {lesson.title}
            </h1>

            <p>
              {lesson.description}
            </p>
          </div>

          {/* LESSON CONTENT */}

          <div className="lesson-card">
            <div className="lesson-card-header">
              <div className="lesson-card-icon">
                <BookOpen size={21} />
              </div>

              <div>
                <span className="lesson-card-eyebrow">
                  CORE CONCEPT
                </span>

                <h2>
                  Understanding the Concept
                </h2>
              </div>
            </div>

            <div className="lesson-card-body">
              <p>
                {lesson.content}
              </p>
            </div>

            <div className="lesson-card-footer">
              <div className="lesson-footer-item">
                <BarChart3 size={15} />
                <span>
                  Market education
                </span>
              </div>

              <div className="lesson-footer-item">
                <Clock3 size={15} />
                <span>
                  Self-paced
                </span>
              </div>
            </div>
          </div>

          {/* TAKEAWAY */}

          <div className="lesson-takeaway">
            <div className="takeaway-glow" />

            <div className="takeaway-icon">
              <Lightbulb size={21} />
            </div>

            <div className="takeaway-content">
              <span>
                KEY TAKEAWAY
              </span>

              <p>
                {lesson.takeaway}
              </p>
            </div>

            <Sparkles
              className="takeaway-spark"
              size={18}
            />
          </div>

          {/* EDUCATION NOTE */}

          <div className="lesson-note">
            <TrendingUp size={17} />

            <p>
              Educational content only.
              Market concepts can help you
              understand financial markets,
              but they do not guarantee future
              investment results.
            </p>
          </div>

          {/* COMPLETE */}

          <button
            className={`complete-lesson-btn ${
              completed
                ? "completed"
                : ""
            }`}
            onClick={handleComplete}
          >
            {completed ? (
              <>
                <CheckCircle2 size={19} />

                Lesson Completed
              </>
            ) : (
              <>
                <CheckCircle2 size={19} />

                Mark Lesson as Complete
              </>
            )}
          </button>
        </article>

        {/* CURRICULUM */}

        <aside className="lesson-sidebar">
          <div className="lesson-sidebar-card">
            <div className="sidebar-card-heading">
              <div>
                <span>
                  CURRICULUM
                </span>

                <h3>
                  Course Lessons
                </h3>
              </div>

              <BookOpen size={18} />
            </div>

            <div className="lesson-list">
              {lessons.map(
                (item, lessonIndex) => {
                  const number =
                    lessonIndex + 1;

                  const isCurrent =
                    number ===
                    lessonNumber;

                  const isCompleted =
                    completedLessons.includes(
                      number
                    );

                  const isUnlocked =
                    number === 1 ||
                    completedLessons.includes(
                      number - 1
                    );

                  return (
                    <button
                      key={number}
                      className={`lesson-list-item ${
                        isCurrent
                          ? "current"
                          : ""
                      } ${
                        isCompleted
                          ? "done"
                          : ""
                      } ${
                        !isUnlocked
                          ? "locked"
                          : ""
                      }`}
                      disabled={
                        !isUnlocked
                      }
                      onClick={() =>
                        handleLessonNavigation(
                          number
                        )
                      }
                    >
                      <span className="lesson-list-number">
                        {isCompleted ? (
                          <CheckCircle2
                            size={15}
                          />
                        ) : isCurrent ? (
                          <span className="current-number">
                            {number}
                          </span>
                        ) : (
                          <Circle
                            size={15}
                          />
                        )}
                      </span>

                      <span className="lesson-list-title">
                        {item.title}
                      </span>

                      {isCurrent && (
                        <span className="lesson-list-active">
                          NOW
                        </span>
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* SIDEBAR PROGRESS */}

          <div className="lesson-sidebar-progress">
            <div className="lesson-sidebar-progress-top">
              <span>
                COURSE PROGRESS
              </span>

              <strong>
                {Math.round(
                  (completedCount /
                    lessons.length) *
                    100
                )}
                %
              </strong>
            </div>

            <div className="lesson-sidebar-progress-track">
              <div
                className="lesson-sidebar-progress-fill"
                style={{
                  width: `${Math.round(
                    (completedCount /
                      lessons.length) *
                      100
                  )}%`,
                }}
              />
            </div>

            <p>
              {completedCount} of{" "}
              {lessons.length} lessons
              completed
            </p>
          </div>
        </aside>
      </section>

      {/* BOTTOM NAVIGATION */}

      <footer className="lesson-navigation">
        <button
          className="previous-lesson-btn"
          onClick={goPrevious}
        >
          <ArrowLeft size={17} />

          <span>
            {lessonNumber === 1
              ? "Course Overview"
              : "Previous Lesson"}
          </span>
        </button>

        <div className="lesson-navigation-center">
          <span>LESSON</span>

          <strong>
            {String(
              lessonNumber
            ).padStart(2, "0")}
          </strong>
        </div>

        <button
          className="next-lesson-btn"
          onClick={goNext}
          disabled={!completed}
        >
          <span>
            {isFinalLesson
              ? "Finish Course"
              : "Next Lesson"}
          </span>

          <ArrowRight size={17} />
        </button>
      </footer>
    </main>
  );
}

export default Lesson;