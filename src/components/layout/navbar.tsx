import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Coins, Copy, Check, Globe, LogOut } from "lucide-react";
import { useState } from "react";

interface User {
  name?: string;
  email?: string;
  profileImage?: string;
}

interface NavbarProps {
  user: User | null;
  address?: string;
  network?: string;
  onLogout: () => void;
}

export function Navbar({ user, address, network = "devnet", onLogout }: NavbarProps) {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Coins className="h-6 w-6 text-green-600" />
            <span className="font-bold text-xl text-gray-900">AfriPay</span>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-xs hidden sm:flex">
                <Globe className="h-3 w-3 mr-1" />
                {network}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email || 'user'}`} 
                        alt={user.name || user.email || 'User'} 
                      />
                      <AvatarFallback>
                        {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name || 'User'}
                      </p>
                      {user.email && (
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem className="flex items-center justify-between p-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Wallet Address</span>
                      <span className="text-sm font-mono">
                        {address ? formatAddress(address) : 'Not connected'}
                      </span>
                    </div>
                    {address && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyAddress}
                        className="h-6 w-6 p-0"
                      >
                        {copied ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      Network
                    </div>
                    <Badge variant={network === 'mainnet' ? 'default' : 'secondary'}>
                      {network}
                    </Badge>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={onLogout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
