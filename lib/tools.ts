export const tools = {
  get_weather: ({ location }: { location: string }) => {
    return `The weather in ${location} is sunny and 88°F.`; // Stubbed
  },
  query: ({ query }: { query: string }) => {
    return `I received your query: "${query}". This is a placeholder response for general queries.`;
  }
};
