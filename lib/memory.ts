import { parseStringPromise, Builder } from 'xml2js';

export async function addEvent(xml: string, intent: string, content: string): Promise<string> {
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
