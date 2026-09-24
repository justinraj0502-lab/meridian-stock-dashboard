import {
  Bell,
  TrendingUp,
  TrendingDown,
  Plus,
  CheckCircle2,
  Clock3,
  ArrowLeft,
  X,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Wifi,
  WifiOff,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  getAlerts,
  createAlert,
  deleteAlert,
  refreshAlerts,
  getStocks,
} from "../api/api";

import "./Alerts.css";

/* =========================================
   HELPERS
========================================= */

const normalizeAlert = (alert) => {
  const target = Number(
    alert?.target
  );

  const current = Number(
    alert?.current
  );

  return {
    ...alert,

    target: Number.isFinite(target)
      ? target
      : 0,

    current: Number.isFinite(current)
      ? current
      : 0,

    triggered:
      Boolean(
        alert?.triggered
      ),

    active:
      alert?.active !== false,
  };
};

const formatPrice = (value) => {
  const price = Number(value);

  if (!Number.isFinite(price)) {
    return "₹0.00";
  }

  return `₹${price.toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
};

const formatUpdatedTime = (
  value
) => {
  if (!value) {
    return "Waiting for data";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Waiting for data";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

const formatCreatedTime = (
  value
) => {
  if (!value) {
    return "Recently created";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Recently created";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

/* =========================================
   PAGE
========================================= */

function Alerts() {
  const navigate =
    useNavigate();

  /* =======================================
     STATE
  ======================================= */

  const [
    alerts,
    setAlerts,
  ] = useState([]);

  const [
    stocks,
    setStocks,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  const [
    actionMessage,
    setActionMessage,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] = useState("All");

  const [
    showModal,
    setShowModal,
  ] = useState(false);

  const [
    form,
    setForm,
  ] = useState({
    symbol: "",
    type: "Above",
    target: "",
  });

  /* =======================================
     LOAD ALERTS
  ======================================= */

  const loadAlerts =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        try {
          if (!silent) {
            setLoading(true);
          }

          setError("");

          const response =
            await getAlerts();

          const nextAlerts =
            Array.isArray(
              response?.alerts
            )
              ? response.alerts.map(
                  normalizeAlert
                )
              : [];

          setAlerts(
            nextAlerts
          );
        } catch (requestError) {
          console.error(
            "Load alerts error:",
            requestError
          );

          if (
            requestError?.status ===
            401
          ) {
            navigate(
              "/login"
            );

            return;
          }

          setError(
            requestError?.message ||
              "Unable to load your alerts."
          );
        } finally {
          if (!silent) {
            setLoading(false);
          }
        }
      },
      [navigate]
    );

  /* =======================================
     LOAD STOCKS
  ======================================= */

  const loadStocks =
    useCallback(
      async () => {
        try {
          const response =
            await getStocks();

          const stockList =
            Array.isArray(
              response?.stocks
            )
              ? response.stocks
              : Array.isArray(
                    response
                  )
                ? response
                : [];

          setStocks(
            stockList
          );
        } catch (requestError) {
          console.error(
            "Load stocks error:",
            requestError
          );
        }
      },
      []
    );

  /* =======================================
     REFRESH ALERTS FROM BACKEND
  ======================================= */

  const refreshLiveAlerts =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        try {
          if (!silent) {
            setRefreshing(
              true
            );
          }

          const response =
            await refreshAlerts();

          const nextAlerts =
            Array.isArray(
              response?.alerts
            )
              ? response.alerts.map(
                  normalizeAlert
                )
              : [];

          setAlerts(
            nextAlerts
          );

          if (
            !silent
          ) {
            setActionMessage(
              "Alerts synced with live market data."
            );
          }

          return response;
        } catch (requestError) {
          console.error(
            "Refresh alerts error:",
            requestError
          );

          if (
            requestError?.status ===
            401
          ) {
            navigate(
              "/login"
            );

            return null;
          }

          if (
            !silent
          ) {
            setError(
              requestError?.message ||
                "Unable to refresh alerts."
            );
          }

          return null;
        } finally {
          if (!silent) {
            setRefreshing(
              false
            );
          }
        }
      },
      [navigate]
    );

  /* =======================================
     INITIAL LOAD
  ======================================= */

  useEffect(() => {
    let cancelled = false;

    const loadInitialData =
      async () => {
        try {
          setLoading(
            true
          );

          setError("");

          const [
            alertsResponse,
            stocksResponse,
          ] =
            await Promise.all([
              getAlerts(),
              getStocks(),
            ]);

          if (cancelled) {
            return;
          }

          const nextAlerts =
            Array.isArray(
              alertsResponse?.alerts
            )
              ? alertsResponse.alerts.map(
                  normalizeAlert
                )
              : [];

          const nextStocks =
            Array.isArray(
              stocksResponse?.stocks
            )
              ? stocksResponse.stocks
              : Array.isArray(
                    stocksResponse
                  )
                ? stocksResponse
                : [];

          setAlerts(
            nextAlerts
          );

          setStocks(
            nextStocks
          );
        } catch (requestError) {
          if (cancelled) {
            return;
          }

          console.error(
            "Initial alerts load error:",
            requestError
          );

          if (
            requestError?.status ===
            401
          ) {
            navigate(
              "/login"
            );

            return;
          }

          setError(
            requestError?.message ||
              "Unable to load your alerts."
          );
        } finally {
          if (!cancelled) {
            setLoading(
              false
            );
          }
        }
      };

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  /* =======================================
     AUTO REFRESH
  ======================================= */

  useEffect(() => {
    const intervalId =
      window.setInterval(
        async () => {
          await loadStocks();
          await refreshLiveAlerts({
            silent: true,
          });
        },
        30000
      );

    return () => {
      window.clearInterval(
        intervalId
      );
    };
  }, [
    loadStocks,
    refreshLiveAlerts,
  ]);

  /* =======================================
     CLEAR ACTION MESSAGE
  ======================================= */

  useEffect(() => {
    if (!actionMessage) {
      return undefined;
    }

    const timeoutId =
      window.setTimeout(
        () => {
          setActionMessage(
            ""
          );
        },
        3500
      );

    return () => {
      window.clearTimeout(
        timeoutId
      );
    };
  }, [
    actionMessage,
  ]);

  /* =======================================
     STOCK LOOKUP
  ======================================= */

  const selectedStock =
    useMemo(() => {
      if (!form.symbol) {
        return null;
      }

      return (
        stocks.find(
          (stock) =>
            String(
              stock.symbol
            ).toUpperCase() ===
            String(
              form.symbol
            ).toUpperCase()
        ) || null
      );
    }, [
      stocks,
      form.symbol,
    ]);

  /* =======================================
     FILTERED ALERTS
  ======================================= */

  const filteredAlerts =
    useMemo(() => {
      if (
        filter === "Watching"
      ) {
        return alerts.filter(
          (alert) =>
            !alert.triggered
        );
      }

      if (
        filter === "Triggered"
      ) {
        return alerts.filter(
          (alert) =>
            alert.triggered
        );
      }

      return alerts;
    }, [
      alerts,
      filter,
    ]);

  /* =======================================
     STATISTICS
  ======================================= */

  const stats =
    useMemo(() => {
      const triggered =
        alerts.filter(
          (alert) =>
            alert.triggered
        ).length;

      const watching =
        alerts.filter(
          (alert) =>
            !alert.triggered
        ).length;

      const live =
        alerts.filter(
          (alert) =>
            alert.isLive
        ).length;

      return {
        total:
          alerts.length,

        watching,

        triggered,

        live,
      };
    }, [
      alerts,
    ]);

  /* =======================================
     FORM HANDLERS
  ======================================= */

  const handleFormChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (previous) => ({
        ...previous,
        [name]:
          value,
      })
    );
  };

  const openCreateModal =
    () => {
      setError("");

      setActionMessage(
        ""
      );

      setForm({
        symbol:
          stocks[0]?.symbol ||
          "",
        type: "Above",
        target: "",
      });

      setShowModal(
        true
      );
    };

  const closeCreateModal =
    () => {
      if (submitting) {
        return;
      }

      setShowModal(
        false
      );
    };

  /* =======================================
     CREATE ALERT
  ======================================= */

  const handleCreateAlert =
    async (event) => {
      event.preventDefault();

      if (submitting) {
        return;
      }

      const symbol =
        String(
          form.symbol || ""
        )
          .trim()
          .toUpperCase();

      const target =
        Number(
          form.target
        );

      if (!symbol) {
        setError(
          "Please select a stock."
        );

        return;
      }

      if (
        !Number.isFinite(
          target
        ) ||
        target <= 0
      ) {
        setError(
          "Please enter a valid target price."
        );

        return;
      }

      try {
        setSubmitting(
          true
        );

        setError("");

        const response =
          await createAlert({
            symbol,
            type:
              form.type,
            target,
          });

        const createdAlert =
          response?.alert
            ? normalizeAlert(
                response.alert
              )
            : null;

        if (
          createdAlert
        ) {
          setAlerts(
            (previous) => [
              createdAlert,
              ...previous,
            ]
          );
        } else {
          await loadAlerts({
            silent: true,
          });
        }

        setShowModal(
          false
        );

        setForm({
          symbol:
            stocks[0]?.symbol ||
            "",
          type: "Above",
          target: "",
        });

        setActionMessage(
          response?.message ||
            "Price alert created successfully."
        );
      } catch (requestError) {
        console.error(
          "Create alert error:",
          requestError
        );

        if (
          requestError?.status ===
          401
        ) {
          navigate(
            "/login"
          );

          return;
        }

        setError(
          requestError?.message ||
            "Unable to create price alert."
        );
      } finally {
        setSubmitting(
          false
        );
      }
    };

  /* =======================================
     DELETE ALERT
  ======================================= */

  const handleDeleteAlert =
    async (alertId) => {
      if (
        !alertId ||
        deletingId
      ) {
        return;
      }

      try {
        setDeletingId(
          alertId
        );

        setError("");

        await deleteAlert(
          alertId
        );

        setAlerts(
          (previous) =>
            previous.filter(
              (alert) =>
                String(
                  alert._id ||
                    alert.id
                ) !==
                String(
                  alertId
                )
            )
        );

        setActionMessage(
          "Alert deleted successfully."
        );
      } catch (requestError) {
        console.error(
          "Delete alert error:",
          requestError
        );

        if (
          requestError?.status ===
          401
        ) {
          navigate(
            "/login"
          );

          return;
        }

        setError(
          requestError?.message ||
            "Unable to delete alert."
        );
      } finally {
        setDeletingId(
          null
        );
      }
    };

  /* =======================================
     REFRESH BUTTON
  ======================================= */

  const handleManualRefresh =
    async () => {
      setError("");

      await loadStocks();

      await refreshLiveAlerts();
    };

  /* =======================================
     LOADING
  ======================================= */

  if (loading) {
    return (
      <main className="alerts-page">
        <div className="alerts-shell">
          <div className="alerts-loading">
            <div className="alerts-loading-orbit">
              <div className="alerts-loading-core">
                <Bell
                  size={22}
                />
              </div>
            </div>

            <div className="alerts-loading-title">
              Loading alerts
            </div>

            <div className="alerts-loading-text">
              Syncing your watchlist with
              Meridian market data...
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================
     RENDER
  ======================================= */

  return (
    <main className="alerts-page">
      <div className="alerts-bg-orb alerts-bg-orb-one" />
      <div className="alerts-bg-orb alerts-bg-orb-two" />

      <div className="alerts-shell">
        {/* =================================
            TOP BAR
        ================================= */}

        <header className="alerts-topbar">
          <button
            type="button"
            className="alerts-back-button"
            onClick={() =>
              navigate("/")
            }
          >
            <ArrowLeft
              size={17}
            />

            <span>
              Dashboard
            </span>
          </button>

          <div className="alerts-live-status">
            <span className="alerts-live-dot" />

            <span>
              Live market alerts
            </span>
          </div>
        </header>

        {/* =================================
            HEADER
        ================================= */}

        <section className="alerts-header">
          <div>
            <div className="alerts-eyebrow">
              <Bell
                size={15}
              />

              PRICE MONITOR
            </div>

            <h1>
              Smart Alerts
            </h1>

            <p>
              Monitor your favorite stocks and
              get notified when the market reaches
              your target price.
            </p>
          </div>

          <div className="alerts-header-actions">
            <button
              type="button"
              className={`alerts-refresh-button ${
                refreshing
                  ? "refreshing"
                  : ""
              }`}
              onClick={
                handleManualRefresh
              }
              disabled={
                refreshing
              }
            >
              <RefreshCw
                size={17}
              />

              <span>
                {refreshing
                  ? "Syncing..."
                  : "Sync Prices"}
              </span>
            </button>

            <button
              type="button"
              className="alerts-create-button"
              onClick={
                openCreateModal
              }
            >
              <Plus
                size={18}
              />

              <span>
                New Alert
              </span>
            </button>
          </div>
        </section>

        {/* =================================
            ERROR
        ================================= */}

        {error && (
          <div className="alerts-error">
            <div className="alerts-error-icon">
              <AlertTriangle
                size={18}
              />
            </div>

            <div className="alerts-error-content">
              <strong>
                Something went wrong
              </strong>

              <span>
                {error}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setError("");
                loadAlerts();
              }}
              aria-label="Close error"
            >
              <X
                size={17}
              />
            </button>
          </div>
        )}

        {/* =================================
            SUCCESS MESSAGE
        ================================= */}

        {actionMessage && (
          <div className="alerts-success">
            <CheckCircle2
              size={17}
            />

            <span>
              {actionMessage}
            </span>
          </div>
        )}

        {/* =================================
            OVERVIEW
        ================================= */}

        <section className="alerts-overview">
          <div className="alerts-stat-card">
            <div className="alerts-stat-icon">
              <Bell
                size={19}
              />
            </div>

            <div>
              <span className="alerts-stat-label">
                Total Alerts
              </span>

              <strong>
                {stats.total}
              </strong>
            </div>
          </div>

          <div className="alerts-stat-card">
            <div className="alerts-stat-icon watching">
              <Clock3
                size={19}
              />
            </div>

            <div>
              <span className="alerts-stat-label">
                Watching
              </span>

              <strong>
                {stats.watching}
              </strong>
            </div>
          </div>

          <div className="alerts-stat-card">
            <div className="alerts-stat-icon triggered">
              <CheckCircle2
                size={19}
              />
            </div>

            <div>
              <span className="alerts-stat-label">
                Triggered
              </span>

              <strong>
                {stats.triggered}
              </strong>
            </div>
          </div>

          <div className="alerts-stat-card">
            <div className="alerts-stat-icon live">
              <Wifi
                size={19}
              />
            </div>

            <div>
              <span className="alerts-stat-label">
                Live Feeds
              </span>

              <strong>
                {stats.live}
              </strong>
            </div>
          </div>
        </section>

        {/* =================================
            MAIN ALERT PANEL
        ================================= */}

        <section className="alerts-panel">
          <div className="alerts-panel-header">
            <div>
              <div className="alerts-panel-eyebrow">
                YOUR MONITORS
              </div>

              <h2>
                Price Alerts
              </h2>

              <p>
                Your alerts are securely stored
                in your Meridian account.
              </p>
            </div>

            <div className="alerts-filter">
              {[
                "All",
                "Watching",
                "Triggered",
              ].map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    className={
                      filter === item
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setFilter(
                        item
                      )
                    }
                  >
                    {item}

                    <span>
                      {item ===
                      "All"
                        ? stats.total
                        : item ===
                            "Watching"
                          ? stats.watching
                          : stats.triggered}
                    </span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* =================================
              EMPTY STATE
          ================================= */}

          {filteredAlerts.length ===
            0 && (
            <div className="alerts-empty-state">
              <div className="alerts-empty-icon">
                <Bell
                  size={27}
                />
              </div>

              <div className="alerts-empty-badge">
                {alerts.length ===
                0
                  ? "NO ALERTS YET"
                  : `NO ${filter.toUpperCase()} ALERTS`}
              </div>

              <h3>
                {alerts.length ===
                0
                  ? "Start monitoring the market"
                  : `Nothing in ${filter.toLowerCase()}`}
              </h3>

              <p>
                {alerts.length ===
                0
                  ? "Create a price alert and Meridian will keep watching the live market for you."
                  : "Try another filter or create a new price alert."}
              </p>

              <button
                type="button"
                className="alerts-empty-button"
                onClick={
                  openCreateModal
                }
              >
                <Plus
                  size={17}
                />

                Create Alert
              </button>
            </div>
          )}

          {/* =================================
              ALERT LIST
          ================================= */}

          {filteredAlerts.length >
            0 && (
            <div className="alerts-list">
              {filteredAlerts.map(
                (alert) => {
                  const alertId =
                    alert._id ||
                    alert.id;

                  const isAbove =
                    alert.type ===
                    "Above";

                  const isDeleting =
                    deletingId ===
                    alertId;

                  return (
                    <article
                      className={`alert-row ${
                        alert.triggered
                          ? "triggered"
                          : "watching"
                      }`}
                      key={
                        alertId
                      }
                    >
                      {/* STOCK */}

                      <div className="alert-stock">
                        <div
                          className={`alert-stock-avatar ${
                            isAbove
                              ? "up"
                              : "down"
                          }`}
                        >
                          {isAbove ? (
                            <TrendingUp
                              size={19}
                            />
                          ) : (
                            <TrendingDown
                              size={19}
                            />
                          )}
                        </div>

                        <div className="alert-stock-info">
                          <strong>
                            {
                              alert.symbol
                            }
                          </strong>

                          <span>
                            {
                              alert.name
                            }
                          </span>

                          <small>
                            Created{" "}
                            {formatCreatedTime(
                              alert.createdAt
                            )}
                          </small>
                        </div>
                      </div>

                      {/* CONDITION */}

                      <div className="alert-condition">
                        <span>
                          Condition
                        </span>

                        <strong
                          className={
                            isAbove
                              ? "above"
                              : "below"
                          }
                        >
                          {isAbove ? (
                            <TrendingUp
                              size={15}
                            />
                          ) : (
                            <TrendingDown
                              size={15}
                            />
                          )}

                          {alert.type}
                        </strong>

                        <b>
                          {formatPrice(
                            alert.target
                          )}
                        </b>
                      </div>

                      {/* CURRENT PRICE */}

                      <div className="alert-current">
                        <span>
                          Current Price
                        </span>

                        <strong>
                          {formatPrice(
                            alert.current
                          )}
                        </strong>

                        <small>
                          {formatUpdatedTime(
                            alert.lastUpdated
                          )}
                        </small>
                      </div>

                      {/* STATUS */}

                      <div className="alert-status">
                        <span>
                          Status
                        </span>

                        <div
                          className={`alert-status-badge ${
                            alert.triggered
                              ? "triggered"
                              : "watching"
                          }`}
                        >
                          {alert.triggered ? (
                            <CheckCircle2
                              size={14}
                            />
                          ) : (
                            <Clock3
                              size={14}
                            />
                          )}

                          {alert.triggered
                            ? "Triggered"
                            : "Watching"}
                        </div>

                        <small>
                          {alert.triggered &&
                          alert.triggeredAt
                            ? `Triggered ${formatUpdatedTime(
                                alert.triggeredAt
                              )}`
                            : alert.active
                              ? "Monitoring price"
                              : "Inactive"}
                        </small>
                      </div>

                      {/* SOURCE */}

                      <div className="alert-source">
                        <span>
                          Data Source
                        </span>

                        <div>
                          {alert.isLive ? (
                            <Wifi
                              size={14}
                            />
                          ) : (
                            <WifiOff
                              size={14}
                            />
                          )}

                          <strong>
                            {alert.dataSource ||
                              "Market data"}
                          </strong>
                        </div>

                        <small>
                          {alert.isMarketOpen
                            ? "Market open"
                            : "Market closed"}
                        </small>
                      </div>

                      {/* DELETE */}

                      <button
                        type="button"
                        className="alert-delete-button"
                        onClick={() =>
                          handleDeleteAlert(
                            alertId
                          )
                        }
                        disabled={
                          isDeleting
                        }
                        aria-label={`Delete ${alert.symbol} alert`}
                      >
                        {isDeleting ? (
                          <RefreshCw
                            size={17}
                            className="spinning"
                          />
                        ) : (
                          <Trash2
                            size={17}
                          />
                        )}
                      </button>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* =================================
            INFO BANNER
        ================================= */}

        <section className="alerts-info-banner">
          <div className="alerts-info-icon">
            <Bell
              size={19}
            />
          </div>

          <div>
            <strong>
              How Meridian alerts work
            </strong>

            <p>
              Your target conditions are stored
              securely in MongoDB. Meridian checks
              them against the latest market prices
              received from Angel One SmartAPI.
            </p>
          </div>

          <div className="alerts-info-live">
            <span />
            Auto-sync every 30s
          </div>
        </section>

        <footer className="alerts-footer">
          <span>
            Meridian Market Intelligence
          </span>

          <span>
            Real-time prices • Secure account
            alerts • Angel One SmartAPI
          </span>
        </footer>
      </div>

      {/* =====================================
          CREATE ALERT MODAL
      ===================================== */}

      {showModal && (
        <div
          className="alerts-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeCreateModal();
            }
          }}
        >
          <div className="alerts-modal">
            <div className="alerts-modal-header">
              <div>
                <div className="alerts-modal-kicker">
                  NEW MARKET ALERT
                </div>

                <h2>
                  Create Price Alert
                </h2>

                <p>
                  Choose a stock and target
                  condition.
                </p>
              </div>

              <button
                type="button"
                className="alerts-modal-close"
                onClick={
                  closeCreateModal
                }
                disabled={
                  submitting
                }
              >
                <X
                  size={19}
                />
              </button>
            </div>

            <form
              className="alerts-modal-form"
              onSubmit={
                handleCreateAlert
              }
            >
              {/* STOCK */}

              <label>
                <span>
                  Stock
                </span>

                <select
                  name="symbol"
                  value={
                    form.symbol
                  }
                  onChange={
                    handleFormChange
                  }
                  disabled={
                    submitting
                  }
                >
                  <option value="">
                    Select a stock
                  </option>

                  {stocks.map(
                    (stock) => (
                      <option
                        key={
                          stock.symbol
                        }
                        value={
                          stock.symbol
                        }
                      >
                        {
                          stock.symbol
                        }{" "}
                        —{" "}
                        {
                          stock.name
                        }
                      </option>
                    )
                  )}
                </select>
              </label>

              {/* CONDITION */}

              <div className="alerts-condition-selector">
                <span>
                  Trigger when price goes
                </span>

                <div>
                  <button
                    type="button"
                    className={
                      form.type ===
                      "Above"
                        ? "active above"
                        : ""
                    }
                    onClick={() =>
                      setForm(
                        (previous) => ({
                          ...previous,
                          type: "Above",
                        })
                      )
                    }
                    disabled={
                      submitting
                    }
                  >
                    <TrendingUp
                      size={16}
                    />

                    Above
                  </button>

                  <button
                    type="button"
                    className={
                      form.type ===
                      "Below"
                        ? "active below"
                        : ""
                    }
                    onClick={() =>
                      setForm(
                        (previous) => ({
                          ...previous,
                          type: "Below",
                        })
                      )
                    }
                    disabled={
                      submitting
                    }
                  >
                    <TrendingDown
                      size={16}
                    />

                    Below
                  </button>
                </div>
              </div>

              {/* TARGET */}

              <label>
                <span>
                  Target Price
                </span>

                <div className="alerts-price-input">
                  <span>
                    ₹
                  </span>

                  <input
                    type="number"
                    name="target"
                    value={
                      form.target
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    inputMode="decimal"
                    disabled={
                      submitting
                    }
                    autoComplete="off"
                  />
                </div>
              </label>

              {/* PREVIEW */}

              {selectedStock && (
                <div className="alerts-modal-preview">
                  <div className="alerts-preview-stock">
                    <div className="alerts-preview-avatar">
                      {form.type ===
                      "Above" ? (
                        <TrendingUp
                          size={17}
                        />
                      ) : (
                        <TrendingDown
                          size={17}
                        />
                      )}
                    </div>

                    <div>
                      <strong>
                        {
                          selectedStock.symbol
                        }
                      </strong>

                      <span>
                        {
                          selectedStock.name
                        }
                      </span>
                    </div>
                  </div>

                  <div className="alerts-preview-price">
                    <small>
                      Live price
                    </small>

                    <strong>
                      {formatPrice(
                        selectedStock.price
                      )}
                    </strong>
                  </div>

                  <div className="alerts-preview-source">
                    <Wifi
                      size={13}
                    />

                    {selectedStock.isLive
                      ? "Live"
                      : "Market data"}
                  </div>
                </div>
              )}

              {/* SECURITY */}

              <div className="alerts-modal-security">
                <CheckCircle2
                  size={15}
                />

                <span>
                  This alert will be securely
                  linked to your Meridian account.
                </span>
              </div>

              {/* ACTIONS */}

              <div className="alerts-modal-actions">
                <button
                  type="button"
                  className="alerts-modal-cancel"
                  onClick={
                    closeCreateModal
                  }
                  disabled={
                    submitting
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="alerts-modal-submit"
                  disabled={
                    submitting ||
                    !form.symbol ||
                    !form.target
                  }
                >
                  {submitting ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="spinning"
                      />

                      Creating...
                    </>
                  ) : (
                    <>
                      <Bell
                        size={16}
                      />

                      Create Alert
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Alerts;