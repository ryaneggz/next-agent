import { parseStringPromise, Builder } from 'xml2js';

export async function updateMemory(xml: string, role: 'user' | 'assistant', content: string): Promise<string> {
  const thread = await parseStringPromise(xml || '<thread></thread>');
  
  // Ensure the thread structure exists
  if (!thread.thread) {
    thread.thread = {};
  }
  
  // Initialize message array if it doesn't exist
  if (!thread.thread.message) {
    thread.thread.message = [];
  }
  
  // Add the new message
  thread.thread.message.push({ 
    $: { role }, 
    _: content 
  });
  
  const builder = new Builder();
  return builder.buildObject(thread);
}
