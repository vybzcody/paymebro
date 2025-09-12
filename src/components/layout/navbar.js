import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Coins, Copy, Check, Globe, LogOut } from "lucide-react";
import { useState } from "react";
export function Navbar({ user, address, network = "devnet", onLogout }) {
    const [copied, setCopied] = useState(false);
    const copyAddress = async () => {
        if (address) {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    const formatAddress = (addr) => {
        return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
    };
    return (_jsx("nav", { className: "border-b bg-white shadow-sm", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex h-16 items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Coins, { className: "h-6 w-6 text-green-600" }), _jsx("span", { className: "font-bold text-xl text-gray-900", children: "AfriPay" })] }), user && (_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs(Badge, { variant: "outline", className: "text-xs hidden sm:flex", children: [_jsx(Globe, { className: "h-3 w-3 mr-1" }), network] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", className: "relative h-8 w-8 rounded-full", children: _jsxs(Avatar, { className: "h-8 w-8", children: [_jsx(AvatarImage, { src: user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email || 'user'}`, alt: user.name || user.email || 'User' }), _jsx(AvatarFallback, { children: (user.name || user.email || 'U').charAt(0).toUpperCase() })] }) }) }), _jsxs(DropdownMenuContent, { className: "w-64", align: "end", forceMount: true, children: [_jsx(DropdownMenuLabel, { className: "font-normal", children: _jsxs("div", { className: "flex flex-col space-y-1", children: [_jsx("p", { className: "text-sm font-medium leading-none", children: user.name || 'User' }), user.email && (_jsx("p", { className: "text-xs leading-none text-muted-foreground", children: user.email }))] }) }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { className: "flex items-center justify-between p-3", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-xs text-muted-foreground", children: "Wallet Address" }), _jsx("span", { className: "text-sm font-mono", children: address ? formatAddress(address) : 'Not connected' })] }), address && (_jsx(Button, { variant: "ghost", size: "sm", onClick: copyAddress, className: "h-6 w-6 p-0", children: copied ? (_jsx(Check, { className: "h-3 w-3 text-green-500" })) : (_jsx(Copy, { className: "h-3 w-3" })) }))] }), _jsxs(DropdownMenuItem, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Globe, { className: "h-4 w-4 mr-2" }), "Network"] }), _jsx(Badge, { variant: network === 'mainnet' ? 'default' : 'secondary', children: network })] }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: onLogout, className: "text-red-600", children: [_jsx(LogOut, { className: "h-4 w-4 mr-2" }), "Logout"] })] })] })] }))] }) }) }));
}
