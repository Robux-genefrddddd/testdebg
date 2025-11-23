import { RequestHandler } from "express";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
}

interface ChatResponse {
  content: string;
  error?: string;
}

export const handleChat: RequestHandler = async (req, res) => {
  try {
    const { messages } = req.body as ChatRequest;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    if (!messages.length) {
      return res.status(400).json({ error: "At least one message is required" });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "OpenRouter API key not configured" });
    }

    // Inject system prompt if not already present
    const messagesWithSystem = messages[0]?.role === "system"
      ? messages
      : [
          {
            role: "system" as const,
            content: `You are a helpful, knowledgeable AI assistant. You provide clear, accurate, and thoughtful responses to user questions. You're professional yet approachable, and you always strive to understand the user's needs fully before providing a response. You can help with a wide range of topics including programming, writing, analysis, problem-solving, and general knowledge. Always be honest about the limitations of your knowledge, and encourage users to verify important information from authoritative sources when appropriate.`,
          },
          ...messages,
        ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": req.get("origin") || "http://localhost:8080",
        "X-Title": "Chat Application",
      },
      body: JSON.stringify({
        model: "xai/grok-4.1-fast",
        messages: messagesWithSystem,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter API error:", error);
      return res.status(response.status).json({
        error: `OpenRouter API error: ${response.statusText}`,
        details: error,
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    if (!content) {
      return res
        .status(500)
        .json({ error: "No response from OpenRouter API" });
    }

    res.json({ content });
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({
      error: "Failed to process chat request",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
