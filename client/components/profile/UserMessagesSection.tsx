import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, Send, CheckCheck, Clock, User } from 'lucide-react';
import { toast } from 'sonner';
import { apiCall } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message_text: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  sender_role?: string;
}

export const UserMessagesSection: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await apiCall<Message[]>('/messages');
      if (response) {
        setMessages(response);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setIsSending(true);
      const response = await apiCall<any>('/messages/send', {
        method: 'POST',
        body: JSON.stringify({ messageText: newMessage }),
      });

      if (response.success) {
        setNewMessage('');
        toast.success('Message sent to support!');
        fetchMessages();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const markAsRead = async (messageId: number) => {
    try {
      await apiCall(`/messages/read`, {
        method: 'POST',
        body: JSON.stringify({ messageId }),
      });
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_read: true } : m));
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-100 dark:border-blue-900 shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Support Messages</CardTitle>
              <CardDescription>Direct line to CoinKrazy support team</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="border-blue-200 text-blue-600 font-black">
            {messages.filter(m => !m.is_read && m.sender_role === 'admin').length} NEW
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col h-[500px]">
          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <p className="font-bold text-slate-500">No messages yet</p>
                  <p className="text-xs text-slate-400">Send a message to start a conversation</p>
                </div>
              </div>
            ) : (
              messages.map((message) => {
                const isFromMe = message.sender_role !== 'admin';
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex flex-col max-w-[80%] space-y-1",
                      isFromMe ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                    onMouseEnter={() => !message.is_read && !isFromMe && markAsRead(message.id)}
                  >
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {isFromMe ? 'You' : message.sender_name || 'Support Agent'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 text-sm shadow-sm border transition-all",
                        isFromMe
                          ? "bg-blue-600 text-white border-blue-500 rounded-tr-none"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-tl-none"
                      )}
                    >
                      {message.message_text}
                    </div>
                    {isFromMe && (
                      <div className="flex items-center gap-1 mt-1 px-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter italic">
                          {message.is_read ? 'Seen' : 'Sent'}
                        </span>
                        {message.is_read ? (
                          <CheckCheck className="w-3 h-3 text-blue-500" />
                        ) : (
                          <Clock className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 border-t bg-white dark:bg-slate-900">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message to support..."
                className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={isSending}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                disabled={isSending || !newMessage.trim()}
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center font-bold uppercase tracking-widest italic">
              Our AI agents and support team typically respond within 15 minutes.
            </p>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};
