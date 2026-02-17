import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageSquare, X, Send, Cpu, Bot, Loader2, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  agent?: string;
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    text: "Hello! I'm LuckyAI, your personal casino optimizer. How can I help you win today?",
    sender: 'ai',
    agent: 'LuckyAI',
    timestamp: new Date(),
  },
];

export const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let aiResponse = "I'm analyzing the platform data for you. Everything looks optimal!";
      let agent = "LuckyAI";

      if (inputValue.toLowerCase().includes('win') || inputValue.toLowerCase().includes('luck')) {
        aiResponse = "I've optimized the slots RTP for your next session. Good luck!";
      } else if (inputValue.toLowerCase().includes('security') || inputValue.toLowerCase().includes('safe')) {
        aiResponse = "SecurityAI here. Your wallet and account are fully protected by our 256-bit encryption.";
        agent = "SecurityAI";
      } else if (inputValue.toLowerCase().includes('bonus') || inputValue.toLowerCase().includes('free')) {
        aiResponse = "PromotionsAI has just added a small surprise to your account. Check your daily bonus!";
        agent = "PromotionsAI";
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        agent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
      {/* Chat Window */}
      {isOpen && (
        <Card className="w-80 md:w-96 h-[500px] flex flex-col shadow-2xl border-2 border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="bg-primary p-4 text-primary-foreground rounded-t-lg flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-black italic">KRAZY AI ASSISTANT</CardTitle>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold uppercase opacity-80">Online & Optimized</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="hover:bg-white/10 text-white h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col max-w-[85%]",
                  message.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                {message.agent && (
                  <span className="text-[10px] font-black uppercase text-slate-500 mb-1 ml-1 flex items-center gap-1">
                    {message.agent === 'SecurityAI' ? <ShieldCheck className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                    {message.agent}
                  </span>
                )}
                <div
                  className={cn(
                    "p-3 rounded-2xl text-sm font-medium shadow-sm",
                    message.sender === 'user'
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tl-none"
                  )}
                >
                  {message.text}
                </div>
                <span className="text-[8px] text-slate-500 mt-1 uppercase font-bold">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {isTyping && (
              <div className="flex flex-col items-start max-w-[85%]">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl rounded-tl-none shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <CardFooter className="p-4 border-t bg-white dark:bg-slate-950/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex w-full gap-2"
            >
              <Input
                placeholder="Ask LuckyAI something..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-900"
              />
              <Button type="submit" size="icon" className="shrink-0" disabled={!inputValue.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}

      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className={cn(
          "w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300",
          isOpen ? "bg-slate-900 rotate-90" : "bg-primary hover:scale-110"
        )}
      >
        {isOpen ? (
          <X className="w-8 h-8" />
        ) : (
          <div className="relative">
            <Cpu className="w-8 h-8" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse" />
          </div>
        )}
      </Button>
    </div>
  );
};
