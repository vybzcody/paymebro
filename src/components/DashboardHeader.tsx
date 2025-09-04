import { Button } from "@/components/ui/button";
import { Bell, Menu, Settings, User, HelpCircle, CreditCard, LogOut, Wallet, Copy } from "lucide-react";
import { useState } from "react";
import { useMultiChainWeb3Auth } from '@/contexts/MultiChainWeb3AuthContext';
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { DarkModeToggle } from "./DarkModeToggle";
import { CurrencySwitcher } from "./CurrencySwitcher";
import { ChainSwitcher } from "./ChainSwitcher";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const DashboardHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, activeChain, wallets } = useMultiChainWeb3Auth();
  const { toast: toastHook } = useToast();
  const unreadNotifications = 3;

  // Get address for active chain
  const activeWallet = wallets[activeChain];
  const walletAddress = activeWallet?.address || 'Not connected';

  const copyAddress = () => {
    if (walletAddress && walletAddress !== 'Not connected') {
      navigator.clipboard.writeText(walletAddress);
      toast.success('Address copied to clipboard!');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed. Please try again.');
    }
  };

  const navigationItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/invoices", label: "Invoices" },
    { href: "/customers", label: "Customers" },
    { href: "/analytics", label: "Analytics" },
  ];

  const NavLink = ({ href, label, mobile = false }: { href: string; label: string; mobile?: boolean }) => {
    const isActive = window.location.pathname === href;
    const baseClasses = mobile
      ? "block px-3 py-2 rounded-lg text-left w-full"
      : "transition-colors";
    const activeClasses = isActive
      ? "text-primary font-medium" + (mobile ? " bg-primary/10" : "")
      : "text-muted-foreground hover:text-primary";

    return (
      <Link
        to={href}
        className={`${baseClasses} ${activeClasses}`}
        onClick={() => mobile && setIsOpen(false)}
      >
        {label}
      </Link>
    );
  };

  const formatWalletAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-card border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <img 
              src="/afripay.png" 
              alt="AfriPay" 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-contain"
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                AfriPay
              </h1>
              <p className="text-xs text-muted-foreground">Merchant Dashboard</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Hide some items on mobile */}
            <div className="hidden sm:flex items-center space-x-3">
              <ChainSwitcher />
              <CurrencySwitcher />
              <DarkModeToggle />
            </div>
            
            {/* Notifications - always visible */}
            <Button variant="ghost" size="sm" className="relative" asChild>
              <Link to="/notifications">
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </Link>
            </Button>

            {/* Hide utility buttons on mobile */}
            <div className="hidden md:flex items-center space-x-3">
              <Button variant="ghost" size="sm" asChild>
                <a href="/billing">
                  <CreditCard className="w-4 h-4" />
                </a>
              </Button>

              <Button variant="ghost" size="sm" asChild>
                <a href="/help">
                  <HelpCircle className="w-4 h-4" />
                </a>
              </Button>

              <Button variant="ghost" size="sm" asChild>
                <a href="/settings">
                  <Settings className="w-4 h-4" />
                </a>
              </Button>
            </div>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={user?.profile?.avatar_url || ''} />
                    <AvatarFallback>
                      {user?.profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-sm">
                    {user?.profile?.full_name || 'User'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {user?.name || user?.profile?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                    {walletAddress && walletAddress !== 'Not connected' && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground flex items-center">
                          <Wallet className="w-3 h-3 mr-1" />
                          {formatWalletAddress(walletAddress)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={copyAddress}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/profile" className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/billing" className="flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Billing
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/settings" className="flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button size="sm" className="lg:hidden ml-2">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[300px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <img 
                      src="/afripay.png" 
                      alt="AfriPay" 
                      className="w-8 h-8 rounded-lg object-contain"
                    />
                    AfriPay
                  </SheetTitle>
                </SheetHeader>
                
                {/* Mobile Navigation */}
                <nav className="mt-6 space-y-2">
                  {navigationItems.map((item) => (
                    <NavLink key={item.href} href={item.href} label={item.label} mobile />
                  ))}
                </nav>

                {/* Mobile Controls */}
                <div className="mt-6 space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Settings</h3>
                    <ChainSwitcher />
                    <CurrencySwitcher />
                    <DarkModeToggle />
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t">
                    <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                      <a href="/billing">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Billing
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                      <a href="/help">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Help
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                      <a href="/settings">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </a>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
