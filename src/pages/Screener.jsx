import { useEffect, useMemo, useState } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  ArrowUpDown,
  RotateCcw,
  RefreshCw,
  Database,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getStocks } from "../api/api";
import "./Screener.css";

function Screener() {
  const [stocks, setStocks] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sector, setSector] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* =========================================
     LOAD STOCKS
  ========================================= */

  const loadStocks = async (showLoader = false) => {
    try {
      if (showLoader) {
        setRefreshing(true);
      }

      setError("");

      const response = await getStocks();

      const marketStocks =
        response?.stocks ||
        response?.data ||
        [];

      setStocks(
        Array.isArray(marketStocks)
          ? marketStocks
          : []
      );
    } catch (err) {
      console.error(
        "Screener stock loading error:",
        err
      );

      setError(
        err.message ||
          "Unable to load market data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStocks();

    const interval = setInterval(() => {
      loadStocks();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  /* =========================================
     SECTORS
  ========================================= */

  const sectors = useMemo(() => {
    const uniqueSectors = [
      ...new Set(
        stocks
          .map((stock) => stock.sector)
          .filter(Boolean)
      ),
    ];

    return ["All", ...uniqueSectors.sort()];
  }, [stocks]);

  /* =========================================
     RESET
  ========================================= */

  const resetFilters = () => {
    setSearch("");
    setFilter("All");
    setSector("All");
    setSortBy("default");
    setPriceRange("All");
  };

  /* =========================================
     FILTER + SORT
  ========================================= */

  const filteredStocks = useMemo(() => {
    let result = stocks.filter((stock) => {
      const symbol = String(
        stock.symbol || ""
      ).toLowerCase();

      const name = String(
        stock.name || ""
      ).toLowerCase();

      const searchValue =
        search.toLowerCase().trim();

      const price =
        Number(stock.price) || 0;

      const change =
        Number(stock.changePercent) || 0;

      const matchesSearch =
        symbol.includes(searchValue) ||
        name.includes(searchValue);

      const matchesFilter =
        filter === "All" ||
        (filter === "Gainers" &&
          change > 0) ||
        (filter === "Losers" &&
          change < 0);

      const matchesSector =
        sector === "All" ||
        stock.sector === sector;

      let matchesPrice = true;

      if (priceRange === "Under ₹500") {
        matchesPrice = price < 500;
      }

      if (priceRange === "₹500 - ₹2,000") {
        matchesPrice =
          price >= 500 &&
          price <= 2000;
      }

      if (priceRange === "Over ₹2,000") {
        matchesPrice = price > 2000;
      }

      return (
        matchesSearch &&
        matchesFilter &&
        matchesSector &&
        matchesPrice
      );
    });

    if (sortBy === "price-low") {
      result.sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      );
    }

    if (sortBy === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0)
      );
    }

    if (sortBy === "change-high") {
      result.sort(
        (a, b) =>
          Number(b.changePercent || 0) -
          Number(a.changePercent || 0)
      );
    }

    if (sortBy === "change-low") {
      result.sort(
        (a, b) =>
          Number(a.changePercent || 0) -
          Number(b.changePercent || 0)
      );
    }

    if (sortBy === "market-cap-high") {
      result.sort(
        (a, b) =>
          Number(b.marketCap || 0) -
          Number(a.marketCap || 0)
      );
    }

    return result;
  }, [
    stocks,
    search,
    filter,
    sector,
    sortBy,
    priceRange,
  ]);

  /* =========================================
     MARKET STATISTICS
  ========================================= */

  const statistics = useMemo(() => {
    const gainers = stocks.filter(
      (stock) =>
        Number(stock.changePercent || 0) > 0
    ).length;

    const losers = stocks.filter(
      (stock) =>
        Number(stock.changePercent || 0) < 0
    ).length;

    const live = stocks.filter(
      (stock) => stock.isLive === true
    ).length;

    return {
      total: stocks.length,
      gainers,
      losers,
      live,
    };
  }, [stocks]);

  /* =========================================
     FORMATTERS
  ========================================= */

  const formatPrice = (price) => {
    const value = Number(price);

    if (!Number.isFinite(value)) {
      return "—";
    }

    return `₹${value.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatMarketCap = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number) || number <= 0) {
      return "—";
    }

    if (number >= 1e12) {
      return `₹${(
        number / 1e12
      ).toFixed(2)}T`;
    }

    if (number >= 1e9) {
      return `₹${(
        number / 1e9
      ).toFixed(2)}B`;
    }

    if (number >= 1e6) {
      return `₹${(
        number / 1e6
      ).toFixed(2)}M`;
    }

    return `₹${number.toLocaleString(
      "en-IN"
    )}`;
  };

  const formatChange = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0.00%";
    }

    return `${
      number >= 0 ? "+" : ""
    }${number.toFixed(2)}%`;
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="screener-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="screener-header">
        <div>
          <span className="screener-eyebrow">
            MARKET INTELLIGENCE
          </span>

          <h1>Stock Screener</h1>

          <p>
            Scan NSE stocks, compare performance,
            and discover market opportunities.
          </p>
        </div>

        <div className="screener-header-actions">
          <button
            className="screener-refresh"
            onClick={() =>
              loadStocks(true)
            }
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "is-spinning"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing"
              : "Refresh"}
          </button>

          <Link
            to="/dashboard"
            className="screener-back"
          >
            <ArrowLeft size={17} />
            Dashboard
          </Link>
        </div>
      </header>

      {/* =====================================
          MARKET SNAPSHOT
      ===================================== */}

      <section className="screener-stats">

        <div className="screener-stat-card">
          <div className="screener-stat-icon">
            <Database size={18} />
          </div>

          <div>
            <span>Total stocks</span>
            <strong>
              {statistics.total}
            </strong>
          </div>
        </div>

        <div className="screener-stat-card">
          <div className="screener-stat-icon positive">
            <TrendingUp size={18} />
          </div>

          <div>
            <span>Gainers</span>
            <strong>
              {statistics.gainers}
            </strong>
          </div>
        </div>

        <div className="screener-stat-card">
          <div className="screener-stat-icon negative">
            <TrendingDown size={18} />
          </div>

          <div>
            <span>Losers</span>
            <strong>
              {statistics.losers}
            </strong>
          </div>
        </div>

        <div className="screener-stat-card">
          <div className="screener-stat-icon live">
            <Activity size={18} />
          </div>

          <div>
            <span>Live quotes</span>
            <strong>
              {statistics.live}
            </strong>
          </div>
        </div>

      </section>

      {/* =====================================
          MAIN SCREENER
      ===================================== */}

      <section className="screener-card">

        {/* TOOLBAR */}

        <div className="screener-toolbar">

          <div className="screener-search">
            <Search size={17} />

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

            {search && (
              <button
                className="screener-search-clear"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="screener-filters">
            {[
              "All",
              "Gainers",
              "Losers",
            ].map((item) => (
              <button
                key={item}
                className={
                  filter === item
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  setFilter(item)
                }
              >
                {item}
              </button>
            ))}
          </div>

        </div>

        {/* ADVANCED FILTERS */}

        <div className="screener-advanced">

          <div className="screener-select-group">
            <label>Sector</label>

            <select
              value={sector}
              onChange={(event) =>
                setSector(
                  event.target.value
                )
              }
            >
              {sectors.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="screener-select-group">
            <label>Price</label>

            <select
              value={priceRange}
              onChange={(event) =>
                setPriceRange(
                  event.target.value
                )
              }
            >
              <option value="All">
                All Prices
              </option>

              <option value="Under ₹500">
                Under ₹500
              </option>

              <option value="₹500 - ₹2,000">
                ₹500 - ₹2,000
              </option>

              <option value="Over ₹2,000">
                Over ₹2,000
              </option>
            </select>
          </div>

          <div className="screener-select-group">
            <label>Sort by</label>

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target.value
                )
              }
            >
              <option value="default">
                Default
              </option>

              <option value="price-low">
                Price: Low → High
              </option>

              <option value="price-high">
                Price: High → Low
              </option>

              <option value="change-high">
                Change: Highest
              </option>

              <option value="change-low">
                Change: Lowest
              </option>

              <option value="market-cap-high">
                Market Cap: Highest
              </option>
            </select>
          </div>

          <button
            className="screener-reset"
            onClick={resetFilters}
          >
            <RotateCcw size={15} />
            Reset
          </button>

        </div>

        {/* COUNT */}

        <div className="screener-count">
          <span>
            Showing{" "}
            <strong>
              {filteredStocks.length}
            </strong>{" "}
            of{" "}
            <strong>
              {stocks.length}
            </strong>{" "}
            stocks
          </span>

          {stocks.length > 0 && (
            <span className="screener-market-label">
              NSE · INR
            </span>
          )}
        </div>

        {/* ERROR */}

        {error && (
          <div className="screener-error">
            <strong>
              Market data unavailable
            </strong>

            <span>{error}</span>

            <button
              onClick={() =>
                loadStocks(true)
              }
            >
              Try again
            </button>
          </div>
        )}

        {/* LOADING */}

        {loading && (
          <div className="screener-loading">
            {[1, 2, 3, 4, 5].map(
              (item) => (
                <div
                  className="screener-skeleton-row"
                  key={item}
                >
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                </div>
              )
            )}
          </div>
        )}

        {/* TABLE */}

        {!loading &&
          !error &&
          stocks.length > 0 && (
            <div className="screener-table">

              <div className="screener-row screener-header-row">
                <span>Stock</span>
                <span>Price</span>
                <span>Change</span>
                <span>Market cap</span>
                <span>Sector</span>
              </div>

              {filteredStocks.map(
                (stock) => {
                  const change =
                    Number(
                      stock.changePercent
                    ) || 0;

                  return (
                    <div
                      className="screener-row screener-stock-row"
                      key={stock.symbol}
                    >

                      {/* STOCK */}

                      <div className="screener-stock">

                        <div className="screener-logo">
                          {String(
                            stock.symbol || "—"
                          ).slice(0, 2)}
                        </div>

                        <div className="screener-stock-info">
                          <strong>
                            {stock.symbol}
                          </strong>

                          <small>
                            {stock.name}
                          </small>

                          <span>
                            {stock.exchange ||
                              "NSE"}
                          </span>
                        </div>

                      </div>

                      {/* PRICE */}

                      <strong className="screener-price">
                        {formatPrice(
                          stock.price
                        )}
                      </strong>

                      {/* CHANGE */}

                      <span
                        className={
                          change >= 0
                            ? "screener-gain"
                            : "screener-loss"
                        }
                      >
                        {change >= 0 ? (
                          <TrendingUp
                            size={14}
                          />
                        ) : (
                          <TrendingDown
                            size={14}
                          />
                        )}

                        {formatChange(
                          change
                        )}
                      </span>

                      {/* MARKET CAP */}

                      <span className="market-cap">
                        {formatMarketCap(
                          stock.marketCap
                        )}
                      </span>

                      {/* SECTOR */}

                      <span className="sector">
                        {stock.sector ||
                          "Other"}
                      </span>

                    </div>
                  );
                }
              )}

              {/* EMPTY FILTER RESULT */}

              {filteredStocks.length ===
                0 && (
                <div className="no-results">
                  <Search size={30} />

                  <strong>
                    No stocks found
                  </strong>

                  <span>
                    Try changing your
                    search or filters.
                  </span>

                  <button
                    onClick={
                      resetFilters
                    }
                  >
                    Reset filters
                  </button>
                </div>
              )}

            </div>
          )}

        {/* EMPTY DATABASE */}

        {!loading &&
          !error &&
          stocks.length === 0 && (
            <div className="no-results">
              <Database size={32} />

              <strong>
                No market data available
              </strong>

              <span>
                The stock database is
                currently empty.
              </span>

              <button
                onClick={() =>
                  loadStocks(true)
                }
              >
                Refresh data
              </button>
            </div>
          )}

      </section>

      {/* =====================================
          DATA STATUS
      ===================================== */}

      <div className="screener-note">
        <ArrowUpDown size={15} />

        <span>
          Market data is provided by
          Meridian's configured market-data
          provider. Stocks without a live
          quote retain their last known value.
        </span>
      </div>

    </div>
  );
}

export default Screener;