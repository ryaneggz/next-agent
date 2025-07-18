import yahooFinance from 'yahoo-finance2';

export const tools = {
  get_weather: ({ location }: { location: string }) => {
    return `The weather in ${location} is sunny and 88°F.`; // Stubbed
  },
  
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
