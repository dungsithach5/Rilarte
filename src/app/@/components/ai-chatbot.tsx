"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatbotFloating() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Xin chào! Tôi có thể giúp gì cho bạn?", fromBot: true },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { text: input, fromBot: false };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    try {
      const res = await axios.post("http://localhost:5000/api/gemini", {
        message: input,
      });
      const botMsg = { text: res.data.reply, fromBot: true };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { text: "(Lỗi kết nối Gemini)", fromBot: true },
      ]);
    }
  };

  return (
    <div>
      {/* Nút mở chat */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed z-50 bottom-6 right-6 w-14 h-14 rounded-full bg-black text-white flex items-center justify-center shadow-sm hover:bg-gray-800 transition-all cursor-pointer"
        aria-label="Mở chatbot"
      >
        <Bot size={30} />
      </button>

      {/* Hộp chat có animation */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chatbox"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 bottom-24 right-6 w-[450px] max-w-[90vw] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
          >
            <div className="bg-black text-white px-4 py-3 font-semibold flex justify-between items-center">
              <span>Chatbot</span>
              <button
                onClick={() => setOpen(false)}
                className="text-white text-lg"
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            {/* Danh sách tin nhắn */}
            <div
              className="p-3 bg-gray-50 overflow-y-auto"
              style={{ maxHeight: "400px", minHeight: "200px" }}
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-2 flex ${
                    msg.fromBot ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-[70%] text-sm ${
                      msg.fromBot
                        ? "bg-gray-200 text-gray-800"
                        : "bg-black text-white"
                    }`}
                  >
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Ô nhập liệu */}
            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 p-3 border-t bg-white"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 rounded-full border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Nhập tin nhắn..."
                autoFocus
              />
              <button
                type="submit"
                className="rounded-full bg-black text-white w-10 h-10 flex items-center justify-center hover:bg-gray-800"
                aria-label="Gửi"
              >
                <ArrowUp size={20} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
