import { Button } from "@/components/ui/button";
import { Bell, Menu, Settings, User, HelpCircle, Users, CreditCard, LogOut, Wallet } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { DarkModeToggle } from "./DarkModeToggle";
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
  const { user, logout, walletAddress } = useAuth();
  const { toast } = useToast();
  const unreadNotifications = 3; // Mock unread count

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been disconnected from your wallet.",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const navigationItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/payment-links", label: "Payment Links" },
    { href: "/transactions", label: "Transactions" },
    { href: "/qr-codes", label: "QR Codes" },
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

  // Format wallet address for display
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
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                AfriPay
              </h1>
              <p className="text-xs text-muted-foreground">Merchant Dashboard</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <DarkModeToggle />
            
            <Button variant="ghost" size="sm" className="relative" asChild>
              <Link to="/notifications">
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </Link>
            </Button>

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
                  <span className="hidden sm:inline text-sm">
                    {user?.profile?.full_name || 'User'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {user?.profile?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                    {walletAddress && (
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Wallet className="w-3 h-3 mr-1" />
                        {formatWalletAddress(walletAddress)}
                      </p>
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
                <Button size="sm" className="md:hidden">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">A</span>
                    </div>
                    AfriPay
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-6 space-y-2">
                  {navigationItems.map((item) => (
                    <NavLink key={item.href} href={item.href} label={item.label} mobile />
                  ))}
                  <div className="border-t pt-4 mt-4 space-y-2">
                    <NavLink href="/customers" label="Customers" mobile />
                    <NavLink href="/billing" label="Billing" mobile />
                    <NavLink href="/profile" label="Profile" mobile />
                    <div className="flex items-center justify-between">
                      <Link to="/notifications" className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors">
                        <Bell className="w-4 h-4" />
                        <span>Notifications</span>
                      </Link>
                      {unreadNotifications > 0 && (
                        <span className="w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                          {unreadNotifications}
                        </span>
                      )}
                    </div>
                    <NavLink href="/settings" label="Settings" mobile />
                    <NavLink href="/help" label="Help & Support" mobile />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};