"use client";

import React from "react";
import axios from "axios";
import { Send } from "lucide-react";

interface IDoc {
  pageContent: string;
  metadata?: Record<string, any>;
  id?: string;
}

interface Imessage {
  role: "assistant" | "user";
  content?: string;
  documents?: string[];
}

interface ApiResponse {
  docs: IDoc[];
  messages: string;
}

const Chat: React.FC = () => {
  const [message, setMessage] = React.useState<string>("");
  const [messages, setMessages] = React.useState<Imessage[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    setLoading(true);

    try {
      const res = await axios.get<ApiResponse>(
        process.env.NEXT_PUBLIC_BASE_URL + "/chat",
        {
          params: { message },
        },
      );

      const aiReply = res.data.messages;
      const docs = res.data.docs?.map((doc) => doc.pageContent);

      // Add assistant message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiReply,
          documents: docs,
        },
      ]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Error fetching response from server.",
        },
      ]);
    } finally {
      setLoading(false);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-black text-white rounded-2xl border border-gray-800">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <div key={index}>
            <div
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-md whitespace-pre-wrap ${
                  msg.role === "user" ? "bg-blue-600" : "bg-gray-800"
                }`}
              >
                {msg.content}
              </div>
            </div>
            {msg.documents && msg.documents.length > 0 && (
              <div className="mt-2 ml-2 space-y-2">
                <p className="text-xs text-gray-400">📄 Retrieved Context</p>
                {msg.documents.map((doc, i) => (
                  <div
                    key={i}
                    className="bg-gray-900 border border-gray-700 p-3 rounded-lg text-xs text-gray-300"
                  >
                    {doc}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && <div className="text-gray-400 text-sm">Thinking...</div>}
      </div>
      <div className="border-t border-gray-800 p-4 bg-black">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask something from the document..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 bg-gray-900 text-white placeholder-gray-400 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl transition disabled:opacity-50"
          >
            <Send size={18} />
            Ask
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
