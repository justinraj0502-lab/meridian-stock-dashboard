import {
  Search,
  Circle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";

import {
  getStocks,
  getPortfolio,
  buyStock,
  sellStock,
  getStockHistory,
} from "../api/api";

import "./Dashboard.css";


/* =========================================
   ALLOCATION COLORS
   ========================================= */

const allocationColors = [
  "#8ec9f0",
  "#7ee29a",
  "#929be8",
  "#f19a8e",
  "#f2c47e",
  "#b99bea",
];


/* =========================================
   CHART RANGE
   ========================================= */

const CHART_RANGES = [
  {
    label: "3M",
    interval: "1day",
  },
  {
    label: "1Y",
    interval: "1week",
  },
  {
    label: "2Y",
    interval: "1month",
  },
];


/* =========================================
   AUTO REFRESH
   ========================================= */

const AUTO_REFRESH_INTERVAL = 30000;


/* =========================================
   FORMATTERS
   ========================================= */

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


function formatCompactMoney(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "₹0";
  }

  return `₹${number.toLocaleString("en-IN", {
    maximumFractionDigits: 1,
  })}`;
}


function formatQuoteTime(value) {
  if (!value) {
    return "Unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}


function getChangePercent(stock) {
  if (!stock) {
    return 0;
  }

  const changePercent = Number(stock.changePercent);

  if (Number.isFinite(changePercent)) {
    return changePercent;
  }

  return 0;
}


function getChangeAmount(stock) {
  if (!stock) {
    return 0;
  }

  const change = Number(stock.change);

  if (Number.isFinite(change)) {
    return change;
  }

  const price = Number(stock.price) || 0;
  const percent = getChangePercent(stock);

  return price * (percent / 100);
}


function getDataLabel(stock) {
  if (!stock) {
    return "Market data";
  }

  if (stock.isLive) {
    return "Live quote";
  }

  return "Last known";
}


function getMarketLabel(stocks) {
  if (!stocks?.length) {
    return "Market data unavailable";
  }

  const liveStocks = stocks.filter(
    (stock) => stock.isLive
  );

  const marketOpen = stocks.some(
    (stock) => stock.isMarketOpen
  );

  if (liveStocks.length > 0 && marketOpen) {
    return "Market open";
  }

  if (liveStocks.length > 0) {
    return "Live quotes";
  }

  return "Last known prices";
}


/* =========================================
   DASHBOARD
   ========================================= */

function Dashboard() {
  /* =======================================
     MARKET DATA
     ======================================= */

  const [stocks, setStocks] = useState([]);

  const [portfolio, setPortfolio] =
    useState(null);

  const [balance, setBalance] =
    useState(0);


  /* =======================================
     CHART
     ======================================= */

  const [chartData, setChartData] =
    useState([]);

  const [chartInterval, setChartInterval] =
    useState("1day");

  const [chartLoading, setChartLoading] =
    useState(false);

  const [chartError, setChartError] =
    useState("");

  const [chartRestricted, setChartRestricted] =
    useState(false);

  const [selectedSymbol, setSelectedSymbol] =
    useState("");


  /* =======================================
     SEARCH
     ======================================= */

  const [search, setSearch] =
    useState("");


  /* =======================================
     DASHBOARD STATE
     ======================================= */

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [tradeLoading, setTradeLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [lastUpdated, setLastUpdated] =
    useState(null);


  /* =======================================
     FORMAT CHART DATE
     ======================================= */

  const formatChartDate = (
    date,
    interval
  ) => {
    if (!date) {
      return "";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    if (interval === "1month") {
      return parsed.toLocaleDateString(
        "en-IN",
        {
          month: "short",
          year: "2-digit",
        }
      );
    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
      }
    );
  };


  /* =======================================
     LOAD CHART DATA
     ======================================= */

  const loadChartData = async (
    symbol,
    interval
  ) => {
    if (!symbol) {
      return;
    }

    try {
      setChartLoading(true);
      setChartError("");
      setChartRestricted(false);
      setChartData([]);

      const data =
        await getStockHistory(
          symbol,
          interval
        );

      if (data?.restricted) {
        setChartRestricted(true);
        return;
      }

      if (
        !data?.history ||
        !Array.isArray(data.history)
      ) {
        throw new Error(
          "Invalid chart data received from server."
        );
      }

      const formatted =
        data.history
          .map((item) => ({
            ...item,
            close: Number(item.close),
            displayDate:
              formatChartDate(
                item.date,
                interval
              ),
          }))
          .filter((item) =>
            Number.isFinite(item.close)
          );

      setChartData(formatted);
    } catch (err) {
      console.error(
        "Chart error:",
        err
      );

      setChartError(
        err?.message ||
          "Unable to load chart history."
      );

      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  };


  /* =======================================
     LOAD DASHBOARD DATA
     ======================================= */

  const loadDashboard = async (
    showLoader = true
  ) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const [
        stocksData,
        portfolioData,
      ] = await Promise.all([
        getStocks(),
        getPortfolio(),
      ]);

      const stockList =
        Array.isArray(stocksData)
          ? stocksData
          : [];

      setStocks(stockList);

      setPortfolio(
        portfolioData?.portfolio ||
          null
      );

      setBalance(
        Number(
          portfolioData?.balance
        ) || 0
      );

      if (stockList.length > 0) {
        setSelectedSymbol(
          (current) => {
            const exists =
              stockList.some(
                (stock) =>
                  stock.symbol === current
              );

            if (exists) {
              return current;
            }

            const preferredStock =
              stockList.find(
                (stock) =>
                  stock.symbol === "INFY"
              ) ||
              stockList[0];

            return (
              preferredStock?.symbol ||
              ""
            );
          }
        );
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error(
        "Dashboard loading error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load dashboard."
      );
    } finally {
      if (showLoader) {
        setLoading(false);
      }

      setRefreshing(false);
    }
  };


  /* =======================================
     INITIAL LOAD
     ======================================= */

  useEffect(() => {
    loadDashboard(true);
  }, []);


  /* =======================================
     CHART LOAD
     ======================================= */

  useEffect(() => {
    if (!selectedSymbol) {
      return;
    }

    loadChartData(
      selectedSymbol,
      chartInterval
    );
  }, [
    selectedSymbol,
    chartInterval,
  ]);


  /* =======================================
     AUTO REFRESH
     ======================================= */

  useEffect(() => {
    const interval =
      setInterval(() => {
        if (
          !loading &&
          !refreshing &&
          !tradeLoading
        ) {
          loadDashboard(false);
        }
      }, AUTO_REFRESH_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [
    loading,
    refreshing,
    tradeLoading,
  ]);


  /* =======================================
     MANUAL REFRESH
     ======================================= */

  const handleRefresh = async () => {
    if (
      refreshing ||
      loading
    ) {
      return;
    }

    setRefreshing(true);

    await loadDashboard(false);

    setRefreshing(false);
  };


  /* =======================================
     SELECTED STOCK
     ======================================= */

  const selectedStock =
    stocks.find(
      (stock) =>
        stock.symbol ===
        selectedSymbol
    ) || stocks[0];


  /* =======================================
     SEARCH RESULTS
     ======================================= */

  const searchResults =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return [];
      }

      return stocks.filter(
        (stock) =>
          stock.symbol
            .toLowerCase()
            .includes(value) ||
          stock.name
            .toLowerCase()
            .includes(value)
      );
    }, [
      search,
      stocks,
    ]);


  /* =======================================
     ALLOCATION
     ======================================= */

  const allocationData =
    useMemo(() => {
      if (
        !portfolio?.holdings?.length
      ) {
        return [];
      }

      const total =
        portfolio.holdings.reduce(
          (sum, holding) =>
            sum +
            Number(
              holding.currentValue || 0
            ),
          0
        );

      if (total <= 0) {
        return [];
      }

      return portfolio.holdings.map(
        (holding) => ({
          name: holding.symbol,
          value:
            (Number(
              holding.currentValue || 0
            ) /
              total) *
            100,
        })
      );
    }, [portfolio]);


  /* =======================================
     BUY
     ======================================= */

  const handleBuy = async () => {
    if (!selectedStock) {
      return;
    }

    const quantity =
      window.prompt(
        `How many ${selectedStock.symbol} shares do you want to buy?`
      );

    if (
      quantity === null ||
      quantity.trim() === ""
    ) {
      return;
    }

    const numericQuantity =
      Number(quantity);

    if (
      !Number.isFinite(
        numericQuantity
      ) ||
      numericQuantity <= 0
    ) {
      alert(
        "Please enter a valid quantity."
      );
      return;
    }

    try {
      setTradeLoading(true);

      const result =
        await buyStock(
          selectedStock.symbol,
          numericQuantity
        );

      alert(result.message);

      await loadDashboard(false);
    } catch (err) {
      alert(
        err?.message ||
          "Unable to complete buy order."
      );
    } finally {
      setTradeLoading(false);
    }
  };


  /* =======================================
     SELL
     ======================================= */

  const handleSell = async () => {
    if (!selectedStock) {
      return;
    }

    const quantity =
      window.prompt(
        `How many ${selectedStock.symbol} shares do you want to sell?`
      );

    if (
      quantity === null ||
      quantity.trim() === ""
    ) {
      return;
    }

    const numericQuantity =
      Number(quantity);

    if (
      !Number.isFinite(
        numericQuantity
      ) ||
      numericQuantity <= 0
    ) {
      alert(
        "Please enter a valid quantity."
      );
      return;
    }

    try {
      setTradeLoading(true);

      const result =
        await sellStock(
          selectedStock.symbol,
          numericQuantity
        );

      alert(result.message);

      await loadDashboard(false);
    } catch (err) {
      alert(
        err?.message ||
          "Unable to complete sell order."
      );
    } finally {
      setTradeLoading(false);
    }
  };


  /* =======================================
     LOADING
     ======================================= */

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />

        <main className="dashboard-main">
          <div className="dashboard-loading">
            <div className="dashboard-loader-orb">
              <RefreshCw size={23} />
            </div>

            <h2>
              Loading Meridian
            </h2>

            <p>
              Connecting to your portfolio
              and market data...
            </p>
          </div>
        </main>
      </div>
    );
  }


  /* =======================================
     ERROR
     ======================================= */

  if (error) {
    return (
      <div className="app-layout">
        <Sidebar />

        <main className="dashboard-main">
          <div className="dashboard-error">
            <div className="dashboard-error-icon">
              <AlertTriangle size={25} />
            </div>

            <h2>
              Unable to load dashboard
            </h2>

            <p>
              {error}
            </p>

            <button
              onClick={() =>
                loadDashboard(true)
              }
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }


  /* =======================================
     MARKET STATUS
     ======================================= */

  const liveCount =
    stocks.filter(
      (stock) => stock.isLive
    ).length;

  const marketOpen =
    stocks.some(
      (stock) =>
        stock.isMarketOpen
    );


  /* =======================================
     MAIN DASHBOARD
     ======================================= */

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="dashboard-main">

        {/* =================================
            TOP SEARCH
            ================================= */}

        <div className="top-row">

          <div className="search-box">
            <Search size={19} />

            <input
              type="text"
              placeholder="Search ticker or company..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

            {searchResults.length > 0 && (
              <div className="dashboard-search-results">

                {searchResults.map(
                  (stock) => (
                    <button
                      key={
                        stock.symbol
                      }
                      onClick={() => {
                        setSelectedSymbol(
                          stock.symbol
                        );

                        setSearch("");
                      }}
                    >
                      <strong>
                        {stock.symbol}
                      </strong>

                      <span>
                        {stock.name}
                      </span>

                      <small>
                        {getDataLabel(
                          stock
                        )}
                      </small>
                    </button>
                  )
                )}

              </div>
            )}

          </div>


          <div className="market-status">

            <Circle
              size={9}
              fill="currentColor"
            />

            <span>
              {getMarketLabel(
                stocks
              )}
            </span>

            <b>·</b>

            <span>
              {liveCount > 0
                ? `${liveCount} live quote${
                    liveCount === 1
                      ? ""
                      : "s"
                  }`
                : "Provider data unavailable"}
            </span>

            <button
              type="button"
              onClick={
                handleRefresh
              }
              disabled={
                refreshing
              }
              title="Refresh market data"
            >
              <RefreshCw
                size={13}
                className={
                  refreshing
                    ? "live-refresh-icon refreshing"
                    : "live-refresh-icon"
                }
              />
            </button>

          </div>

        </div>


        {/* =================================
            MARKET TICKER
            ================================= */}

        <div className="market-ticker">

          {stocks.map(
            (stock) => {
              const change =
                getChangePercent(
                  stock
                );

              return (
                <div
                  key={
                    stock.symbol
                  }
                  className={
                    selectedStock?.symbol ===
                    stock.symbol
                      ? "ticker-selected"
                      : ""
                  }
                  onClick={() =>
                    setSelectedSymbol(
                      stock.symbol
                    )
                  }
                >

                  <strong>
                    {stock.symbol}
                  </strong>

                  <span>
                    {formatPrice(
                      stock.price
                    )}
                  </span>

                  <span
                    className={
                      change >= 0
                        ? "up"
                        : "down"
                    }
                  >
                    {change >= 0
                      ? "▲"
                      : "▼"}{" "}
                    {Math.abs(
                      change
                    ).toFixed(2)}
                    %
                  </span>

                </div>
              );
            }
          )}

        </div>


        {/* =================================
            CONTENT GRID
            ================================= */}

        <div className="dashboard-grid">

          {/* =================================
              MAIN STOCK CARD
              ================================= */}

          <section className="stock-card">

            {selectedStock && (
              <>

                <div className="stock-header">

                  <div className="stock-title">

                    <div className="stock-logo">
                      {
                        selectedStock.symbol
                      }
                    </div>

                    <div>
                      <h2>
                        {
                          selectedStock.symbol
                        }
                      </h2>

                      <p>
                        {
                          selectedStock.name
                        }
                      </p>

                      <small className="stock-data-source">
                        {getDataLabel(
                          selectedStock
                        )}

                        {selectedStock.lastUpdated &&
                          ` · ${formatQuoteTime(
                            selectedStock.lastUpdated
                          )}`}
                      </small>
                    </div>

                  </div>


                  <div className="stock-price">

                    <strong>
                      {formatPrice(
                        selectedStock.price
                      )}
                    </strong>

                    <span
                      className={
                        getChangePercent(
                          selectedStock
                        ) >= 0
                          ? "up"
                          : "down"
                      }
                    >

                      {getChangePercent(
                        selectedStock
                      ) >= 0 ? (
                        <TrendingUp
                          size={15}
                        />
                      ) : (
                        <TrendingDown
                          size={15}
                        />
                      )}

                      {getChangeAmount(
                        selectedStock
                      ) >= 0
                        ? "+"
                        : "-"}
                      {formatPrice(
                        Math.abs(
                          getChangeAmount(
                            selectedStock
                          )
                        )
                      ).replace(
                        "₹",
                        "₹"
                      )}

                      {" ("}

                      {getChangePercent(
                        selectedStock
                      ) >= 0
                        ? "+"
                        : ""}

                      {getChangePercent(
                        selectedStock
                      ).toFixed(2)}

                      {"%)"}

                    </span>

                  </div>

                </div>


                {/* =================================
                    CHART RANGE
                    ================================= */}

                <div className="time-buttons">

                  {CHART_RANGES.map(
                    (range) => (
                      <button
                        key={
                          range.interval
                        }
                        className={
                          chartInterval ===
                          range.interval
                            ? "selected"
                            : ""
                        }
                        onClick={() =>
                          setChartInterval(
                            range.interval
                          )
                        }
                      >
                        {range.label}
                      </button>
                    )
                  )}

                </div>


                {/* =================================
                    CHART
                    ================================= */}

                <div className="chart-area">

                  {chartLoading && (
                    <div className="chart-loading">
                      <div className="chart-spinner"></div>

                      <span>
                        Loading market history...
                      </span>
                    </div>
                  )}


                  {chartRestricted &&
                    !chartLoading && (
                      <div className="chart-restricted">

                        <div className="chart-restricted-icon">
                          <TrendingUp
                            size={22}
                          />
                        </div>

                        <div className="chart-restricted-content">
                          <strong>
                            Historical data unavailable
                          </strong>

                          <span>
                            {selectedSymbol} historical
                            data isn't available
                            on the current market-data
                            provider plan.
                          </span>
                        </div>

                      </div>
                    )}


                  {chartError &&
                    !chartLoading &&
                    !chartRestricted && (
                      <div className="chart-error">
                        {chartError}
                      </div>
                    )}


                  {!chartLoading &&
                    !chartError &&
                    !chartRestricted &&
                    chartData.length > 0 && (
                      <div className="real-chart-wrapper">

                        <ResponsiveContainer
                          width="100%"
                          height={325}
                        >
                          <LineChart
                            data={
                              chartData
                            }
                            margin={{
                              top: 10,
                              right: 10,
                              left: 0,
                              bottom: 5,
                            }}
                          >

                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#1d2936"
                            />

                            <XAxis
                              dataKey="displayDate"
                              tick={{
                                fill: "#708298",
                                fontSize: 11,
                              }}
                              axisLine={false}
                              tickLine={false}
                              minTickGap={35}
                            />

                            <YAxis
                              domain={[
                                "auto",
                                "auto",
                              ]}
                              tick={{
                                fill: "#708298",
                                fontSize: 11,
                              }}
                              axisLine={false}
                              tickLine={false}
                              width={58}
                              tickFormatter={(
                                value
                              ) =>
                                `₹${Number(
                                  value
                                ).toFixed(0)}`
                              }
                            />

                            <Tooltip
                              contentStyle={{
                                background:
                                  "#0d141d",
                                border:
                                  "1px solid #293748",
                                borderRadius:
                                  "10px",
                                color:
                                  "#f2f4f7",
                              }}
                              labelStyle={{
                                color:
                                  "#708298",
                                marginBottom:
                                  "5px",
                              }}
                              formatter={(
                                value
                              ) => [
                                formatPrice(
                                  value
                                ),
                                "Close",
                              ]}
                            />

                            <Line
                              type="monotone"
                              dataKey="close"
                              stroke="#20d493"
                              strokeWidth={2.5}
                              dot={false}
                              activeDot={{
                                r: 5,
                              }}
                            />

                          </LineChart>
                        </ResponsiveContainer>

                      </div>
                    )}


                  {!chartLoading &&
                    !chartError &&
                    !chartRestricted &&
                    chartData.length === 0 && (
                      <div className="chart-empty">
                        <TrendingUp
                          size={23}
                        />

                        <strong>
                          No historical points available
                        </strong>

                        <span>
                          The selected provider does
                          not currently return chart
                          history for this symbol.
                        </span>
                      </div>
                    )}

                </div>


                {/* =================================
                    TRADE BUTTONS
                    ================================= */}

                <div className="trade-buttons">

                  <button
                    className="buy-btn"
                    onClick={
                      handleBuy
                    }
                    disabled={
                      tradeLoading
                    }
                  >
                    {tradeLoading
                      ? "Processing..."
                      : "Buy"}
                  </button>

                  <button
                    className="sell-btn"
                    onClick={
                      handleSell
                    }
                    disabled={
                      tradeLoading
                    }
                  >
                    {tradeLoading
                      ? "Processing..."
                      : "Sell"}
                  </button>

                </div>


                {/* =================================
                    DATA NOTE
                    ================================= */}

                <div className="dashboard-live-note">

                  <span
                    className={
                      selectedStock.isLive
                        ? "dashboard-live-dot"
                        : "dashboard-seed-dot"
                    }
                  />

                  <span>
                    {getDataLabel(
                      selectedStock
                    )}

                    {" · Updated "}

                    {formatQuoteTime(
                      selectedStock.lastUpdated ||
                        lastUpdated
                    )}

                  </span>

                </div>

              </>
            )}

          </section>


          {/* =================================
              WATCHLIST
              ================================= */}

          <section className="watchlist-card">

            <div className="section-heading">

              <h3>
                Watchlist
              </h3>

              <span>
                <span className="watch-live-dot"></span>

                {liveCount > 0
                  ? "Live coverage"
                  : "Last known prices"}
              </span>

            </div>


            {stocks.map(
              (stock) => {
                const change =
                  getChangePercent(
                    stock
                  );

                return (
                  <div
                    className={`watch-item ${
                      selectedStock?.symbol ===
                      stock.symbol
                        ? "watch-item-selected"
                        : ""
                    }`}
                    key={
                      stock.symbol
                    }
                    onClick={() =>
                      setSelectedSymbol(
                        stock.symbol
                      )
                    }
                  >

                    <div className="mini-logo">
                      {stock.symbol.slice(
                        0,
                        2
                      )}
                    </div>

                    <div className="watch-name">

                      <strong>
                        {
                          stock.symbol
                        }
                      </strong>

                      <span>
                        {
                          stock.name
                        }
                      </span>

                    </div>

                    <div
                      className={`watch-change ${
                        change >= 0
                          ? "up"
                          : "down"
                      }`}
                    >

                      {change >= 0 ? (
                        <TrendingUp
                          size={28}
                        />
                      ) : (
                        <TrendingDown
                          size={28}
                        />
                      )}

                    </div>

                    <div className="watch-price">

                      <strong>
                        {formatPrice(
                          stock.price
                        )}
                      </strong>

                      <span
                        className={
                          change >= 0
                            ? "up"
                            : "down"
                        }
                      >
                        {change >= 0
                          ? "+"
                          : ""}
                        {change.toFixed(
                          2
                        )}
                        %
                      </span>

                    </div>

                  </div>
                );
              }
            )}

          </section>

        </div>


        {/* =================================
            LOWER DASHBOARD
            ================================= */}

        <div className="lower-dashboard">

          {/* =================================
              HOLDINGS
              ================================= */}

          <section className="holdings-card">

            <div className="section-heading">

              <h3>
                Holdings
              </h3>

              <span>
                {
                  portfolio
                    ?.holdings
                    ?.length || 0
                }{" "}
                positions
              </span>

            </div>


            <div className="holdings-table">

              <div className="holding-row holding-header">

                <span>
                  Symbol
                </span>

                <span>
                  Shares
                </span>

                <span>
                  Avg cost
                </span>

                <span>
                  Price
                </span>

                <span>
                  Market value
                </span>

                <span>
                  Gain / loss
                </span>

              </div>


              {portfolio?.holdings?.length > 0 ? (
                portfolio.holdings.map(
                  (holding) => {
                    const profitLoss =
                      Number(
                        holding.profitLoss
                      ) || 0;

                    const profitPercent =
                      Number(
                        holding.profitLossPercent
                      ) || 0;

                    return (
                      <div
                        className="holding-row"
                        key={
                          holding.symbol
                        }
                      >

                        <div className="holding-symbol">

                          <div className="holding-logo">
                            {holding.symbol.slice(
                              0,
                              2
                            )}
                          </div>

                          <strong>
                            {
                              holding.symbol
                            }
                          </strong>

                        </div>

                        <span>
                          {
                            holding.quantity
                          }
                        </span>

                        <span>
                          {formatPrice(
                            holding.averagePrice
                          )}
                        </span>

                        <span>
                          {formatPrice(
                            holding.currentPrice
                          )}
                        </span>

                        <span>
                          {formatCompactMoney(
                            holding.currentValue
                          )}
                        </span>

                        <span
                          className={
                            profitLoss >= 0
                              ? "gain"
                              : "loss"
                          }
                        >
                          {profitLoss >=
                          0
                            ? "▲ "
                            : "▼ "}

                          {profitPercent >=
                          0
                            ? "+"
                            : ""}

                          {profitPercent.toFixed(
                            2
                          )}
                          %
                        </span>

                      </div>
                    );
                  }
                )
              ) : (
                <div className="dashboard-empty-holdings">
                  <strong>
                    No holdings yet
                  </strong>

                  <span>
                    Buy your first stock to
                    build your Meridian portfolio.
                  </span>
                </div>
              )}

            </div>

          </section>


          {/* =================================
              LOWER RIGHT
              ================================= */}

          <div className="lower-right-column">

            {/* =================================
                ALLOCATION
                ================================= */}

            <section className="allocation-card">

              <div className="section-heading">

                <h3>
                  Allocation
                </h3>

                <span>
                  By market value
                </span>

              </div>


              <div className="allocation-content">

                <div className="allocation-chart">

                  {allocationData.length >
                  0 && (
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <PieChart>

                        <Pie
                          data={
                            allocationData
                          }
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={72}
                          paddingAngle={1}
                          dataKey="value"
                        >

                          {allocationData.map(
                            (
                              item,
                              index
                            ) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  allocationColors[
                                    index %
                                      allocationColors.length
                                  ]
                                }
                                stroke="none"
                              />
                            )
                          )}

                        </Pie>

                      </PieChart>
                    </ResponsiveContainer>
                  )}

                  <div className="allocation-center">

                    <span>
                      TOTAL
                    </span>

                    <strong>
                      {formatCompactMoney(
                        portfolio?.totalValue ||
                          0
                      )}
                    </strong>

                  </div>

                </div>


                <div className="allocation-list">

                  {portfolio?.holdings?.map(
                    (
                      holding,
                      index
                    ) => {
                      const value =
                        Number(
                          holding.currentValue
                        ) || 0;

                      const total =
                        Number(
                          portfolio.totalValue
                        ) || 0;

                      const percentage =
                        total > 0
                          ? (value /
                              total) *
                            100
                          : 0;

                      return (
                        <div
                          className="allocation-item"
                          key={
                            holding.symbol
                          }
                        >

                          <div>

                            <span
                              className="allocation-dot"
                              style={{
                                background:
                                  allocationColors[
                                    index %
                                      allocationColors.length
                                  ],
                              }}
                            />

                            <strong>
                              {
                                holding.symbol
                              }
                            </strong>

                          </div>

                          <span>
                            {percentage.toFixed(
                              1
                            )}
                            %
                          </span>

                        </div>
                      );
                    }
                  )}

                  {!portfolio?.holdings
                    ?.length && (
                    <p>
                      No allocation data
                    </p>
                  )}

                </div>

              </div>

            </section>


            {/* =================================
                MARKET DATA STATUS
                ================================= */}

            <section className="news-card dashboard-data-card">

              <div className="section-heading">

                <h3>
                  Market data
                </h3>

                <span>
                  Provider status
                </span>

              </div>


              <div className="dashboard-data-status">

                <div className="data-status-icon">
                  <Circle
                    size={10}
                    fill="currentColor"
                  />
                </div>

                <div>
                  <strong>
                    {liveCount > 0
                      ? "Live market coverage available"
                      : "Live coverage unavailable"}
                  </strong>

                  <span>
                    {liveCount > 0
                      ? `${liveCount} of ${stocks.length} tracked symbols currently have live quotes.`
                      : "Tracked symbols are currently using their last known database values."}
                  </span>
                </div>

              </div>


              <div className="dashboard-data-stats">

                <div>
                  <span>
                    Symbols
                  </span>

                  <strong>
                    {stocks.length}
                  </strong>
                </div>

                <div>
                  <span>
                    Live
                  </span>

                  <strong>
                    {liveCount}
                  </strong>
                </div>

                <div>
                  <span>
                    Market
                  </span>

                  <strong>
                    {marketOpen
                      ? "Open"
                      : "Closed"}
                  </strong>
                </div>

              </div>


              <p className="dashboard-data-disclaimer">
                Meridian displays the latest available
                provider data. Symbols without a live
                provider quote retain their last known
                database value.
              </p>

            </section>

          </div>

        </div>

      </main>
    </div>
  );
}


export default Dashboard;