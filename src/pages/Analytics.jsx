import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  PieChart,
  BarChart3,
  RefreshCw,
  Wallet,
  Database,
} from "lucide-react";
import {
  getPortfolio,
  getTransactions,
} from "../api/api";
import "./Analytics.css";

function Analytics() {
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadAnalytics = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      }

      setError("");

      const [portfolioResponse, transactionResponse] =
        await Promise.all([
          getPortfolio(),
          getTransactions(),
        ]);

      setPortfolio(
        portfolioResponse?.portfolio ||
          portfolioResponse?.data ||
          portfolioResponse ||
          null
      );

      setTransactions(
        transactionResponse?.transactions ||
          transactionResponse?.data ||
          []
      );
    } catch (err) {
      console.error(
        "Analytics loading error:",
        err
      );

      setError(
        err.message ||
          "Unable to load portfolio analytics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();

    const interval = setInterval(() => {
      loadAnalytics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  /* =========================================================
     NORMALIZE PORTFOLIO
     ========================================================= */

  const holdings = useMemo(() => {
    if (!portfolio) {
      return [];
    }

    return (
      portfolio.holdings ||
      portfolio.positions ||
      []
    );
  }, [portfolio]);

  const cashBalance = Number(
    portfolio?.balance ??
      portfolio?.cash ??
      portfolio?.cashBalance ??
      0
  );

  const investedValue = Number(
    portfolio?.investedValue ??
      portfolio?.totalInvested ??
      0
  );

  const currentValue = Number(
    portfolio?.currentValue ??
      portfolio?.portfolioValue ??
      portfolio?.totalValue ??
      0
  );

  const totalPnL = Number(
    portfolio?.profitLoss ??
      portfolio?.pnl ??
      portfolio?.totalPnL ??
      currentValue - investedValue
  );

  const totalPnLPercent = Number(
    portfolio?.profitLossPercent ??
      portfolio?.pnlPercent ??
      portfolio?.totalPnLPercent ??
      (investedValue > 0
        ? (totalPnL / investedValue) * 100
        : 0)
  );

  /* =========================================================
     HOLDING ANALYTICS
     ========================================================= */

  const holdingAnalytics = useMemo(() => {
    return holdings
      .map((holding) => {
        const symbol =
          holding.symbol ||
          holding.stock?.symbol ||
          "—";

        const quantity = Number(
          holding.quantity ??
            holding.qty ??
            holding.shares ??
            0
        );

        const averagePrice = Number(
          holding.averagePrice ??
            holding.avgPrice ??
            holding.buyPrice ??
            0
        );

        const price = Number(
          holding.currentPrice ??
            holding.price ??
            holding.stock?.price ??
            0
        );

        const invested =
          Number(
            holding.investedValue ??
              holding.totalInvested ??
              0
          ) ||
          averagePrice * quantity;

        const value =
          Number(
            holding.currentValue ??
              holding.marketValue ??
              0
          ) ||
          price * quantity;

        const pnl =
          Number(
            holding.profitLoss ??
              holding.pnl
          ) ||
          value - invested;

        const pnlPercent =
          Number(
            holding.profitLossPercent ??
              holding.pnlPercent
          ) ||
          (invested > 0
            ? (pnl / invested) * 100
            : 0);

        const sector =
          holding.sector ||
          holding.stock?.sector ||
          "Other";

        return {
          symbol,
          quantity,
          averagePrice,
          price,
          invested,
          value,
          pnl,
          pnlPercent,
          sector,
        };
      })
      .filter(
        (holding) =>
          holding.quantity > 0 ||
          holding.value > 0
      );
  }, [holdings]);

  /* =========================================================
     TOP / WORST POSITIONS
     ========================================================= */

  const sortedHoldings = useMemo(() => {
    return [...holdingAnalytics].sort(
      (a, b) => b.pnl - a.pnl
    );
  }, [holdingAnalytics]);

  const positivePositions = holdingAnalytics.filter(
    (holding) => holding.pnl > 0
  ).length;

  const negativePositions = holdingAnalytics.filter(
    (holding) => holding.pnl < 0
  ).length;

  const largestPosition = useMemo(() => {
    if (!holdingAnalytics.length) {
      return null;
    }

    return [...holdingAnalytics].sort(
      (a, b) => b.value - a.value
    )[0];
  }, [holdingAnalytics]);

  /* =========================================================
     SECTOR ALLOCATION
     ========================================================= */

  const sectors = useMemo(() => {
    const sectorMap = {};

    holdingAnalytics.forEach((holding) => {
      const sector = holding.sector || "Other";

      sectorMap[sector] =
        (sectorMap[sector] || 0) +
        holding.value;
    });

    const total = Object.values(sectorMap).reduce(
      (sum, value) => sum + value,
      0
    );

    return Object.entries(sectorMap)
      .map(([sector, value]) => ({
        sector,
        value,
        percentage:
          total > 0
            ? (value / total) * 100
            : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [holdingAnalytics]);

  /* =========================================================
     TRANSACTION ANALYTICS
     ========================================================= */

  const transactionStats = useMemo(() => {
    const buys = transactions.filter(
      (transaction) =>
        String(
          transaction.type ||
            transaction.action ||
            ""
        ).toUpperCase() === "BUY"
    );

    const sells = transactions.filter(
      (transaction) =>
        String(
          transaction.type ||
            transaction.action ||
            ""
        ).toUpperCase() === "SELL"
    );

    return {
      total: transactions.length,
      buys: buys.length,
      sells: sells.length,
    };
  }, [transactions]);

  /* =========================================================
     HELPERS
     ========================================================= */

  const formatCurrency = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "₹0.00";
    }

    return `₹${number.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatPercent = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0.00%";
    }

    return `${
      number >= 0 ? "+" : ""
    }${number.toFixed(2)}%`;
  };

  const formatQuantity = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0";
    }

    return number.toLocaleString("en-IN", {
      maximumFractionDigits: 4,
    });
  };

  /* =========================================================
     RISK SCORE
     ========================================================= */

  const riskLevel = useMemo(() => {
    const positionCount =
      holdingAnalytics.length;

    if (positionCount === 0) {
      return {
        label: "No positions",
        percentage: 0,
      };
    }

    const concentration =
      largestPosition &&
      currentValue > 0
        ? (largestPosition.value /
            currentValue) *
          100
        : 0;

    /*
      This is a simple portfolio concentration
      indicator, not a financial risk rating.
    */

    const score = Math.min(
      100,
      Math.max(
        0,
        concentration * 0.7 +
          Math.max(
            0,
            30 - positionCount * 2
          )
      )
    );

    let label = "Moderate";

    if (score < 35) {
      label = "Diversified";
    } else if (score >= 70) {
      label = "Concentrated";
    }

    return {
      label,
      percentage: score,
    };
  }, [
    holdingAnalytics,
    largestPosition,
    currentValue,
  ]);

  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          <div className="analytics-loader-orb">
            <Activity size={22} />
          </div>

          <strong>
            Loading portfolio analytics
          </strong>

          <span>
            Reading your latest portfolio data...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="analytics-header">

        <div>
          <span className="analytics-eyebrow">
            PORTFOLIO ANALYTICS
          </span>

          <h1>Analytics</h1>

          <p>
            Understand your portfolio performance,
            allocation, and position-level exposure.
          </p>
        </div>

        <div className="analytics-header-actions">

          <button
            className="analytics-refresh"
            onClick={() =>
              loadAnalytics(true)
            }
            disabled={refreshing}
          >
            <RefreshCw
              size={15}
              className={
                refreshing
                  ? "analytics-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing"
              : "Refresh"}
          </button>

          <Link
            to="/dashboard"
            className="analytics-back"
          >
            <ArrowLeft size={17} />
            Dashboard
          </Link>

        </div>

      </header>

      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <div className="analytics-error">
          <Activity size={17} />

          <div>
            <strong>
              Analytics data unavailable
            </strong>

            <span>{error}</span>
          </div>

          <button
            onClick={() =>
              loadAnalytics(true)
            }
          >
            Try again
          </button>
        </div>
      )}

      {/* =====================================================
          OVERVIEW
          ===================================================== */}

      <section className="analytics-overview">

        <div className="analytics-overview-card main">

          <div className="analytics-overview-top">
            <div>
              <span>Current portfolio value</span>

              <strong>
                {formatCurrency(currentValue)}
              </strong>
            </div>

            <div className="analytics-overview-icon">
              <Wallet size={19} />
            </div>
          </div>

          <div
            className={
              totalPnL >= 0
                ? "analytics-overview-change positive"
                : "analytics-overview-change negative"
            }
          >
            {totalPnL >= 0 ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}

            <span>
              {formatCurrency(
                Math.abs(totalPnL)
              )}
            </span>

            <span>
              ({formatPercent(totalPnLPercent)})
            </span>

            <small>overall P&L</small>
          </div>

        </div>

        <div className="analytics-overview-card">

          <span>Invested capital</span>

          <strong>
            {formatCurrency(investedValue)}
          </strong>

          <small>
            Capital currently deployed
          </small>

        </div>

        <div className="analytics-overview-card">

          <span>Available cash</span>

          <strong>
            {formatCurrency(cashBalance)}
          </strong>

          <small>
            Uninvested balance
          </small>

        </div>

        <div className="analytics-overview-card">

          <span>Active positions</span>

          <strong>
            {holdingAnalytics.length}
          </strong>

          <small>
            {positivePositions} positive ·{" "}
            {negativePositions} negative
          </small>

        </div>

      </section>

      {/* =====================================================
          POSITION PERFORMANCE
          ===================================================== */}

      <section className="analytics-card">

        <div className="analytics-section-title">

          <div>
            <h2>Position performance</h2>

            <p>
              Contribution from your current holdings
            </p>
          </div>

          <BarChart3 size={20} />

        </div>

        {sortedHoldings.length > 0 ? (
          <div className="analytics-position-list">

            {sortedHoldings.map(
              (holding) => {

                const maxPnl =
                  Math.max(
                    ...sortedHoldings.map(
                      (item) =>
                        Math.abs(item.pnl)
                    ),
                    1
                  );

                const width =
                  (Math.abs(
                    holding.pnl
                  ) /
                    maxPnl) *
                  100;

                return (
                  <div
                    className="analytics-position-row"
                    key={holding.symbol}
                  >

                    <div className="analytics-position-name">

                      <div className="analytics-position-logo">
                        {holding.symbol.slice(
                          0,
                          2
                        )}
                      </div>

                      <div>
                        <strong>
                          {holding.symbol}
                        </strong>

                        <span>
                          {formatQuantity(
                            holding.quantity
                          )} shares
                        </span>
                      </div>

                    </div>

                    <div className="analytics-position-bar">

                      <div className="analytics-position-track">

                        <div
                          className={
                            holding.pnl >= 0
                              ? "analytics-position-fill positive"
                              : "analytics-position-fill negative"
                          }
                          style={{
                            width: `${Math.max(
                              width,
                              3
                            )}%`,
                          }}
                        />

                      </div>

                    </div>

                    <div
                      className={
                        holding.pnl >= 0
                          ? "analytics-position-pnl positive"
                          : "analytics-position-pnl negative"
                      }
                    >
                      {holding.pnl >= 0 ? (
                        <TrendingUp size={13} />
                      ) : (
                        <TrendingDown size={13} />
                      )}

                      <span>
                        {formatCurrency(
                          Math.abs(
                            holding.pnl
                          )
                        )}
                      </span>

                      <small>
                        {formatPercent(
                          holding.pnlPercent
                        )}
                      </small>
                    </div>

                  </div>
                );
              }
            )}

          </div>
        ) : (
          <div className="analytics-empty">
            <Wallet size={30} />

            <strong>
              No positions yet
            </strong>

            <span>
              Buy a stock to start generating
              portfolio analytics.
            </span>

            <Link to="/screener">
              Explore stocks
            </Link>
          </div>
        )}

      </section>

      {/* =====================================================
          LOWER GRID
          ===================================================== */}

      <div className="analytics-grid">

        {/* RISK PROFILE */}

        <section className="analytics-card">

          <div className="analytics-section-title">

            <div>
              <h2>Portfolio risk</h2>

              <p>
                Concentration indicators
              </p>
            </div>

            <Shield size={20} />

          </div>

          <div className="risk-profile">

            <div className="risk-profile-header">

              <div>
                <span>Concentration profile</span>

                <strong>
                  {riskLevel.label}
                </strong>
              </div>

              <div className="risk-score">
                {Math.round(
                  riskLevel.percentage
                )}
              </div>

            </div>

            <div className="risk-meter">

              <div
                className="risk-meter-fill"
                style={{
                  width: `${riskLevel.percentage}%`,
                }}
              />

            </div>

            <div className="risk-list">

              <div className="risk-row">
                <span>
                  Largest position
                </span>

                <strong>
                  {largestPosition
                    ? `${largestPosition.symbol} · ${formatPercent(
                        currentValue > 0
                          ? (largestPosition.value /
                              currentValue) *
                              100
                          : 0
                      )}`
                    : "—"}
                </strong>
              </div>

              <div className="risk-row">
                <span>
                  Positive positions
                </span>

                <strong>
                  {positivePositions} /{" "}
                  {holdingAnalytics.length}
                </strong>
              </div>

              <div className="risk-row">
                <span>
                  Negative positions
                </span>

                <strong>
                  {negativePositions} /{" "}
                  {holdingAnalytics.length}
                </strong>
              </div>

              <div className="risk-row">
                <span>
                  Total transactions
                </span>

                <strong>
                  {transactionStats.total}
                </strong>
              </div>

            </div>

            <small className="risk-note">
              Concentration indicator is calculated
              from your current holdings. It is not
              an investment risk rating.
            </small>

          </div>

        </section>

        {/* TRANSACTIONS */}

        <section className="analytics-card">

          <div className="analytics-section-title">

            <div>
              <h2>Trading activity</h2>

              <p>
                Your executed portfolio transactions
              </p>
            </div>

            <Activity size={20} />

          </div>

          <div className="activity-summary">

            <div className="activity-stat">
              <span>Total trades</span>
              <strong>
                {transactionStats.total}
              </strong>
            </div>

            <div className="activity-stat positive">
              <span>Buy orders</span>
              <strong>
                {transactionStats.buys}
              </strong>
            </div>

            <div className="activity-stat negative">
              <span>Sell orders</span>
              <strong>
                {transactionStats.sells}
              </strong>
            </div>

          </div>

          {transactions.length > 0 ? (
            <div className="recent-transactions">

              {transactions
                .slice(0, 5)
                .map((transaction, index) => {

                  const type =
                    String(
                      transaction.type ||
                        transaction.action ||
                        ""
                    ).toUpperCase();

                  const symbol =
                    transaction.symbol ||
                    transaction.stockSymbol ||
                    "—";

                  const quantity =
                    Number(
                      transaction.quantity ||
                        transaction.qty ||
                        0
                    );

                  return (
                    <div
                      className="transaction-row"
                      key={
                        transaction._id ||
                        transaction.id ||
                        `${symbol}-${index}`
                      }
                    >

                      <div
                        className={
                          type === "BUY"
                            ? "transaction-type buy"
                            : "transaction-type sell"
                        }
                      >
                        {type === "BUY"
                          ? "B"
                          : "S"}
                      </div>

                      <div className="transaction-info">
                        <strong>
                          {symbol}
                        </strong>

                        <span>
                          {type} ·{" "}
                          {formatQuantity(
                            quantity
                          )} shares
                        </span>
                      </div>

                      <span className="transaction-date">
                        {transaction.createdAt
                          ? new Date(
                              transaction.createdAt
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "—"}
                      </span>

                    </div>
                  );
                })}

            </div>
          ) : (
            <div className="analytics-mini-empty">
              <Database size={23} />

              <span>
                No transactions recorded yet.
              </span>
            </div>
          )}

        </section>

      </div>

      {/* =====================================================
          PORTFOLIO ALLOCATION
          ===================================================== */}

      <section className="analytics-card allocation-card">

        <div className="analytics-section-title">

          <div>
            <h2>Portfolio allocation</h2>

            <p>
              Distribution across your current sectors
            </p>
          </div>

          <PieChart size={20} />

        </div>

        {sectors.length > 0 ? (
          <div className="allocation-list">

            {sectors.map(
              ({
                sector,
                value,
                percentage,
              }) => (
                <div
                  className="allocation-row"
                  key={sector}
                >

                  <div className="allocation-info">

                    <div>
                      <span>{sector}</span>

                      <small>
                        {formatCurrency(value)}
                      </small>
                    </div>

                    <strong>
                      {percentage.toFixed(1)}%
                    </strong>

                  </div>

                  <div className="allocation-track">

                    <div
                      className="allocation-fill"
                      style={{
                        width: `${Math.min(
                          percentage,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>
              )
            )}

          </div>
        ) : (
          <div className="analytics-empty">
            <PieChart size={30} />

            <strong>
              No allocation data
            </strong>

            <span>
              Sector allocation will appear
              after you build your portfolio.
            </span>
          </div>
        )}

      </section>

      {/* =====================================================
          DATA SOURCE
          ===================================================== */}

      <div className="analytics-note">

        <Database size={14} />

        <span>
          Analytics are calculated from your
          Meridian portfolio, holdings, and
          executed transactions. No simulated
          performance figures are displayed.
        </span>

      </div>

    </div>
  );
}

export default Analytics;