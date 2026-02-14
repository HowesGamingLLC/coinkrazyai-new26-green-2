import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useWallet } from '@/hooks/use-wallet';
import { Coins, User, Home, Gamepad2, ShoppingCart, BarChart3, MessageSquare, Trophy, Award, Headphones, Settings, Zap, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { wallet, currency, toggleCurrency } = useWallet();
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Games', path: '/games', icon: Gamepad2 },
    { label: 'Slots', path: '/slots', icon: Zap },
    { label: 'Poker', path: '/poker', icon: Coins },
    { label: 'Bingo', path: '/bingo', icon: Gamepad2 },
    { label: 'Sports', path: '/sportsbook', icon: BarChart3 },
    { label: 'Store', path: '/store', icon: ShoppingCart },
    { label: 'Leaderboard', path: '/leaderboards', icon: Trophy },
    { label: 'Achievements', path: '/achievements', icon: Award },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Wallet', path: '/wallet', icon: Coins },
    { label: 'Settings', path: '/account', icon: Settings },
    { label: 'Support', path: '/support', icon: Headphones },
    ...(isAdmin ? [{ label: 'Admin', path: '/admin', icon: BarChart3 }] : []),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-black text-xl italic">CK</span>
            </div>
            <span className="font-bold text-2xl tracking-tighter hidden sm:inline-block">
              CoinKrazy<span className="text-primary">AI2</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Currency Toggle */}
                <div className="flex items-center bg-muted rounded-full p-1 border border-border">
                  <button
                    onClick={() => currency !== 'GC' && toggleCurrency()}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold transition-all",
                      currency === 'GC' ? "bg-secondary text-secondary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    GC
                  </button>
                  <button
                    onClick={() => currency !== 'SC' && toggleCurrency()}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold transition-all",
                      currency === 'SC' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    SC
                  </button>
                </div>

                {/* Balance Display */}
                <div className="hidden sm:flex items-center gap-2 bg-muted/50 px-4 py-1.5 rounded-full border border-border">
                  <Coins className={cn("w-4 h-4", currency === 'GC' ? "text-secondary" : "text-primary")} />
                  <span className="font-mono font-bold">
                    {currency === 'GC'
                      ? Number(wallet?.goldCoins ?? 0).toLocaleString()
                      : Number(wallet?.sweepsCoins ?? 0).toFixed(2)}
                  </span>
                </div>

                <Button asChild variant="default" className="hidden sm:flex">
                  <Link to="/store">GET COINS</Link>
                </Button>

                {/* User Menu */}
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/profile">{user?.username}</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={logout}
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar / Sidebar Navigation */}
        <aside className="fixed left-0 top-16 hidden h-[calc(100vh-4rem)] w-64 border-r border-border md:block overflow-y-auto">
          <nav className="flex flex-col gap-2 p-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  location.pathname === item.path 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            
            <div className="mt-8 px-3 py-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">AI ASSISTANTS</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>LuckyAI (Manager)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>SecurityAI</span>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-background md:hidden">
        {navItems.slice(0, 4).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 text-xs",
              location.pathname === item.path ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
        <Link to="/store" className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
          <ShoppingCart className="w-5 h-5" />
          <span>Store</span>
        </Link>
      </nav>
    </div>
  );
};
