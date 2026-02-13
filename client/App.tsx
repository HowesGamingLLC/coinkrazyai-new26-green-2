import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Store from "./pages/Store";
import PlaceholderPage from "./pages/PlaceholderPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/store" element={<Store />} />
            <Route path="/slots" element={<PlaceholderPage title="Slots" description="25 customizable games featuring SlotsAI RTP monitoring." />} />
            <Route path="/poker" element={<PlaceholderPage title="Poker" description="Real-money SC tables monitored by JoseyAI." />} />
            <Route path="/bingo" element={<PlaceholderPage title="Bingo" description="10 rooms with rolling jackpots and auto-ball calling." />} />
            <Route path="/sportsbook" element={<PlaceholderPage title="Sportsbook" description="SC-only parlay bets with live lines and spreads." />} />
            <Route path="/admin" element={<PlaceholderPage title="Admin Panel" description="Full control over games, AI employees, and analytics." />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
