import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Database,
  Layers3,
  RefreshCw,
  Server,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
  Zap,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

import {
  getPortfolio,
  getPortfolioHistory,
  getTransactions,
  getStocks,
  buyStock,
  sellStock,
} from "../api/api";

import "./Portfolio.css";

const AUTO_REFRESH_INTERVAL = 30000;

const PERFORMANCE_PERIODS = [
  "3M",
  "1Y",
  "2Y",
];

const formatMoney = (value) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(number);
};

const formatCompactMoney = (value) => {
  const number = Number(value || 0);

  if (number >= 10000000) {
    return `₹${(number / 10000000).toFixed(2)} Cr`;
  }

  if (number >= 100000) {
    return `₹${(number / 100000).toFixed(2)} L`;
  }

  if (number >= 1000) {
    return `₹${(number / 1000).toFixed(1)}K`;
  }

  return formatMoney(number);
};

const formatQuantity = (value) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 4,
  }).format(number);
};

const formatDate = (value) => {
  if (!value) return "--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatChartDate = (value, period) => {
  if (!value) return "--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  if (period === "2Y") {
    return date.toLocaleDateString("en-IN", {
      month: "short",
      year: "2-digit",
    });
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const getPercent = (value) => {
  const number = Number(value || 0);

  return `${number >= 0 ? "+" : ""}${number.toFixed(2)}%`;
};

const getInitials = (symbol) => {
  if (!symbol) return "ST";

  return symbol
    .replace(":NSE", "")
    .replace("-EQ", "")
    .slice(0, 2)
    .toUpperCase();
};

const normalizeSymbol = (symbol) => {
  return String(symbol || "")
    .toUpperCase()
    .replace(":NSE", "")
    .replace("-EQ", "")
    .trim();
};

const getChartPoint = (historyItem) => {
  return {
    date:
      historyItem?.timestamp ||
      historyItem?.capturedAt ||
      historyItem?.date,

    value: Number(
      historyItem?.totalValue ??
        historyItem?.portfolioValue ??
        historyItem?.value ??
        0
    ),

    invested: Number(
      historyItem?.totalInvested || 0
    ),

    profitLoss: Number(
      historyItem?.totalProfitLoss || 0
    ),
  };
};

function Portfolio() {
  const [portfolio, setPortfolio] = useState([]);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [stocks, setStocks] = useState([]);

  const [performanceHistory, setPerformanceHistory] =
    useState([]);

  const [performanceLoading, setPerformanceLoading] =
    useState(true);

  const [performanceError, setPerformanceError] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const [activePeriod, setActivePeriod] = useState("1Y");
  const [selectedHolding, setSelectedHolding] =
    useState(null);

  const [tradeType, setTradeType] = useState(null);
  const [tradeSymbol, setTradeSymbol] = useState("");
  const [tradeQuantity, setTradeQuantity] =
    useState("");
  const [tradeLoading, setTradeLoading] =
    useState(false);
  const [tradeMessage, setTradeMessage] =
    useState("");
  const [tradeError, setTradeError] =
    useState("");

  /*
   * LOAD PORTFOLIO
   */
  const loadPortfolio = useCallback(
    async (showLoader = false) => {
      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const [
          portfolioData,
          transactionData,
          stockData,
        ] = await Promise.all([
          getPortfolio(),
          getTransactions(),
          getStocks(),
        ]);

        const holdings =
          portfolioData?.portfolio?.holdings ||
          portfolioData?.holdings ||
          [];

        const cashBalance = Number(
          portfolioData?.balance ??
            portfolioData?.portfolio?.balance ??
            0
        );

        const normalizedTransactions =
          Array.isArray(transactionData)
            ? transactionData
            : Array.isArray(
                transactionData?.transactions
              )
            ? transactionData.transactions
            : [];

        const normalizedStocks =
          Array.isArray(stockData)
            ? stockData
            : Array.isArray(
                stockData?.stocks
              )
            ? stockData.stocks
            : [];

        setPortfolio(holdings);
        setBalance(cashBalance);
        setTransactions(
          normalizedTransactions
        );
        setStocks(normalizedStocks);
        setLastUpdated(new Date());
      } catch (err) {
        console.error(
          "Portfolio loading error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load portfolio. Please login and try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /*
   * LOAD PORTFOLIO PERFORMANCE HISTORY
   */
  const loadPerformanceHistory =
    useCallback(async () => {
      try {
        setPerformanceLoading(true);
        setPerformanceError("");

        const response =
          await getPortfolioHistory(
            activePeriod
          );

        const history =
          Array.isArray(response)
            ? response
            : Array.isArray(
                response?.history
              )
            ? response.history
            : [];

        setPerformanceHistory(
          history.map(getChartPoint)
        );
      } catch (err) {
        console.error(
          "Portfolio history loading error:",
          err
        );

        setPerformanceHistory([]);

        setPerformanceError(
          err?.message ||
            "Unable to load portfolio performance history."
        );
      } finally {
        setPerformanceLoading(false);
      }
    }, [activePeriod]);

  /*
   * INITIAL LOAD
   */
  useEffect(() => {
    loadPortfolio(true);
  }, [loadPortfolio]);

  /*
   * PERFORMANCE LOAD
   */
  useEffect(() => {
    loadPerformanceHistory();
  }, [loadPerformanceHistory]);

  /*
   * AUTO REFRESH
   */
  useEffect(() => {
    const interval = setInterval(() => {
      loadPortfolio(false);
      loadPerformanceHistory();
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [
    loadPortfolio,
    loadPerformanceHistory,
  ]);

  /*
   * LIVE STOCK LOOKUP
   */
  const stockMap = useMemo(() => {
    const map = new Map();

    stocks.forEach((stock) => {
      const symbol = normalizeSymbol(
        stock.symbol ||
          stock.tradingSymbol
      );

      if (!symbol) return;

      map.set(symbol, stock);
    });

    return map;
  }, [stocks]);

  /*
   * ENRICH HOLDINGS WITH LIVE ANGEL ONE PRICE
   */
  const holdings = useMemo(() => {
    return portfolio
      .map((holding) => {
        const symbol = normalizeSymbol(
          holding.symbol ||
            holding.tradingSymbol
        );

        const liveStock =
          stockMap.get(symbol);

        const quantity = Number(
          holding.quantity ??
            holding.shares ??
            0
        );

        const averagePrice = Number(
          holding.averagePrice ??
            holding.avgPrice ??
            holding.buyPrice ??
            holding.averageCost ??
            0
        );

        const currentPrice = Number(
          liveStock?.price ??
            liveStock?.currentPrice ??
            liveStock?.ltp ??
            liveStock?.close ??
            holding.currentPrice ??
            holding.price ??
            averagePrice ??
            0
        );

        const invested =
          quantity * averagePrice;

        const currentValue =
          quantity * currentPrice;

        const profitLoss =
          currentValue - invested;

        const returnPercent =
          invested > 0
            ? (profitLoss / invested) * 100
            : 0;

        return {
          ...holding,

          symbol:
            holding.symbol ||
            symbol,

          quantity,
          averagePrice,
          currentPrice,

          invested,
          currentValue,
          profitLoss,
          returnPercent,

          liveStock,
          isLive: Boolean(
            liveStock?.isLive
          ),
          dataSource:
            liveStock?.dataSource ||
            holding.dataSource ||
            "Portfolio",
          lastMarketUpdate:
            liveStock?.lastUpdated ||
            null,
        };
      })
      .filter(
        (holding) => holding.quantity > 0
      );
  }, [portfolio, stockMap]);

  /*
   * PORTFOLIO VALUATION
   */
  const totalValue = useMemo(() => {
    return holdings.reduce(
      (total, holding) =>
        total + holding.currentValue,
      0
    );
  }, [holdings]);

  const totalInvested = useMemo(() => {
    return holdings.reduce(
      (total, holding) =>
        total + holding.invested,
      0
    );
  }, [holdings]);

  const totalProfitLoss = useMemo(() => {
    return holdings.reduce(
      (total, holding) =>
        total + holding.profitLoss,
      0
    );
  }, [holdings]);

  const totalAccountValue =
    totalValue + balance;

  const profitPercent = useMemo(() => {
    if (!totalInvested) return 0;

    return (
      (totalProfitLoss /
        totalInvested) *
      100
    );
  }, [totalProfitLoss, totalInvested]);

  const profitableHoldings =
    holdings.filter(
      (holding) => holding.profitLoss >= 0
    );

  const losingHoldings =
    holdings.filter(
      (holding) => holding.profitLoss < 0
    );

  const buyTransactions =
    transactions.filter((transaction) => {
      const type = String(
        transaction.type ||
          transaction.action ||
          ""
      ).toUpperCase();

      return type === "BUY";
    });

  const sellTransactions =
    transactions.filter((transaction) => {
      const type = String(
        transaction.type ||
          transaction.action ||
          ""
      ).toUpperCase();

      return type === "SELL";
    });

  const allocation = useMemo(() => {
    return holdings
      .map((holding) => ({
        ...holding,

        percentage:
          totalValue > 0
            ? (holding.currentValue /
                totalValue) *
              100
            : 0,
      }))
      .sort(
        (a, b) =>
          b.currentValue -
          a.currentValue
      );
  }, [holdings, totalValue]);

  const allocationTotal =
    allocation.reduce(
      (sum, item) =>
        sum + item.percentage,
      0
    );

  const topHolding = holdings.length
    ? [...holdings].sort(
        (a, b) =>
          b.currentValue -
          a.currentValue
      )[0]
    : null;

  const averageHoldingValue =
    holdings.length > 0
      ? totalValue / holdings.length
      : 0;

  const isProfit = totalProfitLoss >= 0;

  /*
   * LIVE MARKET STATUS
   */
  const liveStockCount = stocks.filter(
    (stock) => stock.isLive
  ).length;

  const marketDataLive =
    stocks.length > 0 &&
    liveStockCount > 0;

  /*
   * PERFORMANCE CHART DATA
   */
  const chartPoints = useMemo(() => {
    return performanceHistory.filter(
      (point) =>
        Number.isFinite(point.value) &&
        point.value >= 0 &&
        point.date
    );
  }, [performanceHistory]);

  const chartStats = useMemo(() => {
    if (!chartPoints.length) {
      return {
        firstValue: 0,
        latestValue: totalValue,
        change: 0,
        changePercent: 0,
        highestValue: 0,
        lowestValue: 0,
      };
    }

    const firstValue =
      chartPoints[0].value;

    const latestValue =
      chartPoints[
        chartPoints.length - 1
      ].value;

    const change =
      latestValue - firstValue;

    const changePercent =
      firstValue > 0
        ? (change / firstValue) * 100
        : 0;

    const values = chartPoints.map(
      (point) => point.value
    );

    return {
      firstValue,
      latestValue,
      change,
      changePercent,
      highestValue: Math.max(
        ...values
      ),
      lowestValue: Math.min(
        ...values
      ),
    };
  }, [chartPoints, totalValue]);

  /*
   * CREATE SVG CHART PATH
   */
  const chartGeometry = useMemo(() => {
    if (chartPoints.length < 2) {
      return null;
    }

    const width = 1000;
    const height = 300;
    const paddingX = 8;
    const paddingY = 22;

    const values = chartPoints.map(
      (point) => point.value
    );

    const minValue = Math.min(
      ...values
    );

    const maxValue = Math.max(
      ...values
    );

    const range =
      maxValue - minValue;

    const safeRange =
      range === 0 ? 1 : range;

    const coordinates =
      chartPoints.map(
        (point, index) => {
          const x =
            paddingX +
            (index /
              (chartPoints.length - 1)) *
              (width -
                paddingX * 2);

          const y =
            height -
            paddingY -
            ((point.value -
              minValue) /
              safeRange) *
              (height -
                paddingY * 2);

          return {
            x,
            y,
            ...point,
          };
        }
      );

    const linePath = coordinates
      .map((point, index) => {
        return `${
          index === 0 ? "M" : "L"
        } ${point.x} ${point.y}`;
      })
      .join(" ");

    const areaPath = `${linePath} L ${width - paddingX} ${height - paddingY} L ${paddingX} ${height - paddingY} Z`;

    return {
      width,
      height,
      coordinates,
      linePath,
      areaPath,
      minValue,
      maxValue,
    };
  }, [chartPoints]);

  /*
   * PERFORMANCE CHART LABELS
   */
  const chartLabels = useMemo(() => {
    if (!chartPoints.length) {
      return [];
    }

    const indexes = [
      0,
      Math.floor(
        (chartPoints.length - 1) * 0.33
      ),
      Math.floor(
        (chartPoints.length - 1) * 0.66
      ),
      chartPoints.length - 1,
    ];

    return [
      ...new Set(indexes),
    ].map((index) => ({
      index,
      ...chartPoints[index],
    }));
  }, [chartPoints]);

  /*
   * TRADE MODALS
   */
  const openTradeModal = (
    type,
    holding
  ) => {
    setSelectedHolding(holding);
    setTradeType(type);

    setTradeSymbol(
      holding?.symbol || ""
    );

    setTradeQuantity("");
    setTradeMessage("");
    setTradeError("");
  };

  const openPortfolioBuyModal = () => {
    setSelectedHolding(null);
    setTradeType("BUY");
    setTradeSymbol("");
    setTradeQuantity("");
    setTradeMessage("");
    setTradeError("");
  };

  const closeTradeModal = () => {
    if (tradeLoading) return;

    setTradeType(null);
    setTradeSymbol("");
    setTradeQuantity("");
    setTradeMessage("");
    setTradeError("");
  };

  const selectedTradeStock = useMemo(() => {
    if (!tradeSymbol) return null;

    const normalized =
      normalizeSymbol(tradeSymbol);

    return (
      stockMap.get(normalized) ||
      null
    );
  }, [stockMap, tradeSymbol]);

  const tradeMarketPrice = Number(
    selectedTradeStock?.price ??
      selectedTradeStock?.currentPrice ??
      selectedTradeStock?.ltp ??
      selectedTradeStock?.close ??
      selectedHolding?.currentPrice ??
      selectedHolding?.price ??
      0
  );

  /*
   * BUY / SELL
   */
  const handleTrade = async () => {
    const symbol =
      tradeType === "BUY"
        ? normalizeSymbol(tradeSymbol)
        : normalizeSymbol(
            selectedHolding?.symbol
          );

    if (!tradeType || !symbol) {
      setTradeError(
        "Please select a stock."
      );
      return;
    }

    const quantity = Number(
      tradeQuantity
    );

    if (!quantity || quantity <= 0) {
      setTradeError(
        "Please enter a valid quantity."
      );
      return;
    }

    if (
      tradeType === "SELL" &&
      quantity >
        Number(
          selectedHolding?.quantity || 0
        )
    ) {
      setTradeError(
        `You only have ${formatQuantity(
          selectedHolding?.quantity
        )} shares available to sell.`
      );
      return;
    }

    if (
      tradeType === "BUY" &&
      !selectedTradeStock
    ) {
      setTradeError(
        "Selected stock is not available in the live market feed."
      );
      return;
    }

    if (
      tradeType === "BUY" &&
      tradeMarketPrice <= 0
    ) {
      setTradeError(
        "Live market price is unavailable. Please refresh and try again."
      );
      return;
    }

    try {
      setTradeLoading(true);
      setTradeError("");
      setTradeMessage("");

      let result;

      if (tradeType === "BUY") {
        result = await buyStock(
          symbol,
          quantity
        );
      } else {
        result = await sellStock(
          symbol,
          quantity
        );
      }

      setTradeMessage(
        result?.message ||
          `${tradeType} order completed successfully.`
      );

      await loadPortfolio(false);

      /*
       * Reload performance history after
       * a successful trade. The backend
       * snapshot engine may create a
       * new valuation point when the
       * portfolio is requested.
       */
      await loadPerformanceHistory();

      setTradeQuantity("");

      setTimeout(() => {
        setTradeType(null);
        setSelectedHolding(null);
        setTradeSymbol("");
        setTradeMessage("");
      }, 1200);
    } catch (err) {
      console.error(
        `${tradeType} error:`,
        err
      );

      setTradeError(
        err?.message ||
          `Unable to complete ${tradeType} order.`
      );
    } finally {
      setTradeLoading(false);
    }
  };

  /*
   * LOADING
   */
  if (loading) {
    return (
      <div className="portfolio-shell">
        <Sidebar />

        <main className="portfolio-main">
          <div className="portfolio-loading">
            <div className="portfolio-loading-orbit">
              <div className="portfolio-loading-core">
                M
              </div>
            </div>

            <div className="portfolio-loading-title">
              Loading portfolio
            </div>

            <div className="portfolio-loading-text">
              Syncing your holdings,
              live prices and
              transactions...
            </div>
          </div>
        </main>
      </div>
    );
  }

  /*
   * ERROR
   */
  if (error) {
    return (
      <div className="portfolio-shell">
        <Sidebar />

        <main className="portfolio-main">
          <div className="portfolio-error-state">
            <div className="portfolio-error-icon">
              !
            </div>

            <div className="portfolio-error-label">
              PORTFOLIO ERROR
            </div>

            <h2>
              Unable to load your portfolio
            </h2>

            <p>{error}</p>

            <button
              className="portfolio-primary-action"
              onClick={() =>
                loadPortfolio(true)
              }
            >
              <RefreshCw size={17} />
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="portfolio-shell">
      <Sidebar />

      <div className="portfolio-bg-orb portfolio-bg-orb-one" />
      <div className="portfolio-bg-orb portfolio-bg-orb-two" />

      <main className="portfolio-main">

        {/* TOP BAR */}
        <div className="portfolio-topbar">
          <div className="portfolio-breadcrumb">
            <span>MERIDIAN</span>
            <ChevronRight size={14} />
            <strong>Portfolio</strong>
          </div>

          <div className="portfolio-live-status">
            <span
              className={
                marketDataLive
                  ? "portfolio-live-dot"
                  : "portfolio-live-dot offline"
              }
            />

            {marketDataLive
              ? "LIVE MARKET DATA"
              : "MARKET DATA SYNCING"}
          </div>
        </div>

        {/* HEADER */}
        <section className="portfolio-header">
          <div>
            <div className="portfolio-eyebrow">
              <BriefcaseBusiness size={15} />
              WEALTH CENTER
            </div>

            <h1>Your Portfolio</h1>

            <p>
              Track your holdings,
              performance and capital
              allocation using live
              Angel One market data.
            </p>
          </div>

          <button
            className="portfolio-refresh-premium"
            onClick={() =>
              Promise.all([
                loadPortfolio(false),
                loadPerformanceHistory(),
              ])
            }
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "portfolio-refresh-icon refreshing"
                  : "portfolio-refresh-icon"
              }
            />

            {refreshing
              ? "Syncing..."
              : "Refresh"}
          </button>
        </section>

        {/* HERO */}
        <section className="portfolio-hero-card">
          <div className="portfolio-hero-content">
            <div className="portfolio-hero-left">
              <div className="portfolio-eyebrow">
                TOTAL PORTFOLIO VALUE
              </div>

              <div className="portfolio-hero-value">
                {formatMoney(totalValue)}
              </div>

              <div
                className={
                  isProfit
                    ? "portfolio-hero-change positive"
                    : "portfolio-hero-change negative"
                }
              >
                {isProfit ? (
                  <TrendingUp size={18} />
                ) : (
                  <TrendingDown size={18} />
                )}

                <span>
                  {formatMoney(
                    Math.abs(
                      totalProfitLoss
                    )
                  )}
                </span>

                <span>
                  ({getPercent(
                    profitPercent
                  )})
                </span>

                <span>
                  overall return
                </span>
              </div>
            </div>

            <div className="portfolio-hero-stats">
              <div className="portfolio-hero-stat">
                <span>Invested</span>

                <strong>
                  {formatCompactMoney(
                    totalInvested
                  )}
                </strong>
              </div>

              <div className="portfolio-hero-stat">
                <span>Cash Balance</span>

                <strong>
                  {formatCompactMoney(
                    balance
                  )}
                </strong>
              </div>

              <div className="portfolio-hero-stat">
                <span>Account Value</span>

                <strong>
                  {formatCompactMoney(
                    totalAccountValue
                  )}
                </strong>
              </div>

              <div className="portfolio-hero-stat">
                <span>Positions</span>

                <strong>
                  {holdings.length}
                </strong>
              </div>
            </div>
          </div>

          <div className="portfolio-hero-footer">
            <div>
              <Activity size={15} />

              {marketDataLive
                ? "Angel One market monitor active"
                : "Market data connection syncing"}
            </div>

            <div>
              Last synced{" "}
              {lastUpdated
                ? formatDateTime(
                    lastUpdated
                  )
                : "--"}
            </div>
          </div>
        </section>

        {/* SUMMARY */}
        <section className="portfolio-summary-grid">

          <div className="portfolio-summary-card">
            <div className="portfolio-summary-icon">
              <Wallet size={19} />
            </div>

            <div>
              <span>Cash Available</span>

              <strong>
                {formatMoney(balance)}
              </strong>
            </div>

            <ArrowUpRight className="portfolio-summary-arrow" />
          </div>

          <div className="portfolio-summary-card">
            <div className="portfolio-summary-icon">
              <CircleDollarSign size={19} />
            </div>

            <div>
              <span>Invested Capital</span>

              <strong>
                {formatMoney(
                  totalInvested
                )}
              </strong>
            </div>

            <ArrowUpRight className="portfolio-summary-arrow" />
          </div>

          <div className="portfolio-summary-card">
            <div className="portfolio-summary-icon">
              {isProfit ? (
                <TrendingUp size={19} />
              ) : (
                <TrendingDown size={19} />
              )}
            </div>

            <div>
              <span>Total Return</span>

              <strong
                className={
                  isProfit
                    ? "positive-text"
                    : "negative-text"
                }
              >
                {formatMoney(
                  totalProfitLoss
                )}
              </strong>
            </div>

            {isProfit ? (
              <ArrowUpRight className="portfolio-summary-arrow" />
            ) : (
              <ArrowDownRight className="portfolio-summary-arrow" />
            )}
          </div>

          <div className="portfolio-summary-card">
            <div className="portfolio-summary-icon">
              <Layers3 size={19} />
            </div>

            <div>
              <span>Average Position</span>

              <strong>
                {formatCompactMoney(
                  averageHoldingValue
                )}
              </strong>
            </div>

            <ArrowUpRight className="portfolio-summary-arrow" />
          </div>

        </section>

        {/* INSIGHTS */}
        <section className="portfolio-insights-grid">

          <div className="portfolio-insight-card">
            <div className="portfolio-insight-icon">
              <Sparkles size={17} />
            </div>

            <div>
              <span>Top Position</span>

              <strong>
                {topHolding
                  ? topHolding.symbol
                  : "No holdings"}
              </strong>

              <small>
                {topHolding
                  ? formatCompactMoney(
                      topHolding.currentValue
                    )
                  : "Start investing to build your portfolio"}
              </small>
            </div>
          </div>

          <div className="portfolio-insight-card">
            <div className="portfolio-insight-icon">
              <TrendingUp size={17} />
            </div>

            <div>
              <span>
                Profitable Positions
              </span>

              <strong>
                {profitableHoldings.length}
              </strong>

              <small>
                of {holdings.length} active
                positions
              </small>
            </div>
          </div>

          <div className="portfolio-insight-card">
            <div className="portfolio-insight-icon">
              <TrendingDown size={17} />
            </div>

            <div>
              <span>
                Underperforming
              </span>

              <strong>
                {losingHoldings.length}
              </strong>

              <small>
                positions currently
                negative
              </small>
            </div>
          </div>

          <div className="portfolio-insight-card">
            <div className="portfolio-insight-icon">
              <Zap size={17} />
            </div>

            <div>
              <span>
                Trading Activity
              </span>

              <strong>
                {transactions.length}
              </strong>

              <small>
                recorded transactions
              </small>
            </div>
          </div>

        </section>

        {/* PERFORMANCE */}
        <section className="portfolio-performance-panel portfolio-panel">

          <div className="portfolio-section-heading">
            <div>
              <div className="portfolio-eyebrow">
                <BarChart3 size={15} />
                PERFORMANCE
              </div>

              <h2>
                Portfolio Performance
              </h2>

              <p>
                Historical portfolio
                valuation captured from
                your live Meridian account.
              </p>
            </div>

            <div className="portfolio-period-switcher">
              {PERFORMANCE_PERIODS.map(
                (period) => (
                  <button
                    key={period}
                    className={
                      activePeriod ===
                      period
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setActivePeriod(
                        period
                      )
                    }
                    disabled={
                      performanceLoading
                    }
                  >
                    {period}
                  </button>
                )
              )}
            </div>
          </div>

          {/* PERFORMANCE SUMMARY */}
          <div className="performance-metrics">

            <div className="performance-metric">
              <span>PERIOD VALUE</span>

              <strong>
                {formatCompactMoney(
                  chartStats.latestValue
                )}
              </strong>
            </div>

            <div className="performance-metric">
              <span>PERIOD CHANGE</span>

              <strong
                className={
                  chartStats.change >= 0
                    ? "positive-text"
                    : "negative-text"
                }
              >
                {formatMoney(
                  Math.abs(
                    chartStats.change
                  )
                )}
              </strong>

              <small
                className={
                  chartStats.change >= 0
                    ? "positive-text"
                    : "negative-text"
                }
              >
                {getPercent(
                  chartStats.changePercent
                )}
              </small>
            </div>

            <div className="performance-metric">
              <span>HIGH</span>

              <strong>
                {formatCompactMoney(
                  chartStats.highestValue
                )}
              </strong>
            </div>

            <div className="performance-metric">
              <span>LOW</span>

              <strong>
                {formatCompactMoney(
                  chartStats.lowestValue
                )}
              </strong>
            </div>

          </div>

          {/* CHART */}
          {performanceLoading ? (
            <div className="performance-chart-loading">
              <div className="performance-chart-loading-line" />

              <div>
                <RefreshCw
                  size={18}
                  className="portfolio-refresh-icon refreshing"
                />

                Loading valuation history...
              </div>
            </div>
          ) : performanceError ? (
            <div className="performance-unavailable-card">
              <div className="performance-unavailable-icon">
                <Activity size={25} />
              </div>

              <div>
                <span className="performance-unavailable-badge">
                  HISTORY UNAVAILABLE
                </span>

                <h3>
                  Unable to load performance history
                </h3>

                <p>
                  {performanceError}
                </p>

                <button
                  className="portfolio-primary-action"
                  onClick={
                    loadPerformanceHistory
                  }
                >
                  <RefreshCw size={16} />
                  Retry
                </button>
              </div>
            </div>
          ) : chartPoints.length < 2 ? (
            <div className="performance-unavailable-card">
              <div className="performance-unavailable-icon">
                <Activity size={25} />
              </div>

              <div>
                <span className="performance-unavailable-badge">
                  BUILDING HISTORY
                </span>

                <h3>
                  Your performance chart is
                  being built
                </h3>

                <p>
                  Meridian automatically
                  stores portfolio valuation
                  snapshots while you use the
                  dashboard. Once at least two
                  snapshots are available,
                  your {activePeriod} performance
                  curve will appear here.
                </p>

                <div className="performance-history-status">
                  <span>
                    {chartPoints.length}
                  </span>

                  valuation snapshot
                  {chartPoints.length === 1
                    ? ""
                    : "s"} recorded
                </div>
              </div>
            </div>
          ) : (
            <div className="performance-chart-shell">

              <div className="performance-chart-value-labels">
                <span>
                  {formatCompactMoney(
                    chartGeometry.maxValue
                  )}
                </span>

                <span>
                  {formatCompactMoney(
                    (chartGeometry.maxValue +
                      chartGeometry.minValue) /
                      2
                  )}
                </span>

                <span>
                  {formatCompactMoney(
                    chartGeometry.minValue
                  )}
                </span>
              </div>

              <div className="performance-chart">

                <div className="performance-chart-grid">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <svg
                  viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`}
                  preserveAspectRatio="none"
                  className="performance-svg"
                >
                  <defs>
                    <linearGradient
                      id="portfolioPerformanceFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="rgba(32, 212, 147, 0.28)"
                      />

                      <stop
                        offset="100%"
                        stopColor="rgba(32, 212, 147, 0)"
                      />
                    </linearGradient>
                  </defs>

                  <path
                    d={
                      chartGeometry.areaPath
                    }
                    fill="url(#portfolioPerformanceFill)"
                  />

                  <path
                    d={
                      chartGeometry.linePath
                    }
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="performance-chart-line"
                  />

                  {chartGeometry.coordinates.map(
                    (point, index) => {
                      const shouldShowDot =
                        index ===
                          0 ||
                        index ===
                          chartGeometry
                            .coordinates
                            .length -
                            1 ||
                        index %
                          Math.max(
                            1,
                            Math.floor(
                              chartGeometry
                                .coordinates
                                .length /
                                8
                            )
                          ) ===
                          0;

                      if (!shouldShowDot) {
                        return null;
                      }

                      return (
                        <circle
                          key={`${point.date}-${index}`}
                          cx={point.x}
                          cy={point.y}
                          r="4"
                          className="performance-chart-point"
                        />
                      );
                    }
                  )}
                </svg>

                <div className="performance-chart-hover-layer">
                  {chartGeometry.coordinates.map(
                    (point, index) => (
                      <div
                        key={`${point.date}-hover-${index}`}
                        className="performance-chart-hover-point"
                        style={{
                          left: `${
                            (point.x /
                              chartGeometry.width) *
                            100
                          }%`,
                          top: `${
                            (point.y /
                              chartGeometry.height) *
                            100
                          }%`,
                        }}
                      >
                        <div className="performance-chart-tooltip">
                          <strong>
                            {formatMoney(
                              point.value
                            )}
                          </strong>

                          <span>
                            {formatChartDate(
                              point.date,
                              activePeriod
                            )}
                          </span>

                          <small>
                            P/L{" "}
                            {formatMoney(
                              point.profitLoss
                            )}
                          </small>
                        </div>
                      </div>
                    )
                  )}
                </div>

              </div>

              <div className="performance-chart-axis">
                {chartLabels.map(
                  (label) => (
                    <span
                      key={`${label.date}-${label.index}`}
                    >
                      {formatChartDate(
                        label.date,
                        activePeriod
                      )}
                    </span>
                  )
                )}
              </div>

              <div className="performance-chart-footer">
                <div>
                  <span className="performance-legend-dot" />

                  Portfolio Value
                </div>

                <div>
                  {chartPoints.length} snapshots
                </div>

                <div>
                  Source: MongoDB PortfolioHistory
                </div>
              </div>

            </div>
          )}

        </section>

        {/* MAIN GRID */}
        <section className="portfolio-main-grid">

          {/* HOLDINGS */}
          <div className="portfolio-panel">

            <div className="portfolio-panel-header">
              <div>
                <div className="portfolio-eyebrow">
                  <BriefcaseBusiness size={14} />
                  POSITIONS
                </div>

                <h2>Your Holdings</h2>
              </div>

              <span className="portfolio-panel-count">
                {holdings.length} positions
              </span>
            </div>

            {holdings.length === 0 ? (
              <div className="portfolio-empty-state">

                <div className="portfolio-empty-icon">
                  <BriefcaseBusiness size={24} />
                </div>

                <h3>
                  No holdings yet
                </h3>

                <p>
                  Your purchased stocks will
                  appear here once you make
                  your first trade.
                </p>

                <button
                  className="portfolio-primary-action"
                  onClick={
                    openPortfolioBuyModal
                  }
                >
                  <ShoppingCart size={17} />
                  Start Investing
                </button>

              </div>
            ) : (
              <div className="portfolio-table-wrap">
                <table className="portfolio-table">

                  <thead>
                    <tr>
                      <th>STOCK</th>
                      <th>QTY</th>
                      <th>AVG. PRICE</th>
                      <th>MARKET VALUE</th>
                      <th>RETURN</th>
                      <th />
                    </tr>
                  </thead>

                  <tbody>
                    {holdings.map(
                      (holding) => {
                        const positive =
                          holding.profitLoss >=
                          0;

                        return (
                          <tr
                            key={
                              holding.symbol
                            }
                            className="portfolio-table-row"
                            onClick={() =>
                              setSelectedHolding(
                                holding
                              )
                            }
                          >
                            <td>
                              <div className="portfolio-stock-cell">

                                <div className="portfolio-stock-avatar">
                                  {getInitials(
                                    holding.symbol
                                  )}
                                </div>

                                <div>
                                  <strong>
                                    {
                                      holding.symbol
                                    }
                                  </strong>

                                  <span>
                                    NSE • Equity
                                    {holding.isLive
                                      ? " • LIVE"
                                      : ""}
                                  </span>
                                </div>

                              </div>
                            </td>

                            <td>
                              {formatQuantity(
                                holding.quantity
                              )}
                            </td>

                            <td>
                              {formatMoney(
                                holding.averagePrice
                              )}
                            </td>

                            <td>
                              <strong>
                                {formatMoney(
                                  holding.currentValue
                                )}
                              </strong>

                              <span className="table-subvalue">
                                @{" "}
                                {formatMoney(
                                  holding.currentPrice
                                )}
                              </span>
                            </td>

                            <td>
                              <div
                                className={
                                  positive
                                    ? "portfolio-return-cell positive"
                                    : "portfolio-return-cell negative"
                                }
                              >
                                {positive ? (
                                  <ArrowUpRight size={15} />
                                ) : (
                                  <ArrowDownRight size={15} />
                                )}

                                <div>
                                  <strong>
                                    {formatMoney(
                                      Math.abs(
                                        holding.profitLoss
                                      )
                                    )}
                                  </strong>

                                  <span>
                                    {getPercent(
                                      holding.returnPercent
                                    )}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <ChevronRight
                                className="portfolio-row-arrow"
                                size={18}
                              />
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>

                </table>
              </div>
            )}

          </div>

          {/* ALLOCATION */}
          <div className="portfolio-panel">

            <div className="portfolio-panel-header">
              <div>
                <div className="portfolio-eyebrow">
                  <Layers3 size={14} />
                  ALLOCATION
                </div>

                <h2>
                  Capital Distribution
                </h2>
              </div>
            </div>

            {allocation.length === 0 ? (
              <div className="portfolio-empty-state">

                <div className="portfolio-empty-icon">
                  <Layers3 size={24} />
                </div>

                <h3>
                  No allocation data
                </h3>

                <p>
                  Buy stocks to see your
                  capital distribution.
                </p>

              </div>
            ) : (
              <div className="allocation-list">

                {allocation.map(
                  (item, index) => (
                    <div
                      className={
                        index === 0
                          ? "allocation-item allocation-highlight"
                          : "allocation-item"
                      }
                      key={item.symbol}
                    >

                      <div className="allocation-item-top">

                        <div className="portfolio-stock-cell">

                          <div className="portfolio-stock-avatar">
                            {getInitials(
                              item.symbol
                            )}
                          </div>

                          <div>
                            <strong>
                              {item.symbol}
                            </strong>

                            <span>
                              {formatCompactMoney(
                                item.currentValue
                              )}
                            </span>
                          </div>

                        </div>

                        <strong>
                          {item.percentage.toFixed(
                            1
                          )}
                          %
                        </strong>

                      </div>

                      <div className="allocation-bar">
                        <span
                          style={{
                            width: `${Math.min(
                              item.percentage,
                              100
                            )}%`,
                          }}
                        />
                      </div>

                    </div>
                  )
                )}

                <div className="allocation-total">
                  <span>
                    Total Allocation
                  </span>

                  <strong>
                    {allocationTotal.toFixed(
                      1
                    )}
                    %
                  </strong>
                </div>

              </div>
            )}

          </div>

        </section>

        {/* TRANSACTIONS */}
        <section className="portfolio-panel transactions-panel">

          <div className="portfolio-panel-header">

            <div>
              <div className="portfolio-eyebrow">
                <Clock3 size={14} />
                ACTIVITY
              </div>

              <h2>
                Transaction History
              </h2>
            </div>

            <div className="transaction-summary">

              <span>
                BUY{" "}
                <strong>
                  {buyTransactions.length}
                </strong>
              </span>

              <span>
                SELL{" "}
                <strong>
                  {sellTransactions.length}
                </strong>
              </span>

            </div>

          </div>

          {transactions.length === 0 ? (
            <div className="portfolio-empty-state">

              <div className="portfolio-empty-icon">
                <Clock3 size={24} />
              </div>

              <h3>
                No transactions yet
              </h3>

              <p>
                Your trading activity will
                appear here.
              </p>

            </div>
          ) : (
            <div className="portfolio-table-wrap">

              <table className="portfolio-table">

                <thead>
                  <tr>
                    <th>TYPE</th>
                    <th>STOCK</th>
                    <th>QTY</th>
                    <th>PRICE</th>
                    <th>TOTAL</th>
                    <th>DATE</th>
                  </tr>
                </thead>

                <tbody>

                  {transactions
                    .slice(0, 10)
                    .map(
                      (
                        transaction,
                        index
                      ) => {
                        const type =
                          String(
                            transaction.type ||
                              transaction.action ||
                              ""
                          ).toUpperCase();

                        const isBuy =
                          type === "BUY";

                        const quantity =
                          Number(
                            transaction.quantity ||
                              0
                          );

                        const price =
                          Number(
                            transaction.price ||
                              0
                          );

                        const total =
                          Number(
                            transaction.total ??
                              transaction.totalAmount ??
                              quantity *
                                price
                          );

                        return (
                          <tr
                            className="portfolio-table-row"
                            key={
                              transaction._id ||
                              transaction.id ||
                              index
                            }
                          >

                            <td>
                              <span
                                className={
                                  isBuy
                                    ? "transaction-type buy"
                                    : "transaction-type sell"
                                }
                              >
                                {isBuy ? (
                                  <ArrowUpRight size={14} />
                                ) : (
                                  <ArrowDownRight size={14} />
                                )}

                                {isBuy
                                  ? "BUY"
                                  : "SELL"}
                              </span>
                            </td>

                            <td>
                              <div className="portfolio-stock-cell">

                                <div className="portfolio-stock-avatar">
                                  {getInitials(
                                    transaction.symbol
                                  )}
                                </div>

                                <strong>
                                  {
                                    transaction.symbol
                                  }
                                </strong>

                              </div>
                            </td>

                            <td>
                              {formatQuantity(
                                quantity
                              )}
                            </td>

                            <td>
                              {formatMoney(
                                price
                              )}
                            </td>

                            <td>
                              <strong>
                                {formatMoney(
                                  total
                                )}
                              </strong>
                            </td>

                            <td>
                              <span className="transaction-date">
                                {formatDate(
                                  transaction.createdAt ||
                                    transaction.date
                                )}
                              </span>
                            </td>

                          </tr>
                        );
                      }
                    )}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* FOOTER */}
        <footer className="portfolio-footer">

          <div>
            <ShieldCheck size={15} />
            Secured with JWT authentication
          </div>

          <div>
            <Database size={14} />
            MongoDB connected
          </div>

          <div>
            <Server size={14} />
            {marketDataLive
              ? "Angel One market feed live"
              : "Meridian API online"}
          </div>

        </footer>

      </main>

      {/* HOLDING DETAIL MODAL */}
      {selectedHolding &&
        !tradeType && (
          <div
            className="portfolio-modal-backdrop"
            onClick={() =>
              setSelectedHolding(null)
            }
          >
            <div
              className="portfolio-holding-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div className="portfolio-modal-top">

                <div className="portfolio-modal-stock">

                  <div className="portfolio-modal-avatar">
                    {getInitials(
                      selectedHolding.symbol
                    )}
                  </div>

                  <div>
                    <span>
                      POSITION
                    </span>

                    <h2>
                      {selectedHolding.symbol}
                    </h2>
                  </div>

                </div>

                <button
                  className="portfolio-modal-close"
                  onClick={() =>
                    setSelectedHolding(null)
                  }
                >
                  <X size={18} />
                </button>

              </div>

              <div className="portfolio-modal-price">

                <span>
                  Current Market Value
                </span>

                <strong>
                  {formatMoney(
                    selectedHolding.currentValue
                  )}
                </strong>

              </div>

              <div className="portfolio-modal-grid">

                <div>
                  <span>Quantity</span>

                  <strong>
                    {formatQuantity(
                      selectedHolding.quantity
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Average Price
                  </span>

                  <strong>
                    {formatMoney(
                      selectedHolding.averagePrice
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Current Price
                  </span>

                  <strong>
                    {formatMoney(
                      selectedHolding.currentPrice
                    )}
                  </strong>
                </div>

                <div>
                  <span>Return</span>

                  <strong
                    className={
                      selectedHolding.profitLoss >=
                      0
                        ? "positive-text"
                        : "negative-text"
                    }
                  >
                    {formatMoney(
                      selectedHolding.profitLoss
                    )}
                  </strong>
                </div>

              </div>

              <div className="portfolio-trade-actions">

                <button
                  className="portfolio-buy-button"
                  onClick={() =>
                    openTradeModal(
                      "BUY",
                      selectedHolding
                    )
                  }
                >
                  <ShoppingCart size={17} />
                  Buy More
                </button>

                <button
                  className="portfolio-sell-button"
                  onClick={() =>
                    openTradeModal(
                      "SELL",
                      selectedHolding
                    )
                  }
                >
                  <ArrowDownRight size={17} />
                  Sell
                </button>

              </div>

              <div className="portfolio-modal-footer">
                <span>
                  {selectedHolding.isLive
                    ? "Live price from Angel One"
                    : "Latest available price"}
                </span>
              </div>

            </div>
          </div>
        )}

      {/* BUY / SELL MODAL */}
      {tradeType && (
        <div
          className="portfolio-modal-backdrop trade-modal-layer"
          onClick={closeTradeModal}
        >
          <div
            className="portfolio-trade-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="trade-modal-header">

              <div>
                <span className="trade-modal-kicker">
                  MERIDIAN ORDER DESK
                </span>

                <h2>
                  {tradeType === "BUY"
                    ? "Buy Stock"
                    : "Sell Stock"}
                </h2>
              </div>

              <button
                className="portfolio-modal-close"
                onClick={closeTradeModal}
                disabled={tradeLoading}
              >
                <X size={18} />
              </button>

            </div>

            {/* STOCK SELECTOR */}
            {tradeType === "BUY" &&
              !selectedHolding && (
                <div className="trade-stock-selector">

                  <label>
                    SELECT STOCK
                  </label>

                  <select
                    value={tradeSymbol}
                    onChange={(event) => {
                      setTradeSymbol(
                        event.target.value
                      );

                      setTradeError("");
                    }}
                    disabled={tradeLoading}
                  >
                    <option value="">
                      Choose a stock
                    </option>

                    {stocks
                      .filter(
                        (stock) =>
                          stock.isLive !== false
                      )
                      .map((stock) => (
                        <option
                          key={stock.symbol}
                          value={stock.symbol}
                        >
                          {stock.symbol}
                          {" — ₹"}
                          {Number(
                            stock.price ||
                              stock.currentPrice ||
                              stock.ltp ||
                              stock.close ||
                              0
                          ).toFixed(2)}
                        </option>
                      ))}

                  </select>

                </div>
              )}

            {/* STOCK PREVIEW */}
            {(selectedHolding ||
              tradeSymbol) && (
              <div className="trade-stock-preview">

                <div className="portfolio-modal-avatar">
                  {getInitials(
                    selectedHolding?.symbol ||
                      tradeSymbol
                  )}
                </div>

                <div>
                  <strong>
                    {selectedHolding?.symbol ||
                      tradeSymbol}
                  </strong>

                  <span>
                    NSE • Equity
                    {selectedTradeStock?.isLive
                      ? " • LIVE"
                      : ""}
                  </span>
                </div>

                <div className="trade-current-price">

                  <span>
                    Market Price
                  </span>

                  <strong>
                    {tradeMarketPrice > 0
                      ? formatMoney(
                          tradeMarketPrice
                        )
                      : "--"}
                  </strong>

                </div>

              </div>
            )}

            <div className="trade-form">

              <label htmlFor="tradeQuantity">
                QUANTITY
              </label>

              <input
                id="tradeQuantity"
                type="number"
                min="1"
                step="1"
                value={tradeQuantity}
                onChange={(event) => {
                  setTradeQuantity(
                    event.target.value
                  );

                  setTradeError("");
                  setTradeMessage("");
                }}
                placeholder="Enter quantity"
                disabled={tradeLoading}
                autoFocus
              />

              {tradeType === "SELL" &&
                selectedHolding && (
                  <div className="trade-available">
                    Available shares:{" "}
                    <strong>
                      {formatQuantity(
                        selectedHolding.quantity
                      )}
                    </strong>
                  </div>
                )}

              <div className="trade-estimate">

                <span>
                  Estimated Order Value
                </span>

                <strong>
                  {formatMoney(
                    Number(
                      tradeQuantity || 0
                    ) *
                      tradeMarketPrice
                  )}
                </strong>

              </div>

              {tradeError && (
                <div className="trade-error">
                  {tradeError}
                </div>
              )}

              {tradeMessage && (
                <div className="trade-success">
                  {tradeMessage}
                </div>
              )}

              <button
                className={
                  tradeType === "BUY"
                    ? "trade-submit-button buy"
                    : "trade-submit-button sell"
                }
                onClick={handleTrade}
                disabled={
                  tradeLoading ||
                  Boolean(
                    tradeMessage
                  )
                }
              >

                {tradeLoading ? (
                  <>
                    <RefreshCw
                      size={17}
                      className="portfolio-refresh-icon refreshing"
                    />

                    Processing...
                  </>
                ) : (
                  <>
                    {tradeType === "BUY" ? (
                      <ShoppingCart size={17} />
                    ) : (
                      <ArrowDownRight size={17} />
                    )}

                    Confirm {tradeType}
                  </>
                )}

              </button>

              <div className="trade-security-note">
                <ShieldCheck size={14} />

                Order secured through
                Meridian authentication
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Portfolio;