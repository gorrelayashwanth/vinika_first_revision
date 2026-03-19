// Live Customer Support Chat Widget
// Floating chat button and chat window for customers

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  createChatSession, sendChatMessage, subscribeToChatMessages, ChatMessage,
} from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ChatWidget = () => {
  const { user, firebaseUser } = useApp();
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Start session when chat opens
  useEffect(() => {
    if (!open || !firebaseUser) return;
    if (sessionId) return;
    setSessionLoading(true);
    createChatSession(
      firebaseUser.uid,
      user?.name || firebaseUser.displayName || "Customer",
      user?.email || firebaseUser.email || ""
    ).then(id => {
      setSessionId(id);
      setSessionLoading(false);
    });
  }, [open, firebaseUser]);

  // Subscribe to messages
  useEffect(() => {
    if (!sessionId) return;
    const unsub = subscribeToChatMessages(sessionId, setMessages);
    return unsub;
  }, [sessionId]);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !sessionId || !firebaseUser) return;
    setLoading(true);
    try {
      await sendChatMessage(
        sessionId,
        text.trim(),
        "user",
        user?.name || firebaseUser.displayName || "Customer"
      );
      setText("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!firebaseUser) return null; // Only show for logged-in users

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Window */}
      {open && (
        <div className="w-80 h-[450px] bg-card rounded-2xl shadow-warm-lg border border-border flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center justify-between shrink-0">
            <div>
              <h3 className="font-heading text-sm font-bold text-primary-foreground">Support Chat</h3>
              <p className="text-primary-foreground/70 text-xs">Vinika Food Thoughts</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-primary-foreground/80 hover:text-primary-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {sessionLoading && (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                <p className="text-xs text-muted-foreground mt-2">Connecting...</p>
              </div>
            )}
            {!sessionLoading && messages.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="h-8 w-8 text-primary/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Send a message to start the conversation. Our team typically replies within a few hours.</p>
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-secondary text-foreground rounded-bl-sm"
                }`}>
                  {msg.sender === "admin" && (
                    <p className="text-[10px] font-bold mb-0.5 opacity-70">Vinika Support</p>
                  )}
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-border flex gap-2 shrink-0">
            <Input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 h-9 text-sm"
              disabled={loading || sessionLoading}
            />
            <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={loading || !text.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="h-14 w-14 bg-primary text-primary-foreground rounded-full shadow-warm-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
};

export default ChatWidget;
