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
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getStocks } from "../api/api";

import "./Alerts.css";

const ALERT_STORAGE_KEY = "meridian-alerts";

function normalizeAlert(alert) {
  return {
    ...alert,
    target: Number(alert.target) || 0,
    current: Number(alert.current) || 0,
    triggered: Boolean(alert.triggered),
  };
}

function checkTriggered(alert, currentPrice) {
  const current = Number(currentPrice);

  if (!Number.isFinite(current) || current <= 0) {
    return alert.triggered;
  }

  if (alert.type === "Above") {
    return current >= Number(alert.target);
  }

  return current <= Number(alert.target);
}

function getAlertStatus(alert) {
  return alert.triggered ? "Triggered" : "Watching";
}

function formatPrice(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "₹0.00";
  }

  return `₹${number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatUpdatedTime(value) {
  if (!value) {
    return "Waiting for quote";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Last quote unavailable";
  }

  return `Updated ${date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function Alerts() {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("All Alerts");

  const [alerts, setAlerts] = useState(() => {
    try {
      const saved = localStorage.getItem(ALERT_STORAGE_KEY);

      if (!saved) {
        return [];
      }

      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map(normalizeAlert);
    } catch (error) {
      console.error("Failed to load alerts:", error);
      return [];
    }
  });

  const [stocks, setStocks] = useState([]);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    symbol: "",
    condition: "Above",
    target: "",
  });

  /* =====================================================
     FETCH STOCKS
     ===================================================== */

  const loadStocks = async (showLoader = false) => {
    try {
      if (showLoader) {
        setRefreshing(true);
      } else {
        setLoadingStocks(true);
      }

      setError("");

      const response = await getStocks();

      const stockList = Array.isArray(response)
        ? response
        : response?.stocks || [];

      setStocks(stockList);

      setForm((previous) => {
        if (previous.symbol) {
          const stillExists = stockList.some(
            (stock) => stock.symbol === previous.symbol
          );

          if (stillExists) {
            return previous;
          }
        }

        return {
          ...previous,
          symbol: stockList[0]?.symbol || "",
        };
      });

      /* Update current prices and trigger status */

      setAlerts((previous) =>
        previous.map((alert) => {
          const stock = stockList.find(
            (item) => item.symbol === alert.symbol
          );

          if (!stock) {
            return alert;
          }

          const current = Number(stock.price);

          if (!Number.isFinite(current)) {
            return alert;
          }

          return normalizeAlert({
            ...alert,
            name: stock.name,
            current,
            dataSource: stock.dataSource,
            isLive: stock.isLive,
            isMarketOpen: stock.isMarketOpen,
            lastUpdated: stock.lastUpdated,
            triggered: checkTriggered(
              alert,
              current
            ),
          });
        })
      );
    } catch (requestError) {
      console.error(
        "Failed to load stocks:",
        requestError
      );

      setError(
        requestError?.message ||
          "Unable to load market data."
      );
    } finally {
      setLoadingStocks(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStocks();
  }, []);

  /* =====================================================
     AUTO REFRESH
     ===================================================== */

  useEffect(() => {
    const interval = setInterval(() => {
      loadStocks();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  /* =====================================================
     SAVE ALERTS
     ===================================================== */

  useEffect(() => {
    try {
      localStorage.setItem(
        ALERT_STORAGE_KEY,
        JSON.stringify(alerts)
      );
    } catch (storageError) {
      console.error(
        "Failed to save alerts:",
        storageError
      );
    }
  }, [alerts]);

  /* =====================================================
     COUNTS
     ===================================================== */

  const watchingCount = alerts.filter(
    (alert) =>
      getAlertStatus(alert) === "Watching"
  ).length;

  const triggeredCount = alerts.filter(
    (alert) =>
      getAlertStatus(alert) === "Triggered"
  ).length;

  /* =====================================================
     FILTER
     ===================================================== */

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const status = getAlertStatus(alert);

      if (filter === "Watching") {
        return status === "Watching";
      }

      if (filter === "Triggered") {
        return status === "Triggered";
      }

      return true;
    });
  }, [alerts, filter]);

  /* =====================================================
     SELECTED STOCK
     ===================================================== */

  const selectedStock = stocks.find(
    (stock) => stock.symbol === form.symbol
  );

  /* =====================================================
     CREATE ALERT
     ===================================================== */

  const handleCreateAlert = (event) => {
    event.preventDefault();

    const target = Number(form.target);

    if (
      !form.symbol ||
      !Number.isFinite(target) ||
      target <= 0
    ) {
      return;
    }

    const stock = stocks.find(
      (item) => item.symbol === form.symbol
    );

    if (!stock) {
      return;
    }

    const current = Number(stock.price);

    const newAlert = normalizeAlert({
      id: `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      symbol: stock.symbol,
      name: stock.name,
      target,
      current,
      type: form.condition,
      triggered:
        form.condition === "Above"
          ? current >= target
          : current <= target,
      dataSource: stock.dataSource,
      isLive: stock.isLive,
      isMarketOpen: stock.isMarketOpen,
      lastUpdated: stock.lastUpdated,
      createdAt: new Date().toISOString(),
    });

    setAlerts((previous) => [
      ...previous,
      newAlert,
    ]);

    setForm({
      symbol: stocks[0]?.symbol || "",
      condition: "Above",
      target: "",
    });

    setShowModal(false);
  };

  /* =====================================================
     DELETE ALERT
     ===================================================== */

  const deleteAlert = (id) => {
    setAlerts((previous) =>
      previous.filter(
        (alert) => alert.id !== id
      )
    );
  };

  /* =====================================================
     CLOSE MODAL
     ===================================================== */

  const closeModal = () => {
    setShowModal(false);

    setForm({
      symbol: stocks[0]?.symbol || "",
      condition: "Above",
      target: "",
    });
  };

  return (
    <main className="alerts-page">

      {/* =================================================
          HEADER
          ================================================= */}

      <div className="alerts-header">

        <div>
          <p className="page-label">
            MARKET MONITORING
          </p>

          <h1>Alerts</h1>

          <p className="page-subtitle">
            Stay informed when your selected stocks
            reach the price levels you're watching.
          </p>
        </div>

        <div className="alerts-header-actions">

          <button
            className="back-dashboard-btn"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <ArrowLeft size={17} />
            Dashboard
          </button>

          <button
            className="refresh-alerts-btn"
            onClick={() => loadStocks(true)}
            disabled={refreshing}
            title="Refresh market prices"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "alerts-refresh-spin"
                  : ""
              }
            />
          </button>

          <button
            className="create-alert-btn"
            onClick={() => setShowModal(true)}
            disabled={stocks.length === 0}
          >
            <Plus size={18} />
            Create Alert
          </button>

        </div>

      </div>

      {/* =================================================
          ERROR
          ================================================= */}

      {error && (
        <div className="alerts-error">

          <AlertTriangle size={17} />

          <div>
            <strong>
              Market data unavailable
            </strong>

            <span>{error}</span>
          </div>

          <button
            onClick={() => loadStocks(true)}
          >
            Retry
          </button>

        </div>
      )}

      {/* =================================================
          OVERVIEW
          ================================================= */}

      <section className="alert-overview">

        <div className="alert-stat-card">

          <div className="stat-icon">
            <Bell size={19} />
          </div>

          <div>
            <span>Active Alerts</span>
            <strong>{alerts.length}</strong>
          </div>

        </div>

        <div className="alert-stat-card">

          <div className="stat-icon">
            <Clock3 size={19} />
          </div>

          <div>
            <span>Watching</span>
            <strong>{watchingCount}</strong>
          </div>

        </div>

        <div className="alert-stat-card">

          <div className="stat-icon">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>Triggered</span>
            <strong>{triggeredCount}</strong>
          </div>

        </div>

      </section>

      {/* =================================================
          ALERT LIST
          ================================================= */}

      <section className="alerts-section">

        <div className="section-heading">

          <div>
            <h2>Your Alerts</h2>

            <p>
              Price levels currently being monitored
              by Meridian.
            </p>
          </div>

          <select
            className="filter-btn"
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value)
            }
          >
            <option value="All Alerts">
              All Alerts
            </option>

            <option value="Watching">
              Watching
            </option>

            <option value="Triggered">
              Triggered
            </option>
          </select>

        </div>

        <div className="alerts-list">

          {filteredAlerts.length === 0 ? (

            <div className="empty-alerts">

              <div className="empty-alert-icon">
                <Bell size={30} />
              </div>

              <h3>
                {alerts.length === 0
                  ? "No alerts yet"
                  : "No alerts found"}
              </h3>

              <p>
                {alerts.length === 0
                  ? "Create your first price alert and let Meridian monitor the market for you."
                  : "There are no alerts matching the selected filter."}
              </p>

              {stocks.length > 0 && (
                <button
                  className="create-alert-btn"
                  onClick={() =>
                    setShowModal(true)
                  }
                >
                  <Plus size={17} />
                  Create Alert
                </button>
              )}

            </div>

          ) : (

            filteredAlerts.map((alert) => {

              const status =
                getAlertStatus(alert);

              const isPositive =
                alert.type === "Above";

              const distance =
                Number(alert.target) > 0 &&
                Number(alert.current) > 0
                  ? Math.abs(
                      ((Number(alert.target) -
                        Number(alert.current)) /
                        Number(alert.current)) *
                        100
                    )
                  : 0;

              return (
                <div
                  className={`alert-row ${
                    status === "Triggered"
                      ? "alert-row-triggered"
                      : ""
                  }`}
                  key={alert.id}
                >

                  {/* STOCK */}

                  <div className="alert-stock">

                    <div className="stock-logo">
                      {alert.symbol
                        ?.slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {alert.symbol}
                      </strong>

                      <span>
                        {alert.name ||
                          "Stock"}
                      </span>
                    </div>

                  </div>

                  {/* CONDITION */}

                  <div className="alert-condition">

                    <div
                      className={`condition-icon ${
                        isPositive
                          ? "above"
                          : "below"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp size={17} />
                      ) : (
                        <TrendingDown size={17} />
                      )}
                    </div>

                    <div>

                      <span>
                        Price goes{" "}
                        {alert.type.toLowerCase()}
                      </span>

                      <strong>
                        {formatPrice(
                          alert.target
                        )}
                      </strong>

                    </div>

                  </div>

                  {/* CURRENT PRICE */}

                  <div className="current-price">

                    <span>
                      Current
                    </span>

                    <strong>
                      {formatPrice(
                        alert.current
                      )}
                    </strong>

                    <small>
                      {distance > 0
                        ? `${distance.toFixed(
                            2
                          )}% away`
                        : "At target"}
                    </small>

                  </div>

                  {/* STATUS */}

                  <div
                    className={`alert-status ${
                      status === "Triggered"
                        ? "triggered"
                        : "watching"
                    }`}
                  >
                    {status}
                  </div>

                  {/* DATA SOURCE */}

                  <div className="alert-source">

                    <span
                      className={
                        alert.isLive
                          ? "live-dot"
                          : "seed-dot"
                      }
                    />

                    <div>
                      <strong>
                        {alert.isLive
                          ? "Live quote"
                          : "Last known"}
                      </strong>

                      <span>
                        {formatUpdatedTime(
                          alert.lastUpdated
                        )}
                      </span>
                    </div>

                  </div>

                  {/* DELETE */}

                  <button
                    className="alert-delete"
                    onClick={() =>
                      deleteAlert(alert.id)
                    }
                    aria-label={`Delete ${alert.symbol} alert`}
                    title="Delete alert"
                  >
                    <Trash2 size={17} />
                  </button>

                </div>
              );
            })
          )}

        </div>

      </section>

      {/* =================================================
          INFO
          ================================================= */}

      <section className="alert-info">

        <div className="info-icon">
          <Bell size={22} />
        </div>

        <div>
          <h3>
            Never miss a market move
          </h3>

          <p>
            Create price alerts for NSE stocks
            you're monitoring. Meridian checks
            the latest available quote and updates
            your alert status automatically.
          </p>
        </div>

        <button
          className="secondary-alert-btn"
          onClick={() => setShowModal(true)}
          disabled={stocks.length === 0}
        >
          <Plus size={17} />
          Add New Alert
        </button>

      </section>

      {/* =================================================
          MODAL
          ================================================= */}

      {showModal && (

        <div
          className="alert-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="alert-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <p className="modal-eyebrow">
                  MARKET MONITOR
                </p>

                <h2>
                  Create Price Alert
                </h2>

                <p>
                  Choose a stock and set the price
                  Meridian should monitor.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                <X size={20} />
              </button>

            </div>

            {loadingStocks ? (

              <div className="modal-loading">

                <RefreshCw
                  size={22}
                  className="alerts-refresh-spin"
                />

                <span>
                  Loading market symbols...
                </span>

              </div>

            ) : stocks.length === 0 ? (

              <div className="modal-empty">

                <AlertTriangle size={24} />

                <strong>
                  No market symbols available
                </strong>

                <span>
                  Meridian could not load stocks
                  from the backend.
                </span>

              </div>

            ) : (

              <form
                onSubmit={handleCreateAlert}
              >

                {/* STOCK */}

                <div className="form-group">

                  <label>
                    Stock
                  </label>

                  <select
                    value={form.symbol}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        symbol:
                          event.target.value,
                      })
                    }
                    required
                  >
                    {stocks.map((stock) => (
                      <option
                        key={stock.symbol}
                        value={stock.symbol}
                      >
                        {stock.symbol} —{" "}
                        {stock.name}
                      </option>
                    ))}
                  </select>

                </div>

                {/* CONDITION */}

                <div className="form-group">

                  <label>
                    Condition
                  </label>

                  <select
                    value={form.condition}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        condition:
                          event.target.value,
                      })
                    }
                  >
                    <option value="Above">
                      Price goes above
                    </option>

                    <option value="Below">
                      Price goes below
                    </option>
                  </select>

                </div>

                {/* TARGET */}

                <div className="form-group">

                  <label>
                    Target Price
                  </label>

                  <div className="price-input">

                    <span>₹</span>

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="1500.00"
                      value={form.target}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          target:
                            event.target.value,
                        })
                      }
                      required
                    />

                  </div>

                </div>

                {/* PREVIEW */}

                {selectedStock &&
                  form.target && (

                    <div className="alert-preview">

                      <div className="preview-row">

                        <span>
                          Current price
                        </span>

                        <strong>
                          {formatPrice(
                            selectedStock.price
                          )}
                        </strong>

                      </div>

                      <div className="preview-row">

                        <span>
                          Target
                        </span>

                        <strong>
                          {formatPrice(
                            form.target
                          )}
                        </strong>

                      </div>

                      <small>
                        This alert will be checked
                        against the latest Meridian
                        market quote.
                      </small>

                    </div>
                  )}

                {/* ACTIONS */}

                <div className="modal-actions">

                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="submit-alert-btn"
                    disabled={
                      !form.symbol ||
                      !form.target
                    }
                  >
                    <Bell size={16} />
                    Create Alert
                  </button>

                </div>

              </form>
            )}

          </div>

        </div>
      )}

    </main>
  );
}

export default Alerts;