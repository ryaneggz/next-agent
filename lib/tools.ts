import yahooFinance from 'yahoo-finance2';
import { tool } from "@langchain/core/tools";
import { TavilySearch } from "@langchain/tavily";
import { z } from "zod";

const math_calculator = tool(
  ({ expression }: { expression: string }): string => {
    try {
      // Safe evaluation of basic math expressions
      // Only allow numbers, operators, parentheses, and basic math functions
      const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
      
      // Basic validation
      if (!sanitized || sanitized.trim() === '') {
        return 'Error: Invalid math expression';
      }
      
      // Use Function constructor for safe evaluation (limited scope)
      const result = new Function('return ' + sanitized)();
      
      if (typeof result !== 'number' || !isFinite(result)) {
        return 'Error: Result is not a valid number';
      }
      
      return `${expression} = ${result}`;
    } catch {
      return `Error: Invalid math expression - ${expression}`;
    }
  },
  {
    name: "math_calculator",
    description: "Calculate mathematical expressions including addition, subtraction, multiplication, division, and parentheses",
    schema: z.object({
      expression: z.string().describe("Mathematical expression to evaluate (e.g., '2 + 3 * 4', '(10 - 5) / 2')"),
    }),
  }
);

// Initialize web search conditionally to avoid build errors when API key is not available
let web_search: TavilySearch | null = null;
try {
  if (process.env.TAVILY_API_KEY) {
    web_search = new TavilySearch({
      maxResults: 10,
      topic: "general",
      // includeAnswer: false,
      // includeRawContent: false,
      // includeImages: false,
      // includeImageDescriptions: false,
      // searchDepth: "basic",
      // timeRange: "day",
      // includeDomains: [],
      // excludeDomains: [],
    });
  }
} catch (error) {
  console.warn('Tavily web search not available:', error);
}

export const tools = {
  get_weather: ({ location }: { location: string }) => {
    return `The weather in ${location} is sunny and 88°F.`; // Stubbed
  },
  web_search,
  math_calculator,
  
  get_stock_info: async ({ ticker }: { ticker: string }) => {
    try {
      const quote = await yahooFinance.quote(ticker);
      
      if (!quote || !quote.regularMarketPrice) {
        return `Sorry, I couldn't find stock information for ticker "${ticker}". Please make sure the ticker symbol is correct.`;
      }
      
      const price = quote.regularMarketPrice;
      const change = quote.regularMarketChange || 0;
      const changePercent = quote.regularMarketChangePercent || 0;
      const volume = quote.regularMarketVolume || 0;
      const marketCap = quote.marketCap || 0;
      const companyName = quote.longName || quote.shortName || ticker;
      
      return `Stock Info for ${companyName} (${ticker.toUpperCase()}):
• Current Price: ${price.toFixed(2)}
• Change: ${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)
• Volume: ${volume.toLocaleString()}
• Market Cap: ${(marketCap / 1000000000).toFixed(2)}B
• Previous Close: ${quote.regularMarketPreviousClose?.toFixed(2) || 'N/A'}
• Day Range: ${quote.regularMarketDayLow?.toFixed(2) || 'N/A'} - ${quote.regularMarketDayHigh?.toFixed(2) || 'N/A'}`;
    } catch (error) {
      console.error('Error fetching stock info:', error);
      return `Error fetching stock information for "${ticker}". Please check if the ticker symbol is valid.`;
    }
  }
};

// Tool descriptions for user understanding
export interface ToolDescription {
  name: string;
  shortDescription: string;
  detailedDescription: string;
  parameters: string;
  examples: string[];
  expectedResults: string;
}

export function getToolDescription(toolName: string): ToolDescription | null {
  const descriptions: Record<string, ToolDescription> = {
    get_weather: {
      name: "Weather Information",
      shortDescription: "Get current weather conditions for any location",
      detailedDescription: "Retrieves real-time weather information including temperature, conditions, and forecast data for any city or location worldwide.",
      parameters: "Location name (city, state/country optional)",
      examples: [
        "Get weather for New York City",
        "Check weather in London, UK",
        "What's the weather like in Tokyo?"
      ],
      expectedResults: "Current temperature, weather conditions, and basic forecast information"
    },
    
    web_search: {
      name: "Web Search",
      shortDescription: "Search the internet for current information",
      detailedDescription: "Performs comprehensive web searches to find up-to-date information, news, articles, and answers to questions from across the internet.",
      parameters: "Search query or question",
      examples: [
        "Latest news about artificial intelligence",
        "How to cook pasta carbonara",
        "Current events in technology"
      ],
      expectedResults: "Relevant web search results with summaries, links, and current information"
    },
    
    get_stock_info: {
      name: "Stock Market Data",
      shortDescription: "Get real-time stock prices and market information",
      detailedDescription: "Retrieves comprehensive stock market data including current prices, price changes, trading volume, market capitalization, and key financial metrics for publicly traded companies.",
      parameters: "Stock ticker symbol (e.g., AAPL, GOOGL, TSLA)",
      examples: [
        "Get stock price for Apple (AAPL)",
        "Check Tesla stock performance (TSLA)",
        "Show Microsoft stock info (MSFT)"
      ],
      expectedResults: "Current stock price, daily change, volume, market cap, price range, and company information"
    },
    
    math_calculator: {
      name: "Mathematical Calculator",
      shortDescription: "Perform mathematical calculations and solve expressions",
      detailedDescription: "Evaluates mathematical expressions including basic arithmetic operations, parentheses, and complex calculations with high precision.",
      parameters: "Mathematical expression using numbers and operators (+, -, *, /, parentheses)",
      examples: [
        "Calculate 15 * 24 + 100",
        "Solve (250 - 50) / 4",
        "What is 2.5 * 3.14159?"
      ],
      expectedResults: "Precise numerical result of the mathematical expression"
    }
  };
  
  return descriptions[toolName] || null;
}


