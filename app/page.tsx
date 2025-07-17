"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [input, setInput] = useState("");
  const [systemInput, setSystemInput] = useState("You are a helpful assistant that can use tools to help users.");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages((msgs) => [...msgs, { role: "user", content: input }]);

    // Send to backend
    const res = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        userInput: input,
        systemInput: systemInput,
        threadId: threadId 
      }),
    });
    const data = await res.json();

    // Store threadId from first response
    if (data.threadId && !threadId) {
      setThreadId(data.threadId);
    }

    // Add response message
    setMessages((msgs) => [
      ...msgs,
      { role: "assistant", content: data.message || "No response" },
    ]);
    setInput("");
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full max-w-md">
        <div className="flex flex-col gap-2 w-full min-h-[200px] border rounded p-4 bg-white">
          {threadId && (
            <div className="text-xs text-gray-500 mb-2 border-b pb-2">
              Thread ID: {threadId}
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={msg.role === "user" ? "text-right text-blue-700" : "text-left text-gray-700"}
            >
              <span className="block">{msg.content}</span>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col gap-2 w-full">
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={systemInput}
            onChange={(e) => setSystemInput(e.target.value)}
            placeholder="System prompt (optional)..."
            disabled={!!threadId} // Disable after first message
          />
          {threadId && (
            <p className="text-xs text-gray-500">System prompt is set for this conversation</p>
          )}
        </div>

        <form onSubmit={handleSend} className="flex gap-2 w-full">
          <input
            className="flex-1 border rounded px-3 py-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            autoFocus
          />
          <Button type="submit">Send</Button>
        </form>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <p>This is the footer</p>
      </footer>
    </div>
  );
}
