import { parseStringPromise, Builder } from 'xml2js';

export async function agentMemory(
  intent: string,
  content: string,
  xml: string,
): Promise<string> {
  const thread = await parseStringPromise(xml || '<thread></thread>');

  // Ensure the thread structure exists
  if (!thread.thread) {
    thread.thread = {};
  }

  // Initialize event array if it doesn't exist
  if (!thread.thread.event) {
    thread.thread.event = [];
  }

  // Build event attributes
  let eventAttrs: Record<string, string | boolean> = { intent };
  if (intent !== 'user_input' && intent !== 'llm_response') {
    eventAttrs = {
      ...eventAttrs,
      type: "tool",
      status: "success",
      done: "true"
    };
  }

  // Add the new event
  thread.thread.event.push({
    $: eventAttrs,
    _: content
  });

  const builder = new Builder({
    headless: true,
    renderOpts: {
      pretty: true,
    }
  });
  return builder.buildObject(thread);
}

export function parseEvents(xml: string): { intent: string, content: string }[] {
  if (!xml) return [];
  
  const events: { intent: string, content: string }[] = [];
  
  // Simple regex parsing for the XML format
  const eventMatches = xml.match(/<event intent="([^"]*)"[^>]*>([^<]*)<\/event>/g);
  if (eventMatches) {
    eventMatches.forEach(match => {
      const intentMatch = match.match(/intent="([^"]*)"/);
      const contentMatch = match.match(/>([^<]*)</);
      if (intentMatch && contentMatch) {
        events.push({
          intent: intentMatch[1],
          content: contentMatch[1]
        });
      }
    });
  }
  
  return events;
}

export function getLatestContext(threadXML: string): string {
  const events = parseEvents(threadXML);
  if (events.length === 0) return "";
  
  // Get the last few events to understand current context
  const recentEvents = events.slice(-3);
  return recentEvents.map(e => `${e.intent}: ${e.content}`).join('\n');
}