import {
  BookOpen,
  TrendingUp,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

export const COURSES = [
  {
    id: 1,
    title: "Stock Market Basics",
    description:
      "Understand stocks, exchanges, market orders and how investing works.",
    category: "Investing",
    level: "Beginner",
    lessons: 8,
    duration: "45 min",
    icon: TrendingUp,

    lessonsData: [
      {
        title: "What Is the Stock Market?",
        description: "Understand what the stock market is and why it exists.",
        content:
          "The stock market is a marketplace where investors buy and sell ownership interests in publicly listed companies. When you purchase a stock, you are purchasing a small ownership stake in that business.",
        takeaway:
          "A stock represents ownership in a company, while the stock market provides the infrastructure for buying and selling those ownership interests.",
      },
      {
        title: "Stocks and Ownership",
        description: "Learn what owning shares of a company actually means.",
        content:
          "Companies can divide their ownership into shares. Investors who purchase shares become shareholders. The value of those shares can change as expectations about the company, economy and market conditions change.",
        takeaway:
          "Owning shares means owning a small portion of a company.",
      },
      {
        title: "Stock Exchanges",
        description: "Understand exchanges and how stocks are traded.",
        content:
          "Stock exchanges provide organized marketplaces where buyers and sellers can trade securities. In India, major exchanges include the NSE and BSE.",
        takeaway:
          "Exchanges provide the infrastructure that connects buyers and sellers.",
      },
      {
        title: "Market Orders",
        description: "Learn the difference between market and limit orders.",
        content:
          "A market order attempts to execute immediately at the best available price. A limit order specifies the maximum price you are willing to pay when buying or the minimum price you are willing to accept when selling.",
        takeaway:
          "Market orders prioritize execution, while limit orders prioritize price control.",
      },
      {
        title: "Bid and Ask Prices",
        description: "Understand how buyers and sellers quote prices.",
        content:
          "The bid represents the highest price a buyer is currently willing to pay. The ask represents the lowest price a seller is currently willing to accept. The difference between them is called the spread.",
        takeaway:
          "Bid and ask prices show the current interaction between buyers and sellers.",
      },
      {
        title: "Why Stock Prices Move",
        description: "Explore the major factors behind price movement.",
        content:
          "Stock prices can move because of company earnings, investor expectations, economic conditions, interest rates, news, industry developments and changes in supply and demand.",
        takeaway:
          "Price movement reflects changing expectations and buying and selling pressure.",
      },
      {
        title: "Risk and Return",
        description: "Understand the relationship between potential return and uncertainty.",
        content:
          "Investments can produce gains or losses. Higher potential returns can come with greater uncertainty, which makes understanding risk an important part of investing.",
        takeaway:
          "Return potential and investment risk should be considered together.",
      },
      {
        title: "Building Market Knowledge",
        description: "Learn how to continue developing your market understanding.",
        content:
          "Successful market learning involves understanding businesses, financial statements, market structure, valuation, risk management and investor behavior. Continuous learning helps you interpret information more effectively.",
        takeaway:
          "Strong market knowledge comes from consistently learning and evaluating information.",
      },
    ],
  },

  {
    id: 2,
    title: "Technical Analysis",
    description:
      "Learn charts, trends, support, resistance and basic indicators.",
    category: "Technical",
    level: "Intermediate",
    lessons: 10,
    duration: "1 hr 20 min",
    icon: BarChart3,

    lessonsData: [
      {
        title: "Introduction to Technical Analysis",
        description: "Understand the purpose of technical analysis.",
        content:
          "Technical analysis studies historical price and volume information to identify patterns, trends and potential areas of market interest.",
        takeaway:
          "Technical analysis focuses on price, volume and market behavior.",
      },
      {
        title: "Reading Price Charts",
        description: "Learn the basic structure of a price chart.",
        content:
          "Price charts display how an asset's price changes over time. Traders can use different timeframes to study short-term or longer-term movements.",
        takeaway:
          "Charts convert historical price movement into a visual format.",
      },
      {
        title: "Candlestick Basics",
        description: "Understand the information contained in a candlestick.",
        content:
          "A candlestick can show the opening price, closing price, highest price and lowest price for a selected period.",
        takeaway:
          "Each candlestick summarizes four important price points.",
      },
      {
        title: "Market Trends",
        description: "Learn how uptrends, downtrends and sideways markets work.",
        content:
          "An uptrend generally consists of rising highs and lows, while a downtrend generally consists of declining highs and lows. A sideways market moves within a relatively defined range.",
        takeaway:
          "Trend structure helps describe the direction of historical price movement.",
      },
      {
        title: "Support Levels",
        description: "Understand the concept of support.",
        content:
          "Support is a price area where buying interest has historically appeared and where price has previously found difficulty moving lower.",
        takeaway:
          "Support is an area of historical buying interest, not a guaranteed price floor.",
      },
      {
        title: "Resistance Levels",
        description: "Understand the concept of resistance.",
        content:
          "Resistance is a price area where selling interest has historically appeared and where price has previously found difficulty moving higher.",
        takeaway:
          "Resistance represents an area where historical selling pressure has appeared.",
      },
      {
        title: "Moving Averages",
        description: "Learn how moving averages summarize price data.",
        content:
          "Moving averages smooth historical prices over a selected period. They are commonly used to study trends and compare current prices with historical averages.",
        takeaway:
          "Moving averages help reduce short-term price noise.",
      },
      {
        title: "Volume Analysis",
        description: "Understand why trading volume matters.",
        content:
          "Volume represents the amount of trading activity during a period. Analysts often study volume alongside price movement to understand market participation.",
        takeaway:
          "Volume provides context about trading activity behind price movement.",
      },
      {
        title: "Technical Indicators",
        description: "Explore common technical indicators.",
        content:
          "Indicators such as RSI, MACD and moving averages transform price or volume data into additional measurements that traders may use alongside charts.",
        takeaway:
          "Indicators are analytical tools and should be interpreted within broader market context.",
      },
      {
        title: "Building a Chart-Based View",
        description: "Combine charts, trends and indicators.",
        content:
          "A chart-based analysis can combine trend structure, support and resistance, volume and selected indicators. Using too many indicators can make analysis harder to interpret.",
        takeaway:
          "A clear analysis usually focuses on a small number of meaningful signals.",
      },
    ],
  },

  {
    id: 3,
    title: "Risk Management",
    description:
      "Learn how position sizing, diversification and risk control work.",
    category: "Risk",
    level: "Beginner",
    lessons: 6,
    duration: "35 min",
    icon: ShieldCheck,

    lessonsData: [
      {
        title: "Understanding Investment Risk",
        description: "Learn what risk means in financial markets.",
        content:
          "Investment risk is the possibility that an investment may produce an unexpected result, including a loss of capital.",
        takeaway:
          "Risk cannot be completely removed, but it can be understood and managed.",
      },
      {
        title: "Position Sizing",
        description: "Understand why position size matters.",
        content:
          "Position sizing determines how much capital is allocated to an individual investment. Smaller positions can reduce the impact of one investment on the overall portfolio.",
        takeaway:
          "Position size directly affects how strongly one investment can influence a portfolio.",
      },
      {
        title: "Diversification",
        description: "Learn how diversification works.",
        content:
          "Diversification involves spreading investments across different assets, companies or sectors. It can reduce the impact of poor performance from a single investment.",
        takeaway:
          "Diversification can reduce concentration in individual investments.",
      },
      {
        title: "Portfolio Concentration",
        description: "Understand concentration risk.",
        content:
          "A portfolio becomes concentrated when a large portion of its value depends on a small number of holdings. Concentration can increase the effect of individual price movements.",
        takeaway:
          "Monitoring concentration helps investors understand portfolio exposure.",
      },
      {
        title: "Managing Losses",
        description: "Understand why predefined risk limits can matter.",
        content:
          "Investors can use predefined rules to manage how much capital they are willing to expose to individual positions. The appropriate approach depends on the investor and their circumstances.",
        takeaway:
          "Having a defined approach to losses can help maintain consistency.",
      },
      {
        title: "Creating a Risk Framework",
        description: "Build a structured approach to portfolio risk.",
        content:
          "A risk framework can consider position size, diversification, concentration, liquidity and the investor's time horizon. Reviewing these factors regularly can improve portfolio awareness.",
        takeaway:
          "Risk management works best as a consistent process rather than a single decision.",
      },
    ],
  },

  {
    id: 4,
    title: "Understanding Market Trends",
    description:
      "Discover how to identify market trends and interpret price movement.",
    category: "Technical",
    level: "Intermediate",
    lessons: 7,
    duration: "55 min",
    icon: TrendingUp,

    lessonsData: [
      {
        title: "What Is a Market Trend?",
        description: "Understand the basic idea of market direction.",
        content:
          "A market trend describes the general direction in which price has been moving over a period of time.",
        takeaway:
          "Trends describe historical price direction over a selected timeframe.",
      },
      {
        title: "Uptrends",
        description: "Learn how rising market structures develop.",
        content:
          "An uptrend is generally characterized by a sequence of higher highs and higher lows.",
        takeaway:
          "Higher highs and higher lows are common characteristics of an uptrend.",
      },
      {
        title: "Downtrends",
        description: "Learn how declining market structures develop.",
        content:
          "A downtrend is generally characterized by lower highs and lower lows.",
        takeaway:
          "Lower highs and lower lows are common characteristics of a downtrend.",
      },
      {
        title: "Sideways Markets",
        description: "Understand markets that move within a range.",
        content:
          "A sideways market occurs when price moves within a relatively defined range without establishing a clear long-term upward or downward direction.",
        takeaway:
          "Not every market environment has a clear directional trend.",
      },
      {
        title: "Trend Strength",
        description: "Explore factors that can provide context around trends.",
        content:
          "Trend analysis can consider price structure, volume, volatility and the timeframe being studied.",
        takeaway:
          "Trend strength should be considered in context rather than from one signal alone.",
      },
      {
        title: "Multiple Timeframes",
        description: "Understand why timeframe selection matters.",
        content:
          "A stock can show different patterns on daily, weekly and monthly charts. Looking at multiple timeframes can provide broader context.",
        takeaway:
          "The same asset can have different trends across different timeframes.",
      },
      {
        title: "Putting Trend Analysis Together",
        description: "Combine trend structure into a practical framework.",
        content:
          "Trend analysis can combine price structure, support, resistance, volume and timeframe to create a more complete description of historical market behavior.",
        takeaway:
          "Trend analysis becomes more useful when multiple pieces of market context are considered together.",
      },
    ],
  },

  {
    id: 5,
    title: "Reading Financial Charts",
    description:
      "Understand candlesticks, volume and common chart patterns.",
    category: "Technical",
    level: "Beginner",
    lessons: 9,
    duration: "1 hr",
    icon: BarChart3,

    lessonsData: [
      {
        title: "Chart Fundamentals",
        description: "Learn the basic components of financial charts.",
        content:
          "Financial charts display price information across time. Common chart components include price, time, volume and technical overlays.",
        takeaway:
          "Charts organize market data into a visual timeline.",
      },
      {
        title: "Candlestick Structure",
        description: "Learn how candlesticks are formed.",
        content:
          "Candlesticks display open, high, low and close prices for a specific period.",
        takeaway:
          "A single candle contains four key pieces of price information.",
      },
      {
        title: "Bullish and Bearish Candles",
        description: "Understand rising and falling candles.",
        content:
          "A candle that closes above its opening price represents a rising period, while a candle that closes below its opening price represents a falling period.",
        takeaway:
          "The relationship between open and close shows the direction of that period's price movement.",
      },
      {
        title: "Wicks and Price Rejection",
        description: "Understand what candle wicks can represent.",
        content:
          "The upper and lower wicks show prices reached during the period that were different from the opening and closing prices.",
        takeaway:
          "Wicks provide additional information about the price range during a period.",
      },
      {
        title: "Volume",
        description: "Learn how to read trading volume.",
        content:
          "Volume measures trading activity during a particular period and can provide additional context when viewed alongside price.",
        takeaway:
          "Volume can help describe the level of market participation.",
      },
      {
        title: "Chart Patterns",
        description: "Explore common visual price structures.",
        content:
          "Chart patterns are recurring visual structures that analysts study in historical price data. Examples include triangles, channels and double tops or bottoms.",
        takeaway:
          "Patterns describe historical price structures but do not guarantee future outcomes.",
      },
      {
        title: "Support and Resistance",
        description: "Identify important price areas.",
        content:
          "Support and resistance are commonly used to identify historical areas where price has previously encountered buying or selling interest.",
        takeaway:
          "These levels are zones of historical interest rather than guaranteed turning points.",
      },
      {
        title: "Combining Price and Volume",
        description: "Use multiple chart elements together.",
        content:
          "Studying price movement together with volume can provide more context than examining either measurement independently.",
        takeaway:
          "Price and volume can complement each other when interpreting market activity.",
      },
      {
        title: "Building a Chart Reading Routine",
        description: "Create a consistent way to read charts.",
        content:
          "A chart reading routine can begin with timeframe, trend and price structure before adding support, resistance, volume and selected indicators.",
        takeaway:
          "A structured process can make chart analysis clearer and more consistent.",
      },
    ],
  },

  {
    id: 6,
    title: "Long-Term Investing",
    description:
      "Explore diversification, compounding and building an investment plan.",
    category: "Investing",
    level: "Beginner",
    lessons: 8,
    duration: "50 min",
    icon: BookOpen,

    lessonsData: [
      {
        title: "Long-Term Investing",
        description: "Understand the basic philosophy of long-term investing.",
        content:
          "Long-term investing focuses on holding investments over extended periods while considering business fundamentals, valuation and broader financial goals.",
        takeaway:
          "Long-term investing emphasizes patience and a longer time horizon.",
      },
      {
        title: "Compounding",
        description: "Understand how returns can build over time.",
        content:
          "Compounding occurs when returns generate additional returns over time. The effect becomes increasingly significant over longer periods.",
        takeaway:
          "Time can play an important role in the growth of investments.",
      },
      {
        title: "Fundamental Analysis",
        description: "Learn how investors study businesses.",
        content:
          "Fundamental analysis examines factors such as revenue, profits, cash flow, debt, competitive position and business prospects.",
        takeaway:
          "Fundamental analysis focuses on understanding the underlying business.",
      },
      {
        title: "Valuation",
        description: "Understand why price and value are different concepts.",
        content:
          "Valuation involves assessing what an investment may be worth using financial information and assumptions. Market price and estimated value do not always match.",
        takeaway:
          "Price is the current market quote; valuation is an analytical estimate.",
      },
      {
        title: "Diversified Portfolios",
        description: "Understand portfolio diversification.",
        content:
          "A diversified portfolio spreads exposure across multiple investments, sectors or asset types to reduce dependence on a single holding.",
        takeaway:
          "Diversification can reduce concentration in one investment or area.",
      },
      {
        title: "Investment Time Horizon",
        description: "Learn why time horizon matters.",
        content:
          "An investor's time horizon affects how they may think about volatility, liquidity and asset allocation.",
        takeaway:
          "Investment decisions should be considered alongside the time period for which capital may be invested.",
      },
      {
        title: "Reviewing Investments",
        description: "Learn how to review an investment thesis.",
        content:
          "Reviewing an investment can involve examining business performance, financial results, valuation and whether the original assumptions remain relevant.",
        takeaway:
          "Regular review helps investors compare current information with their original reasoning.",
      },
      {
        title: "Building an Investment Process",
        description: "Create a repeatable long-term investing framework.",
        content:
          "A long-term investment process can include defining goals, researching businesses, evaluating risk, considering valuation and periodically reviewing the portfolio.",
        takeaway:
          "A repeatable process can help organize long-term investment decisions.",
      },
    ],
  },
];

export const CATEGORIES = [
  "All",
  "Investing",
  "Technical",
  "Risk",
];

export function getCourseById(courseId) {
  return COURSES.find(
    (course) => String(course.id) === String(courseId)
  );
}

export function getCompletedLessons(courseId) {
  const course = getCourseById(courseId);

  if (!course) return [];

  try {
    const saved = JSON.parse(
      localStorage.getItem(
        `meridian-course-${course.id}-completed`
      ) || "[]"
    );

    return [
      ...new Set(
        saved
          .map(Number)
          .filter(
            (lesson) =>
              Number.isInteger(lesson) &&
              lesson >= 1 &&
              lesson <= course.lessonsData.length
          )
      ),
    ].sort((a, b) => a - b);
  } catch {
    return [];
  }
}

export function getCourseProgress(courseId) {
  const course = getCourseById(courseId);

  if (!course) {
    return {
      completedCount: 0,
      totalLessons: 0,
      percentage: 0,
      nextLesson: 1,
      completed: false,
    };
  }

  const completedLessons = getCompletedLessons(courseId);
  const totalLessons = course.lessonsData.length;
  const completedCount = completedLessons.length;

  const nextLesson =
    course.lessonsData.findIndex(
      (_, index) => !completedLessons.includes(index + 1)
    ) + 1;

  return {
    completedCount,
    totalLessons,
    percentage:
      totalLessons > 0
        ? Math.round((completedCount / totalLessons) * 100)
        : 0,
    nextLesson:
      completedCount === totalLessons
        ? totalLessons
        : nextLesson,
    completed: completedCount === totalLessons,
  };
}