import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, Search, UserPlus, Send, History, Loader2, Sparkles, Trophy } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { apiCall } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Community = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('messages');
  const [threads, setThreads] = useState<any[]>([]);
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(4521);

  useEffect(() => {
    fetchThreads();
    fetchPlatformStats();
  }, []);

  const fetchPlatformStats = async () => {
    try {
      const response = await apiCall<{ success: boolean; data: any }>('/platform/stats');
      if (response.success && response.data.activePlayers) {
        setOnlineCount(response.data.activePlayers);
      }
    } catch (error) {
      console.error('Failed to fetch platform stats:', error);
    }
  };

  const fetchThreads = async () => {
    try {
      setIsLoading(true);
      const response = await apiCall<any[]>('/messages/threads');
      setThreads(response || []);
    } catch (error) {
      console.error('Failed to fetch threads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (userId: number) => {
    try {
      setIsLoading(true);
      const response = await apiCall<any[]>(`/messages/conversation?otherUserId=${userId}`);
      setMessages(response || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread) return;

    try {
      await apiCall('/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          recipientId: selectedThread.userId,
          message: newMessage,
          subject: 'Direct Message'
        }),
      });
      setNewMessage('');
      fetchMessages(selectedThread.userId);
      toast.success('Message sent!');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) return;
    try {
      setIsLoading(true);
      const response = await apiCall<any>(`/players/search?search=${searchQuery}`);
      setSearchResults(response.players || []);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tight uppercase flex items-center gap-3">
            <Users className="w-10 h-10 text-primary" />
            Player Community
          </h1>
          <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest mt-1">Connect, Chat, and Share Wins</p>
        </div>
        <div className="flex items-center gap-2">
           <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 font-black uppercase italic">
             Online Players: {onlineCount.toLocaleString()}
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Sidebar: Threads & Search */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-2 border-slate-100 shadow-xl overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search players..." 
                  className="pl-10 bg-slate-800 border-none text-white placeholder:text-slate-500 h-10"
                  value={searchQuery}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-none bg-slate-100 p-0 h-12">
                  <TabsTrigger value="messages" className="data-[state=active]:bg-white data-[state=active]:shadow-none rounded-none border-b-2 data-[state=active]:border-primary font-black uppercase text-[10px] tracking-widest">Messages</TabsTrigger>
                  <TabsTrigger value="search" className="data-[state=active]:bg-white data-[state=active]:shadow-none rounded-none border-b-2 data-[state=active]:border-primary font-black uppercase text-[10px] tracking-widest">Search</TabsTrigger>
                </TabsList>
                
                <TabsContent value="messages" className="m-0 max-h-[500px] overflow-y-auto">
                  {isLoading && threads.length === 0 ? (
                    <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                  ) : threads.length > 0 ? (
                    threads.map((thread) => (
                      <button 
                        key={thread.userId}
                        onClick={() => {
                          setSelectedThread(thread);
                          fetchMessages(thread.userId);
                        }}
                        className={cn(
                          "w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors border-b last:border-0",
                          selectedThread?.userId === thread.userId && "bg-primary/5 border-l-4 border-l-primary"
                        )}
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center font-black text-slate-500 overflow-hidden border-2 border-white shadow-md">
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${thread.username}`} alt="Avatar" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-black text-sm uppercase italic">{thread.username}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase truncate">Last active: {new Date(thread.lastMessageAt).toLocaleDateString()}</p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      </button>
                    ))
                  ) : (
                    <div className="p-12 text-center text-slate-400 font-bold italic uppercase text-xs">No conversations yet</div>
                  )}
                </TabsContent>

                <TabsContent value="search" className="m-0 max-h-[500px] overflow-y-auto">
                   {searchResults.length > 0 ? (
                     searchResults.map((player) => (
                       <div key={player.id} className="p-4 flex items-center justify-between border-b last:border-0">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border">
                               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`} alt="Avatar" />
                            </div>
                            <div>
                               <p className="font-black text-sm uppercase italic">{player.username}</p>
                               <Badge variant="outline" className="text-[8px] font-black h-4 px-1 uppercase">{player.kyc_level} Level</Badge>
                            </div>
                         </div>
                         <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => {
                            setSelectedThread({ userId: player.id, username: player.username });
                            setMessages([]);
                            setActiveTab('messages');
                         }}>
                            <MessageSquare className="w-4 h-4 text-primary" />
                         </Button>
                       </div>
                     ))
                   ) : (
                     <div className="p-12 text-center text-slate-400 font-bold italic uppercase text-xs">Search for players above</div>
                   )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* AI Notice */}
          <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-2xl overflow-hidden relative group">
             <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
             <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6" />
                   </div>
                   <h3 className="font-black italic uppercase tracking-tight">SocialAI Active</h3>
                </div>
                <p className="text-xs font-bold text-indigo-100 leading-relaxed uppercase italic">
                  Our SocialAI monitor ensures a safe and friendly environment. Any abusive behavior will be automatically flagged.
                </p>
                <div className="flex gap-2">
                   <Badge className="bg-white/20 text-white border-none text-[8px] font-black uppercase">24/7 Moderation</Badge>
                   <Badge className="bg-white/20 text-white border-none text-[8px] font-black uppercase">Instant Flagging</Badge>
                </div>
             </CardContent>
          </Card>
        </div>

        {/* Right Area: Conversation */}
        <div className="lg:col-span-2">
          {selectedThread ? (
            <Card className="border-4 border-slate-900 shadow-2xl h-[650px] flex flex-col">
              <CardHeader className="bg-slate-900 text-white p-6 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-2 border-white/20">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedThread.username}`} alt="Avatar" />
                   </div>
                   <div>
                      <CardTitle className="text-xl font-black italic uppercase tracking-tight">{selectedThread.username}</CardTitle>
                      <div className="flex items-center gap-1.5">
                         <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                         <span className="text-[10px] font-black uppercase text-slate-400">Connected</span>
                      </div>
                   </div>
                </div>
                <div className="flex gap-2">
                   <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-xl">
                      <History className="w-5 h-5" />
                   </Button>
                   <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-xl">
                      <Trophy className="w-5 h-5" />
                   </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-slate-950/50">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={cn(
                        "flex flex-col max-w-[80%]",
                        msg.sender_id === user?.id ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      <div className={cn(
                        "p-4 rounded-2xl text-sm font-medium shadow-sm border-2",
                        msg.sender_id === user?.id 
                          ? "bg-slate-900 border-slate-800 text-white rounded-tr-none" 
                          : "bg-white border-slate-200 rounded-tl-none"
                      )}>
                        {msg.message}
                      </div>
                      <span className="text-[8px] font-black uppercase text-slate-400 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
                     <MessageSquare className="w-16 h-16" />
                     <p className="font-black italic uppercase">Start a conversation with {selectedThread.username}</p>
                  </div>
                )}
              </CardContent>

              <div className="p-6 border-t bg-white">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="flex gap-3"
                >
                  <Input 
                    placeholder={`Write a message to ${selectedThread.username}...`}
                    className="h-14 bg-slate-50 border-2 focus:border-primary font-medium"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <Button size="icon" className="h-14 w-14 rounded-2xl shadow-xl shadow-primary/20 shrink-0" type="submit" disabled={!newMessage.trim()}>
                    <Send className="w-6 h-6" />
                  </Button>
                </form>
              </div>
            </Card>
          ) : (
            <Card className="border-4 border-dashed border-slate-200 h-[650px] flex flex-col items-center justify-center bg-slate-50/50 text-slate-400 gap-6">
               <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center">
                  <MessageSquare className="w-12 h-12 opacity-30" />
               </div>
               <div className="text-center">
                  <h3 className="text-2xl font-black italic uppercase tracking-tight">Your Inbox is Empty</h3>
                  <p className="text-sm font-bold uppercase text-slate-400 mt-1 italic">Select a player to start chatting</p>
               </div>
               <Button variant="outline" className="h-12 px-8 border-2 font-black italic uppercase rounded-xl" onClick={() => setActiveTab('search')}>
                  <Search className="w-4 h-4 mr-2" />
                  Find Players
               </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;
