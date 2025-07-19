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
    } catch (error) {
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

const web_search = new TavilySearch({
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
• Current Price: $${price.toFixed(2)}
• Change: ${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)
• Volume: ${volume.toLocaleString()}
• Market Cap: $${(marketCap / 1000000000).toFixed(2)}B
• Previous Close: $${quote.regularMarketPreviousClose?.toFixed(2) || 'N/A'}
• Day Range: $${quote.regularMarketDayLow?.toFixed(2) || 'N/A'} - $${quote.regularMarketDayHigh?.toFixed(2) || 'N/A'}`;
    } catch (error) {
      console.error('Error fetching stock info:', error);
      return `Error fetching stock information for "${ticker}". Please check if the ticker symbol is valid.`;
    }
  }
};
