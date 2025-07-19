
export type ThreadState = {
  thread: {
    events: {
      intent: string;
      content: string;
      type?: string;
      status?: string;
      done?: string;
    }[];
  };
};

export async function agentMemory(
  intent: string,
  content: string,
  state: ThreadState,
): Promise<ThreadState> {
  // Create event object
  const event: ThreadState['thread']['events'][0] = {
    intent,
    content
  };

  // Add additional attributes for tool events
  if (intent !== 'user_input' && intent !== 'llm_response') {
    event.type = "tool";
    event.status = "success";
    event.done = "true";
  }

  // Add the new event to the state
  const newState = {
    thread: {
      events: [...state.thread.events, event]
    }
  };

  return newState;
}

export function parseEvents(state: ThreadState): { intent: string, content: string }[] {
  return state.thread.events.map(event => ({
    intent: event.intent,
    content: event.content
  }));
}

export function getLatestContext(state: ThreadState): string {
  const events = parseEvents(state);
  if (events.length === 0) return "";
  
  // Get the last few events to understand current context
  const recentEvents = events.slice(-3);
  return recentEvents.map(e => `${e.intent}: ${e.content}`).join('\n');
}

export function convertStateToXML(state: ThreadState): string {
  // Convert to XML format for components that still expect it
  const events = state.thread.events.map(event => {
    const attrs = [`intent="${event.intent}"`];
    if (event.type) attrs.push(`type="${event.type}"`);
    if (event.status) attrs.push(`status="${event.status}"`);
    if (event.done) attrs.push(`done="${event.done}"`);
    
    return `<event ${attrs.join(' ')}>${event.content}</event>`;
  }).join('\n  ');
  
  return `<thread>\n  ${events}\n</thread>`;
}