import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  LifeBuoy, 
  MessageCircle, 
  FileText, 
  Search, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  PlusCircle,
  Send
} from 'lucide-react';
import { apiCall } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

interface SupportTicket {
  id: number;
  subject: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  created_at: string;
  updated_at: string;
}

const Support = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);
  
  // New ticket form
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('General');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const response = await apiCall<{ success: boolean; data: SupportTicket[] }>('/support/tickets');
      if (response.success) {
        setTickets(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      // Fallback for demo if API fails
      setTickets([
        { id: 101, subject: 'Withdrawal processing time', status: 'In Progress', priority: 'Medium', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 98, subject: 'Verification document rejected', status: 'Resolved', priority: 'High', created_at: new Date(Date.now() - 86400000).toISOString(), updated_at: new Date().toISOString() }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await apiCall<{ success: boolean; data: SupportTicket }>('/support/tickets', {
        method: 'POST',
        body: JSON.stringify({ subject, message, category })
      });

      if (response.success) {
        toast.success('Ticket created successfully');
        setSubject('');
        setMessage('');
        setShowNewTicket(false);
        fetchTickets();
      }
    } catch (error) {
      toast.error('Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'In Progress': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Resolved': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Closed': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tight uppercase flex items-center gap-3">
            <LifeBuoy className="w-10 h-10 text-primary" />
            Help & Support
          </h1>
          <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest mt-1">24/7 Assistance for our Players</p>
        </div>
        <Button 
          className="font-black italic uppercase tracking-wider"
          onClick={() => setShowNewTicket(!showNewTicket)}
        >
          {showNewTicket ? 'Cancel' : (
            <>
              <PlusCircle className="w-4 h-4 mr-2" />
              New Support Ticket
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Support Options */}
        <div className="space-y-6">
          <Card className="border-2 border-slate-100 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg font-black uppercase italic">Quick Help</CardTitle>
              <CardDescription>Common support channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start h-16 border-2 hover:bg-slate-50">
                <div className="bg-primary/10 p-2 rounded-lg mr-4">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-black uppercase text-xs italic">Live Chat</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Average response: 2 mins</p>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start h-16 border-2 hover:bg-slate-50">
                <div className="bg-blue-500/10 p-2 rounded-lg mr-4">
                  <FileText className="w-6 h-6 text-blue-500" />
                </div>
                <div className="text-left">
                  <p className="font-black uppercase text-xs italic">Knowledge Base</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Self-service articles</p>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white border-none shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white font-black uppercase italic">Safety First</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                <p className="text-xs font-bold text-slate-400 uppercase leading-relaxed">
                  Encrypted secure messaging
                </p>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                <p className="text-xs font-bold text-slate-400 uppercase leading-relaxed">
                  Verified support agents
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {showNewTicket ? (
            <Card className="border-4 border-primary shadow-2xl overflow-hidden">
              <CardHeader className="bg-primary text-primary-foreground p-6">
                <CardTitle className="text-2xl font-black italic uppercase">Create New Ticket</CardTitle>
                <CardDescription className="text-primary-foreground/80 font-bold uppercase italic">
                  Our team will respond within 24 hours
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleCreateTicket}>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label className="font-black uppercase italic text-xs">Subject</Label>
                    <Input 
                      placeholder="Briefly describe the issue..."
                      className="border-2 font-bold h-12"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-black uppercase italic text-xs">Category</Label>
                      <select 
                        className="w-full h-12 rounded-md border-2 bg-background px-3 py-2 text-sm font-bold"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option>General</option>
                        <option>Account</option>
                        <option>Payment</option>
                        <option>Technical</option>
                        <option>Games</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black uppercase italic text-xs">Priority</Label>
                      <Badge className="h-12 w-full flex items-center justify-center bg-slate-100 text-slate-900 border-2 font-black italic uppercase">
                        Standard
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black uppercase italic text-xs">Detailed Description</Label>
                    <Textarea 
                      placeholder="Tell us everything we need to know..."
                      className="min-h-[150px] border-2 font-bold"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50 p-6 flex justify-end gap-4">
                  <Button variant="ghost" type="button" onClick={() => setShowNewTicket(false)} className="font-black uppercase italic">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="font-black uppercase italic px-8 h-12 shadow-xl shadow-primary/20">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Ticket
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          ) : (
            <Card className="border-2 border-slate-100 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-black uppercase italic">Your Support Tickets</CardTitle>
                <CardDescription>Track the status of your requests</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  </div>
                ) : tickets.length > 0 ? (
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <div 
                        key={ticket.id} 
                        className="flex items-center justify-between p-4 rounded-xl border-2 hover:border-primary/50 transition-colors cursor-pointer group bg-slate-50/30"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-white border-2 flex items-center justify-center text-slate-400 font-black italic">
                            #{ticket.id}
                          </div>
                          <div>
                            <h4 className="font-black uppercase italic text-sm group-hover:text-primary transition-colors">
                              {ticket.subject}
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                              <Badge className={cn("text-[8px] font-black uppercase h-5", getStatusColor(ticket.status))}>
                                {ticket.status}
                              </Badge>
                              <span className="text-[8px] text-muted-foreground font-bold uppercase flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(ticket.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-all" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-4">
                    <AlertCircle className="w-12 h-12 mx-auto text-slate-200" />
                    <p className="text-slate-400 font-bold uppercase italic text-sm">No support tickets found</p>
                    <Button variant="outline" onClick={() => setShowNewTicket(true)} className="border-2 font-black uppercase italic">
                      Create Your First Ticket
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* FAQ Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2 hover:border-primary/30 transition-all cursor-pointer group">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-black uppercase italic text-xs mb-1 group-hover:text-primary transition-colors">How do I verify my account?</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Identity verification guide</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary" />
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/30 transition-all cursor-pointer group">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-black uppercase italic text-xs mb-1 group-hover:text-primary transition-colors">Redemption timelines</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">When will I get my coins?</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
