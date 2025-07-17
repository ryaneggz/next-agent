import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

interface Event {
  function: string;
  args: any;
  content: string;
}

function handleEvent(event: Event = { function: "done_for_now", args: {}, content: "" }) {
  if (event.function === "done_for_now") {
    return {
      function: "done_for_now",
      args: {
        query: event.args.query,
        threadId: event.args.threadId,
      },
      content: "The weather in Dallas is 70 degrees",
    };
  } else if (event.function === "get_weather") {
    return {
      function: "get_weather",
      args: {
        location: "Dallas",
      },
    };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const event = handleEvent(body);

    return NextResponse.json({ 
      event,
      success: true
    });
  } catch (error) {
    console.error('Error in agent route:', error);
    return NextResponse.json(
      { message: "Error processing request", success: false },
      { status: 500 }
    );
  }
}
